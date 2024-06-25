import ShortUniqueId from 'short-unique-id';
import type {
    CFDNSRecordTLSAPayload,
    CFListDNSRecordEntryTLSA,
    CFListDNSRecords,
    CFListZoneEntry,
    CFListZones,
    CFResponse,
    CFVerifyToken,
} from '../interface/cloudflare';

const BASE = 'https://api.cloudflare.com/client/v4';
const HEADERS = {
    Authorization: `Bearer ${Bun.env.CF_API_TOKEN}`,
    'Content-Type': 'application/json',
};

async function parseResponse<CFType>(response: Response) {
    const data = (await response.json()) as CFResponse<CFType>;

    if (!data.success || data.errors.length > 0) throw new Error(JSON.stringify(data.errors, null, 2));

    return data;
}

export async function verifyToken() {
    const response = await fetch(`${BASE}/user/tokens/verify`, {
        method: 'GET',
        headers: HEADERS,
    });

    const parsed = await parseResponse<CFVerifyToken>(response);
    if (parsed.result.status === 'active') return true;

    console.log('Token not valid');
    console.log(`Status: ${parsed.result.status}`);
    console.log(`Not before: ${parsed.result.not_before}`);
    console.log(`Expires on: ${parsed.result.expires_on}`);
    return false;
}

export async function listZones() {
    const response = await fetch(`${BASE}/zones`, {
        method: 'GET',
        headers: HEADERS,
    });

    const parsed = await parseResponse<CFListZones>(response);

    return parsed.result;
}

export async function getZone(name: string) {
    const zones = await listZones();

    const zone = zones.find((z) => z.name === name);
    if (!zone) throw new Error('Could not find Zone on Cloudflare. Please make sure we have permissions to view this Zone');

    if (!zone.permissions.includes('#dns_records:read')) throw new Error('Missing permission to read DNS records on Zone');
    if (!zone.permissions.includes('#dns_records:edit')) throw new Error('Missing permission to edit DNS records on Zone');

    return zone;
}

export async function listDNSRecords(zone: CFListZoneEntry) {
    const response = await fetch(`${BASE}/zones/${zone.id}/dns_records`, {
        method: 'GET',
        headers: HEADERS,
    });

    const parsed = await parseResponse<CFListDNSRecords>(response);

    return parsed.result;
}

export async function createTLSARecord(
    zone: CFListZoneEntry,
    name: string,
    usage: number,
    selector: number,
    matching_type: number,
    data: string,
) {
    const { randomUUID } = new ShortUniqueId({ length: 32 });

    const payload: CFDNSRecordTLSAPayload = {
        data: {
            certificate: data,
            matching_type: matching_type,
            selector: selector,
            usage: usage,
        },
        name: name,
        type: 'TLSA',
        id: randomUUID(),
        zone_id: zone.id,
    };

    const response = await fetch(`${BASE}/zones/${zone.id}/dns_records`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify(payload),
    });

    await parseResponse(response);
}

export async function updateTLSARecord(zone: CFListZoneEntry, record: CFListDNSRecordEntryTLSA, data: string) {
    const payload: CFDNSRecordTLSAPayload = {
        data: {
            certificate: data,
            matching_type: record.data.matching_type,
            selector: record.data.selector,
            usage: record.data.usage,
        },
        name: record.name,
        type: 'TLSA',
        id: record.id,
    };

    if (record.comment) payload.comment = record.comment;
    if (record.tags) payload.tags = record.tags;
    if (record.ttl) payload.ttl = record.ttl;
    if (record.zone_id) payload.zone_id = record.zone_id;

    const response = await fetch(`${BASE}/zones/${zone.id}/dns_records/${record.id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify(payload),
    });

    await parseResponse(response);
}
