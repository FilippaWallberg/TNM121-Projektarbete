const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/tnm121-project")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Mongo error:", err));

const Movie = require("./models/Movie");

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/movies", async (req, res) => {
  try {
    const movies = await Movie.find().limit(20);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/movies", async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json(movie);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
