const request = require("supertest");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { generateToken } = require("../src/utils/jwt");

describe("Admin API", () => {
  let admin;
  let adminToken;
  let owner;
  let ownerToken;
  let store;

  beforeAll(async () => {
    admin = await prisma.user.findUnique({
      where: {
        email: "admin@example.com",
      },
    });

    if (!admin) {
      throw new Error("Admin not found. Run: node prisma/seed.js");
    }

    adminToken = generateToken(admin);
  });

  afterAll(async () => {
    if (store) {
      await prisma.store.delete({
        where: {
          id: store.id,
        },
      });
    }

    if (owner) {
      await prisma.user.delete({
        where: {
          id: owner.id,
        },
      });
    }

    await prisma.$disconnect();
  });

  test("GET /api/admin/dashboard - should return dashboard statistics", async () => {
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty("totalUsers");
    expect(response.body.data).toHaveProperty("totalStores");
    expect(response.body.data).toHaveProperty("totalRatings");
  });

  test("GET /api/admin/users - should return users", async () => {
    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("POST /api/admin/users - should create store owner", async () => {
    const email = `owner${Date.now()}@example.com`;

    const response = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Store Owner Account",
        email,
        password: "Owner@123",
        address: "Store Owner Address",
        role: "STORE_OWNER",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.role).toBe("STORE_OWNER");

    owner = await prisma.user.findUnique({
      where: { email },
    });

    expect(owner).toBeDefined();

    ownerToken = generateToken(owner);
  });

  test("POST /api/admin/stores - should create store", async () => {
    const response = await request(app)
      .post("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Supermarket Main Branch",
        email: `store${Date.now()}@example.com`,
        address: "Main Road, Vadodara",
        ownerId: owner.id,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);

    store = response.body.data;

    expect(store).toBeDefined();
  });

  test("GET /api/admin/stores - should return stores", async () => {
    const response = await request(app)
      .get("/api/admin/stores")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /api/admin/dashboard - should reject normal user", async () => {
    const user = await prisma.user.findFirst({
      where: { role: "USER" },
    });

    if (!user) return;

    const userToken = generateToken(user);

    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("GET /api/admin/dashboard - should reject unauthenticated request", async () => {
    const response = await request(app)
      .get("/api/admin/dashboard");

    expect(response.statusCode).toBe(401);
  });
});
