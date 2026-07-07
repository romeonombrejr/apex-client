export type FieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'date'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'file';

export type ServiceType = 'one_time' | 'subscription';
export type BillingInterval = 'monthly' | 'yearly';

export type FormFieldDef = {
    label: string;
    key: string;
    type: FieldType;
    help: string | null;
    required: boolean;
    options: string[];
};

export type FormDefinition = {
    id: number;
    name: string;
    fields: FormFieldDef[];
};

export type ServiceCategoryLite = { id: number; name: string };

export type CatalogService = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    type: ServiceType;
    billing_interval: BillingInterval | null;
    price: number;
    image_url: string | null;
    category: ServiceCategoryLite | null;
    form: FormDefinition | null;
};

/** A field answer: scalar (text/number/date/select/radio/file path), or string[] (multi-checkbox). */
export type AnswerValue = string | string[];
export type FormAnswers = Record<string, AnswerValue>;

export type CartItemRow = {
    id: number;
    quantity: number;
    selected: boolean;
    answers: FormAnswers;
    referenced_order_ids: number[];
    complete: boolean;
    line_total: number;
    service: CatalogService;
};

// ── Admin builder ────────────────────────────────────────────────
export type FormRow = {
    id: number;
    name: string;
    description: string | null;
    fields_count: number;
    services_count: number;
};

export type ServiceRow = {
    id: number;
    name: string;
    type: ServiceType;
    billing_interval: BillingInterval | null;
    price: number;
    form: string | null;
    category: string | null;
    is_active: boolean;
    image_url: string | null;
};

export type ServiceCategoryRow = {
    id: number;
    name: string;
    services_count: number;
};

/** A field row while editing in the form builder (help is a string, never null). */
export type FieldInput = {
    label: string;
    key: string;
    type: FieldType;
    help: string;
    required: boolean;
    options: string[];
};

// ── Phase 2: money & fulfillment ─────────────────────────────────
export type StatusBadge = {
    name: string;
    color: string;
    is_completed: boolean;
} | null;

export type OrderStatusRow = {
    id: number;
    name: string;
    color: string;
    position: number;
    is_default: boolean;
    is_completed: boolean;
    is_protected: boolean;
    orders_count: number;
};

export type OrderStatusLite = { id: number; name: string; color: string };

export type OrderRow = {
    id: number;
    number: string;
    name: string;
    quantity: number;
    status: StatusBadge;
    client?: string | null;
    assignee?: string | null;
    created_at: string | null;
};

export type OrderMessage = {
    id: number;
    author_id: number;
    author: string | null;
    body: string;
    attachment_url: string | null;
    attachment_name: string | null;
    created_at: string | null;
};

export type OrderRef = { id: number; number: string; name: string };

export type OrderDetail = OrderRow & {
    status_id: number | null;
    assigned_to: number | null;
    completed_at: string | null;
    invoice: { id: number; number: string } | null;
    answers: FormAnswers;
    form: FormDefinition | null;
    messages: OrderMessage[];
    references: OrderRef[];
};

export type NotificationItem = {
    id: string;
    title: string;
    message: string;
    url: string | null;
    read: boolean;
    created_at: string | null;
};

export type InvoiceItemRow = {
    id: number;
    name: string;
    unit_price: number;
    quantity: number;
    total: number;
    order: { id: number; number: string } | null;
};

export type InvoiceRow = {
    id: number;
    number: string;
    status: string;
    total: number;
    client?: string | null;
    created_at: string | null;
};

export type InvoiceDetail = InvoiceRow & {
    subtotal: number;
    paid_at: string | null;
    note: string | null;
    items: InvoiceItemRow[];
};

export type CreditTransactionRow = {
    id: number;
    amount: number;
    type: string;
    note: string | null;
    by?: string | null;
    created_at: string | null;
};

export type ClientBalanceRow = {
    id: number;
    name: string;
    email: string;
    balance: number;
};
