"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ImagePreview = {
  id: string;
  url: string;
  name: string;
  uploading?: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Brand = {
  id: string;
  name: string;
  slug: string;
};

type Store = {
  id: string;
  name: string;
  slug: string;
};

export default function NewProductPage() {
  const router = useRouter();

  /* =========================================================
     FORM STATE
  ========================================================= */

  const [productName, setProductName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");

  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");

  const [status, setStatus] = useState("DRAFT");

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [storeId, setStoreId] = useState("");

  /* =========================================================
     OPTIONS
  ========================================================= */

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  /* =========================================================
     IMAGES
  ========================================================= */

  const [images, setImages] = useState<ImagePreview[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  /* =========================================================
     SUBMIT STATE
  ========================================================= */

  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =========================================================
     LOAD CATEGORIES / BRANDS / STORES
  ========================================================= */

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        setOptionsError("");

        const [
          categoriesResponse,
          brandsResponse,
          storesResponse,
        ] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
          fetch("/api/stores"),
        ]);

        if (
          !categoriesResponse.ok ||
          !brandsResponse.ok ||
          !storesResponse.ok
        ) {
          throw new Error(
            "Failed to load product options"
          );
        }

        const categoriesData =
          await categoriesResponse.json();

        const brandsData =
          await brandsResponse.json();

        const storesData =
          await storesResponse.json();

        if (!categoriesData.success) {
          throw new Error(
            "Failed to load categories"
          );
        }

        if (!brandsData.success) {
          throw new Error(
            "Failed to load brands"
          );
        }

        if (!storesData.success) {
          throw new Error(
            "Failed to load stores"
          );
        }

        const loadedCategories =
          categoriesData.categories || [];

        const loadedBrands =
          brandsData.brands || [];

        const loadedStores =
          storesData.stores || [];

        setCategories(loadedCategories);
        setBrands(loadedBrands);
        setStores(loadedStores);

        if (loadedStores.length === 1) {
          setStoreId(loadedStores[0].id);
        }
      } catch (error) {
        console.error(
          "Failed to load product options:",
          error
        );

        setOptionsError(
          "Unable to load categories, brands, or stores. Please refresh the page."
        );
      } finally {
        setLoadingOptions(false);
      }
    };

    loadOptions();
  }, []);

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const uploadImage = async (file: File) => {
    const temporaryId = `${file.name}-${file.lastModified}-${Math.random()}`;

    /*
     * Show the image immediately while it uploads.
     */
    const previewUrl = URL.createObjectURL(file);

    const temporaryImage: ImagePreview = {
      id: temporaryId,
      url: previewUrl,
      name: file.name,
      uploading: true,
    };

    setImages((current) => [
      ...current,
      temporaryImage,
    ]);

    try {
      setUploadingImages(true);
      setFormError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "/api/admin/upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.url) {
        throw new Error(
          data.message ||
            "Failed to upload image."
        );
      }

      /*
       * Remove the temporary browser URL because
       * the permanent Vercel Blob URL is now available.
       */
      URL.revokeObjectURL(previewUrl);

      setImages((current) =>
        current.map((image) =>
          image.id === temporaryId
            ? {
                ...image,
                url: data.url,
                uploading: false,
              }
            : image
        )
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      URL.revokeObjectURL(previewUrl);

      setImages((current) =>
        current.filter(
          (image) => image.id !== temporaryId
        )
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to upload image."
      );
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    const imageFiles = files.filter((file) =>
      [
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(file.type)
    );

    if (imageFiles.length !== files.length) {
      setFormError(
        "Only JPG, PNG and WEBP images are allowed."
      );
    }

    if (imageFiles.length === 0) {
      event.target.value = "";
      return;
    }

    /*
     * Upload all selected images.
     */
    await Promise.all(
      imageFiles.map((file) =>
        uploadImage(file)
      )
    );

    /*
     * Allow selecting the same file again.
     */
    event.target.value = "";
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (id: string) => {
    setImages((current) => {
      const imageToRemove = current.find(
        (image) => image.id === id
      );

      /*
       * Only revoke local browser preview URLs.
       * Vercel Blob URLs must not be revoked.
       */
      if (
        imageToRemove &&
        imageToRemove.url.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imageToRemove.url
        );
      }

      return current.filter(
        (image) => image.id !== id
      );
    });
  };

  /* =========================================================
     CREATE PRODUCT
  ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    /* -------------------------------------------------------
       Client-side validation
    ------------------------------------------------------- */

    if (!productName.trim()) {
      setFormError(
        "Please enter a product name."
      );
      return;
    }

    if (!sku.trim()) {
      setFormError(
        "Please enter a SKU."
      );
      return;
    }

    if (!categoryId) {
      setFormError(
        "Please select a category."
      );
      return;
    }

    if (!storeId) {
      setFormError(
        "Please select a store."
      );
      return;
    }

    if (!price || Number(price) < 0) {
      setFormError(
        "Please enter a valid product price."
      );
      return;
    }

    /*
     * Do not allow product creation while
     * an image is still uploading.
     */
    if (uploadingImages) {
      setFormError(
        "Please wait until all images finish uploading."
      );
      return;
    }

    /*
     * Make sure no temporary/uploading image
     * remains.
     */
    if (
      images.some(
        (image) => image.uploading
      )
    ) {
      setFormError(
        "Please wait until all images finish uploading."
      );
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: productName.trim(),

            sku: sku.trim(),

            description:
              description.trim() || null,

            categoryId,

            brandId:
              brandId || null,

            storeId,

            price: Number(price),

            compareAtPrice:
              compareAtPrice
                ? Number(compareAtPrice)
                : null,

            status,

            stockQuantity:
              stockQuantity
                ? Number(stockQuantity)
                : 0,

            /*
             * These are now permanent Vercel Blob URLs.
             */
            images: images.map(
              (image) => ({
                url: image.url,
                altText:
                  productName.trim(),
              })
            ),
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
            "Failed to create product."
        );
      }

      setSuccessMessage(
        "Product created successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/products"
        );
        router.refresh();
      }, 800);
    } catch (error) {
      console.error(
        "Product creation error:",
        error
      );

      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to create product. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  /* =========================================================
     STATUS DISPLAY
  ========================================================= */

  const statusColor =
    status === "ACTIVE"
      ? "bg-emerald-400"
      : status === "OUT_OF_STOCK"
        ? "bg-yellow-400"
        : status === "ARCHIVED"
          ? "bg-zinc-400"
          : "bg-violet-400";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#07090f] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10"
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin/products"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              <ArrowLeftIcon />
              Back to Products
            </Link>

            <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
              Nexora Admin
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Add New Product
            </h1>

            <p className="mt-2 text-sm text-zinc-400 sm:text-base">
              Create a new product and add it to your
              store catalog.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 sm:block">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Product status
            </div>

            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-200">
              <span
                className={`h-2 w-2 rounded-full ${statusColor}`}
              />

              {status.replaceAll(
                "_",
                " "
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            MESSAGES
        ===================================================== */}

        {loadingOptions && (
          <div className="mb-6 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 text-sm text-violet-300">
            Loading categories, brands, and stores...
          </div>
        )}

        {optionsError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {optionsError}
          </div>
        )}

        {formError && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            {successMessage}
          </div>
        )}

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.5fr]">
          {/* ===================================================
              LEFT COLUMN
          =================================================== */}

          <div className="space-y-6">
            {/* -------------------------------------------------
                PRODUCT IMAGES
            ------------------------------------------------- */}

            <section className="rounded-2xl border border-white/10 bg-[#0d1018]/90 p-6 shadow-2xl shadow-black/20">
              <SectionHeading
                title="Product Images"
                description="Add clear images of your product."
              />

              <label
                className={`group mt-6 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 text-center transition ${
                  uploadingImages
                    ? "cursor-wait border-violet-500/40 bg-violet-500/[0.03]"
                    : "cursor-pointer border-white/15 bg-black/20 hover:border-violet-500/50 hover:bg-violet-500/[0.03]"
                }`}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={
                    handleImageChange
                  }
                  disabled={
                    uploadingImages
                  }
                  className="hidden"
                />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 transition group-hover:scale-105 group-hover:bg-violet-500/15">
                  {uploadingImages ? (
                    <LoadingIcon />
                  ) : (
                    <UploadIcon />
                  )}
                </div>

                <h3 className="mt-5 font-semibold text-white">
                  {uploadingImages
                    ? "Uploading images..."
                    : "Upload product images"}
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
                  {uploadingImages
                    ? "Please wait while your images are being uploaded."
                    : "Drag and drop images here, or click to browse from your computer."}
                </p>

                <span className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-zinc-300">
                  JPG, PNG or WEBP · Max 5 MB
                </span>
              </label>

              {images.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map(
                    (image, index) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20"
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className={`h-32 w-full object-cover transition ${
                            image.uploading
                              ? "opacity-50"
                              : ""
                          }`}
                        />

                        {index === 0 &&
                          !image.uploading && (
                            <span className="absolute left-2 top-2 rounded-md bg-violet-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                              Primary
                            </span>
                          )}

                        {image.uploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                              <LoadingIcon />

                              <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
                                Uploading
                              </span>
                            </div>
                          </div>
                        )}

                        {!image.uploading && (
                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                image.id
                              )
                            }
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-zinc-300 opacity-0 backdrop-blur transition hover:bg-red-500 hover:text-white group-hover:opacity-100"
                            aria-label={`Remove ${image.name}`}
                          >
                            <CloseIcon />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              <p className="mt-4 text-xs text-zinc-600">
                Images upload automatically and are securely stored in NEXORA&apos;s image storage.
              </p>
            </section>

            {/* -------------------------------------------------
                DESCRIPTION
            ------------------------------------------------- */}

            <section className="rounded-2xl border border-white/10 bg-[#0d1018]/90 p-6 shadow-2xl shadow-black/20">
              <SectionHeading
                title="Description"
                description="Tell customers what makes this product special."
              />

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Write a detailed product description..."
                rows={8}
                className="mt-6 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10"
              />

              <p className="mt-2 text-xs text-zinc-600">
                A clear description helps customers
                understand the product.
              </p>
            </section>
          </div>

          {/* ===================================================
              RIGHT COLUMN
          =================================================== */}

          <div className="space-y-6">
            {/* -------------------------------------------------
                PRODUCT INFORMATION
            ------------------------------------------------- */}

            <section className="rounded-2xl border border-white/10 bg-[#0d1018]/90 p-6 shadow-2xl shadow-black/20">
              <SectionHeading
                title="Product Information"
                description="Basic information about your product."
              />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Product Name"
                  placeholder="e.g. Premium Wireless Headphones"
                  value={productName}
                  onChange={setProductName}
                  required
                />

                <Field
                  label="SKU"
                  placeholder="e.g. NEX-HEAD-001"
                  value={sku}
                  onChange={setSku}
                  required
                />

                <SelectField
                  label="Category"
                  placeholder={
                    loadingOptions
                      ? "Loading categories..."
                      : "Select category"
                  }
                  value={categoryId}
                  onChange={setCategoryId}
                  options={categories.map(
                    (category) => ({
                      value: category.id,
                      label: category.name,
                    })
                  )}
                  disabled={
                    loadingOptions ||
                    categories.length === 0
                  }
                  required
                />

                <SelectField
                  label="Brand"
                  placeholder={
                    loadingOptions
                      ? "Loading brands..."
                      : "Select brand"
                  }
                  value={brandId}
                  onChange={setBrandId}
                  options={brands.map(
                    (brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })
                  )}
                  disabled={
                    loadingOptions ||
                    brands.length === 0
                  }
                />

                <SelectField
                  label="Store"
                  placeholder={
                    loadingOptions
                      ? "Loading stores..."
                      : "Select store"
                  }
                  value={storeId}
                  onChange={setStoreId}
                  options={stores.map(
                    (store) => ({
                      value: store.id,
                      label: store.name,
                    })
                  )}
                  disabled={
                    loadingOptions ||
                    stores.length === 0
                  }
                  required
                />

                <SelectField
                  label="Status"
                  placeholder="Select status"
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

            {/* -------------------------------------------------
                PRICING & INVENTORY
            ------------------------------------------------- */}

            <section className="rounded-2xl border border-white/10 bg-[#0d1018]/90 p-6 shadow-2xl shadow-black/20">
              <SectionHeading
                title="Pricing & Inventory"
                description="Set the selling price and available stock."
              />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Price"
                  placeholder="0.00"
                  type="number"
                  prefix="৳"
                  value={price}
                  onChange={setPrice}
                  required
                />

                <Field
                  label="Compare-at Price"
                  placeholder="0.00"
                  type="number"
                  prefix="৳"
                  value={compareAtPrice}
                  onChange={setCompareAtPrice}
                />

                <Field
                  label="Stock Quantity"
                  placeholder="0"
                  type="number"
                  value={stockQuantity}
                  onChange={setStockQuantity}
                />

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Stock status
                  </label>

                  <div className="flex h-[46px] items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        Number(stockQuantity) > 0
                          ? "bg-emerald-400"
                          : "bg-zinc-500"
                      }`}
                    />

                    <span className="text-sm text-zinc-400">
                      {Number(stockQuantity) > 0
                        ? `${stockQuantity} units available`
                        : "No stock entered"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* -------------------------------------------------
                PRODUCT PREVIEW
            ------------------------------------------------- */}

            <section className="rounded-2xl border border-white/10 bg-[#0d1018]/90 p-6 shadow-2xl shadow-black/20">
              <SectionHeading
                title="Product Preview"
                description="This is how the product information will begin to look."
              />

              <div className="mt-6 flex gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
                  {images[0] ? (
                    <img
                      src={images[0].url}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-violet-400">
                    {status === "ACTIVE"
                      ? "Active Product"
                      : "New Product"}
                  </div>

                  <div className="mt-1 truncate font-semibold text-white">
                    {productName.trim() ||
                      "Product name will appear here"}
                  </div>

                  <div className="mt-2 text-sm text-zinc-500">
                    {description.trim() ||
                      "Add product information to see the details here."}
                  </div>

                  {price && (
                    <div className="mt-3 text-sm font-semibold text-white">
                      ৳{Number(price).toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* =====================================================
            BOTTOM ACTIONS
        ===================================================== */}

        <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-white/10 bg-[#0b0e15]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden text-xs text-zinc-500 sm:block">
              You can save this product as a draft
              and activate it later.
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
                disabled={
                  creating ||
                  loadingOptions ||
                  uploadingImages
                }
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {creating ? (
                  <>
                    <LoadingIcon />
                    Creating...
                  </>
                ) : uploadingImages ? (
                  <>
                    <LoadingIcon />
                    Uploading...
                  </>
                ) : (
                  <>
                    <PlusIcon />
                    Create Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

/* ==========================================================================
   REUSABLE COMPONENTS
========================================================================== */

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold tracking-tight text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

/* ==========================================================================
   INPUT FIELD
========================================================================== */

function Field({
  label,
  placeholder,
  type = "text",
  prefix,
  required = false,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  prefix?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
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
          placeholder={placeholder}
          min={
            type === "number"
              ? "0"
              : undefined
          }
          step={
            type === "number"
              ? "0.01"
              : undefined
          }
          className={`h-[46px] w-full rounded-xl border border-white/10 bg-black/20 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 ${
            prefix
              ? "pl-9 pr-4"
              : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   SELECT FIELD
========================================================================== */

function SelectField({
  label,
  placeholder,
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  options?: {
    value: string;
    label: string;
  }[];
  disabled?: boolean;
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
        <select
          value={value || ""}
          onChange={(event) =>
            onChange?.(
              event.target.value
            )
          }
          disabled={disabled}
          required={required}
          className="h-[46px] w-full appearance-none rounded-xl border border-white/10 bg-[#0a0c12] px-4 pr-10 text-sm text-zinc-300 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!value && (
            <option
              value=""
              disabled={required}
            >
              {placeholder}
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

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}

/* ==========================================================================
   ICONS
========================================================================== */

function ArrowLeftIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width="27"
      height="27"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
      />

      <circle
        cx="8.5"
        cy="8.5"
        r="1.5"
      />

      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function LoadingIcon() {
  return (
    <svg
      className="h-5 w-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />

      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}