import { unlink } from 'node:fs/promises';

import { verifyToken } from './functions/cloudflare';
import { getCN } from './functions/openssl';

if (!Bun.env.CF_API_TOKEN) throw new Error('Environment variable CLOUDFLARE_API_TOKEN is required');
if (!Bun.env.CERT) throw new Error('Environment variable CERT is required');

const cert = await Bun.file(Bun.env.CERT).text();

const [cert1, cert2] = cert.split(/\n^$\n/m);

await Bun.write('./cert1.pem', cert1);
await Bun.write('./cert2.pem', cert2);

const cert1CN = await getCN('./cert1.pem');

let domain = cert1CN;
if (/.*\..*\./.test(cert1CN)) {
	const seperated = cert1CN.split('.').reverse();
	domain = `${seperated[1]}.${seperated[0]}`;
}

if (!(await verifyToken())) process.exit(1);

await unlink('./cert1.pem');
await unlink('./cert2.pem');