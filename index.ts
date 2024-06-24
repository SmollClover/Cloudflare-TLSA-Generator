if (!Bun.env.CF_API_EMAIL || !Bun.env.CF_DNS_API_TOKEN) throw new Error('Environment variable CF_API_EMAIL and CF_DNS_API_TOKEN are required');
if (!Bun.env.CERT) throw new Error('Environment variable CERT is required');

