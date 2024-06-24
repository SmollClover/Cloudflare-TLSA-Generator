import { cleanCert, splitCert } from './functions/certificate';
import { createTLSARecord, getZone, listDNSRecords, updateTLSARecord, verifyToken } from './functions/cloudflare';
import { genTLSA, getCN } from './functions/openssl';
import type { CFListDNSRecordEntryTLSA } from './interfaces/cloudflare';

if (!Bun.env.CF_API_TOKEN) throw new Error('Environment variable CLOUDFLARE_API_TOKEN is required');
if (!Bun.env.CERT) throw new Error('Environment variable CERT is required');

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
tasks.add('201');
tasks.add('202');
tasks.add('211');
tasks.add('212');
tasks.add('301');
tasks.add('302');
tasks.add('311');
tasks.add('312');

for (const record of records) {
    const key = `${record.data.usage}${record.data.selector}${record.data.matching_type}`;
    if (!tasks.has(key)) throw new Error('Unexpected TLSA Record found on Cloudflare');

    const data = await genTLSA(record.data.usage, record.data.selector, record.data.matching_type);
    if (data === record.data.certificate) {
        tasks.delete(key);
        continue;
    }

    await updateTLSARecord(zone, record, data);
    console.log(`Updating ${key}`);
    console.log(`${record.data.certificate} -> ${data}`);
    tasks.delete(key);
}

for (const key of tasks.values()) {
    console.log(key);
    const [usage, selector, matching_type] = key.split('').map((v) => Number.parseInt(v));
    const data = await genTLSA(usage, selector, matching_type);

    await createTLSARecord(zone, name, usage, selector, matching_type, data);
    console.log(`Creating ${key}`);
    console.log(data);
    tasks.delete(key);
}

await cleanCert();
