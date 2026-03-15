const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Movie = require("./models/Movie");


const app = express();

app.use(cors());
app.use(express.json());

app.use("/media", express.static(path.join(__dirname, "..", "..", "project-material", "media")));


mongoose.connect("mongodb://localhost:27017/tnm121-project")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Mongo error:", err));

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/movies", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const movies = await db.collection("imdb").find({}).limit(300).toArray();
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
