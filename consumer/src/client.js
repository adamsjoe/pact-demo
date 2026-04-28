'use strict';

/**
 * UserClient
 *
 * Thin axios wrapper — the "consumer" of the UserProvider API.
 * In Pact terms this is the code under test during consumer tests;
 * the Pact mock server stands in for the real provider.
 */

const axios = require('axios');

class UserClient {
  constructor(baseUrl) {
    this.http = axios.create({
      baseURL: baseUrl,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** GET /users → User[] */
  async getUsers() {
    const { data } = await this.http.get('/users');
    return data;
  }

  /** GET /users/:id → User (throws on 404) */
  async getUser(id) {
    const { data } = await this.http.get(`/users/${id}`);
    return data;
  }

  /** POST /users → User (201) */
  async createUser(payload) {
    const { data } = await this.http.post('/users', payload);
    return data;
  }
}

module.exports = UserClient;
