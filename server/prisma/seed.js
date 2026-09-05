const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(
    "Admin@123",
    12
  );

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@example.com",
    },

    update: {},

    create: {
      name: "System Administrator Account",
      email: "admin@example.com",
      passwordHash,
      address: "Admin Office",
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });