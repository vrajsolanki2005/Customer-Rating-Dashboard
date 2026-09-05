const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { generateToken } = require("../src/utils/jwt");

describe("Owner API", () => {
  let owner;
  let ownerToken;
  let store;
  let ratingUser;

  const ownerEmail = `owner_test_${Date.now()}@example.com`;
  const userEmail = `rater_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("Test@123", 12);

    owner = await prisma.user.create({
      data: {
        name: "Test Store Owner Account",
        email: ownerEmail,
        address: "Owner Address, Vadodara",
        passwordHash,
        role: "STORE_OWNER",
      },
    });

    ownerToken = generateToken(owner);

    store = await prisma.store.create({
      data: {
        name: "Owner Test Store Branch",
        email: `ownerstore_${Date.now()}@example.com`,
        address: "Store Address, Vadodara",
        ownerId: owner.id,
      },
    });

    ratingUser = await prisma.user.create({
      data: {
        name: "Rating Test User Account",
        email: userEmail,
        address: "User Address, Vadodara",
        passwordHash,
        role: "USER",
      },
    });

    await prisma.rating.create({
      data: { rating: 4, userId: ratingUser.id, storeId: store.id },
    });
  });

  afterAll(async () => {
    await prisma.rating.deleteMany({ where: { storeId: store.id } });
    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.deleteMany({ where: { id: { in: [owner.id, ratingUser.id] } } });
    await prisma.$disconnect();
  });

  // ─── GET /api/owner/dashboard ─────────────────────────────────────────────────

  describe("GET /api/owner/dashboard", () => {
    test("200 - returns stores, ratings, averageRating, totalRatings", async () => {
      const res = await request(app)
        .get("/api/owner/dashboard")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.stores)).toBe(true);
      expect(Array.isArray(res.body.data.ratings)).toBe(true);
      expect(res.body.data).toHaveProperty("totalRatings");
      expect(res.body.data).toHaveProperty("averageRating");
      expect(res.body.pagination).toHaveProperty("total");
    });

    test("200 - shows correct store and rating data", async () => {
      const res = await request(app)
        .get("/api/owner/dashboard")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.body.data.totalRatings).toBe(1);
      expect(res.body.data.averageRating).toBe(4);

      const s = res.body.data.stores.find((x) => x.id === store.id);
      expect(s).toBeDefined();

      const r = res.body.data.ratings[0];
      expect(r.rating).toBe(4);
      expect(r.user.id).toBe(ratingUser.id);
      expect(r.store.id).toBe(store.id);
    });

    test("200 - returns empty data when owner has no stores", async () => {
      const passwordHash = await bcrypt.hash("Test@123", 12);
      const emptyOwner = await prisma.user.create({
        data: {
          name: "Empty Store Owner Account",
          email: `emptyowner_${Date.now()}@example.com`,
          address: "Empty Owner Address",
          passwordHash,
          role: "STORE_OWNER",
        },
      });

      const emptyToken = generateToken(emptyOwner);

      const res = await request(app)
        .get("/api/owner/dashboard")
        .set("Authorization", `Bearer ${emptyToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.stores).toHaveLength(0);
      expect(res.body.data.totalRatings).toBe(0);

      await prisma.user.delete({ where: { id: emptyOwner.id } });
    });

    test("200 - filters ratings by user name", async () => {
      const res = await request(app)
        .get("/api/owner/dashboard?name=Rating")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.ratings.length).toBeGreaterThan(0);
    });

    test("200 - supports pagination", async () => {
      const res = await request(app)
        .get("/api/owner/dashboard?page=1&limit=1")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.ratings.length).toBeLessThanOrEqual(1);
      expect(res.body.pagination.limit).toBe(1);
    });

    test("403 - rejects USER role", async () => {
      const user = await prisma.user.findFirst({ where: { role: "USER" } });
      if (!user) return;

      const userToken = generateToken(user);
      const res = await request(app)
        .get("/api/owner/dashboard")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.statusCode).toBe(403);
    });

    test("403 - rejects ADMIN role", async () => {
      const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
      if (!admin) return;

      const adminToken = generateToken(admin);
      const res = await request(app)
        .get("/api/owner/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(403);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/owner/dashboard");
      expect(res.statusCode).toBe(401);
    });
  });
});
