import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./session";
import type {
  AdminCustomer,
  Analytics,
  AnalyticsRange,
  AuditLog,
  AuthResponse,
  Complaint,
  ComplaintStatus,
  Coupon,
  Delivery,
  DeliveryHistoryEntry,
  LiveFleet,
  DeliveryStatus,
  DiscountType,
  Page,
  MarketplaceOrder,
  MarketplaceSummary,
  Merchant,
  OrderStatus,
  Payment,
  Rating,
  ReportsSummary,
  Rider,
  RiderDocument,
  Settings,
  SettingsInput,
  UserStatus,
  VerificationStatus,
  WalletFloat,
  Withdrawal,
  WithdrawalDecision,
} from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

// Every handler answers with response.envelope: {"data": ...} on success,
// {"error": "..."} on failure. ApiError carries the status so callers can
// tell "not found" from "forbidden" — a non-admin token 403s on every
// /admin route, which is worth saying differently from a bad password.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type Envelope<T> = { data?: T; error?: string };

type RequestOptions = {
  method?: string;
  body?: unknown;
  // Auth calls (login/refresh) must not carry — or try to renew — a bearer
  // token; a stale one would 401 the login itself.
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const url = new URL(
    `${base}${path}`,
    typeof window === "undefined" ? "http://localhost" : window.location.origin,
  );
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// A single in-flight refresh shared by every 401 that lands at once — the
// overview page fans out two requests, and letting each refresh
// independently would rotate the refresh token out from under the other
// (the API revokes the used token on every refresh).
let refreshInFlight: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(buildUrl("/auth/refresh"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) return false;

  const payload = (await res.json()) as Envelope<AuthResponse>;
  if (!payload.data) return false;

  saveSession({
    accessToken: payload.data.access_token,
    refreshToken: payload.data.refresh_token,
    user: payload.data.user,
  });
  return true;
}

function authHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function send<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = "GET", body, auth = true, query } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) Object.assign(headers, authHeader());

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Empty bodies are not JSON; treat an unparseable body as the error text
  // rather than masking the real status behind a parse failure.
  let payload: Envelope<T> = {};
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text) as Envelope<T>;
    } catch {
      payload = { error: text };
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, payload.error || `Request failed (${res.status})`);
  }
  return payload.data as T;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await send<T>(path, options);
  } catch (err) {
    const expired =
      err instanceof ApiError && err.status === 401 && options.auth !== false;
    if (!expired) throw err;

    refreshInFlight ??= refreshSession().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;
    if (!refreshed) {
      clearSession();
      throw new ApiError(401, "Your session has expired. Please sign in again.");
    }
    return send<T>(path, options);
  }
}

/**
 * The CSV exports and the document download stream a file with an
 * `attachment` Content-Disposition rather than answering the JSON envelope.
 * They still require the bearer token, so a plain <a href> would 401 — the
 * bytes are fetched with the auth header and handed to the browser as an
 * object URL instead.
 */
async function download(path: string, filename: string, query?: RequestOptions["query"]) {
  let res = await fetch(buildUrl(path, query), { headers: authHeader() });

  if (res.status === 401) {
    refreshInFlight ??= refreshSession().finally(() => {
      refreshInFlight = null;
    });
    if (!(await refreshInFlight)) {
      clearSession();
      throw new ApiError(401, "Your session has expired. Please sign in again.");
    }
    res = await fetch(buildUrl(path, query), { headers: authHeader() });
  }

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || `Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking immediately can cancel the download in some browsers; one turn
  // of the event loop is enough for the click to have been consumed.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const api = {
  // ---- auth -------------------------------------------------------------
  login(email: string, password: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
  },

  // NOTE: there is deliberately no me(). The API exposes /customers/me and
  // /riders/me but no /auth/me and no admin equivalent — the router's auth
  // group is register/login/refresh/logout only. The user object captured
  // at login is the only source of identity this panel has.

  logout() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return Promise.resolve(null);
    // A failed logout must never trap the user inside the app — the local
    // session is cleared either way by the caller.
    return request<{ message: string }>("/auth/logout", {
      method: "POST",
      auth: false,
      body: { refresh_token: refreshToken },
    }).catch(() => null);
  },

  // ---- reports & analytics ----------------------------------------------
  reportsSummary() {
    return request<ReportsSummary>("/admin/reports/summary");
  },

  // Last 7 days only — the handler is hard-coded to that window, so there
  // is no range parameter to pass.
  analytics() {
    return request<Analytics>("/admin/analytics");
  },

  // Range-aware analytics. The dateless /admin/analytics stays available for
  // the default seven-day view; this one also returns totals for the window,
  // so the KPI row and the charts describe the same period.
  analyticsRange(from = "", to = "") {
    return request<AnalyticsRange>("/admin/analytics/range", {
      query: { from: from || undefined, to: to || undefined },
    });
  },

  // What the platform owes its users — the number that decides whether a
  // payout run is safe. Withdrawals only show what has been asked for.
  walletFloat() {
    return request<WalletFloat>("/admin/wallet-float");
  },

  // Snapshot, not a stream: internal/ws carries per-delivery rooms but
  // nothing publishes rider positions to it, so the live board polls.
  liveRiders() {
    return request<LiveFleet>("/admin/live/riders");
  },

  // ---- marketplace ------------------------------------------------------
  marketplaceSummary() {
    return request<MarketplaceSummary>("/admin/marketplace/summary");
  },

  listMarketplaceOrders(page = 1, limit = 20, status: OrderStatus | "" = "", search = "") {
    return request<Page<MarketplaceOrder>>("/admin/marketplace/orders", {
      query: { page, limit, status: status || undefined, search: search || undefined },
    });
  },

  // ---- audit trail ------------------------------------------------------
  // Read-only: the API exposes no way to edit or delete an entry.
  listAuditLogs(page = 1, limit = 20, action = "", entityType = "", search = "") {
    return request<Page<AuditLog>>("/admin/audit-logs", {
      query: {
        page,
        limit,
        action: action || undefined,
        entity_type: entityType || undefined,
        search: search || undefined,
      },
    });
  },

  auditActions() {
    return request<string[]>("/admin/audit-logs/actions");
  },

  // ---- customers --------------------------------------------------------
  listCustomers(page = 1, limit = 20, search = "") {
    return request<Page<AdminCustomer>>("/admin/customers", {
      query: { page, limit, search: search || undefined },
    });
  },

  getCustomer(id: number) {
    return request<AdminCustomer>(`/admin/customers/${id}`);
  },

  customerRatings(id: number, page = 1, limit = 20) {
    return request<Page<Rating>>(`/admin/customers/${id}/ratings`, {
      query: { page, limit },
    });
  },

  setCustomerStatus(id: number, status: UserStatus) {
    return request<{ id: number; status: string }>(
      `/admin/customers/${id}/status`,
      { method: "PATCH", body: { status } },
    );
  },

  // ---- riders -----------------------------------------------------------
  listRiders(page = 1, limit = 20, search = "", verification: VerificationStatus | "" = "") {
    return request<Page<Rider>>("/admin/riders", {
      query: { page, limit, search: search || undefined, verification: verification || undefined },
    });
  },

  getRider(id: number) {
    return request<Rider>(`/admin/riders/${id}`);
  },

  riderRatings(id: number, page = 1, limit = 20) {
    return request<Page<Rating>>(`/admin/riders/${id}/ratings`, {
      query: { page, limit },
    });
  },

  setRiderStatus(id: number, status: UserStatus) {
    return request<{ id: number; status: string }>(`/admin/riders/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },

  verifyRider(id: number, verification_status: VerificationStatus) {
    return request<Rider>(`/admin/riders/${id}/verify`, {
      method: "PATCH",
      body: { verification_status },
    });
  },

  listRiderDocuments(riderId: number) {
    return request<RiderDocument[]>(`/admin/riders/${riderId}/documents`);
  },

  updateRiderDocument(
    id: number,
    input: { status: VerificationStatus; admin_notes?: string },
  ) {
    return request<RiderDocument>(`/admin/documents/${id}`, {
      method: "PATCH",
      body: input,
    });
  },

  downloadRiderDocument(id: number, filename: string) {
    return download(`/admin/documents/${id}/file`, filename);
  },

  // ---- merchants --------------------------------------------------------
  verifyMerchant(id: number, verification_status: VerificationStatus) {
    return request<{ id: number; verification_status: string }>(
      `/admin/merchants/${id}/verify`,
      { method: "PATCH", body: { verification_status } },
    );
  },

  listMerchants(page = 1, limit = 20, search = "", verification: VerificationStatus | "" = "") {
    return request<Page<Merchant>>("/admin/merchants", {
      query: { page, limit, search: search || undefined, verification: verification || undefined },
    });
  },

  getMerchant(id: number) {
    return request<Merchant>(`/admin/merchants/${id}`);
  },

  // ---- deliveries -------------------------------------------------------
  listDeliveries(
    page = 1,
    limit = 20,
    status?: DeliveryStatus | "",
    search = "",
    from = "",
    to = "",
  ) {
    return request<Page<Delivery>>("/admin/deliveries", {
      query: {
        page,
        limit,
        status: status || undefined,
        search: search || undefined,
        from: from || undefined,
        to: to || undefined,
      },
    });
  },

  getDelivery(id: number) {
    return request<Delivery>(`/admin/deliveries/${id}`);
  },

  deliveryHistory(id: number) {
    return request<DeliveryHistoryEntry[]>(`/admin/deliveries/${id}/history`);
  },

  reassignDelivery(id: number, rider_id: number) {
    return request<Delivery>(`/admin/deliveries/${id}/reassign`, {
      method: "PATCH",
      body: { rider_id },
    });
  },

  exportDeliveries(status?: DeliveryStatus | "") {
    return download("/admin/deliveries/export", "deliveries.csv", {
      status: status || undefined,
    });
  },

  // ---- payments & withdrawals -------------------------------------------
  listPayments(page = 1, limit = 20) {
    return request<Page<Payment>>("/admin/payments", { query: { page, limit } });
  },

  exportPayments() {
    return download("/admin/payments/export", "payments.csv");
  },

  listWithdrawals(page = 1, limit = 20) {
    return request<Page<Withdrawal>>("/admin/withdrawals", {
      query: { page, limit },
    });
  },

  // Settles a request by hand — for transfers done outside the gateway, or
  // to record one that failed.
  updateWithdrawal(id: number, status: WithdrawalDecision, admin_notes = "") {
    return request<Withdrawal>(`/admin/withdrawals/${id}`, {
      method: "PATCH",
      body: { status, admin_notes },
    });
  },

  // Sends the transfer through the active gateway. Moves the request to
  // 'processing'; the gateway webhook is what finally marks it completed or
  // failed, so the row will not read 'completed' the moment this resolves.
  payoutWithdrawal(id: number) {
    return request<Withdrawal>(`/admin/withdrawals/${id}/payout`, {
      method: "POST",
    });
  },

  // ---- complaints -------------------------------------------------------
  listComplaints(page = 1, limit = 20, status?: ComplaintStatus | "", search = "") {
    return request<Page<Complaint>>("/admin/complaints", {
      query: { page, limit, status: status || undefined, search: search || undefined },
    });
  },

  getComplaint(id: number) {
    return request<Complaint>(`/admin/complaints/${id}`);
  },

  // Updating notifies the person who raised it, so this is never a silent
  // bookkeeping change.
  updateComplaint(id: number, status: ComplaintStatus, admin_notes = "") {
    return request<Complaint>(`/admin/complaints/${id}`, {
      method: "PATCH",
      body: { status, admin_notes },
    });
  },

  // ---- coupons ----------------------------------------------------------
  listCoupons(page = 1, limit = 20, search = "") {
    return request<Page<Coupon>>("/admin/coupons", {
      query: { page, limit, search: search || undefined },
    });
  },

  getCoupon(id: number) {
    return request<Coupon>(`/admin/coupons/${id}`);
  },

  createCoupon(input: {
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    max_redemptions?: number | null;
    min_order_value?: number | null;
    expires_at?: string | null;
    active: boolean;
  }) {
    return request<Coupon>("/admin/coupons", { method: "POST", body: input });
  },

  updateCoupon(
    id: number,
    input: {
      code: string;
      discount_type: DiscountType;
      discount_value: number;
      max_redemptions?: number | null;
      min_order_value?: number | null;
      expires_at?: string | null;
      active: boolean;
    },
  ) {
    return request<Coupon>(`/admin/coupons/${id}`, { method: "PATCH", body: input });
  },

  // ---- settings ---------------------------------------------------------
  getSettings() {
    return request<Settings>("/admin/settings");
  },

  // Every field is `required,gt=0` server-side — this is a whole-object
  // write, not a merge, so callers must send the full current settings.
  updateSettings(input: SettingsInput) {
    return request<Settings>("/admin/settings", { method: "PATCH", body: input });
  },
};

export { loadSession, saveSession, clearSession } from "./session";
