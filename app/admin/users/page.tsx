"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type UserRole =
  | "CUSTOMER"
  | "SELLER"
  | "ADMIN";

type UserStatus =
  | "ACTIVE"
  | "SUSPENDED"
  | "DELETED";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
};

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) => letter.toUpperCase()
    );
}

function money(value: number) {
  return `৳${Number(value).toFixed(2)}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-BD",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =========================================================
   ICONS
========================================================= */

function Icon({
  name,
  size = 20,
}: {
  name:
    | "users"
    | "user"
    | "search"
    | "orders"
    | "money"
    | "shield"
    | "edit"
    | "check"
    | "pause"
    | "trash"
    | "refresh"
    | "plus"
    | "close";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6" />
          <path d="M16 5.5a3 3 0 0 1 0 5.5" />
          <path d="M17 14c2.5.5 3.8 2.3 4 5" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 21c.8-4.5 3.2-6.5 7-6.5s6.2 2 7 6.5" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <rect
            x="4"
            y="3"
            width="16"
            height="18"
            rx="2"
          />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case "money":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M15 9.5c-.7-.7-1.6-1-3-1-1.7 0-3 .8-3 2s1.2 2 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.3-.3-3-1" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 19 6v5c0 4.8-2.8 8-7 10-4.2-2-7-5.2-7-10V6l7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5Z" />
        </svg>
      );

    case "check":
      return (
        <svg {...common}>
          <path d="m5 12 4 4L19 6" />
        </svg>
      );

    case "pause":
      return (
        <svg {...common}>
          <rect
            x="5"
            y="4"
            width="14"
            height="16"
            rx="2"
          />
          <path d="M10 9v6M14 9v6" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M10 11v6M14 11v6" />
          <path d="M6 7l1 14h10l1-14" />
          <path d="M9 7V4h6v3" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.7-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.7 4L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );
  }
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon:
    | "users"
    | "user"
    | "orders"
    | "money"
    | "shield"
    | "check";
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1018] p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
        <Icon name={icon} size={21} />
      </div>

      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   BADGES
========================================================= */

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  const styles = {
    CUSTOMER:
      "border-slate-400/20 bg-slate-400/10 text-slate-300",

    SELLER:
      "border-sky-400/20 bg-sky-400/10 text-sky-300",

    ADMIN:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[role]}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: UserStatus;
}) {
  const styles = {
    ACTIVE:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",

    SUSPENDED:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",

    DELETED:
      "border-red-400/20 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* =========================================================
   CUSTOM FILTER DROPDOWN
========================================================= */

type FilterOption = {
  value: string;
  label: string;
};

function FilterDropdown({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
  }, []);

  const selected =
    options.find((option) => option.value === value) ??
    options[0];

  return (
    <div
      ref={ref}
      className="relative w-full sm:w-[160px]"
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-black/30 px-4 text-sm text-white outline-none transition ${
          open
            ? "border-violet-400/50 bg-white/[0.035]"
            : "border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.025]"
        }`}
      >
        <span className="truncate">{selected.label}</span>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`ml-3 shrink-0 text-white/45 transition-transform ${
            open ? "rotate-180 text-violet-300" : ""
          }`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute right-0 z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/[0.10] bg-[#10131c] p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  isSelected
                    ? "bg-violet-500/15 text-violet-200"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Icon name="check" size={15} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [showAddAdmin, setShowAddAdmin] =
    useState(false);

  const [creatingAdmin, setCreatingAdmin] =
    useState(false);

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => {
      setMessage("");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!error) return;

    const timer = window.setTimeout(() => {
      setError("");
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [error]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (roleFilter !== "ALL") {
        params.set(
          "role",
          roleFilter
        );
      }

      if (statusFilter !== "ALL") {
        params.set(
          "status",
          statusFilter
        );
      }

      const query =
        params.toString();

      const response = await fetch(
        `/api/admin/users${
          query ? `?${query}` : ""
        }`,
        {
          cache: "no-store",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load users"
        );
      }

      setUsers(data.users || []);
    } catch (err) {
      console.error(
        "Admin users error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(
      () => {
        loadUsers();
      },
      250
    );

    return () =>
      clearTimeout(timer);
  }, [
    search,
    roleFilter,
    statusFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: users.length,

      customers: users.filter(
        (user) =>
          user.role === "CUSTOMER"
      ).length,

      sellers: users.filter(
        (user) =>
          user.role === "SELLER"
      ).length,

      admins: users.filter(
        (user) =>
          user.role === "ADMIN"
      ).length,

      active: users.filter(
        (user) =>
          user.status === "ACTIVE"
      ).length,
    };
  }, [users]);

  async function updateUser(
    id: string,
    changes: {
      role?: UserRole;
      status?: UserStatus;
    }
  ) {
    try {
      setUpdatingId(id);
      setMessage("");

      const response = await fetch(
        "/api/admin/users",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id,
            ...changes,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Unable to update user"
        );
      }

      setMessage(
        data.message ||
          "User updated successfully."
      );

      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update user."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function createAdmin() {
    const name = adminForm.name.trim();
    const email = adminForm.email.trim().toLowerCase();

    if (!name || !email || !adminForm.password || !adminForm.confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (name.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (adminForm.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setCreatingAdmin(true);
      setError("");
      setMessage("");

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password: adminForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to create admin account."
        );
      }

      setAdminForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setShowAddAdmin(false);
      setMessage(data.message || "Admin account created successfully.");
      await loadUsers();
    } catch (err) {
      console.error("Create admin error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create admin account."
      );
    } finally {
      setCreatingAdmin(false);
    }
  }

  function getInitials(name: string) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0).toUpperCase()
      )
      .join("");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#080a0f] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">

        {/* HEADER */}

        <header>
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-400">
              NEXORA ADMIN
            </p>

            <span className="h-1 w-1 rounded-full bg-white/20" />

            <span className="text-xs text-white/35">
              User management
            </span>
          </div>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            Users
          </h1>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-6 text-white/40">
              Manage customers, sellers and
              administrators across your
              Nexora store.
            </p>

            <button
              type="button"
              onClick={() => {
                setError("");
                setMessage("");
                setShowAddAdmin(true);
              }}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.22)] transition hover:bg-violet-500 active:scale-[0.98]"
            >
              <Icon name="plus" size={17} />
              Add Admin
            </button>
          </div>
        </header>

        {/* STATS */}

        <section className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total users"
            value={stats.total}
            description="Users matching filters"
            icon="users"
          />

          <StatCard
            label="Customers"
            value={stats.customers}
            description="Store customers"
            icon="user"
          />

          <StatCard
            label="Sellers"
            value={stats.sellers}
            description="Seller accounts"
            icon="users"
          />

          <StatCard
            label="Administrators"
            value={stats.admins}
            description="Admin accounts"
            icon="shield"
          />

          <StatCard
            label="Active"
            value={stats.active}
            description="Currently active"
            icon="check"
          />
        </section>

        {/* MAIN PANEL */}

        <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0e15]">

          {/* TOOLBAR */}

          <div className="border-b border-white/[0.07] p-5 sm:p-6">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div className="relative min-w-0 flex-1 xl:max-w-xl">

                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
                  <Icon
                    name="search"
                    size={18}
                  />
                </div>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, email or phone..."
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/40"
                />
              </div>

              <div className="flex flex-wrap gap-3">

                <FilterDropdown
                  value={roleFilter}
                  onChange={setRoleFilter}
                  ariaLabel="Filter users by role"
                  options={[
                    { value: "ALL", label: "All roles" },
                    { value: "CUSTOMER", label: "Customers" },
                    { value: "SELLER", label: "Sellers" },
                    { value: "ADMIN", label: "Admins" },
                  ]}
                />

                <FilterDropdown
                  value={statusFilter}
                  onChange={setStatusFilter}
                  ariaLabel="Filter users by status"
                  options={[
                    { value: "ALL", label: "All statuses" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "SUSPENDED", label: "Suspended" },
                    { value: "DELETED", label: "Deleted" },
                  ]}
                />

                <button
                  type="button"
                  onClick={loadUsers}
                  className="flex h-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                  title="Refresh users"
                >
                  <Icon
                    name="refresh"
                    size={18}
                  />
                </button>

              </div>
            </div>
          </div>

          {/* MESSAGES */}

          {message && (
            <div className="mx-5 mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-300 sm:mx-6">
              {message}
            </div>
          )}

          {error && (
            <div className="mx-5 mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-300 sm:mx-6">
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="space-y-3 p-5 sm:p-6">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-2xl bg-white/[0.03]"
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            /* EMPTY */

            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-white/30">
                <Icon
                  name="users"
                  size={25}
                />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No users found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                No users match the current
                search and filter criteria.
              </p>

            </div>
          ) : (
            /* TABLE */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[920px] lg:min-w-0 table-fixed">

                <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                  </colgroup>

                <thead>
                  <tr className="border-b border-white/[0.07] text-left">
                    <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      User
                    </th>

                    <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      Role
                    </th>

                    <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      Status
                    </th>

                    <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      Orders
                    </th>

                    <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      Total spent
                    </th>

                    <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map(
                    (user) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/[0.05] transition hover:bg-white/[0.018]"
                      >

                        {/* USER */}

                        <td className="px-5 py-5 align-middle">

                          <div className="flex min-w-0 items-center gap-3">

                            {user.avatar ? (
                              <img
                                src={
                                  user.avatar
                                }
                                alt={
                                  user.name
                                }
                                className="h-11 w-11 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-sm font-semibold text-violet-300">
                                {getInitials(
                                  user.name
                                )}
                              </div>
                            )}

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-white">
                                {user.name}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-white/35">
                                {user.email}
                              </p>

                              {user.phone && (
                                <p className="mt-0.5 text-[11px] text-white/25">
                                  {user.phone}
                                </p>
                              )}

                            </div>
                          </div>

                        </td>

                        {/* ROLE */}

                        <td className="px-4 py-5">
                          <RoleBadge
                            role={
                              user.role
                            }
                          />
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-5">
                          <StatusBadge
                            status={
                              user.status
                            }
                          />
                        </td>

                        {/* ORDERS */}

                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2 text-sm text-white/65">
                            <span className="text-white/30">
                              <Icon
                                name="orders"
                                size={16}
                              />
                            </span>

                            {
                              user.orderCount
                            }
                          </div>
                        </td>

                        {/* SPENDING */}

                        <td className="px-4 py-5">
                          <p className="text-sm font-medium text-white/75">
                            {money(
                              user.totalSpent
                            )}
                          </p>
                        </td>

                        {/* DATE */}

                        <td className="px-4 py-5">
                          <p className="text-sm text-white/45">
                            {formatDate(
                              user.createdAt
                            )}
                          </p>
                        </td>

                        {/* ACTIONS */}

                        <td className="whitespace-nowrap px-4 py-5 lg:px-5">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                setMessage(
                                  `Editing ${user.name} is not enabled yet.`
                                )
                              }
                              title="Edit user"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/40 transition hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
                            >
                              <Icon name="edit" size={16} />
                            </button>

                            {user.status ===
                              "ACTIVE" && (
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  user.id
                                }
                                onClick={() =>
                                  updateUser(
                                    user.id,
                                    {
                                      status:
                                        "SUSPENDED",
                                    }
                                  )
                                }
                                title="Suspend user"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/40 transition hover:border-amber-400/20 hover:bg-amber-400/10 hover:text-amber-300 disabled:opacity-40"
                              >
                                <Icon
                                  name="pause"
                                  size={16}
                                />
                              </button>
                            )}

                            {user.status ===
                              "SUSPENDED" && (
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  user.id
                                }
                                onClick={() =>
                                  updateUser(
                                    user.id,
                                    {
                                      status:
                                        "ACTIVE",
                                    }
                                  )
                                }
                                title="Activate user"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/40 transition hover:border-emerald-400/20 hover:bg-emerald-400/10 hover:text-emerald-300 disabled:opacity-40"
                              >
                                <Icon
                                  name="check"
                                  size={16}
                                />
                              </button>
                            )}

                            {user.status !==
                              "DELETED" && (
                              <button
                                type="button"
                                disabled={
                                  updatingId ===
                                  user.id
                                }
                                onClick={() => {
                                  const confirmed =
                                    window.confirm(
                                      `Mark ${user.name} as deleted?`
                                    );

                                  if (
                                    confirmed
                                  ) {
                                    updateUser(
                                      user.id,
                                      {
                                        status:
                                          "DELETED",
                                      }
                                    );
                                  }
                                }}
                                title="Delete user"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/40 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
                              >
                                <Icon
                                  name="trash"
                                  size={16}
                                />
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          )}

          {/* FOOTER */}

          {!loading &&
            users.length > 0 && (
              <div className="flex flex-col gap-2 border-t border-white/[0.07] px-6 py-4 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Showing {users.length}{" "}
                  {users.length === 1
                    ? "user"
                    : "users"}
                </span>

                <span>
                  NEXORA Admin • User
                  management
                </span>
              </div>
            )}

        </section>

        {showAddAdmin && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !creatingAdmin) {
                setShowAddAdmin(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-admin-title"
              className="w-full max-w-lg rounded-3xl border border-white/[0.10] bg-[#0d1018] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
            >
              <div className="flex items-start justify-between border-b border-white/[0.07] p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                    Administration
                  </p>
                  <h2 id="add-admin-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    Add Admin
                  </h2>
                  <p className="mt-1 text-sm text-white/35">
                    Create a new active administrator account.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={creatingAdmin}
                  onClick={() => setShowAddAdmin(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-white/40 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                  aria-label="Close add admin dialog"
                >
                  <Icon name="close" size={17} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Full name
                  </label>
                  <input
                    value={adminForm.name}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Enter full name"
                    autoComplete="name"
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(event) =>
                      setAdminForm((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="admin@nexora.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/60">
                      Password
                    </label>
                    <input
                      type="password"
                      value={adminForm.password}
                      onChange={(event) =>
                        setAdminForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/60">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={adminForm.confirmPassword}
                      onChange={(event) =>
                        setAdminForm((current) => ({
                          ...current,
                          confirmPassword: event.target.value,
                        }))
                      }
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-violet-400/50"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-violet-400/15 bg-violet-500/[0.05] px-4 py-3 text-xs leading-5 text-white/40">
                  This account will be created with <span className="font-semibold text-violet-300">ADMIN</span> role and <span className="font-semibold text-emerald-300">ACTIVE</span> status.
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] p-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={creatingAdmin}
                  onClick={() => setShowAddAdmin(false)}
                  className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 text-sm font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={creatingAdmin}
                  onClick={createAdmin}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingAdmin ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}