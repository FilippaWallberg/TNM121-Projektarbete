const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/tnm121-project")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Mongo error:", err));

// Test route
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});