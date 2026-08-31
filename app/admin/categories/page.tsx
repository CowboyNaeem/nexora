"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
};

type ModalMode = "create" | "edit";

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

function IconBase({
  size = 18,
  className = "",
  strokeWidth = 1.8,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/* =========================================================
   ICONS
========================================================= */

function TagsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.59 13.41 11 3.82A2.8 2.8 0 0 0 9 3H4a1 1 0 0 0-1 1v5a2.8 2.8 0 0 0 .82 2l9.59 9.59a2 2 0 0 0 2.82 0l4.36-4.36a2 2 0 0 0 0-2.82Z" />
      <circle cx="7" cy="7" r="1" />
      <path d="m13 6 5 5" />
    </IconBase>
  );
}

function TagIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.59 13.41 11 3.82A2.8 2.8 0 0 0 9 3H4a1 1 0 0 0-1 1v5a2.8 2.8 0 0 0 .82 2l9.59 9.59a2 2 0 0 0 2.82 0l4.36-4.36a2 2 0 0 0 0-2.82Z" />
      <circle cx="7" cy="7" r="1" />
    </IconBase>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3-1.2 3.6L7 8l3.8 1.4L12 13l1.2-3.6L17 8l-3.8-1.4L12 3Z" />
      <path d="m19 13-.7 2.1L16 16l2.3.9L19 19l.7-2.1L22 16l-2.3-.9L19 13Z" />
      <path d="m5 13-.7 2.1L2 16l2.3.9L5 19l.7-2.1L8 16l-2.3-.9L5 13Z" />
    </IconBase>
  );
}

function CpuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
      <path d="M10 10h4v4h-4z" />
    </IconBase>
  );
}

function ShirtIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 4 3 2 3-2 5 3-2 4-2-1v10H8V10l-2 1-2-4 5-3Z" />
      <path d="M9 4c.3 1.2 1.2 2 3 2s2.7-.8 3-2" />
    </IconBase>
  );
}

function HomeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </IconBase>
  );
}

function DumbbellIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 7v10M18 7v10" />
      <path d="M3 9v6M21 9v6" />
      <path d="M6 12h12" />
      <path d="M3 10h3M18 10h3M3 14h3M18 14h3" />
    </IconBase>
  );
}

function CheckCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </IconBase>
  );
}

function EyeOffIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 3 18 18" />
      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
      <path d="M9.88 4.24A9.77 9.77 0 0 1 12 4c5 0 8.27 4 9 8-.28 1.54-1.07 3.15-2.27 4.48" />
      <path d="M6.61 6.61C4.91 7.77 3.73 9.48 3 12c.73 4 4 8 9 8 1.61 0 3.04-.4 4.27-1.06" />
    </IconBase>
  );
}

function PackageIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m16.5 9.4-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.27 6.96 8.73 5.05 8.73-5.05" />
      <path d="M12 22.08V12" />
    </IconBase>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </IconBase>
  );
}

function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

function XIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </IconBase>
  );
}

function PencilIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </IconBase>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6 18 20H6L5 6" />
      <path d="M10 11v5M14 11v5" />
    </IconBase>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================
   CATEGORY ICON
========================================================= */

function CategoryIcon({ name }: { name: string }) {
  const normalized = name.toLowerCase();

  let icon: React.ReactNode = <TagIcon size={20} />;
  let label = `${name} category`;

  if (normalized.includes("beauty")) {
    icon = <SparklesIcon size={20} />;
    label = "Beauty category";
  } else if (normalized.includes("electronic")) {
    icon = <CpuIcon size={20} />;
    label = "Electronics category";
  } else if (normalized.includes("fashion")) {
    icon = <ShirtIcon size={20} />;
    label = "Fashion category";
  } else if (normalized.includes("home")) {
    icon = <HomeIcon size={20} />;
    label = "Home and Living category";
  } else if (normalized.includes("sport")) {
    icon = <DumbbellIcon size={20} />;
    label = "Sports category";
  } else if (normalized.includes("accessor")) {
    icon = <TagIcon size={20} />;
    label = "Accessories category";
  }

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-violet-300"
      aria-label={label}
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </div>
  );
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
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0d1018] p-4 transition hover:border-white/[0.12] sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300">
        {icon}
      </div>

      <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30 sm:mt-5 sm:text-[10px]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {value}
      </p>

      <p className="mt-1 text-xs text-white/35">{description}</p>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/categories", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load categories");
      }

      setCategories(data.categories || []);
    } catch (err) {
      console.error("Admin categories error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load categories"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  /* =======================================================
     FILTERING
  ======================================================= */

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        (category.description || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const active = categories.filter(
      (category) => category.isActive
    ).length;

    const inactive = categories.filter(
      (category) => !category.isActive
    ).length;

    const products = categories.reduce(
      (sum, category) => sum + Number(category._count?.products || 0),
      0
    );

    return {
      total: categories.length,
      active,
      inactive,
      products,
    };
  }, [categories]);

  /* =======================================================
     CREATE MODAL
  ======================================================= */

  function openCreateModal() {
    setModalMode("create");
    setEditingCategory(null);

    setName("");
    setSlug("");
    setDescription("");
    setIsActive(true);

    setMessage("");
    setError("");

    setModalOpen(true);
  }

  /* =======================================================
     EDIT MODAL
  ======================================================= */

  function openEditModal(category: Category) {
    setModalMode("edit");
    setEditingCategory(category);

    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setIsActive(category.isActive);

    setMessage("");
    setError("");

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingCategory(null);
  }

  /* =======================================================
     SAVE CATEGORY
  ======================================================= */

  async function saveCategory() {
    const cleanName = name.trim();

    if (!cleanName) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const finalSlug = slug.trim() || slugify(cleanName);

      const body = {
        name: cleanName,
        slug: finalSlug,
        description: description.trim(),
        isActive,
      };

      const url =
        modalMode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${editingCategory?.id}`;

      const method = modalMode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save category");
      }

      setMessage(
        modalMode === "create"
          ? "Category created successfully."
          : "Category updated successfully."
      );

      await loadCategories();

      setTimeout(() => {
        setModalOpen(false);
        setEditingCategory(null);
      }, 500);
    } catch (err) {
      console.error("Save category error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to save category"
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     TOGGLE CATEGORY
  ======================================================= */

  async function toggleCategory(category: Category) {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            isActive: !category.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update category status"
        );
      }

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id ? data.category : item
        )
      );

      setMessage(
        category.isActive
          ? `${category.name} deactivated.`
          : `${category.name} activated.`
      );
    } catch (err) {
      console.error("Toggle category error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to update category"
      );
    }
  }

  /* =======================================================
     DELETE CATEGORY
  ======================================================= */

  async function deleteCategory(category: Category) {
    const productCount = Number(category._count?.products || 0);

    if (productCount > 0) {
      setError(
        `"${category.name}" contains ${productCount} product${
          productCount === 1 ? "" : "s"
        }. Deactivate it instead of deleting it.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${category.name}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(category.id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete category");
      }

      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );

      setMessage("Category deleted successfully.");
    } catch (err) {
      console.error("Delete category error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to delete category"
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090f] px-4 py-8 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="h-3 w-32 rounded bg-white/10" />

          <div className="mt-5 h-12 w-72 rounded bg-white/10" />

          <div className="mt-3 h-5 w-[420px] max-w-full rounded bg-white/[0.06]" />

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 rounded-2xl bg-white/[0.03]"
              />
            ))}
          </div>

          <div className="mt-6 h-[520px] rounded-3xl bg-white/[0.03]" />
        </div>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07090f] pb-24 text-white sm:pb-0">
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-5 sm:px-6 sm:py-8 lg:px-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-400">
                NEXORA ADMIN
              </p>

              <span className="h-1 w-1 rounded-full bg-white/20" />

              <span className="text-xs text-white/35">
                Catalog management
              </span>
            </div>

            <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.035em] sm:text-5xl">
              Categories
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              Organize your product catalog, control category visibility,
              and manage product grouping.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:bg-violet-400 active:scale-[0.98] sm:w-auto"
          >
            <PlusIcon size={18} strokeWidth={2} />
            Add Category
          </button>
        </header>

        {/* =================================================
            GLOBAL ERROR
        ================================================= */}

        {error && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-5 py-4 text-sm text-red-300">
            <span className="leading-6">{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="shrink-0 rounded-lg p-1 text-red-300/60 transition hover:bg-red-400/10 hover:text-red-200"
            >
              <XIcon size={16} />
            </button>
          </div>
        )}

        {/* =================================================
            GLOBAL SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-5 py-4 text-sm text-emerald-300">
            <CheckCircleIcon size={17} />
            <span>{message}</span>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
          <StatCard
            icon={<TagsIcon size={19} />}
            label="Total categories"
            value={stats.total}
            description="All catalog categories"
          />

          <StatCard
            icon={<CheckCircleIcon size={19} />}
            label="Active"
            value={stats.active}
            description="Visible to customers"
          />

          <StatCard
            icon={<EyeOffIcon size={19} />}
            label="Inactive"
            value={stats.inactive}
            description="Currently hidden"
          />

          <StatCard
            icon={<PackageIcon size={19} />}
            label="Products"
            value={stats.products}
            description="Products across categories"
          />
        </section>

        {/* =================================================
            CATEGORY TABLE
        ================================================= */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0e15] sm:mt-6 sm:rounded-3xl">

          {/* SEARCH + FILTERS */}

          <div className="flex flex-col gap-3 border-b border-white/[0.06] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25">
                <SearchIcon size={17} />
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/30 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-violet-400/40 focus:bg-black/40"
              />
            </div>

            <div className="grid grid-cols-3 items-center gap-1 rounded-xl border border-white/[0.06] bg-black/20 p-1 sm:flex sm:w-auto sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0">
              {(
                [
                  ["all", "All"],
                  ["active", "Active"],
                  ["inactive", "Inactive"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`min-h-10 rounded-lg px-2 py-2.5 text-[11px] font-medium transition sm:rounded-xl sm:px-4 sm:text-xs ${
                    statusFilter === value
                      ? "bg-white/[0.09] text-white shadow-sm"
                      : "text-white/35 hover:bg-white/[0.04] hover:text-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {filteredCategories.length === 0 ? (
            <div className="px-5 py-16 text-center sm:px-6 sm:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-white/25">
                <SearchIcon size={21} />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No categories found
              </h2>

              <p className="mt-2 text-sm text-white/35">
                Try changing your search or status filter.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP / TABLET TABLE
              ================================================= */}

              <div className="hidden md:block">
                <table className="w-full table-fixed border-collapse">

                  {/* FIXED COLUMN WIDTHS
                      This prevents the Actions column
                      from being pushed outside the screen.
                  */}

                  <colgroup>
                    <col className="w-[32%]" />
                    <col className="w-[14%]" />
                    <col className="w-[10%]" />
                    <col className="w-[13%]" />
                    <col className="w-[12%]" />
                    <col className="w-[19%]" />
                  </colgroup>

                  <thead>
                    <tr className="border-b border-white/[0.06] text-left">
                      <th className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                        Category
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                        Slug
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                        Products
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                        Status
                      </th>

                      <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                        Updated
                      </th>

                      <th className="px-3 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.045]">
                    {filteredCategories.map((category) => {
                      const productCount = Number(
                        category._count?.products || 0
                      );

                      const canDelete = productCount === 0;

                      return (
                        <tr
                          key={category.id}
                          className="group transition hover:bg-white/[0.018]"
                        >
                          {/* CATEGORY */}

                          <td className="overflow-hidden px-6 py-5">
                            <div className="flex min-w-0 items-center gap-4">
                              <CategoryIcon name={category.name} />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                  {category.name}
                                </p>

                                <p className="mt-1 max-w-full truncate text-xs text-white/30">
                                  {category.description ||
                                    "No description"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SLUG */}

                          <td className="overflow-hidden px-4 py-5">
                            <code
                              title={`/${category.slug}`}
                              className="block max-w-full truncate rounded-lg border border-white/[0.06] bg-black/30 px-2.5 py-1.5 text-xs text-white/45"
                            >
                              /{category.slug}
                            </code>
                          </td>

                          {/* PRODUCTS */}

                          <td className="overflow-hidden px-4 py-5">
                            <span className="text-sm font-medium text-white/75">
                              {productCount}
                            </span>

                            <span className="ml-1 text-xs text-white/25">
                              {productCount === 1
                                ? "product"
                                : "products"}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="overflow-hidden px-4 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                toggleCategory(category)
                              }
                              title={
                                category.isActive
                                  ? "Click to deactivate"
                                  : "Click to activate"
                              }
                              className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                category.isActive
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15"
                                  : "border-white/[0.08] bg-white/[0.03] text-white/35 hover:bg-white/[0.06]"
                              }`}
                            >
                              {category.isActive ? (
                                <CheckCircleIcon size={14} />
                              ) : (
                                <EyeOffIcon size={14} />
                              )}

                              {category.isActive
                                ? "Active"
                                : "Inactive"}
                            </button>
                          </td>

                          {/* UPDATED */}

                          <td className="overflow-hidden px-4 py-5">
                            <span className="block truncate text-xs text-white/35">
                              {formatDate(category.updatedAt)}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td className="px-3 py-5">
                            <div className="flex items-center justify-end gap-2 whitespace-nowrap opacity-90 transition group-hover:opacity-100">

                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(category)
                                }
                                aria-label={`Edit ${category.name}`}
                                title="Edit category"
                                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-2 text-xs font-medium text-white/55 transition hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
                              >
                                <PencilIcon size={14} />
                                Edit
                              </button>

                              {/* DELETE */}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteCategory(category)
                                }
                                disabled={
                                  deletingId === category.id
                                }
                                aria-label={`Delete ${category.name}`}
                                title={
                                  canDelete
                                    ? "Delete category"
                                    : "Cannot delete a category containing products"
                                }
                                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                  canDelete
                                    ? "border-red-400/15 bg-red-400/[0.03] text-red-300/70 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                                    : "border-white/[0.06] bg-white/[0.02] text-white/25 hover:border-white/[0.08] hover:bg-white/[0.04]"
                                }`}
                              >
                                <TrashIcon size={14} />

                                {deletingId === category.id
                                  ? "..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE CARDS
              ================================================= */}

              <div className="divide-y divide-white/[0.045] md:hidden">
                {filteredCategories.map((category) => {
                  const productCount = Number(
                    category._count?.products || 0
                  );

                  const canDelete = productCount === 0;

                  return (
                    <article
                      key={category.id}
                      className="p-4 sm:p-5"
                    >
                      {/* TOP */}

                      <div className="flex items-start gap-3.5">
                        <CategoryIcon name={category.name} />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-white">
                                {category.name}
                              </h3>

                              <p className="mt-1 truncate text-xs text-white/30">
                                {category.description ||
                                  "No description"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                toggleCategory(category)
                              }
                              aria-label={`Toggle ${category.name} status`}
                              title="Toggle status"
                              className={`shrink-0 rounded-full border p-2 transition ${
                                category.isActive
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                                  : "border-white/[0.08] bg-white/[0.03] text-white/35"
                              }`}
                            >
                              {category.isActive ? (
                                <CheckCircleIcon size={15} />
                              ) : (
                                <EyeOffIcon size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* DETAILS */}

                      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            Slug
                          </p>

                          <p className="mt-1 truncate text-xs text-white/50">
                            /{category.slug}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            Products
                          </p>

                          <p className="mt-1 text-xs text-white/60">
                            {productCount}{" "}
                            {productCount === 1
                              ? "product"
                              : "products"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            Status
                          </p>

                          <p
                            className={`mt-1 text-xs ${
                              category.isActive
                                ? "text-emerald-300"
                                : "text-white/40"
                            }`}
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                            Updated
                          </p>

                          <p className="mt-1 text-xs text-white/40">
                            {formatDate(category.updatedAt)}
                          </p>
                        </div>
                      </div>

                      {/* MOBILE ACTIONS */}

                      <div className="mt-4 grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(category)
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5 text-xs font-medium text-white/55 transition active:scale-[0.99] hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
                        >
                          <PencilIcon size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteCategory(category)
                          }
                          disabled={
                            deletingId === category.id
                          }
                          title={
                            canDelete
                              ? "Delete category"
                              : "Category contains products"
                          }
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 ${
                            canDelete
                              ? "border-red-400/15 bg-red-400/[0.03] text-red-300/70 hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
                              : "border-white/[0.06] bg-white/[0.02] text-white/25 hover:bg-white/[0.04]"
                          }`}
                        >
                          <TrashIcon size={14} />

                          {deletingId === category.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col gap-2 border-t border-white/[0.06] px-6 py-4 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing {filteredCategories.length} of{" "}
              {categories.length} categories
            </span>

            <span>{stats.products} total products</span>
          </div>
        </section>
      </div>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-h-[92dvh] overflow-y-auto rounded-t-3xl border border-white/[0.09] bg-[#0c0f17] shadow-2xl shadow-black/50 sm:my-auto sm:max-w-xl sm:rounded-3xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-white/[0.06] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-400">
                  Category management
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {modalMode === "create"
                    ? "Add category"
                    : "Edit category"}
                </h2>

                <p className="mt-1 text-xs text-white/35">
                  {modalMode === "create"
                    ? "Create a new product category."
                    : "Update category information."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/[0.05] hover:text-white"
              >
                <XIcon size={17} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/55">
                  Category name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => {
                    const value = event.target.value;

                    setName(value);

                    if (modalMode === "create") {
                      setSlug(slugify(value));
                    }
                  }}
                  placeholder="e.g. Electronics"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-violet-400/40"
                />
              </div>

              {/* SLUG */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/55">
                  Slug
                </label>

                <input
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(slugify(event.target.value))
                  }
                  placeholder="electronics"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/20 transition focus:border-violet-400/40"
                />

                <p className="mt-2 text-[11px] text-white/25">
                  Used in URLs and category filtering.
                </p>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-2 block text-xs font-medium text-white/55">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  rows={4}
                  placeholder="Describe what belongs in this category..."
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 transition focus:border-violet-400/40"
                />
              </div>

              {/* ACTIVE TOGGLE */}

              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-white/80">
                    Active category
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    Active categories can be displayed to customers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setIsActive((current) => !current)
                  }
                  aria-label="Toggle active category"
                  className={`relative h-6 w-11 rounded-full transition ${
                    isActive
                      ? "bg-violet-500"
                      : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* MODAL ERROR */}

              {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-xs leading-5 text-red-300">
                  {error}
                </div>
              )}

              {/* MODAL MESSAGE */}

              {message && (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3 text-xs leading-5 text-emerald-300">
                  {message}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}

            <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] px-5 py-4 sm:flex sm:items-center sm:justify-end sm:px-6 sm:py-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="min-h-11 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveCategory}
                disabled={saving}
                className="min-h-11 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : modalMode === "create"
                    ? "Create category"
                    : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}