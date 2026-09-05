const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Authentication API", () => {
  const testEmail = `testuser${Date.now()}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: testEmail,
      },
    });

    await prisma.$disconnect();
  });

  test("POST /api/auth/signup - should create a user", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Test Normal User Account",
        email: testEmail,
        address: "Test Address, Vadodara",
        password: "Test@123",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe(testEmail);
    expect(response.body.data.user.role).toBe("USER");
  });

  test("POST /api/auth/signup - should reject invalid password", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Another Test User Account",
        email: `invalid${Date.now()}@example.com`,
        address: "Test Address",
        password: "password",
      });

    expect(response.statusCode).toBe(400);
  });

  test("POST /api/auth/login - should login successfully", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "Test@123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test("POST /api/auth/login - should reject wrong password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testEmail,
        password: "Wrong@123",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("GET /api/auth/me - should require authentication", async () => {
    const response = await request(app)
      .get("/api/auth/me");

    expect(response.statusCode).toBe(401);
  });
});
