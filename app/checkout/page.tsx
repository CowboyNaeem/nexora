"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "MOBILE_BANKING";

type MobileProvider = "BKASH" | "NAGAD" | "ROCKET";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number | string;
    sku?: string;
    images?: {
      url: string;
    }[];
  };
  variant?: {
    id: string;
    name: string;
    price: number | string | null;
    sku: string;
  } | null;
};

type CartResponse = {
  success: boolean;
  message?: string;
  cart?: {
    id: string | null;
    items: CartItem[];
  };
};

type UserResponse = {
  success: boolean;
  message?: string;
  user?: {
    id?: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
};

type OrderResponse = {
  success: boolean;
  message?: string;
  order?: {
    id: string;
    orderNumber: string;
    totalAmount: number | string;
  };
};

const divisions: Record<string, string[]> = {
  Dhaka: [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
  ],

  Chattogram: [
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
  ],

  Rajshahi: [
    "Bogura",
    "Chapainawabganj",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
  ],

  Khulna: [
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
  ],

  Barishal: [
    "Barguna",
    "Barishal",
    "Bhola",
    "Jhalokati",
    "Patuakhali",
    "Pirojpur",
  ],

  Sylhet: [
    "Habiganj",
    "Moulvibazar",
    "Sunamganj",
    "Sylhet",
  ],

  Rangpur: [
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
  ],

  Mymensingh: [
    "Jamalpur",
    "Mymensingh",
    "Netrokona",
    "Sherpur",
  ],
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50 focus:bg-white/[0.06]";

const selectClass =
  "w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [division, setDivision] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");

  const [mobileProvider, setMobileProvider] =
    useState<MobileProvider>("BKASH");

  const [transactionId, setTransactionId] = useState("");

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");

  const availableCities = division
    ? divisions[division] || []
    : [];

  // =========================================================
  // Load cart + user
  // =========================================================

  useEffect(() => {
    async function loadCheckoutData() {
      try {
        setLoading(true);
        setError("");

        const [cartResponse, userResponse] =
          await Promise.all([
            fetch("/api/cart", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }),

            fetch("/api/auth/me", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }),
          ]);

        const cartText = await cartResponse.text();
        const userText = await userResponse.text();

        let cartData: CartResponse;
        let userData: UserResponse;

        try {
          cartData = cartText ? JSON.parse(cartText) : {
            success: false,
            message: "Empty cart response.",
          };
        } catch {
          cartData = {
            success: false,
            message: "Invalid response received while loading your cart.",
          };
        }

        try {
          userData = userText ? JSON.parse(userText) : {
            success: false,
            message: "Empty account response.",
          };
        } catch {
          userData = {
            success: false,
            message: "Invalid response received while loading your account.",
          };
        }

        if (
          !cartResponse.ok ||
          !cartData.success
        ) {
          setError(
            cartData.message ||
              "Unable to load your cart."
          );
          return;
        }

        if (
          !userResponse.ok ||
          !userData.success
        ) {
          setError(
            userData.message ||
              "Unable to load your account information."
          );
          return;
        }

        setItems(cartData.cart?.items || []);

        if (userData.user) {
          setName(userData.user.name || "");
          setPhone(userData.user.phone || "");
        }
      } catch (error) {
        console.error(
          "Checkout loading error:",
          error
        );

        setError(
          "Something went wrong while loading checkout."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, []);

  // =========================================================
  // Price calculations
  // =========================================================

  function getPrice(
    price: number | string | null | undefined
  ) {
    const value = Number(price);
    return Number.isFinite(value) ? value : 0;
  }

  function getItemPrice(item: CartItem) {
    if (
      item.variant &&
      item.variant.price !== null
    ) {
      return getPrice(item.variant.price);
    }

    return getPrice(item.product.price);
  }

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        getItemPrice(item) * item.quantity,
      0
    );
  }, [items]);

  // Currently free shipping.
  // We can add division-based shipping charges later.
  const shippingCost = 0;

  const discountAmount = 0;

  const total =
    subtotal +
    shippingCost -
    discountAmount;

  // =========================================================
  // Division change
  // =========================================================

  function handleDivisionChange(
    value: string
  ) {
    setDivision(value);

    // Reset district when division changes.
    setCity("");
  }

  // =========================================================
  // Place order
  // =========================================================

  async function placeOrder() {
    if (placingOrder) {
      return;
    }

    setError("");

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    const normalizedPhone =
      phone.replace(/\s+/g, "");

    if (
      !/^01[3-9]\d{8}$/.test(
        normalizedPhone
      )
    ) {
      setError(
        "Please enter a valid Bangladesh phone number."
      );
      return;
    }

    if (!division) {
      setError(
        "Please select your division."
      );
      return;
    }

    if (!city) {
      setError(
        "Please select your district."
      );
      return;
    }

    if (!address.trim()) {
      setError(
        "Please enter your full shipping address."
      );
      return;
    }

    if (
      paymentMethod === "MOBILE_BANKING" &&
      !transactionId.trim()
    ) {
      setError(
        `Please enter your ${mobileProvider} transaction ID.`
      );
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            shippingName: name.trim(),
            shippingPhone:
              normalizedPhone,
            shippingDivision: division,
            shippingCity: city,
            shippingAddress:
              address.trim(),
            shippingPostalCode:
              postalCode.trim() || null,
            shippingCountry:
              "Bangladesh",

            paymentMethod,

            paymentProvider:
              paymentMethod ===
              "MOBILE_BANKING"
                ? mobileProvider
                : null,

            transactionId:
              paymentMethod ===
              "MOBILE_BANKING"
                ? transactionId.trim()
                : null,
          }),
        }
      );

      const responseText = await response.text();

      let data: OrderResponse;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {
              success: false,
              message: "The server returned an empty response.",
            };
      } catch {
        data = {
          success: false,
          message: "The server returned an invalid response.",
        };
      }

      if (
        !response.ok ||
        !data.success
      ) {
        setError(
          data.message ||
            "Unable to place your order."
        );
        return;
      }

      if (!data.order) {
        setError(
          "Order was created, but order information was not returned."
        );
        return;
      }

      // Redirect after successful order.
      window.location.href =
        `/orders/${data.order.id}`;
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      setError(
        "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  // =========================================================
  // Loading state
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-4 w-20 rounded bg-white/10" />

          <div className="mt-4 h-12 w-64 rounded bg-white/10" />

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="h-[700px] rounded-3xl bg-white/5" />

            <div className="h-[500px] rounded-3xl bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // Empty cart
  // =========================================================

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-black px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-white/[0.08] bg-white/[0.025] p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-3xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
            Add some products to your cart
            before proceeding to checkout.
          </p>

          <a
            href="/"
            className="mt-8 inline-flex rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Continue Shopping
          </a>
        </div>
      </main>
    );
  }

  // =========================================================
  // Main checkout
  // =========================================================

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-10">
          <a
  href="/"
  className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400 transition-opacity hover:opacity-70"
>
  NEXORA
</a>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Checkout
          </h1>

          <p className="mt-3 text-sm text-white/40">
            Complete your delivery and payment
            information.
          </p>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="space-y-8">

            {/* Shipping information */}

            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">

              <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
                Step 1
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Delivery information
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Where should we deliver your
                order?
              </p>

              <div className="mt-8 space-y-5">

                {/* Name */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Full name
                  </label>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>

                {/* Phone */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Phone number
                  </label>

                  <input
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    placeholder="01XXXXXXXXX"
                    type="tel"
                    maxLength={11}
                    className={inputClass}
                  />

                  <p className="mt-2 text-xs text-white/25">
                    Example: 01712345678
                  </p>
                </div>

                {/* Division + District */}

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      Division
                    </label>

                    <select
                      value={division}
                      onChange={(event) =>
                        handleDivisionChange(
                          event.target.value
                        )
                      }
                      className={selectClass}
                    >
                      <option value="">
                        Select division
                      </option>

                      {Object.keys(
                        divisions
                      ).map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-white/70">
                      District
                    </label>

                    <select
                      value={city}
                      onChange={(event) =>
                        setCity(
                          event.target.value
                        )
                      }
                      disabled={!division}
                      className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <option value="">
                        {division
                          ? "Select district"
                          : "Select division first"}
                      </option>

                      {availableCities.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                </div>

                {/* Full address */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Full address
                  </label>

                  <textarea
                    value={address}
                    onChange={(event) =>
                      setAddress(
                        event.target.value
                      )
                    }
                    placeholder="House / Flat, Road, Area, Thana..."
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Postal code */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Postal code
                    <span className="ml-2 text-xs text-white/25">
                      Optional
                    </span>
                  </label>

                  <input
                    value={postalCode}
                    onChange={(event) =>
                      setPostalCode(
                        event.target.value
                      )
                    }
                    placeholder="1205"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </div>

                {/* Country */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">
                    Country
                  </label>

                  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
                    🇧🇩 Bangladesh
                  </div>
                </div>

              </div>
            </section>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">

              <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
                Step 2
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Payment method
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Choose how you want to pay.
              </p>

              <div className="mt-7 space-y-3">

                {/* COD */}

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod(
                      "CASH_ON_DELIVERY"
                    );
                    setTransactionId("");
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    paymentMethod ===
                    "CASH_ON_DELIVERY"
                      ? "border-violet-400/60 bg-violet-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-xl">
                      💵
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">
                        Cash on Delivery
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        Pay when your order
                        arrives.
                      </p>
                    </div>

                    <div
                      className={`h-4 w-4 rounded-full border ${
                        paymentMethod ===
                        "CASH_ON_DELIVERY"
                          ? "border-violet-400 bg-violet-400"
                          : "border-white/30"
                      }`}
                    />
                  </div>
                </button>

                {/* Mobile Banking */}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod(
                      "MOBILE_BANKING"
                    )
                  }
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    paymentMethod ===
                    "MOBILE_BANKING"
                      ? "border-violet-400/60 bg-violet-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                      📱
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">
                        Mobile Banking
                      </p>

                      <p className="mt-1 text-xs text-white/40">
                        bKash, Nagad or Rocket
                      </p>
                    </div>

                    <div
                      className={`h-4 w-4 rounded-full border ${
                        paymentMethod ===
                        "MOBILE_BANKING"
                          ? "border-violet-400 bg-violet-400"
                          : "border-white/30"
                      }`}
                    />
                  </div>
                </button>

              </div>

              {/* Mobile banking details */}

{paymentMethod === "MOBILE_BANKING" && (
  <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-5">

    {/* Provider selection */}

    <p className="text-sm font-medium">
      Select mobile banking provider
    </p>

    <div className="mt-4 grid grid-cols-3 gap-3">

      {(
        [
          "BKASH",
          "NAGAD",
          "ROCKET",
        ] as MobileProvider[]
      ).map((provider) => (
        <button
          key={provider}
          type="button"
          onClick={() => {
            setMobileProvider(provider);
            setTransactionId("");
          }}
          className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
            mobileProvider === provider
              ? "border-violet-400 bg-violet-500/10 text-white"
              : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
          }`}
        >
          {provider === "BKASH"
            ? "bKash"
            : provider === "NAGAD"
              ? "Nagad"
              : "Rocket"}
        </button>
      ))}

    </div>

    {/* Payment instructions */}

    <div className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-5">

      <p className="text-sm font-medium text-white">
        Payment instructions
      </p>

      <div className="mt-3 space-y-3 text-sm text-white/60">

        <p>
          Send the exact order amount using{" "}
          <span className="font-medium text-white">
            {mobileProvider === "BKASH"
              ? "bKash"
              : mobileProvider === "NAGAD"
                ? "Nagad"
                : "Rocket"}
          </span>
          .
        </p>

        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-xs text-white/40">Amount to pay</p>
          <p className="mt-1 text-lg font-semibold text-emerald-300">
            ৳{total.toFixed(2)}
          </p>
        </div>

        <p className="text-white/50">
          Send Money to:
        </p>

        <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-3">

          <p className="text-xs text-white/40">
            {mobileProvider === "BKASH"
              ? "bKash Number"
              : mobileProvider === "NAGAD"
                ? "Nagad Number"
                : "Rocket Number"}
          </p>

          <p className="mt-1 font-semibold text-violet-300">
            {mobileProvider === "BKASH"
              ? process.env.NEXT_PUBLIC_BKASH_NUMBER
              : mobileProvider === "NAGAD"
                ? process.env.NEXT_PUBLIC_NAGAD_NUMBER
                : process.env.NEXT_PUBLIC_ROCKET_NUMBER}
          </p>

        </div>

        <p className="text-xs leading-5 text-white/35">
          After completing the payment, enter your
          transaction ID below. Your payment will remain
          pending until it is verified by Nexora.
        </p>

      </div>

    </div>

    {/* Transaction ID */}

    <div className="mt-5">

      <label className="mb-2 block text-sm font-medium text-white/70">
        Transaction ID
        <span className="ml-2 text-xs text-red-400">
          Required
        </span>
      </label>

      <input
        value={transactionId}
        onChange={(event) =>
          setTransactionId(
            event.target.value.replace(/\s+/g, "").toUpperCase()
          )
        }
        placeholder={`Enter ${mobileProvider} transaction ID`}
        className={inputClass}
        autoComplete="off"
      />

    </div>

  </div>
)}
            </section>

          </div>

          {/* =================================================
              RIGHT SIDE — ORDER SUMMARY
          ================================================= */}

          <aside className="h-fit rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 lg:sticky lg:top-8">

            <p className="text-xs uppercase tracking-[0.2em] text-violet-400">
              Step 3
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              Order summary
            </h2>

            {/* Items */}

            <div className="mt-6 max-h-[420px] space-y-4 overflow-y-auto pr-1">

              {items.map((item) => {
                const price =
                  getItemPrice(item);

                const image =
                  item.product.images &&
                  item.product.images.length >
                    0
                    ? item.product.images[0]
                        .url
                    : null;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3"
                  >

                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white/[0.05]">

                      {image ? (
                        <img
                          src={image}
                          alt={
                            item.product.name
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-white/20">
                          ◇
                        </div>
                      )}

                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-bold">
                        {item.quantity}
                      </span>

                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.product.name}
                      </p>

                      {item.variant && (
                        <p className="mt-1 truncate text-xs text-white/30">
                          {item.variant.name}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-white/40">
                        ${price.toFixed(2)} ×{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-medium">
                      $
                      {(
                        price *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                  </div>
                );
              })}

            </div>

            {/* Totals */}

            <div className="mt-6 space-y-4 border-t border-white/[0.08] pt-6">

              <div className="flex justify-between text-sm">
                <span className="text-white/40">
                  Subtotal
                </span>

                <span>
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-white/40">
                  Shipping
                </span>

                <span className="text-emerald-400">
                  Free
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">
                    Discount
                  </span>

                  <span className="text-emerald-400">
                    -$
                    {discountAmount.toFixed(
                      2
                    )}
                  </span>
                </div>
              )}

              <div className="border-t border-white/[0.08] pt-4">

                <div className="flex items-center justify-between">

                  <span className="font-medium">
                    Total
                  </span>

                  <span className="text-2xl font-semibold">
                    ${total.toFixed(2)}
                  </span>

                </div>

              </div>

            </div>

            {/* Place order */}

            <button
              type="button"
              onClick={placeOrder}
              disabled={placingOrder}
              className="mt-7 w-full rounded-xl bg-violet-500 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placingOrder
                ? "Placing order..."
                : `Place Order • $${total.toFixed(
                    2
                  )}`}
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-white/25">
              By placing your order, you agree
              to Nexora's terms and conditions.
            </p>

            <a
              href="/cart"
              className="mt-5 block text-center text-sm text-white/40 transition hover:text-white"
            >
              ← Back to cart
            </a>

          </aside>

        </div>
      </div>
    </main>
  );
}