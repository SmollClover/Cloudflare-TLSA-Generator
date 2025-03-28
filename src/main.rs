#[macro_use] extern crate log;

use std::{fs, process::exit};
use clap::{error, Parser};
use dotenv::dotenv;
use log::LevelFilter;
use openssl::{nid::Nid, x509::X509};
use cloudflare::{endpoints::zones::zone::ListZonesParams, framework::{auth::Credentials::UserAuthToken, client::{blocking_api::HttpApiClient, ClientConfig}, Environment}};
use simplelog::{format_description, ColorChoice, ConfigBuilder, TermLogger, TerminalMode};

mod tlsa;
mod util;
mod cf;

#[derive(Parser, Debug, Clone)]
#[command(version, )]
struct Args {
    /// Path to the certificate
    #[arg(long, env)]
    cert: String,

    /// Cloudflare API Token with read and write access to the Zone's DNS records
    #[arg(long, env = "CF_API_TOKEN")]
    token: String,

    /// Explicit ID of Cloudflare Zone to use instead of deriving from the Domain
    #[arg(long, env = "ZONE_ID")]
    zone: Option<String>,

    /// Common name used for the TLSA record
    #[arg(long, env)]
    common_name: Option<String>,

    /// Domain used to get Cloudflare Zone derived from the Common Name
    #[arg(long, env)]
    domain: Option<String>,

    /// Prefix used for the TLSA record name
    #[arg(long, env = "TLSA_PREFIX", default_value = "_25._tcp")]
    prefix: Option<String>,

    /// Only perform a dry-run and don't change anything
    #[arg(long, env)]
    dry_run: bool,

    /// Give verbose output
    #[arg(long, env)]
    verbose: bool,
}

fn main() {
    dotenv().ok();
    let args = Args::parse();

    let log_config = ConfigBuilder::new()
        .set_time_format_custom(format_description!("[day].[month].[year] [hour]:[minute]:[second]"))
        .build();
    let log_level = if args.verbose { LevelFilter::Debug } else { LevelFilter::Info };
    TermLogger::init(log_level, log_config, TerminalMode::Mixed, ColorChoice::Auto).unwrap();

    debug!("Reading certificate from: {}", args.clone().cert);
    let file =  match fs::read_to_string(args.clone().cert) {
        Ok(file) => file,
        Err(e) => {
            error!("Unable to read certificate: {}", e);
            exit(1);
        },
    };

    let file_split = match file.split_once("\n\n") {
        Some(file_split) => file_split,
        None => {
            error!("Unable to split certificate");
            exit(1);
        },
    };

    debug!("Parsing certificate file to X509 object");
    let cert_main = match X509::from_pem(file_split.0.as_bytes()) {
        Ok(cert_main) => cert_main,
        Err(e) => {
            error!("Unable to parse main (first) certificate: {}", e);
            exit(1);
        }
    };

    let cert_ca = match X509::from_pem(file_split.1.as_bytes()) {
        Ok(cert_ca) => cert_ca,
        Err(e) => {
            error!("Unable to parse ca (second) certificate: {}", e);
            exit(1);
        }
    };

    debug!("Extracting Common Name from certificate, if not provided");
    let common_name = args.clone().common_name.unwrap_or_else(|| util::cert_getnid(&cert_main, Nid::COMMONNAME));
    info!("Using Common Name: {}", common_name);

    debug!("Deriving Domain from Common Name, if not provided");
    let domain = args.clone().domain.unwrap_or_else(|| util::domain_to_host(common_name.clone()));
    info!("Using Domain: {}", domain);

    debug!("Creating HTTP Client");
    let credentials = UserAuthToken { token: args.clone().token };
    let api_client = match HttpApiClient::new(credentials, ClientConfig::default(), Environment::Production) {
        Ok(api_client) => api_client,
        Err(e) => {
            error!("Failed to create HTTP Client: {}", e);
            exit(1);
        }
    };

    cf::verify_token(&api_client);
    cf::check_zone_permission(cf::list_zones(&api_client, ListZonesParams::default()).result.first().unwrap());

    // println!("2 1 1 {}", tlsa::generate(&cert_ca, tlsa::Selector::PublicKey, tlsa::MatchingType::SHA256));
    // println!("2 1 2 {}", tlsa::generate(&cert_ca, tlsa::Selector::PublicKey, tlsa::MatchingType::SHA512));
    // println!("2 0 1 {}", tlsa::generate(&cert_ca, tlsa::Selector::EntireCertificate, tlsa::MatchingType::SHA256));
    // println!("2 0 2 {}", tlsa::generate(&cert_ca, tlsa::Selector::EntireCertificate, tlsa::MatchingType::SHA512));
    // println!("3 1 1 {}", tlsa::generate(&cert_main, tlsa::Selector::PublicKey, tlsa::MatchingType::SHA256));
    // println!("3 1 2 {}", tlsa::generate(&cert_main, tlsa::Selector::PublicKey, tlsa::MatchingType::SHA512));
    // println!("3 0 1 {}", tlsa::generate(&cert_main, tlsa::Selector::EntireCertificate, tlsa::MatchingType::SHA256));
    // println!("3 0 2 {}", tlsa::generate(&cert_main, tlsa::Selector::EntireCertificate, tlsa::MatchingType::SHA512));
}

