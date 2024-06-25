import { cleanCert, splitCert } from './function/certificate';
import { createTLSARecord, getZone, listDNSRecords, updateTLSARecord, verifyToken } from './function/cloudflare';
import { log } from './function/console';
import { genTLSA, getCN } from './function/openssl';

import type { CFListDNSRecordEntryTLSA } from './interface/cloudflare';

const STATE = {
    IDLE: 0,
    RUNNING: 1,
    QUEUED: 2,
} as const;

let state: number = STATE.IDLE;

export async function main() {
    if (state === STATE.QUEUED) return;
    if (state === STATE.RUNNING) {
        state = STATE.QUEUED;

        while (state === STATE.QUEUED) {
            await Bun.sleep(1000);
        }

        return main();
    }
    state = STATE.RUNNING;

    await splitCert();

    const cert1CN = await getCN('./cert1.pem');

    let domain = cert1CN;
    if (/.*\..*\./.test(cert1CN)) {
        const seperated = cert1CN.split('.').reverse();
        domain = `${seperated[1]}.${seperated[0]}`;
    }

    const name = `_25._tcp.${cert1CN}`;

    if (!(await verifyToken())) process.exit(1);
    const zone = await getZone(domain);
    const dns = await listDNSRecords(zone);
    const records = dns.filter((d) => d.type === 'TLSA' && d.name === name) as CFListDNSRecordEntryTLSA[];

    const tasks = new Set<string>();
    tasks.add('2 0 1');
    tasks.add('2 0 2');
    tasks.add('2 1 1');
    tasks.add('2 1 2');
    tasks.add('3 0 1');
    tasks.add('3 0 2');
    tasks.add('3 1 1');
    tasks.add('3 1 2');

    for (const record of records) {
        const key = `${record.data.usage} ${record.data.selector} ${record.data.matching_type}`;
        if (!tasks.has(key)) throw new Error('Unexpected TLSA Record found on Cloudflare');

        const data = await genTLSA(record.data.usage, record.data.selector, record.data.matching_type);
        if (data === record.data.certificate) {
            tasks.delete(key);
            continue;
        }

        await updateTLSARecord(zone, record, data);
        log(`Updating ${key} due to differing certificate`);
        tasks.delete(key);
    }

    for (const key of tasks.values()) {
        const [usage, selector, matching_type] = key.split(' ').map((v) => Number.parseInt(v));
        const data = await genTLSA(usage, selector, matching_type);

        await createTLSARecord(zone, name, usage, selector, matching_type, data);
        log(`Creating ${key} due to missing DNS Record`);
        tasks.delete(key);
    }

    await cleanCert();
    state = STATE.IDLE;
}
