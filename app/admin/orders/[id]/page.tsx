 "use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

/* =========================================================
   TYPES
========================================================= */

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type ShipmentStatus =
  | "PENDING"
  | "PACKED"
  | "SHIPPED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "RETURNED";

type OrderItem = {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: string | number;
  totalPrice: string | number;
  imageUrl?: string | null;
  productImage?: string | null;
  productImageUrl?: string | null;
  image?: string | null;
  product?: {
    imageUrl?: string | null;
    image?: string | null;
  } | null;
};

type Shipment = {
  status: ShipmentStatus;
  courier?: string | null;
  trackingNumber?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
};

type Payment = {
  method: string;
  status: string;
  amount: string | number;
  transactionId?: string | null;
  paidAt?: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: string | number;
  shippingCost: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  shippingName: string;
  shippingPhone: string;
  shippingDivision: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode?: string | null;
  shippingCountry: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  items: OrderItem[];
  payment?: Payment | null;
  shipment?: Shipment | null;
};

/* =========================================================
   CONSTANTS
========================================================= */

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

const ALL_ORDER_STATUSES: OrderStatus[] = [
  ...ORDER_STATUSES,
  "CANCELLED",
  "REFUNDED",
];

const SHIPMENT_STATUSES: ShipmentStatus[] = [
  "PENDING",
  "PACKED",
  "SHIPPED",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
];

/* =========================================================
   HELPERS
========================================================= */

function money(value: string | number) {
  return `৳${Number(value || 0).toFixed(2)}`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusTone(status: string) {
  switch (status) {
    case "DELIVERED":
      return {
        text: "text-emerald-300",
        bg: "bg-emerald-400/[0.09]",
        border: "border-emerald-400/20",
        dot: "bg-emerald-400",
      };

    case "SHIPPED":
    case "IN_TRANSIT":
      return {
        text: "text-sky-300",
        bg: "bg-sky-400/[0.09]",
        border: "border-sky-400/20",
        dot: "bg-sky-400",
      };

    case "PROCESSING":
    case "PACKED":
      return {
        text: "text-violet-300",
        bg: "bg-violet-400/[0.09]",
        border: "border-violet-400/20",
        dot: "bg-violet-400",
      };

    case "CONFIRMED":
      return {
        text: "text-blue-300",
        bg: "bg-blue-400/[0.09]",
        border: "border-blue-400/20",
        dot: "bg-blue-400",
      };

    case "CANCELLED":
    case "RETURNED":
      return {
        text: "text-red-300",
        bg: "bg-red-400/[0.09]",
        border: "border-red-400/20",
        dot: "bg-red-400",
      };

    case "REFUNDED":
      return {
        text: "text-orange-300",
        bg: "bg-orange-400/[0.09]",
        border: "border-orange-400/20",
        dot: "bg-orange-400",
      };

    default:
      return {
        text: "text-amber-300",
        bg: "bg-amber-400/[0.09]",
        border: "border-amber-400/20",
        dot: "bg-amber-400",
      };
  }
}

function paymentTone(status: string) {
  switch (status.toUpperCase()) {
    case "PAID":
      return "text-emerald-300";
    case "FAILED":
    case "CANCELLED":
      return "text-red-300";
    case "REFUNDED":
      return "text-orange-300";
    default:
      return "text-amber-300";
  }
}

/* =========================================================
   ICONS
========================================================= */

function Icon({
  name,
  size = 20,
}: {
  name:
    | "arrow"
    | "package"
    | "user"
    | "pin"
    | "card"
    | "truck"
    | "check"
    | "refresh"
    | "copy"
    | "mail"
    | "phone"
    | "calendar"
    | "external";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      );

    case "package":
      return (
        <svg {...common}>
          <path d="m16.5 9.4-9-5.19" />
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );

    case "pin":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "card":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );

    case "truck":
      return (
        <svg {...common}>
          <path d="M3 6h11v10H3z" />
          <path d="M14 9h4l3 3v4h-7z" />
          <circle cx="7" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-14.9-3L3 11" />
          <path d="M3 5v6h6" />
          <path d="M4 13a8.1 8.1 0 0 0 14.9 3L21 13" />
          <path d="M21 19v-6h-6" />
        </svg>
      );

    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );

    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );

    case "phone":
      return (
        <svg {...common}>
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M14 3h7v7" />
          <path d="M10 14 21 3" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      );
  }
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function SectionCard({
  icon,
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-[22px] border border-white/[0.075] bg-[#090d16]/95 shadow-[0_18px_55px_rgba(0,0,0,0.16)] ${className}`}
    >
      {(icon || eyebrow || title || action) && (
        <div className="flex items-start justify-between gap-4 min-h-[82px] border-b border-white/[0.065] px-6 py-5 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.08] bg-white/[0.025] text-white/65">
                {icon}
              </div>
            )}

            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
                  {eyebrow}
                </p>
              )}

              <h2 className="mt-0.5 truncate text-[16px] font-semibold tracking-[-0.01em] text-white">
                {title}
              </h2>

              {description && (
                <p className="mt-1 text-xs leading-5 text-white/35">
                  {description}
                </p>
              )}
            </div>
          </div>

          {action}
        </div>
      )}

      {children}
    </section>
  );
}

function StatusBadge({
  status,
  large = false,
}: {
  status: string;
  large?: boolean;
}) {
  const tone = statusTone(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${tone.border} ${tone.bg} ${tone.text} ${
        large ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-[10px]"
      } font-semibold uppercase tracking-[0.08em]`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {label(status)}
    </span>
  );
}

function Field({
  label: fieldLabel,
  value,
  action,
}: {
  label: string;
  value: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/28">
          {fieldLabel}
        </p>
        {action}
      </div>
      <p className="mt-2 break-words text-sm leading-6 text-white/80">
        {value || "—"}
      </p>
    </div>
  );
}

function MiniStat({
  label: statLabel,
  value,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  tone?: "default" | "green" | "blue";
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-300"
      : tone === "blue"
        ? "text-sky-300"
        : "text-white";

  return (
    <div className="rounded-[16px] border border-white/[0.065] bg-black/20 px-4 py-4">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
        {statLabel}
      </p>
      <p className={`mt-2 text-sm font-medium ${toneClass}`}>{value}</p>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus | "">("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [selectedShipmentStatus, setSelectedShipmentStatus] =
    useState<ShipmentStatus>("PENDING");
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updatingShipment, setUpdatingShipment] = useState(false);

  const [statusMessage, setStatusMessage] = useState("");
  const [shipmentMessage, setShipmentMessage] = useState("");
  const [copied, setCopied] = useState(false);

  /* =======================================================
     LOAD ORDER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/admin/orders/${id}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load order");
        }

        if (!mounted) return;

        const loadedOrder: Order = data.order;

        setOrder(loadedOrder);
        setSelectedStatus(loadedOrder.status);

        if (loadedOrder.shipment) {
          setSelectedShipmentStatus(loadedOrder.shipment.status);
          setCourier(loadedOrder.shipment.courier || "");
          setTrackingNumber(
            loadedOrder.shipment.trackingNumber || ""
          );
        } else {
          setSelectedShipmentStatus("PENDING");
          setCourier("");
          setTrackingNumber("");
        }
      } catch (err) {
        console.error("Admin order load error:", err);

        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load order"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) loadOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* =======================================================
     UPDATE ORDER STATUS
  ======================================================= */

  async function updateOrderStatus() {
    if (!order || !selectedStatus || selectedStatus === order.status) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setStatusMessage("");
      setError("");

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update order status"
        );
      }

      setOrder((currentOrder) =>
        currentOrder
          ? { ...currentOrder, status: data.order.status }
          : currentOrder
      );

      setSelectedStatus(data.order.status);
      setStatusMessage("Order status updated successfully.");
    } catch (err) {
      console.error("Admin order status update error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to update order status"
      );

      if (order) setSelectedStatus(order.status);
    } finally {
      setUpdatingStatus(false);
    }
  }

  /* =======================================================
     UPDATE SHIPMENT
  ======================================================= */

  async function updateShipment() {
    if (!order) return;

    try {
      setUpdatingShipment(true);
      setShipmentMessage("");
      setError("");

      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          shipmentStatus: selectedShipmentStatus,
          courier: courier.trim() || null,
          trackingNumber: trackingNumber.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update shipment");
      }

      setOrder((currentOrder) =>
        currentOrder
          ? { ...currentOrder, shipment: data.shipment }
          : currentOrder
      );

      if (data.shipment) {
        setSelectedShipmentStatus(data.shipment.status);
        setCourier(data.shipment.courier || "");
        setTrackingNumber(data.shipment.trackingNumber || "");
      }

      setShipmentMessage("Shipment information saved successfully.");
    } catch (err) {
      console.error("Admin shipment update error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to update shipment"
      );
    } finally {
      setUpdatingShipment(false);
    }
  }

  async function copyOrderNumber() {
    if (!order) return;

    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  }

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const currentStatusIndex = useMemo(() => {
    if (!order) return 0;

    const index = ORDER_STATUSES.indexOf(order.status);
    return index >= 0 ? index : 0;
  }, [order]);

  const hasNormalStatus =
    !!order && ORDER_STATUSES.includes(order.status);

  const progressPercent = hasNormalStatus
    ? `${(currentStatusIndex / (ORDER_STATUSES.length - 1)) * 100}%`
    : "0%";

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#05070b] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1400px] animate-pulse">
          <div className="h-4 w-28 rounded bg-white/[0.06]" />
          <div className="mt-8 h-12 w-80 rounded-xl bg-white/[0.06]" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/[0.04]" />

          <div className="mt-10 h-32 rounded-[24px] bg-white/[0.035]" />

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
            <div className="h-96 rounded-[24px] bg-white/[0.035]" />
            <div className="space-y-5">
              <div className="h-56 rounded-[24px] bg-white/[0.035]" />
              <div className="h-48 rounded-[24px] bg-white/[0.035]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error && !order) {
    return (
      <main className="min-h-screen bg-[#05070b] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
          >
            <Icon name="arrow" size={17} />
            Back to orders
          </Link>

          <div className="mt-8 rounded-[24px] border border-red-400/20 bg-red-400/[0.05] p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300/70">
              Unable to load order
            </p>
            <h1 className="mt-3 text-2xl font-semibold">
              {error || "Order not found"}
            </h1>
          </div>
        </div>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#05070b] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[12%] top-[-220px] h-[500px] w-[500px] rounded-full bg-violet-600/[0.055] blur-[130px]" />
        <div className="absolute right-[-160px] top-[15%] h-[420px] w-[420px] rounded-full bg-sky-500/[0.035] blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Link
              href="/admin/orders"
              className="group inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
            >
              <span className="transition-transform group-hover:-translate-x-0.5">
                <Icon name="arrow" size={17} />
              </span>
              Back to orders
            </Link>

            <div className="mt-8 flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-violet-400">
                NEXORA ADMIN
              </span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-xs text-white/35">
                Order management
              </span>
            </div>

            <h1 className="mt-3 text-[38px] font-semibold tracking-[-0.045em] text-white sm:text-5xl">
              Order details
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/38">
              <span className="font-mono text-[12px] text-white/45">
                {order.orderNumber}
              </span>
              <span className="text-white/15">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="calendar" size={14} />
                {formatDate(order.createdAt)}
              </span>

              <button
                type="button"
                onClick={copyOrderNumber}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-white/45 transition hover:border-white/[0.14] hover:text-white"
              >
                <Icon name="copy" size={13} />
                {copied ? "Copied" : "Copy ID"}
              </button>
            </div>
          </div>

          <div
            className={`rounded-[20px] border px-5 py-4 ${statusTone(order.status).border} ${statusTone(order.status).bg} lg:min-w-[190px]`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Current status
            </p>

            <div className="mt-2">
              <StatusBadge status={order.status} large />
            </div>
          </div>
        </header>

        {/* =================================================
            ERROR / SUCCESS
        ================================================= */}

        {error && (
          <div className="mt-5 flex items-center gap-3 rounded-[16px] border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />
            {error}
          </div>
        )}

        {/* =================================================
            ORDER TIMELINE
        ================================================= */}

        <section className="mt-8 overflow-hidden rounded-[22px] border border-white/[0.075] bg-[#090d16]/90 px-5 py-8 shadow-[0_18px_55px_rgba(0,0,0,0.12)] sm:px-8">
          {hasNormalStatus ? (
            <div className="relative">
              {/* Base line */}
              <div className="absolute left-[10%] right-[10%] top-5 h-px bg-white/[0.08]" />

              {/* Active line */}
              <div
                className="absolute left-[10%] top-5 h-px bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500 transition-all duration-700"
                style={{ width: `calc(${progressPercent} * 0.8)` }}
              />

              <div className="relative grid grid-cols-5">
                {ORDER_STATUSES.map((status, index) => {
                  const completed = index < currentStatusIndex;
                  const current = index === currentStatusIndex;

                  return (
                    <div
                      key={status}
                      className="flex min-w-0 flex-col items-center"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xs transition-all duration-500 ${
                          completed || current
                            ? "border-violet-300 bg-violet-500 text-white shadow-[0_0_0_6px_rgba(139,92,246,0.10),0_8px_30px_rgba(139,92,246,0.25)]"
                            : "border-white/[0.10] bg-[#070a10] text-white/25"
                        }`}
                      >
                        {completed ? (
                          <Icon name="check" size={16} />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <p
                        className={`mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-[11px] ${
                          current
                            ? "text-white"
                            : completed
                              ? "text-white/55"
                              : "text-white/25"
                        }`}
                      >
                        {label(status)}
                      </p>

                      <p className="mt-1 text-[9px] text-white/20 sm:text-[10px]">
                        {current
                          ? "Current"
                          : completed
                            ? "Completed"
                            : "Upcoming"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-[16px] border border-white/[0.07] bg-white/[0.02] px-4 py-3">
              <span
                className={`h-2 w-2 rounded-full ${
                  order.status === "CANCELLED"
                    ? "bg-red-400"
                    : "bg-orange-400"
                }`}
              />
              <p className="text-sm text-white/50">
                This order is{" "}
                <span className="font-medium text-white">
                  {label(order.status)}
                </span>
                .
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            TOP CONTENT
        ================================================= */}

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.8fr)]">
          {/* ORDER ITEMS */}
          <SectionCard
            icon={<Icon name="package" />}
            eyebrow="Order items"
            title={`${order.items.length} ${
              order.items.length === 1 ? "item" : "items"
            }`}
            description="Products included in this order"
            action={
              <span className="hidden font-mono text-[10px] text-white/20 sm:block">
                {order.orderNumber}
              </span>
            }
          >
            <div className="divide-y divide-white/[0.06]">
              {order.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-6"
                >
                  {(() => {
                    const imageSrc =
                      item.imageUrl ||
                      item.productImageUrl ||
                      item.productImage ||
                      item.image ||
                      item.product?.imageUrl ||
                      item.product?.image ||
                      null;

                    return imageSrc ? (
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.035] shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
                        <img
                          src={imageSrc}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-violet-400/[0.10] to-white/[0.02] text-xs font-semibold text-white/35">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    );
                  })()}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-white">
                      {item.productName}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-white/30">
                      <span>SKU {item.sku}</span>
                      <span className="text-white/15">•</span>
                      <span>Qty {item.quantity}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xs text-white/25">
                      {money(item.unitPrice)} × {item.quantity}
                    </p>
                    <p className="mt-1 text-[15px] font-semibold text-white">
                      {money(item.totalPrice)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end gap-10 px-6 py-5">
                <span className="text-xs text-white/35">
                  Items total
                </span>
                <span className="text-lg font-semibold">
                  {money(order.subtotal)}
                </span>
              </div>
            </div>
          </SectionCard>

          {/* FINANCIAL COLUMN */}
          <div className="space-y-5">
            <SectionCard
              icon={<Icon name="card" />}
              eyebrow="Order summary"
              title="Payment summary"
            >
              <div className="px-6 py-6">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-5">
                    <span className="text-white/40">Subtotal</span>
                    <span className="font-medium">
                      {money(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-5">
                    <span className="text-white/40">Shipping</span>
                    <span
                      className={
                        Number(order.shippingCost) === 0
                          ? "font-medium text-emerald-300"
                          : "font-medium"
                      }
                    >
                      {Number(order.shippingCost) === 0
                        ? "Free"
                        : money(order.shippingCost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-5">
                    <span className="text-white/40">Discount</span>
                    <span
                      className={
                        Number(order.discountAmount) > 0
                          ? "font-medium text-emerald-300"
                          : "text-white/60"
                      }
                    >
                      {Number(order.discountAmount) === 0
                        ? "—"
                        : `-${money(order.discountAmount)}`}
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/[0.07] pt-5">
                  <div className="flex items-end justify-between gap-5">
                    <div>
                      <p className="text-xs text-white/35">Total amount</p>
                      <p className="mt-1 text-[11px] text-white/20">
                        Including all applicable charges
                      </p>
                    </div>

                    <p className="text-2xl font-semibold tracking-tight text-violet-300">
                      {money(order.totalAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<Icon name="card" />}
              eyebrow="Payment"
              title={
                order.payment
                  ? label(order.payment.method)
                  : "Payment information"
              }
              action={
                order.payment ? (
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${paymentTone(
                      order.payment.status
                    )}`}
                  >
                    {label(order.payment.status)}
                  </span>
                ) : undefined
              }
            >
              {order.payment ? (
                <div className="grid gap-4 px-6 py-5">
                  <MiniStat
                    label="Amount"
                    value={money(order.payment.amount)}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    <Field
                      label="Transaction ID"
                      value={
                        order.payment.transactionId || "No transaction ID"
                      }
                    />
                    {order.payment.paidAt && (
                      <Field
                        label="Paid at"
                        value={formatDate(order.payment.paidAt)}
                      />
                    )}
                  </div>
                </div>
              ) : (
                <p className="px-6 py-6 text-sm text-white/35">
                  No payment information available.
                </p>
              )}
            </SectionCard>
          </div>
        </div>

        {/* =================================================
            CUSTOMER + DELIVERY
        ================================================= */}

        <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-2">
          <SectionCard
            icon={<Icon name="user" />}
            className="h-full"
            eyebrow="Customer"
            title="Customer information"
            description="Information associated with this order"
          >
            <div className="grid gap-5 px-6 py-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Name" value={order.user.name} />

              <Field
                label="Phone"
                value={
                  order.user.phone ||
                  order.shippingPhone ||
                  "—"
                }
              />

              <Field
                label="Email"
                value={
                  <a
                    href={`mailto:${order.user.email}`}
                    className="break-all text-sky-300 transition hover:text-sky-200"
                  >
                    {order.user.email}
                  </a>
                }
              />

              <Field label="Customer ID" value={order.user.id} />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Icon name="pin" />}
            className="h-full"
            eyebrow="Shipping information"
            title="Delivery address"
            description="Where this order should be delivered"
          >
            <div className="grid gap-x-8 gap-y-5 px-6 py-6 sm:grid-cols-2">
              <Field label="Recipient" value={order.shippingName} />

              <Field
                label="Phone"
                value={
                  <a
                    href={`tel:${order.shippingPhone}`}
                    className="transition hover:text-white"
                  >
                    {order.shippingPhone}
                  </a>
                }
              />

              <Field
                label="Division"
                value={order.shippingDivision}
              />

              <Field label="City" value={order.shippingCity} />

              <div className="sm:col-span-2">
                <Field
                  label="Address"
                  value={order.shippingAddress}
                />
              </div>

              <Field
                label="Postal code"
                value={order.shippingPostalCode || "—"}
              />

              <Field
                label="Country"
                value={order.shippingCountry}
              />
            </div>
          </SectionCard>
        </div>

        {/* =================================================
            FULFILLMENT
        ================================================= */}

        <SectionCard
          className="mt-6"
          icon={<Icon name="truck" />}
          eyebrow="Fulfillment"
          title="Order fulfillment"
          description="Manage order progress, shipment and delivery tracking"
        >
          {/* =================================================
              CONTROL GRID — intentionally symmetric
          ================================================= */}
          <div className="grid lg:grid-cols-2">
            {/* ORDER STATUS */}
            <div className="flex min-h-[380px] flex-col border-b border-white/[0.065] p-6 lg:border-b-0 lg:border-r lg:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-violet-400/15 bg-violet-400/[0.06] text-violet-300">
                  <Icon name="refresh" size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">
                    Order status
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-white">
                    Update order progress
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Change the current status of this order.
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <label
                  htmlFor="order-status"
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30"
                >
                  Order status
                </label>

                <select
                  id="order-status"
                  value={selectedStatus}
                  onChange={(event) =>
                    setSelectedStatus(event.target.value as OrderStatus)
                  }
                  disabled={updatingStatus}
                  className="mt-2 h-12 w-full rounded-[13px] border border-white/[0.08] bg-[#06090e] px-4 text-sm text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ALL_ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {label(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-auto pt-5">
                <button
                  type="button"
                  onClick={updateOrderStatus}
                  disabled={
                    updatingStatus ||
                    !selectedStatus ||
                    selectedStatus === order.status
                  }
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(139,92,246,0.15)] transition hover:from-violet-500 hover:to-fuchsia-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:bg-none disabled:text-white/25 disabled:shadow-none"
                >
                  {updatingStatus ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving...
                    </>
                  ) : selectedStatus === order.status ? (
                    "Status is up to date"
                  ) : (
                    <>
                      <Icon name="refresh" size={16} />
                      Update order status
                    </>
                  )}
                </button>

                {statusMessage && (
                  <div className="mt-3 flex items-center gap-2 rounded-[13px] border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-xs text-emerald-300">
                    <Icon name="check" size={15} />
                    {statusMessage}
                  </div>
                )}
              </div>
            </div>

            {/* SHIPMENT */}
            <div className="flex min-h-[380px] flex-col p-6 lg:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-sky-400/15 bg-sky-400/[0.06] text-sky-300">
                  <Icon name="truck" size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">
                    Shipment
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-white">
                    Courier & tracking
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Update delivery progress and tracking information.
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <label
                  htmlFor="shipment-status"
                  className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30"
                >
                  Shipment status
                </label>

                <select
                  id="shipment-status"
                  value={selectedShipmentStatus}
                  onChange={(event) =>
                    setSelectedShipmentStatus(
                      event.target.value as ShipmentStatus
                    )
                  }
                  disabled={updatingShipment}
                  className="mt-2 h-12 w-full rounded-[13px] border border-white/[0.08] bg-[#06090e] px-4 text-sm text-white outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {SHIPMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {label(status)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="courier"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30"
                  >
                    Courier
                  </label>

                  <input
                    id="courier"
                    type="text"
                    value={courier}
                    onChange={(event) => setCourier(event.target.value)}
                    placeholder="Pathao, Steadfast..."
                    disabled={updatingShipment}
                    className="mt-2 h-12 w-full rounded-[13px] border border-white/[0.08] bg-[#06090e] px-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tracking-number"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/30"
                  >
                    Tracking number
                  </label>

                  <input
                    id="tracking-number"
                    type="text"
                    value={trackingNumber}
                    onChange={(event) =>
                      setTrackingNumber(event.target.value)
                    }
                    placeholder="Enter tracking number"
                    disabled={updatingShipment}
                    className="mt-2 h-12 w-full rounded-[13px] border border-white/[0.08] bg-[#06090e] px-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="mt-auto pt-5">
                <button
                  type="button"
                  onClick={updateShipment}
                  disabled={updatingShipment}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-sky-500 px-4 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(14,165,233,0.12)] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-white/25 disabled:shadow-none"
                >
                  {updatingShipment ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Saving shipment...
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={16} />
                      Save shipment
                    </>
                  )}
                </button>

                {shipmentMessage && (
                  <div className="mt-3 flex items-center gap-2 rounded-[13px] border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-xs text-emerald-300">
                    <Icon name="check" size={15} />
                    {shipmentMessage}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =================================================
              LATEST SHIPMENT
          ================================================= */}
          <div className="border-t border-white/[0.065] bg-white/[0.012] px-6 py-6 lg:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/28">
                  Latest shipment
                </p>
                <p className="mt-1 text-xs text-white/30">
                  Latest delivery details
                </p>
              </div>
            </div>

            {order.shipment ? (
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <MiniStat
                  label="Courier"
                  value={order.shipment.courier || "Not assigned"}
                />

                <MiniStat
                  label="Tracking number"
                  value={
                    order.shipment.trackingNumber || "Not assigned"
                  }
                  tone="blue"
                />

                <MiniStat
                  label="Latest delivery event"
                  value={
                    order.shipment.deliveredAt
                      ? `Delivered ${formatDate(order.shipment.deliveredAt)}`
                      : order.shipment.shippedAt
                        ? `Shipped ${formatDate(order.shipment.shippedAt)}`
                        : "No delivery event yet"
                  }
                />
              </div>
            ) : (
              <div className="mt-5 rounded-[16px] border border-dashed border-white/[0.09] bg-black/20 px-4 py-5 text-sm text-white/35">
                Shipment has not been created yet.
              </div>
            )}
          </div>
        </SectionCard>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="flex flex-col gap-2 border-t border-white/[0.06] py-8 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <span>NEXORA Admin • Order management</span>

          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-white/35 transition hover:text-white"
          >
            Back to all orders
            <Icon name="external" size={13} />
          </Link>
        </footer>
      </div>
    </main>
  );
}
