import { unlink } from 'node:fs/promises';

export async function splitCert() {
    const cert = await Bun.file(Bun.env.CERT).text();

    const [cert1, cert2] = cert.split(/\n^$\n/m);

    await Bun.write('./cert1.pem', cert1);
    await Bun.write('./cert2.pem', cert2);
}

export async function cleanCert() {
    await unlink('./cert1.pem');
    await unlink('./cert2.pem');
}
