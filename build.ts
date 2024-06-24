console.log(
    (
        await Bun.build({
            entrypoints: ['src/index.ts'],
            outdir: './out',
            minify: true,
            splitting: true,
            target: 'bun',
            sourcemap: 'inline',
        })
    ).logs.join('\n'),
);
