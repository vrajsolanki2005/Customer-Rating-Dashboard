const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const userHash = await bcrypt.hash("User@1234", 12);
  const ownerHash = await bcrypt.hash("Owner@123", 12);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "System Administrator Account",
      email: "admin@example.com",
      passwordHash: adminHash,
      address: "Admin Office, Vadodara",
      role: "ADMIN",
    },
  });
  console.log("Admin:", admin.email);

  // Store owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Demo Store Owner Account",
      email: "owner@example.com",
      passwordHash: ownerHash,
      address: "Owner Street, Vadodara",
      role: "STORE_OWNER",
    },
  });
  console.log("Owner:", owner.email);

  // Normal user
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Demo Normal User Account",
      email: "user@example.com",
      passwordHash: userHash,
      address: "User Street, Vadodara",
      role: "USER",
    },
  });
  console.log("User:", user.email);

  // Stores
  const storeData = [
    {
      name: "Fresh Mart Supermarket Vadodara",
      email: "freshmart@example.com",
      address: "Alkapuri, Vadodara, Gujarat",
      ownerId: owner.id,
    },
    {
      name: "City Electronics and Gadgets Store",
      email: "cityelec@example.com",
      address: "Manjalpur, Vadodara, Gujarat",
      ownerId: owner.id,
    },
    {
      name: "Green Grocers Organic Market",
      email: "greengrocers@example.com",
      address: "Fatehgunj, Vadodara, Gujarat",
      ownerId: owner.id,
    },
    {
      name: "Sunrise Bakery and Cafe Shop",
      email: "sunrise@example.com",
      address: "Sayajigunj, Vadodara, Gujarat",
      ownerId: null,
    },
    {
      name: "Metro Fashion Clothing Boutique",
      email: "metrofashion@example.com",
      address: "Akota, Vadodara, Gujarat",
      ownerId: null,
    },
  ];

  for (const s of storeData) {
    const existing = await prisma.store.findFirst({ where: { email: s.email } });
    if (!existing) {
      const store = await prisma.store.create({ data: s });
      console.log("Store created:", store.name);
    } else {
      console.log("Store exists:", existing.name);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });