export interface CFMessage {
    code: number;
    message: string;
}

export interface CFResponse<CFResult> {
    errors: CFMessage[];
    messages: CFMessage[];
    success: boolean;
    result_info: {
        count: number;
        page: number;
        per_page: number;
        total_count: number;
    };
    result: CFResult;
}

export interface CFVerifyToken {
    expires_on: string;
    id: string;
    not_before: string;
    status: string;
}

export type CFListZones = CFListZoneEntry[];

export interface CFListZoneEntry {
    id: string;
    name: string;
    status: string;
    paused: boolean;
    type: string;
    development_mode: number;
    name_servers: string[];
    original_name_servers: string[];
    original_registrar: string;
    original_dnshost: null;
    modified_on: string;
    created_on: string;
    activated_on: string;
    meta: { step: number; custom_certificate_quota: number; page_rule_quota: number; phishing_detected: boolean };
    owner: { id: string | null; type: string; email: string | null };
    account: { id: string };
    tenant: { id: string | null; name: string | null };
    tenant_unit: { id: string | null };
    permissions: [string];
    plan: {
        id: string;
        name: string;
        price: number;
        currency: string;
        frequency: string;
        is_subscribed: boolean;
        can_subscribe: boolean;
        legacy_id: string;
        legacy_discount: boolean;
        externally_managed: boolean;
    };
}

export type CFListDNSRecords = CFListDNSRecordEntry[];

export interface CFListDNSRecordEntry {
    id: string;
    zone_id: string;
    zone_name: string;
    name: string;
    type: string;
    content: string;
    proxiable: true;
    proxied: boolean;
    ttl: number;
    locked: boolean;
    meta: {
        auto_added: boolean;
        managed_by_apps: boolean;
        managed_by_argo_tunnel: boolean;
    };
    comment: string | null;
    tags: [];
    created_on: string;
    modified_on: string;
}

export interface CFListDNSRecordEntryTLSA extends CFListDNSRecordEntry {
    data: {
        certificate: string;
        matching_type: number;
        selector: number;
        usage: number;
    };
}

export interface CFDNSRecordTLSAPayload {
    data: {
        certificate: string;
        matching_type: number;
        selector: number;
        usage: number;
    };
    name: string;
    type: 'TLSA';
    comment?: string;
    id: string;
    tags?: string[];
    ttl?: number;
    zone_id?: string;
}
