const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { generateToken } = require("../src/utils/jwt");

describe("Store & Rating API", () => {
  let user;
  let token;
  let store;
  let otherStore;

  const testEmail = `user_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("Test@123", 12);

    user = await prisma.user.create({
      data: {
        name: "Test Normal User Account",
        email: testEmail,
        address: "Test Address, Vadodara",
        passwordHash,
        role: "USER",
      },
    });

    token = generateToken(user);

    store = await prisma.store.create({
      data: {
        name: "Test Store For Rating",
        email: `teststore_${Date.now()}@example.com`,
        address: "Test Store Address, Vadodara",
      },
    });

    otherStore = await prisma.store.create({
      data: {
        name: "Another Store For Search",
        email: `otherstore_${Date.now()}@example.com`,
        address: "Other Store Address, Surat",
      },
    });
  });

  afterAll(async () => {
    await prisma.rating.deleteMany({ where: { userId: user.id } });
    await prisma.store.deleteMany({ where: { id: { in: [store.id, otherStore.id] } } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  });

  // ─── GET /api/user/stores ─────────────────────────────────────────────────────

  describe("GET /api/user/stores", () => {
    test("200 - returns store list with overallRating and userRating", async () => {
      const res = await request(app)
        .get("/api/user/stores")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toHaveProperty("total");

      const s = res.body.data.find((x) => x.id === store.id);
      expect(s).toBeDefined();
      expect(s).toHaveProperty("overallRating");
      expect(s).toHaveProperty("userRating");
      expect(s.passwordHash).toBeUndefined();
    });

    test("200 - filters by name", async () => {
      const res = await request(app)
        .get("/api/user/stores?name=Another")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.every((s) => s.name.toLowerCase().includes("another"))).toBe(true);
    });

    test("200 - returns empty array for no match", async () => {
      const res = await request(app)
        .get("/api/user/stores?name=zzznomatch")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    test("200 - supports pagination", async () => {
      const res = await request(app)
        .get("/api/user/stores?page=1&limit=2")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
    });

    test("403 - rejects non-USER role", async () => {
      const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
      if (!admin) return;

      const adminToken = generateToken(admin);
      const res = await request(app)
        .get("/api/user/stores")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(403);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/user/stores");
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── POST /api/user/stores/:storeId/rating ────────────────────────────────────

  describe("POST /api/user/stores/:storeId/rating", () => {
    test("201 - submits rating successfully", async () => {
      await prisma.rating.deleteMany({ where: { userId: user.id, storeId: store.id } });

      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.storeId).toBe(store.id);
    });

    test("409 - rejects duplicate rating", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test("400 - rejects rating above 5", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects rating below 1", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 0 });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects non-integer rating", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3.5 });

      expect(res.statusCode).toBe(400);
    });

    test("404 - rejects non-existent store", async () => {
      const res = await request(app)
        .post("/api/user/stores/999999/rating")
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(404);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── PUT /api/user/stores/:storeId/rating ─────────────────────────────────────

  describe("PUT /api/user/stores/:storeId/rating", () => {
    test("200 - updates rating successfully", async () => {
      const res = await request(app)
        .put(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(3);
      expect(res.body.data.storeId).toBe(store.id);
    });

    test("404 - rejects update when no rating exists", async () => {
      const res = await request(app)
        .put(`/api/user/stores/${otherStore.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    test("400 - rejects rating above 5", async () => {
      const res = await request(app)
        .put(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects rating below 1", async () => {
      const res = await request(app)
        .put(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 0 });

      expect(res.statusCode).toBe(400);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app)
        .put(`/api/user/stores/${store.id}/rating`)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── Average rating reflects submitted ratings ────────────────────────────────

  describe("Store average rating", () => {
    test("GET /api/user/stores reflects updated overallRating", async () => {
      const res = await request(app)
        .get("/api/user/stores")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      const s = res.body.data.find((x) => x.id === store.id);
      expect(s.overallRating).toBe(3);
      expect(s.userRating).toBe(3);
    });
  });
});
