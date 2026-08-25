import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting NEXORA database seed...\n");

  // ==================================================
  // 1. Find the existing development user
  // ==================================================

  const testUser = await prisma.user.findUnique({
    where: {
      email: "test@nexora.com",
    },
  });

  if (!testUser) {
    throw new Error(
      'Test user "test@nexora.com" was not found. Please create/login with the existing test account first.'
    );
  }

  console.log(`✅ Found user: ${testUser.name}`);

  // ==================================================
  // 2. Create / update ADMIN account
  // ==================================================

  const adminPasswordHash = await bcrypt.hash(
    "NexoraAdmin123!",
    12
  );

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@nexora.com",
    },

    update: {
      name: "NEXORA Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },

    create: {
      name: "NEXORA Admin",
      email: "admin@nexora.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`✅ Admin account ready: ${admin.email}`);

  // ==================================================
  // 3. Create / update seller
  // ==================================================

  const seller = await prisma.seller.upsert({
    where: {
      userId: testUser.id,
    },

    update: {
      businessName: "NEXORA Official",
      businessEmail: "store@nexora.com",
      businessPhone: "+8801700000000",
      status: "APPROVED",
    },

    create: {
      userId: testUser.id,
      businessName: "NEXORA Official",
      businessEmail: "store@nexora.com",
      businessPhone: "+8801700000000",
      status: "APPROVED",
    },
  });

  console.log("✅ Seller ready");

  // ==================================================
  // 4. Create / update official store
  // ==================================================

  const store = await prisma.store.upsert({
    where: {
      sellerId: seller.id,
    },

    update: {
      name: "NEXORA Official",
      slug: "nexora-official",
      description:
        "The official NEXORA marketplace store featuring carefully selected products.",
      status: "ACTIVE",
    },

    create: {
      sellerId: seller.id,
      name: "NEXORA Official",
      slug: "nexora-official",
      description:
        "The official NEXORA marketplace store featuring carefully selected products.",
      status: "ACTIVE",
    },
  });

  console.log("✅ Store ready");

  // ==================================================
  // 5. Categories
  // ==================================================

  const categoryData = [
    {
      name: "Electronics",
      slug: "electronics",
      description:
        "Smart devices, audio, gadgets and modern technology.",
    },
    {
      name: "Fashion",
      slug: "fashion",
      description:
        "Modern clothing, footwear and fashion accessories.",
    },
    {
      name: "Home & Living",
      slug: "home-living",
      description:
        "Products designed to make your home better.",
    },
    {
      name: "Beauty",
      slug: "beauty",
      description:
        "Beauty, personal care and lifestyle products.",
    },
    {
      name: "Sports",
      slug: "sports",
      description:
        "Fitness, sports and outdoor products.",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description:
        "Useful everyday accessories and essentials.",
    },
  ];

  const categories: Record<string, { id: string }> = {};

  for (const category of categoryData) {
    const result = await prisma.category.upsert({
      where: {
        slug: category.slug,
      },

      update: {
        name: category.name,
        description: category.description,
        isActive: true,
      },

      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        isActive: true,
      },
    });

    categories[category.slug] = result;
  }

  console.log(
    `✅ ${categoryData.length} categories ready`
  );

  // ==================================================
  // 6. Brands
  // ==================================================

  const brandsData = [
    {
      name: "NEXORA Essentials",
      slug: "nexora-essentials",
      description: "Curated everyday products by NEXORA.",
    },
    {
      name: "Aero",
      slug: "aero",
      description:
        "Modern audio and lifestyle technology.",
    },
    {
      name: "Orbit",
      slug: "orbit",
      description:
        "Smart technology for everyday life.",
    },
  ];

  const brands: Record<string, { id: string }> = {};

  for (const brand of brandsData) {
    const result = await prisma.brand.upsert({
      where: {
        slug: brand.slug,
      },

      update: {
        name: brand.name,
        description: brand.description,
        isActive: true,
      },

      create: {
        name: brand.name,
        slug: brand.slug,
        description: brand.description,
        isActive: true,
      },
    });

    brands[brand.slug] = result;
  }

  console.log(
    `✅ ${brandsData.length} brands ready`
  );

  // ==================================================
  // 7. Products
  // ==================================================

  const products = [
    {
      name: "Aero Wireless Headphones",
      slug: "aero-wireless-headphones",
      sku: "NXR-AERO-001",
      description:
        "Premium wireless headphones with immersive sound, active noise cancellation and a comfortable all-day design.",
      price: 129,
      compareAtPrice: 159,
      category: "electronics",
      brand: "aero",
      rating: 4.9,
      reviewCount: 328,
      quantity: 45,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Orbit Smart Watch",
      slug: "orbit-smart-watch",
      sku: "NXR-ORBIT-001",
      description:
        "A sleek smart watch with health tracking, notifications, activity monitoring and a vibrant display.",
      price: 99,
      compareAtPrice: 129,
      category: "electronics",
      brand: "orbit",
      rating: 4.8,
      reviewCount: 214,
      quantity: 32,
      image:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Cloud Runner Sneakers",
      slug: "cloud-runner-sneakers",
      sku: "NXR-CRS-001",
      description:
        "Lightweight everyday sneakers designed for comfort, movement and modern street style.",
      price: 109,
      compareAtPrice: 139,
      category: "fashion",
      brand: "nexora-essentials",
      rating: 4.7,
      reviewCount: 187,
      quantity: 28,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Minimal Leather Backpack",
      slug: "minimal-leather-backpack",
      sku: "NXR-MLB-001",
      description:
        "A refined everyday backpack with a minimalist design and practical storage for work and travel.",
      price: 89,
      compareAtPrice: 119,
      category: "accessories",
      brand: "nexora-essentials",
      rating: 4.8,
      reviewCount: 142,
      quantity: 20,
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Studio Ceramic Set",
      slug: "studio-ceramic-set",
      sku: "NXR-SCS-001",
      description:
        "Elegant ceramic tableware designed for modern homes and everyday dining.",
      price: 59,
      compareAtPrice: 79,
      category: "home-living",
      brand: "nexora-essentials",
      rating: 4.6,
      reviewCount: 96,
      quantity: 40,
      image:
        "https://images.unsplash.com/photo-1576020799627-aeac74d58064?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Active Performance Bottle",
      slug: "active-performance-bottle",
      sku: "NXR-APB-001",
      description:
        "A durable insulated bottle built for workouts, travel and everyday hydration.",
      price: 35,
      compareAtPrice: 45,
      category: "sports",
      brand: "nexora-essentials",
      rating: 4.7,
      reviewCount: 74,
      quantity: 65,
      image:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Nova ANC Earbuds",
      slug: "nova-anc-earbuds",
      sku: "NXR-NOVA-001",
      description:
        "Compact wireless earbuds with active noise cancellation, clear calls and a comfortable everyday fit.",
      price: 79,
      compareAtPrice: 99,
      category: "electronics",
      brand: "aero",
      rating: 4.8,
      reviewCount: 156,
      quantity: 38,
      image:
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Lumen Desk Lamp",
      slug: "lumen-desk-lamp",
      sku: "NXR-LUMEN-001",
      description:
        "A minimalist LED desk lamp with a warm modern glow for focused work and relaxed evenings.",
      price: 49,
      compareAtPrice: 65,
      category: "home-living",
      brand: "nexora-essentials",
      rating: 4.7,
      reviewCount: 118,
      quantity: 31,
      image:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Urban Oversized Hoodie",
      slug: "urban-oversized-hoodie",
      sku: "NXR-UOH-001",
      description:
        "A premium heavyweight hoodie with a relaxed silhouette and soft everyday comfort.",
      price: 69,
      compareAtPrice: 89,
      category: "fashion",
      brand: "nexora-essentials",
      rating: 4.8,
      reviewCount: 203,
      quantity: 26,
      image:
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Pulse Fitness Band",
      slug: "pulse-fitness-band",
      sku: "NXR-PULSE-001",
      description:
        "A lightweight fitness band for activity tracking, daily movement and simple wellness insights.",
      price: 59,
      compareAtPrice: 75,
      category: "sports",
      brand: "orbit",
      rating: 4.6,
      reviewCount: 91,
      quantity: 34,
      image:
        "https://images.unsplash.com/photo-1557935728-e6d1eaabe558?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Aura Skin Care Set",
      slug: "aura-skin-care-set",
      sku: "NXR-AURA-001",
      description:
        "A simple everyday skin-care collection designed for a clean, fresh and comfortable routine.",
      price: 54,
      compareAtPrice: 69,
      category: "beauty",
      brand: "nexora-essentials",
      rating: 4.7,
      reviewCount: 127,
      quantity: 42,
      image:
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85",
    },

    {
      name: "Metro Everyday Watch",
      slug: "metro-everyday-watch",
      sku: "NXR-METRO-001",
      description:
        "A refined everyday watch with a clean dial and versatile design for work and weekends.",
      price: 85,
      compareAtPrice: 110,
      category: "accessories",
      brand: "orbit",
      rating: 4.8,
      reviewCount: 164,
      quantity: 24,
      image:
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85",
    },
  ];

  let createdProducts = 0;

  for (const product of products) {
    const category = categories[product.category];
    const brand = brands[product.brand];

    if (!category) {
      throw new Error(
        `Category not found: ${product.category}`
      );
    }

    if (!brand) {
      throw new Error(
        `Brand not found: ${product.brand}`
      );
    }

    const existingProduct =
      await prisma.product.findUnique({
        where: {
          slug: product.slug,
        },
      });

    const savedProduct = existingProduct
      ? await prisma.product.update({
          where: {
            id: existingProduct.id,
          },

          data: {
            name: product.name,
            description: product.description,
            sku: product.sku,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            status: "ACTIVE",
            rating: product.rating,
            reviewCount: product.reviewCount,
            storeId: store.id,
            categoryId: category.id,
            brandId: brand.id,
          },
        })
      : await prisma.product.create({
          data: {
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            status: "ACTIVE",
            rating: product.rating,
            reviewCount: product.reviewCount,
            storeId: store.id,
            categoryId: category.id,
            brandId: brand.id,
          },
        });

    await prisma.productImage.deleteMany({
      where: {
        productId: savedProduct.id,
      },
    });

    await prisma.productImage.create({
      data: {
        productId: savedProduct.id,
        url: product.image,
        altText: product.name,
        sortOrder: 0,
        isPrimary: true,
      },
    });

    await prisma.inventory.upsert({
      where: {
        productId: savedProduct.id,
      },

      update: {
        quantity: product.quantity,
        reserved: 0,
      },

      create: {
        productId: savedProduct.id,
        quantity: product.quantity,
        reserved: 0,
      },
    });

    createdProducts++;
  }

  console.log(
    `✅ ${createdProducts} seed products processed`
  );

  // ==================================================
  // 8. Final summary
  // ==================================================

  const productCount = await prisma.product.count({
    where: {
      status: "ACTIVE",
    },
  });

  const categoryCount = await prisma.category.count({
    where: {
      isActive: true,
    },
  });

  console.log(
    "\n🎉 NEXORA seed completed successfully!"
  );
  console.log("-----------------------------------");
  console.log(`Admin      : ${admin.email}`);
  console.log(`Categories : ${categoryCount}`);
  console.log(`Products   : ${productCount}`);
  console.log(`Store      : ${store.name}`);
  console.log("-----------------------------------\n");
}

main()
  .catch((error) => {
    console.error("\n❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });