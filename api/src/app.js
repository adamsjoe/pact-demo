'use strict';

const express = require('express');
const app = express();

app.use(express.json());

// In-memory store — reset on each require() via module cache clear in tests
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
];
let nextId = 3;

// Expose reset so provider state handlers can call it
app.reset = () => {
  users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  ];
  nextId = 3;
};

app.get('/users', (_req, res) => {
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id, 10));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(users);
});

app.post('/users', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  const user = { id: nextId++, name, email, role: role || 'user' };
  users.push(user);
  res.status(201).json(user);
});

module.exports = app;
