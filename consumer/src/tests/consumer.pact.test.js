'use strict';

/**
 * Consumer Pact Tests
 *
 * These tests:
 *   1. Spin up a Pact mock server
 *   2. Register expected interactions (request → response pairs)
 *   3. Call the real UserClient (which hits the mock server)
 *   4. Assert the client handles responses correctly
 *   5. Write the verified interactions to ../../pacts/UserConsumer-UserProvider.json
 *
 * Run with: npm run test:pact  (from the consumer/ directory)
 */

const { PactV3, MatchersV3 } = require('@pact-foundation/pact');
const { like, eachLike, integer, string } = MatchersV3;
const path = require('path');
const UserClient = require('../client');

// ── Pact provider instance ──────────────────────────────────────────────────

const provider = new PactV3({
  consumer: 'UserConsumer',
  provider: 'UserProvider',
  dir: path.resolve(__dirname, '../../../pacts'),
  logLevel: 'warn',
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe('UserConsumer → UserProvider Pact', () => {
  // ── GET /users ─────────────────────────────────────────────────────────────

  describe('GET /users', () => {
    it('returns a non-empty list of users', async () => {
      await provider
        .addInteraction({
          states: [{ description: 'users exist' }],
          uponReceiving: 'a request for all users',
          withRequest: {
            method: 'GET',
            path: '/users',
          },
          willRespondWith: {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            // eachLike: array with ≥1 items matching this shape
            body: eachLike({
              id: integer(1),
              name: string('Alice'),
              email: string('alice@example.com'),
              role: string('admin'),
            }),
          },
        })
        .executeTest(async (mockServer) => {
          const client = new UserClient(mockServer.url);
          const users = await client.getUsers();

          expect(Array.isArray(users)).toBe(true);
          expect(users.length).toBeGreaterThan(0);
          expect(users[0]).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            email: expect.any(String),
          });
        });
    });
  });

  // ── GET /users/:id ────────────────────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('returns a single user when the user exists', async () => {
      await provider
        .addInteraction({
          states: [{ description: 'user with id 1 exists' }],
          uponReceiving: 'a request for user with id 1',
          withRequest: {
            method: 'GET',
            path: '/users/1',
          },
          willRespondWith: {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            // like: object must have these fields; values are type-matched, not exact
            body: like({
              id: integer(1),
              name: string('Alice'),
              email: string('alice@example.com'),
              role: string('admin'),
            }),
          },
        })
        .executeTest(async (mockServer) => {
          const client = new UserClient(mockServer.url);
          const user = await client.getUser(1);

          expect(user.id).toBe(1);
          expect(typeof user.name).toBe('string');
          expect(typeof user.email).toBe('string');
        });
    });

    it('returns 404 when the user does not exist', async () => {
      await provider
        .addInteraction({
          states: [{ description: 'user with id 999 does not exist' }],
          uponReceiving: 'a request for user with id 999',
          withRequest: {
            method: 'GET',
            path: '/users/999',
          },
          willRespondWith: {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
            body: like({
              error: string('User not found'),
            }),
          },
        })
        .executeTest(async (mockServer) => {
          const client = new UserClient(mockServer.url);

          // The client should propagate the 404 as a thrown error
          await expect(client.getUser(999)).rejects.toMatchObject({
            response: { status: 404 },
          });
        });
    });
  });

  // ── POST /users ───────────────────────────────────────────────────────────

  describe('POST /users', () => {
    it('creates a new user and returns 201 with the created resource', async () => {
      await provider
        .addInteraction({
          states: [{ description: 'the users collection is available' }],
          uponReceiving: 'a request to create a new user',
          withRequest: {
            method: 'POST',
            path: '/users',
            headers: { 'Content-Type': 'application/json' },
            body: like({
              name: string('Charlie'),
              email: string('charlie@example.com'),
              role: string('user'),
            }),
          },
          willRespondWith: {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
            body: like({
              id: integer(3),
              name: string('Charlie'),
              email: string('charlie@example.com'),
              role: string('user'),
            }),
          },
        })
        .executeTest(async (mockServer) => {
          const client = new UserClient(mockServer.url);
          const user = await client.createUser({
            name: 'Charlie',
            email: 'charlie@example.com',
            role: 'user',
          });

          expect(user.id).toBeDefined();
          expect(typeof user.id).toBe('number');
          expect(user.name).toBe('Charlie');
          expect(user.email).toBe('charlie@example.com');
        });
    });
  });
});
