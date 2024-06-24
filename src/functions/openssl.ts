export async function getCN(cert: string) {
    const proc = Bun.spawn(['openssl', 'x509', '-in', cert, '-noout', '-subject']);

    const output = await new Response(proc.stdout).text();
    const CN = output.match(/CN=\S+/);

    if (!CN) throw new Error(`Could not find CN in certificate ${cert}`);
    return CN[0].replace(/^CN=/m, '');
}
