import { getZone, listDNSRecords, verifyToken } from './functions/cloudflare';
import { getCN } from './functions/openssl';
import type { CFListDNSRecordEntryTLSA } from './interfaces/cloudflare';
import { cleanCert, splitCert } from './functions/certificate';

if (!Bun.env.CF_API_TOKEN) throw new Error('Environment variable CLOUDFLARE_API_TOKEN is required');
if (!Bun.env.CERT) throw new Error('Environment variable CERT is required');

await splitCert();

const cert1CN = await getCN('./cert1.pem');

let domain = cert1CN;
if (/.*\..*\./.test(cert1CN)) {
    const seperated = cert1CN.split('.').reverse();
    domain = `${seperated[1]}.${seperated[0]}`;
}

if (!(await verifyToken())) process.exit(1);
const zone = await getZone(domain);
const dns = await listDNSRecords(zone);
const tlsa = dns.filter((d) => d.type === 'TLSA' && d.name === `_25._tcp.${cert1CN}`) as CFListDNSRecordEntryTLSA[];
console.log(tlsa);

await cleanCert();
