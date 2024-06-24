import { watch } from 'node:fs';
import { main } from './main';

if (!Bun.env.CF_API_TOKEN) throw new Error('Environment variable CLOUDFLARE_API_TOKEN is required');
if (!Bun.env.CERT) throw new Error('Environment variable CERT is required');

const watcher = watch(Bun.env.CERT, { persistent: true }, async () => {
    console.log('Detected change');
    main();
});

process.on('exit', () => {
    watcher.close();
    process.exit();
});

main();
