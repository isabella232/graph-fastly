export type FastlyAccount = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  owner_id: string;
  deleted_at: null;
  pricing_plan: string;
  billing_contact_id: string | null;
  postal_address: string | null;
  billing_ref: string | null;
  phone_number: string;
  pricing_plan_id: string | string;
  can_upload_vcl: boolean;
  billing_network_type: string;
  can_configure_wordpress: boolean;
  can_reset_passwords: boolean;
  force_2fa: boolean;
  force_sso: boolean;
  has_account_panel: boolean;
  has_api_key: boolean;
  has_improved_events: boolean;
  has_improved_ssl_config: boolean;
  has_openstack_logging: boolean;
  has_pci: boolean;
  has_pci_passwords: boolean;
  ip_whitelist: string;
  logentries_provisioned_by: string | null;
  max_tokens_per_user: number;
  rate_limit: number;
  readonly: boolean;
  requires_support_email: boolean;
  san_domains: number;
};

// https://docs.fastly.com/en/guides/configuring-user-roles-and-permissions#user-roles-and-what-they-can-do
export enum FastlyUserRole {
  USER = 'user',
  BILLING = 'billing',
  ENGINEER = 'engineer',
  SUPERUSER = 'superuser',
}

export type FastlyUser = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  require_new_password: boolean;
  role: FastlyUserRole;
  login: string;
  deleted_at: string | null;
  locked: boolean;
  two_factor_auth_enabled: boolean;
  two_factor_setup_required: boolean;
  limit_services: boolean;
  email_hash: string;
};

export type FastlyToken = {
  id: string;
  user_id: string;
  customer_id: string;
  name: string;
  last_used_at: string;
  created_at: string;
  expires_at: string | null;
  ip: string;
  user_agent: string;
  sudo_expires_at: string | null;
  scopes: string[];
  scope: string;
  services: [];
  service_id: string | null;
};

export type FastlyService = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  type: string;
  comment: string;
  version: number;
  versions: object[];
};

export type FastlyServiceBackend = {
  name: string;
  version: number;
  weight: number;
  hostname: string | null;
  port: number;
  address: string;
  ipv4: string;
  ipv6: string | null;
  comment: string;
  auto_loadbalance: boolean;
  between_bytes_timeout: number;
  client_cert: string | null;
  connect_timeout: number;
  error_threshold: number;
  first_byte_timeout: number;
  healthcheck: string | null;
  request_condition: string;
  locked: boolean;
  min_tls_version: string | null;
  max_tls_version: string | null;
  max_conn: number;
  override_host: string | null;
  shield: string;
  ssl_ciphers: string | null;
  ssl_cert_hostname: string | null;
  ssl_hostname: string | null;
  ssl_client_cert: string | null;
  ssl_ca_cert: string | null;
  ssl_check_cert: boolean;
  ssl_client_key: string | null;
  ssl_sni_hostname: string | null;
  use_ssl: boolean;
  service_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type FastlyServiceDomain = {
  name: string;
  locked: boolean;
  comment: string;
  version: number;
  service_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
