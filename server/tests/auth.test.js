const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Auth API", () => {
  const testEmail = `auth_test_${Date.now()}@example.com`;
  let token;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  // ─── POST /api/auth/signup ───────────────────────────────────────────────────

  describe("POST /api/auth/signup", () => {
    test("201 - creates user and returns token", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test Normal User Account",
        email: testEmail,
        address: "Test Address, Vadodara",
        password: "Test@123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.role).toBe("USER");
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    test("409 - rejects duplicate email", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test Normal User Account",
        email: testEmail,
        address: "Test Address, Vadodara",
        password: "Test@123",
      });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    test("400 - rejects password without uppercase", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test Normal User Account",
        email: `new_${Date.now()}@example.com`,
        address: "Test Address",
        password: "test@123",
      });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects password without special character", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test Normal User Account",
        email: `new_${Date.now()}@example.com`,
        address: "Test Address",
        password: "TestPass1",
      });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects name shorter than 10 characters", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Short",
        email: `new_${Date.now()}@example.com`,
        address: "Test Address",
        password: "Test@123",
      });

      expect(res.statusCode).toBe(400);
    });

    test("400 - rejects invalid email", async () => {
      const res = await request(app).post("/api/auth/signup").send({
        name: "Test Normal User Account",
        email: "not-an-email",
        address: "Test Address",
        password: "Test@123",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── POST /api/auth/login ────────────────────────────────────────────────────

  describe("POST /api/auth/login", () => {
    test("200 - logs in and returns token", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "Test@123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);

      token = res.body.data.token;
    });

    test("401 - rejects wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testEmail,
        password: "Wrong@123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("401 - rejects non-existent email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nobody@example.com",
        password: "Test@123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test("400 - rejects missing password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testEmail,
      });

      expect(res.statusCode).toBe(400);
    });
  });

  // ─── GET /api/auth/me ────────────────────────────────────────────────────────

  describe("GET /api/auth/me", () => {
    test("200 - returns current user", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toBe(401);
    });

    test("401 - rejects invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken");
      expect(res.statusCode).toBe(401);
    });
  });

  // ─── PATCH /api/auth/password ────────────────────────────────────────────────

  describe("PATCH /api/auth/password", () => {
    test("200 - changes password successfully", async () => {
      const res = await request(app)
        .patch("/api/auth/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "Test@123", newPassword: "New@1234" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("400 - rejects wrong current password", async () => {
      const res = await request(app)
        .patch("/api/auth/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "Wrong@123", newPassword: "New@1234" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("400 - rejects same new password", async () => {
      const res = await request(app)
        .patch("/api/auth/password")
        .set("Authorization", `Bearer ${token}`)
        .send({ currentPassword: "New@1234", newPassword: "New@1234" });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app)
        .patch("/api/auth/password")
        .send({ currentPassword: "Test@123", newPassword: "New@1234" });

      expect(res.statusCode).toBe(401);
    });
  });

  // ─── POST /api/auth/logout ───────────────────────────────────────────────────

  describe("POST /api/auth/logout", () => {
    test("200 - logs out successfully", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test("401 - rejects unauthenticated request", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.statusCode).toBe(401);
    });
  });
});
