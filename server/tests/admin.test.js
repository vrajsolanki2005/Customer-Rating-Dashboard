const request = require("supertest");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { generateToken } = require("../src/utils/jwt");

describe("Admin API", () => {
  let admin;
  let adminToken;
  let normalUser;
  let normalUserToken;
  let owner;
  let store;

  beforeAll(async () => {
    admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });

    if (!admin) throw new Error("Admin not found. Run: node prisma/seed.js");

    adminToken = generateToken(admin);

    normalUser = await prisma.user.findFirst({ where: { role: "USER" } });
    if (normalUser) normalUserToken = generateToken(normalUser);
  });

  afterAll(async () => {
    if (store) await prisma.store.delete({ where: { id: store.id } });
    if (owner) await prisma.user.delete({ where: { id: owner.id } });
    await prisma.$disconnect();
  });

  // ─── GET /api/admin/dashboard ────────────────────────────────────────────────

  describe("GET /api/admin/dashboard", () => {
    test("200 - returns totalUsers, totalStores, totalRatings", async () => {
      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("totalUsers");
      expect(res.body.data).toHaveProperty("totalStores");
      expect(res.body.data).toHaveProperty("totalRatings");
      expect(typeof res.body.data.totalUsers).toBe("number");
    });

    test("403 - rejects normal user", async () => {
      if (!normalUserToken) return;

      const res = await request(app)
        .get("/api/admin/dashboard")
        .set("Authorization", `Bearer ${normalUserToken}`);

      expect(res.statusCode).toBe(403);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/admin/dashboard");
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── GET /api/admin/users ────────────────────────────────────────────────────

  describe("GET /api/admin/users", () => {
    test("200 - returns paginated user list", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("page");
      expect(res.body.pagination).toHaveProperty("totalPages");
    });

    test("200 - filters by role", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=ADMIN")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every((u) => u.role === "ADMIN")).toBe(true);
    });

    test("200 - filters by name", async () => {
      const res = await request(app)
        .get("/api/admin/users?name=admin")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("200 - supports pagination", async () => {
      const res = await request(app)
        .get("/api/admin/users?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
    });

    test("400 - rejects invalid role filter", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=INVALID")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── POST /api/admin/users ───────────────────────────────────────────────────

  describe("POST /api/admin/users", () => {
    test("201 - creates STORE_OWNER", async () => {
      const email = `owner_${Date.now()}@example.com`;

      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Store Owner Account",
          email,
          password: "Owner@123",
          address: "Store Owner Address Here",
          role: "STORE_OWNER",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("STORE_OWNER");
      expect(res.body.data.passwordHash).toBeUndefined();

      owner = await prisma.user.findUnique({ where: { email } });
      expect(owner).toBeDefined();
    });

    test("409 - rejects duplicate email", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Store Owner Account",
          email: owner.email,
          password: "Owner@123",
          address: "Store Owner Address Here",
          role: "STORE_OWNER",
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test("400 - rejects invalid role", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Store Owner Account",
          email: `new_${Date.now()}@example.com`,
          password: "Owner@123",
          address: "Store Owner Address Here",
          role: "INVALID_ROLE",
        });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects name shorter than 10 characters", async () => {
      const res = await request(app)
        .post("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Short",
          email: `new_${Date.now()}@example.com`,
          password: "Owner@123",
          address: "Store Owner Address Here",
          role: "USER",
        });

      expect(res.statusCode).toBe(400);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).post("/api/admin/users").send({
        name: "Test Store Owner Account",
        email: `new_${Date.now()}@example.com`,
        password: "Owner@123",
        address: "Store Owner Address Here",
        role: "USER",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── GET /api/admin/users/:id ────────────────────────────────────────────────

  describe("GET /api/admin/users/:id", () => {
    test("200 - returns user details", async () => {
      const res = await request(app)
        .get(`/api/admin/users/${admin.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(admin.id);
      expect(res.body.data.email).toBe(admin.email);
    });

    test("200 - returns stores array for STORE_OWNER", async () => {
      const res = await request(app)
        .get(`/api/admin/users/${owner.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.role).toBe("STORE_OWNER");
      expect(Array.isArray(res.body.data.stores)).toBe(true);
    });

    test("404 - returns 404 for non-existent user", async () => {
      const res = await request(app)
        .get("/api/admin/users/999999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(404);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).get(`/api/admin/users/${admin.id}`);
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── POST /api/admin/stores ──────────────────────────────────────────────────

  describe("POST /api/admin/stores", () => {
    test("201 - creates store with owner", async () => {
      const res = await request(app)
        .post("/api/admin/stores")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Supermarket Main Branch",
          email: `store_${Date.now()}@example.com`,
          address: "Main Road, Vadodara, Gujarat",
          ownerId: owner.id,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.owner.id).toBe(owner.id);

      store = res.body.data;
    });

    test("400 - rejects non-STORE_OWNER as owner", async () => {
      const res = await request(app)
        .post("/api/admin/stores")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Supermarket Main Branch",
          email: `store_${Date.now()}@example.com`,
          address: "Main Road, Vadodara, Gujarat",
          ownerId: admin.id,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("400 - rejects store name shorter than 20 characters", async () => {
      const res = await request(app)
        .post("/api/admin/stores")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Short Name",
          email: `store_${Date.now()}@example.com`,
          address: "Main Road, Vadodara",
          ownerId: owner.id,
        });

      expect(res.statusCode).toBe(400);
    });

    test("404 - rejects non-existent ownerId", async () => {
      const res = await request(app)
        .post("/api/admin/stores")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Test Supermarket Main Branch",
          email: `store_${Date.now()}@example.com`,
          address: "Main Road, Vadodara, Gujarat",
          ownerId: 999999,
        });

      expect(res.statusCode).toBe(404);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).post("/api/admin/stores").send({
        name: "Test Supermarket Main Branch",
        email: `store_${Date.now()}@example.com`,
        address: "Main Road, Vadodara, Gujarat",
      });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── GET /api/admin/stores ───────────────────────────────────────────────────

  describe("GET /api/admin/stores", () => {
    test("200 - returns paginated store list", async () => {
      const res = await request(app)
        .get("/api/admin/stores")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toHaveProperty("total");
    });

    test("200 - filters by name", async () => {
      const res = await request(app)
        .get("/api/admin/stores?name=supermarket")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("200 - supports pagination", async () => {
      const res = await request(app)
        .get("/api/admin/stores?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/admin/stores");
      expect(res.statusCode).toBe(401);
    });
  });
});
