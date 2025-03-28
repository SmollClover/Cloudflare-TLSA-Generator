use crate::exit;
use openssl::{nid::Nid, x509::X509};

pub fn cert_getnid(certificate: &X509, nid: Nid) -> String {
    match certificate.subject_name().entries_by_nid(nid).next() {
        Some(entry) => entry.data().as_utf8().unwrap().to_string(),
        None => {
            error!(
                "Unable to find Nid {} in certificate",
                nid.long_name().unwrap()
            );
            exit(1);
        }
    }
}

pub fn domain_to_host(domain: String) -> String {
    if domain.matches('.').count() > 1 {
        domain
            .splitn(2, '.')
            .skip(1)
            .collect::<Vec<&str>>()
            .join(".")
    } else {
        domain
    }
}
