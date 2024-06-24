export async function getCN(cert: string) {
    const proc = Bun.spawn(['openssl', 'x509', '-in', cert, '-noout', '-subject']);

    const output = await new Response(proc.stdout).text();
    const CN = output.match(/CN=\S+/);

    if (!CN) throw new Error(`Could not find CN in certificate ${cert}`);
    return CN[0].replace(/^CN=/m, '');
}

export async function genTLSA(usage: number, selector: number, matching_type: number) {
    if (usage < 2 || usage > 3) throw new Error('Usage must be between 2 and 3');
    if (selector < 0 || selector > 1) throw new Error('Selector must be between 0 and 1');
    if (matching_type < 1 || matching_type > 2) throw new Error('Matching type must be between 1 and 2');

    let cert = '';
    switch (usage) {
        case 2: {
            cert = './cert2.pem';
            break;
        }
        case 3: {
            cert = './cert1.pem';
            break;
        }
    }

    let dgst = '';
    switch (matching_type) {
        case 1: {
            dgst = '-sha256';
            break;
        }
        case 2: {
            dgst = '-sha512';
            break;
        }
    }

    let data = '';
    switch (selector) {
        case 0: {
            data = (
                await Bun.$`openssl x509 -in ${cert} -outform DER | openssl dgst ${dgst} | awk '{print $2}'`.quiet()
            ).stdout.toString();
            break;
        }
        case 1: {
            data = (
                await Bun.$`openssl x509 -in ${cert} -noout -pubkey | openssl pkey -pubin -outform DER | openssl dgst ${dgst} | awk '{print $2}'`.quiet()
            ).stdout.toString();
            break;
        }
    }

    return data;
}
