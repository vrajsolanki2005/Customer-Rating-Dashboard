const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../src/app");
const prisma = require("../src/config/prisma");
const { generateToken } = require("../src/utils/jwt");

describe("Normal User API", () => {
  let user;
  let token;
  let store;
  let rating;

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
  });

  afterAll(async () => {
    await prisma.rating.deleteMany({
      where: { userId: user.id, storeId: store.id },
    });

    await prisma.store.delete({ where: { id: store.id } });
    await prisma.user.delete({ where: { id: user.id } });

    await prisma.$disconnect();
  });

  test("GET /api/stores - should return stores", async () => {
    const response = await request(app)
      .get("/api/stores")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /api/stores - should support search", async () => {
    const response = await request(app)
      .get("/api/stores?name=store")
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test("POST /api/stores/:storeId/rating - should submit rating", async () => {
    await prisma.rating.deleteMany({
      where: { userId: user.id, storeId: store.id },
    });

    const response = await request(app)
      .post(`/api/stores/${store.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5 });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);

    rating = response.body.data;

    expect(rating.rating).toBe(5);
  });

  test("POST /api/stores/:storeId/rating - should reject duplicate rating", async () => {
    const response = await request(app)
      .post(`/api/stores/${store.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4 });

    expect(response.statusCode).toBe(409);
  });

  test("PUT /api/stores/:storeId/rating - should modify rating", async () => {
    const response = await request(app)
      .put(`/api/stores/${store.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4 });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.rating).toBe(4);
  });

  test("POST /api/stores/:storeId/rating - should reject rating above 5", async () => {
    const response = await request(app)
      .post(`/api/stores/${store.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 6 });

    expect(response.statusCode).toBe(400);
  });

  test("POST /api/stores/:storeId/rating - should reject rating below 1", async () => {
    const response = await request(app)
      .post(`/api/stores/${store.id}/rating`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 0 });

    expect(response.statusCode).toBe(400);
  });
});
