export function log(message: string) {
    const date = new Date(Date.now()).toLocaleString('en-GB');
    console.log(`[${date}]: ${message}`);
}
