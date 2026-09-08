const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { generateToken } = require("../src/utils/jwt");

describe("Rating System", () => {
  let user;
  let user2;
  let token;
  let token2;
  let store;

  const email1 = `rating_user1_${Date.now()}@example.com`;
  const email2 = `rating_user2_${Date.now()}@example.com`;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("Test@123", 12);

    user = await prisma.user.create({
      data: { name: "Rating Test User One", email: email1, address: "Test Address", passwordHash, role: "USER" },
    });

    user2 = await prisma.user.create({
      data: { name: "Rating Test User Two", email: email2, address: "Test Address", passwordHash, role: "USER" },
    });

    token = generateToken(user);
    token2 = generateToken(user2);

    store = await prisma.store.create({
      data: {
        name: "Rating Test Store",
        email: `ratingstore_${Date.now()}@example.com`,
        address: "Store Address, Vadodara",
      },
    });
  });

  afterAll(async () => {
    await prisma.rating.deleteMany({ where: { storeId: store.id } });
    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.deleteMany({ where: { id: { in: [user.id, user2.id] } } });
    await prisma.$disconnect();
  });

  // Clean up ratings before each submit test
  beforeEach(async () => {
    // Only clean for tests that need a fresh state — handled per test
  });

  describe("POST /api/user/stores/:storeId/rating — submit", () => {
    beforeEach(async () => {
      await prisma.rating.deleteMany({ where: { userId: user.id, storeId: store.id } });
    });

    test("201 - accepts valid rating of 1", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 1 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.rating).toBe(1);
    });

    test("201 - accepts valid rating of 5", async () => {
      await prisma.rating.deleteMany({ where: { userId: user.id, storeId: store.id } });

      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5 });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.rating).toBe(5);
    });

    test("400 - rejects rating of 0", async () => {
      await prisma.rating.deleteMany({ where: { userId: user.id, storeId: store.id } });

      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 0 });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects rating of 6", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 6 });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects decimal rating 3.5", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3.5 });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects missing rating field", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.statusCode).toBe(400);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(401);
    });

    test("404 - rejects non-existent store", async () => {
      const res = await request(app)
        .post("/api/user/stores/999999/rating")
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("Duplicate prevention and update", () => {
    beforeAll(async () => {
      await prisma.rating.deleteMany({ where: { userId: user.id, storeId: store.id } });
      await prisma.rating.create({ data: { rating: 4, userId: user.id, storeId: store.id } });
    });

    test("409 - rejects duplicate rating from same user", async () => {
      const res = await request(app)
        .post(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 3 });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test("200 - allows updating existing rating", async () => {
      const res = await request(app)
        .put(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 2 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.rating).toBe(2);
    });

    test("404 - update fails when no rating exists for that user/store", async () => {
      const res = await request(app)
        .put(`/api/user/stores/${store.id}/rating`)
        .set("Authorization", `Bearer ${token2}`)
        .send({ rating: 4 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe("Average rating accuracy", () => {
    beforeAll(async () => {
      // user has rating 2 (from above), add user2 rating of 4 → avg = 3
      await prisma.rating.deleteMany({ where: { userId: user2.id, storeId: store.id } });
      await prisma.rating.create({ data: { rating: 4, userId: user2.id, storeId: store.id } });
    });

    test("GET /api/user/stores returns correct average rating", async () => {
      const res = await request(app)
        .get("/api/user/stores")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      const s = res.body.data.find((x) => x.id === store.id);
      expect(s).toBeDefined();
      // user=2, user2=4 → avg=3
      expect(s.overallRating).toBe(3);
    });

    test("GET /api/user/stores shows correct userRating per user", async () => {
      const res1 = await request(app)
        .get("/api/user/stores")
        .set("Authorization", `Bearer ${token}`);

      const res2 = await request(app)
        .get("/api/user/stores")
        .set("Authorization", `Bearer ${token2}`);

      const s1 = res1.body.data.find((x) => x.id === store.id);
      const s2 = res2.body.data.find((x) => x.id === store.id);

      expect(s1.userRating).toBe(2);
      expect(s2.userRating).toBe(4);
    });
  });
});
