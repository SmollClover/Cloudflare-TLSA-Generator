use openssl::{
    sha::{sha256, sha512},
    x509::X509,
};

pub enum Selector {
    EntireCertificate,
    PublicKey,
}

pub enum MatchingType {
    SHA256,
    SHA512,
}

pub fn generate(certificate: &X509, selector: Selector, matching_type: MatchingType) -> String {
    let cert_der: Vec<u8>;

    match selector {
        Selector::EntireCertificate => {
            cert_der = certificate
                .to_der()
                .expect("Failed to convert certificate to DER")
        }
        Selector::PublicKey => {
            cert_der = certificate
                .public_key()
                .expect("Failed to read public key from certificate")
                .public_key_to_der()
                .expect("Failed to convert public key to DER")
        }
    }

    match matching_type {
        MatchingType::SHA256 => hex::encode(sha256(&cert_der)),
        MatchingType::SHA512 => hex::encode(sha512(&cert_der)),
    }
}
