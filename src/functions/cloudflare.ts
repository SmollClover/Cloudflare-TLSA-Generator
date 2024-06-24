import type { CFListDNSRecords, CFListZoneEntry, CFListZones, CFResponse, CFVerifyToken } from '../interfaces/cloudflare';

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
