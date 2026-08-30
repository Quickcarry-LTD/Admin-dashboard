// Mirrors the JSON shapes in the Go API's internal/httpapi/dto package and
// the inline gin.H responses in handlers/adminhandler. Field names match the
// struct tags exactly — snake_case, not camelCase.

export type Role = "customer" | "rider" | "business" | "merchant" | "admin";

export type User = {
  id: number;
  role: Role;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  email_verified: boolean;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user: User;
};

// dto.Page[T] — the shape every paginated list endpoint returns.
export type Page<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

// adminhandler.userView is a hand-built gin.H, not a dto struct — it returns
// only these six fields. Notably there is no `role` and no `email_verified`,
// so the customers table cannot show either.
export type AdminCustomer = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
};

export type UserStatus = "active" | "suspended";

// ---------------------------------------------------------------------------
// Riders — dto.RiderView
// ---------------------------------------------------------------------------

export type VerificationStatus = "pending" | "approved" | "rejected";

export type Rider = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  user_status: UserStatus;
  vehicle_type: string;
  plate_number: string;
  license_number: string;
  verification_status: VerificationStatus;
  is_online: boolean;
  // Present on GET /admin/riders/:id but omitted from the list rows —
  // ToRiderListView leaves the location fields off entirely.
  current_lat?: number;
  current_lng?: number;
  last_location_at?: string;
  rating_avg: number;
  rating_count: number;
  created_at: string;
};

// dto.RiderDocumentView
export type RiderDocType =
  | "license"
  | "vehicle_registration"
  | "profile_photo"
  | "other";

export type RiderDocument = {
  id: number;
  rider_id: number;
  doc_type: RiderDocType;
  original_filename: string;
  status: VerificationStatus;
  admin_notes?: string;
  uploaded_at: string;
};

// dto.RatingView
export type Rating = {
  id: number;
  delivery_id: number;
  rated_by_user_id: number;
  rated_user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Merchants — dto.MerchantView
// ---------------------------------------------------------------------------

// merchant_profiles.category is a DB ENUM (migration 000026) — adding a trade
// means a migration, not a UI change.
export type MerchantCategory =
  | "restaurant"
  | "grocery"
  | "pharmacy"
  | "retail"
  | "other";

export type Merchant = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  user_status: UserStatus;
  category: MerchantCategory;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  verification_status: VerificationStatus;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Deliveries — dto.DeliveryView
// ---------------------------------------------------------------------------

export type DeliveryStatus =
  | "pending"
  | "searching"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export const DELIVERY_STATUSES: DeliveryStatus[] = [
  "pending",
  "searching",
  "accepted",
  "picked_up",
  "in_transit",
  "delivered",
  "cancelled",
];

// The states where a rider is actively working the job — what an operator
// means by "live" on the board.
export const ACTIVE_DELIVERY_STATUSES: DeliveryStatus[] = [
  "accepted",
  "picked_up",
  "in_transit",
];

export type Delivery = {
  id: number;
  customer_id: number;
  service_type: string;
  vehicle_type?: string;
  duration_hours?: number;
  rider_id?: number;
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  package_description: string;
  package_size: string;
  status: DeliveryStatus;
  price: number;
  distance_km: number;
  coupon_code?: string;
  discount_amount: number;
  created_at: string;
  accepted_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
};

// dto.DeliveryHistoryView
export type DeliveryHistoryEntry = {
  status: DeliveryStatus;
  changed_at: string;
};

// ---------------------------------------------------------------------------
// Payments — the anonymous struct in adminhandler.ListPayments
// ---------------------------------------------------------------------------

export type PaymentMethod = "cash" | "card" | "wallet";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type Payment = {
  id: number;
  delivery_id: number;
  amount: number;
  // What QuickCarry keeps vs. what the rider is owed. Their sum is the
  // amount, so the payments table can be read as a settlement ledger.
  commission_amount: number;
  rider_payout: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref?: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Withdrawals — dto.WithdrawalRequestView
// ---------------------------------------------------------------------------

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed";

export type Withdrawal = {
  id: number;
  user_id: number;
  amount: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  status: WithdrawalStatus;
  admin_notes?: string;
  created_at: string;
};

// PATCH /admin/withdrawals/:id only accepts these two — "processing" is set
// by the payout endpoint, never by hand.
export type WithdrawalDecision = "completed" | "failed";

// ---------------------------------------------------------------------------
// Complaints — dto.ComplaintView
// ---------------------------------------------------------------------------

// dto.UpdateComplaintRequest binds `oneof=open in_progress resolved closed`,
// and the DB enum agrees — there is no "rejected" state for a complaint.
export type ComplaintStatus = "open" | "in_progress" | "resolved" | "closed";

export const COMPLAINT_STATUSES: ComplaintStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

export type Complaint = {
  id: number;
  delivery_id?: number;
  raised_by_user_id: number;
  subject: string;
  description: string;
  status: ComplaintStatus;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Coupons — dto.CouponView
// ---------------------------------------------------------------------------

export type DiscountType = "percentage" | "fixed";

export type Coupon = {
  id: number;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_redemptions?: number;
  redemptions_count: number;
  min_order_value?: number;
  expires_at?: string;
  active: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Reports & analytics
// ---------------------------------------------------------------------------

// GET /admin/reports/summary. deliveries_by_status is keyed by the delivery
// status enum, and only contains the statuses that have at least one row —
// absent keys mean zero, not missing data.
export type ReportsSummary = {
  total_customers: number;
  total_riders: number;
  deliveries_by_status: Partial<Record<DeliveryStatus, number>>;
  total_delivered_revenue: number;
};

export type DayCount = { day: string; total: number };

// GET /admin/analytics — last 7 days only, per the handler comment.
export type Analytics = {
  deliveries_per_day_last_7: DayCount[];
  revenue_per_day_last_7: DayCount[];
};

// ---------------------------------------------------------------------------
// Settings — adminhandler.settingsView / updateSettingsRequest
// ---------------------------------------------------------------------------

export type PaymentGateway = "none" | "paystack" | "flutterwave" | "monnify";

export const PAYMENT_GATEWAYS: PaymentGateway[] = [
  "none",
  "paystack",
  "flutterwave",
  "monnify",
];

export type Settings = {
  base_fare: number;
  per_km_rate: number;
  per_min_rate: number;
  commission_percent: number;
  free_daily_pickups: number;
  standard_subscription_fee: number;
  premium_subscription_fee: number;
  marketplace_commission_percent: number;
  ride_base_fare: number;
  ride_per_km_rate: number;
  ride_per_min_rate: number;
  hire_base_fare: number;
  hire_hourly_rate: number;
  service_area_lat: number;
  service_area_lng: number;
  service_area_radius_km: number;
  active_payment_gateway: PaymentGateway;
  updated_at: string;
};

// UpdateSettings takes every field — it is a whole-object PUT in PATCH's
// clothing, and each numeric field is `required,gt=0`, so a partial payload
// fails validation rather than merging.
export type SettingsInput = Omit<Settings, "updated_at">;

// ---------------------------------------------------------------------------
// Analytics over an arbitrary window — GET /admin/analytics/range
// ---------------------------------------------------------------------------

export type AnalyticsRange = {
  /** Echoed back inclusively, so `to` is the last day counted. */
  from: string;
  to: string;
  deliveries_per_day: DayCount[];
  revenue_per_day: DayCount[];
  totals: {
    deliveries: number;
    delivered: number;
    cancelled: number;
    revenue: number;
  };
};

// ---------------------------------------------------------------------------
// Wallet float — GET /admin/wallet-float
// ---------------------------------------------------------------------------

// What the platform owes its users right now. Split by role because a
// customer's balance is prepaid spend while a rider's is earnings awaiting
// withdrawal — different liabilities, different urgency.
export type WalletFloat = {
  total_balance: number;
  rider_balance: number;
  customer_balance: number;
  business_balance: number;
  wallet_count: number;
};

// ---------------------------------------------------------------------------
// Marketplace — GET /admin/marketplace/*
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "rejected",
  "cancelled",
];

export type MarketplaceSummary = {
  total_orders: number;
  completed_orders: number;
  /** Completed orders only — a pending basket is not revenue. */
  gmv: number;
  items_total: number;
  delivery_fees: number;
  orders_by_status: Partial<Record<OrderStatus, number>>;
};

export type MarketplaceOrder = {
  id: number;
  merchant_id: number;
  merchant_name: string;
  customer_id: number;
  customer_name: string;
  status: OrderStatus;
  items_total: number;
  delivery_fee: number;
  total: number;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Audit trail — GET /admin/audit-logs
// ---------------------------------------------------------------------------

export type AuditLog = {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_email: string;
  /** verb + subject, e.g. "rider.verify", "settings.update" */
  action: string;
  entity_type: string;
  entity_id?: number;
  /** The request body with credential fields redacted server-side. */
  detail?: Record<string, unknown>;
  status_code: number;
  ip_address?: string;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Live fleet — GET /admin/live/riders
// ---------------------------------------------------------------------------

export type LiveRider = {
  id: number;
  full_name: string;
  phone: string;
  vehicle_type: string;
  plate_number: string;
  lat?: number;
  lng?: number;
  last_location_at?: string;
  /** False once the fix is older than stale_after_seconds. */
  fresh: boolean;
  active_jobs: number;
  rating_avg: number;
  rating_count: number;
};

export type LiveFleet = {
  riders: LiveRider[];
  online: number;
  fresh: number;
  /** The server's staleness rule, echoed so the UI need not duplicate it. */
  stale_after_seconds: number;
  generated_at: string;
};
