'use strict';

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Provider API running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/users`);
  console.log(`  GET  http://localhost:${PORT}/users/:id`);
  console.log(`  POST http://localhost:${PORT}/users`);
});
