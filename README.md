# Cloudflare TLSA Generator

[![GitHub license](https://img.shields.io/github/license/SmollClover/Cloudflare-TLSA-Generator)](https://github.com/SmollClover/Cloudflare-TLSA-Generator/blob/main/LICENSE)

Automatically generate and update TLSA records from a `.pem` certificate on Cloudflare.

---

## Usage

### Environment Variables

| Variable     | Type     | Default                  | Example                                  | Description                                                                      |
| ------------ | -------- | ------------------------ | ---------------------------------------- | -------------------------------------------------------------------------------- |
| CERT         | REQUIRED | unset                    | /data/certs/mail.example.com/cert.pem    | The path to the certificate                                                      |
| CF_API_TOKEN | REQUIRED | unset                    | XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX | A Cloudflare API Token with access to the Zone and to read and write DNS records |
| ZONE_ID      | OPTIONAL | unset                    | XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX         | Explicit ID of Cloudflare Zone used instead of using the Domain                  |
| COMMON_NAME  | OPTIONAL | read from certificate    | mail.example.com                         | Common name used for the TLSA record                                             |
| DOMAIN       | OPTIONAL | derived from COMMON_NAME | example.com                              | Domain used to get Cloudflare Zone                                               |
| TLSA_PREFIX  | OPTIONAL | _25._tcp                 | _25._tcp                                 | Prefix used for the TLSA record name                                             |

### Example

**Example of compose here**