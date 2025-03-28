use std::process::exit;

use cloudflare::{endpoints::{account::user::GetUserTokenStatus, zones::zone::{ListZones, ListZonesParams, Zone}}, framework::{client::blocking_api::HttpApiClient, response::ApiSuccess}};

pub fn verify_token(api_client: &HttpApiClient) {
    debug!("Verifying Token validity");

    let endpoint = GetUserTokenStatus {};
    let response = match api_client.request(&endpoint) {
        Ok(response) => response,
        Err(e) => {
            error!("Error checking Token validity: {}", e);
            exit(1);
        },
    };

    if response.result.status != "active" {
        error!("Token status is not valid: {}", response.result.status);
        exit(1);
    }

    debug!("Token is valid: {}", response.result.id);
}

pub fn list_zones(api_client: &HttpApiClient, params: ListZonesParams) -> ApiSuccess<Vec<Zone>> {
    debug!("Querying Zones");

    let endpoint = ListZones { params };
    
    match api_client.request(&endpoint) {
        Ok(response) => response,
        Err(e) => {
            error!("Error listing all Zones: {}", e);
            exit(1);
        },
    }
}

pub fn check_zone_permission(zone: &Zone) {
    debug!("Checking permissions for zone: {}", zone.name);

    if !zone.permissions.contains(&"#dns_records:read".to_owned()) {
        error!("Missing permission to read DNS records for zone: {}", zone.name);
        exit(1);
    }

    if !zone.permissions.contains(&"#dns_records:edit".to_owned()) {
        error!("Missing permission to edit DNS records for zone: {}", zone.name);
        exit(1);
    }
}