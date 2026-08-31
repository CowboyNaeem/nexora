"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

type Brand = {
  id: string;
  name: string;
};

type Store = {
  id: string;
  name: string;
};

type ProductImage = {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  price: string | number;
  compareAtPrice?: string | number | null;
  status: string;
  category?: Category | null;
  brand?: Brand | null;
  store?: Store | null;
  images?: ProductImage[];
  inventory?: {
    quantity: number;
    reserved: number;
  } | null;
};

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [storeId, setStoreId] = useState("");

  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          productResponse,
          categoriesResponse,
          brandsResponse,
          storesResponse,
        ] = await Promise.all([
          fetch(`/api/admin/products/${id}`, {
            cache: "no-store",
          }),
          fetch("/api/categories", {
            cache: "no-store",
          }),
          fetch("/api/brands", {
            cache: "no-store",
          }),
          fetch("/api/stores", {
            cache: "no-store",
          }),
        ]);

        const productData = await productResponse.json();
        const categoriesData = await categoriesResponse.json();
        const brandsData = await brandsResponse.json();
        const storesData = await storesResponse.json();

        if (!productResponse.ok || !productData.success) {
          throw new Error(
            productData.message || "Unable to load product"
          );
        }

        if (!categoriesResponse.ok || !categoriesData.success) {
          throw new Error("Unable to load categories");
        }

        if (!brandsResponse.ok || !brandsData.success) {
          throw new Error("Unable to load brands");
        }

        if (!storesResponse.ok || !storesData.success) {
          throw new Error("Unable to load stores");
        }

        const loadedProduct: Product = productData.product;

        setProduct(loadedProduct);

        setName(loadedProduct.name || "");
        setSku(loadedProduct.sku || "");
        setDescription(loadedProduct.description || "");

        setCategoryId(loadedProduct.category?.id || "");
        setBrandId(loadedProduct.brand?.id || "");
        setStoreId(loadedProduct.store?.id || "");

        setPrice(String(loadedProduct.price ?? ""));
        setCompareAtPrice(
          loadedProduct.compareAtPrice !== null &&
          loadedProduct.compareAtPrice !== undefined
            ? String(loadedProduct.compareAtPrice)
            : ""
        );

        setStockQuantity(
          String(loadedProduct.inventory?.quantity ?? 0)
        );

        setStatus(loadedProduct.status || "DRAFT");
        setImages(
          (loadedProduct.images || []).sort(
            (a, b) => a.sortOrder - b.sortOrder
          )
        );

        setCategories(categoriesData.categories || []);
        setBrands(brandsData.brands || []);
        setStores(storesData.stores || []);
      } catch (err) {
        console.error("Edit product load error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load product"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const invalidFile = files.find(
      (file) => !allowedTypes.includes(file.type)
    );

    if (invalidFile) {
      setError("Only JPG, PNG and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (oversizedFile) {
      setError(`"${oversizedFile.name}" is larger than 10MB.`);
      event.target.value = "";
      return;
    }

    try {
      setUploadingImages(true);
      setError("");

      const uploadedImages: ProductImage[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.url) {
          throw new Error(
            data.message || `Failed to upload ${file.name}`
          );
        }

        uploadedImages.push({
          id: `new-${crypto.randomUUID()}`,
          url: data.url,
          altText: name || file.name,
          sortOrder: images.length + uploadedImages.length,
          isPrimary: images.length === 0 && uploadedImages.length === 0,
        });
      }

      setImages((current) => {
        const next = [...current, ...uploadedImages];
        return next.map((image, index) => ({
          ...image,
          sortOrder: index,
          isPrimary: index === 0,
        }));
      });
    } catch (err) {
      console.error("Product image upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload product images"
      );
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  }

  function removeImage(imageId: string) {
    setImages((current) => {
      const next = current.filter((image) => image.id !== imageId);

      return next.map((image, index) => ({
        ...image,
        sortOrder: index,
        isPrimary: index === 0,
      }));
    });
  }

  function setPrimaryImage(imageId: string) {
    setImages((current) => {
      const primary = current.find((image) => image.id === imageId);
      const others = current.filter((image) => image.id !== imageId);

      if (!primary) return current;

      return [primary, ...others].map((image, index) => ({
        ...image,
        sortOrder: index,
        isPrimary: index === 0,
      }));
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/admin/products/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            sku,
            description,
            categoryId,
            brandId,
            storeId,
            price,
            compareAtPrice,
            stockQuantity,
            status,
            images: images.map((image) => image.url),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update product"
        );
      }

      setProduct(data.product);

      setSuccess("Product updated successfully.");

      setTimeout(() => {
        router.push("/admin/products");
      }, 800);
    } catch (err) {
      console.error("Edit product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07090f] px-5 py-12 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="h-5 w-32 animate-pulse rounded bg-white/10" />

          <div className="mt-8 h-12 w-80 animate-pulse rounded bg-white/10" />

          <div className="mt-8 h-[500px] animate-pulse rounded-2xl bg-white/[0.03]" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#07090f] px-5 py-12 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin/products"
            className="text-sm text-zinc-400 hover:text-white"
          >
            ← Back to Products
          </Link>

          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <h1 className="text-xl font-semibold text-red-300">
              Unable to load product
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              {error || "Product not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07090f] text-white">
      <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 lg:px-10">

        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            ← Back to Products
          </Link>

          <div className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
            Nexora Admin
          </div>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Edit Product
              </h1>

              <p className="mt-2 text-sm text-zinc-400">
                Update product information, pricing and inventory.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Current status
              </div>

              <div className="mt-1 text-sm font-semibold text-white">
                {status.replaceAll("_", " ")}
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* PRODUCT IMAGES */}
          <section className="rounded-2xl border border-white/10 bg-[#0d1018] p-6 shadow-2xl shadow-black/20">
            <div>
              <h2 className="text-lg font-semibold">Product Images</h2>
              <p className="mt-1 text-sm text-zinc-500">
                Replace, add, remove, and choose the primary product image.
              </p>
            </div>

            <label
              className={`group mt-6 flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-black/20 px-6 text-center transition hover:border-violet-500/50 hover:bg-violet-500/[0.03] ${
                uploadingImages ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageChange}
                disabled={uploadingImages}
                className="hidden"
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                {uploadingImages ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
                ) : (
                  <UploadIcon />
                )}
              </div>

              <h3 className="mt-4 font-semibold text-white">
                {uploadingImages
                  ? "Uploading images..."
                  : "Add product images"}
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Select one image or hold Ctrl/Cmd to select multiple images.
              </p>

              <span className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300">
                JPG, PNG or WEBP • Max 10MB each
              </span>
            </label>

            {images.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`group relative overflow-hidden rounded-2xl border bg-black/20 ${
                      image.isPrimary
                        ? "border-violet-500/60"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText || `Product image ${index + 1}`}
                      className="h-40 w-full object-cover"
                    />

                    {image.isPrimary && (
                      <span className="absolute left-2 top-2 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Primary
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/75 text-zinc-300 opacity-0 backdrop-blur transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      ×
                    </button>

                    {!image.isPrimary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(image.id)}
                        className="absolute bottom-2 left-2 rounded-lg border border-white/10 bg-black/75 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 opacity-0 backdrop-blur transition hover:bg-violet-600 hover:text-white group-hover:opacity-100"
                      >
                        Make primary
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-white/5 bg-black/10 px-4 py-8 text-center text-sm text-zinc-600">
                No product images. Add at least one image for a complete catalog listing.
              </div>
            )}
          </section>

          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-white/10 bg-[#0d1018] p-6 shadow-2xl shadow-black/20">

            <div>
              <h2 className="text-lg font-semibold">
                Product Information
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Basic information about this product.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <Field
                label="Product Name"
                value={name}
                onChange={setName}
                required
              />

              <Field
                label="SKU"
                value={sku}
                onChange={setSku}
                required
              />

              <SelectField
                label="Category"
                value={categoryId}
                onChange={setCategoryId}
                options={categories.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />

              <SelectField
                label="Brand"
                value={brandId}
                onChange={setBrandId}
                options={brands.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                allowEmpty
              />

              <SelectField
                label="Store"
                value={storeId}
                onChange={setStoreId}
                options={stores.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />

              <SelectField
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                  {
                    value: "DRAFT",
                    label: "Draft",
                  },
                  {
                    value: "ACTIVE",
                    label: "Active",
                  },
                  {
                    value: "OUT_OF_STOCK",
                    label: "Out of Stock",
                  },
                  {
                    value: "ARCHIVED",
                    label: "Archived",
                  },
                ]}
              />

            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1018] p-6 shadow-2xl shadow-black/20">

            <h2 className="text-lg font-semibold">
              Description
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Product description shown to customers.
            </p>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={8}
              placeholder="Write a detailed product description..."
              className="mt-6 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
            />
          </section>

          {/* PRICE + INVENTORY */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#0d1018] p-6 shadow-2xl shadow-black/20">

            <h2 className="text-lg font-semibold">
              Pricing & Inventory
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Update the selling price and available stock.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <Field
                label="Price"
                value={price}
                onChange={setPrice}
                type="number"
                required
                prefix="৳"
              />

              <Field
                label="Compare-at Price"
                value={compareAtPrice}
                onChange={setCompareAtPrice}
                type="number"
                prefix="৳"
              />

              <Field
                label="Stock Quantity"
                value={stockQuantity}
                onChange={setStockQuantity}
                type="number"
                required
              />

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Current Available Stock
                </label>

                <div className="flex h-[46px] items-center rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-zinc-300">
                  {product.inventory?.quantity ?? 0} units
                </div>
              </div>

            </div>
          </section>

          {/* ACTIONS */}
          <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-white/10 bg-[#0b0e15]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="hidden text-xs text-zinc-500 sm:block">
                Changes will be saved to the product catalog.
              </p>

              <div className="flex w-full gap-3 sm:w-auto">

                <Link
                  href="/admin/products"
                  className="flex h-11 flex-1 items-center justify-center rounded-xl border border-white/10 px-5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.05] hover:text-white sm:flex-none"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}

function UploadIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* FIELD */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  type = "text",
  prefix,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  prefix?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}

        {required && (
          <span className="ml-1 text-violet-400">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-[46px] w-full rounded-xl border border-white/10 bg-black/20 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 ${
            prefix ? "pl-9 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* SELECT */
/* -------------------------------------------------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  options,
  allowEmpty = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  allowEmpty?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-[46px] w-full rounded-xl border border-white/10 bg-[#0d1018] px-4 text-sm text-zinc-200 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
      >
        {allowEmpty && (
          <option value="">
            No brand
          </option>
        )}

        {!allowEmpty && !value && (
          <option value="">
            Select {label.toLowerCase()}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}