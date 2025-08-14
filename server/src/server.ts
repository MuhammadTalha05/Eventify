// src/server.ts
import express, { Request, Response } from 'express';

const app = express();
const PORT = 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});