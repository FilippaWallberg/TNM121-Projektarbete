const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bechdelData = require("/mnt/data/bechdel.json");

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

app.get("/api/bechdel", (req, res) => {
  res.json(bechdelData);
});

app.get("/api/movies", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const imdbMovies = await db.collection("imdb")
      .find({})
      .sort({ year: -1, votes: -1 })
      .limit(5000)
      .toArray();

    const bechdelMap = new Map(
      bechdelData.data.map(item => [
        Number(item.normalized_imdb_id),
        Number(item.rating)
      ])
    );

    let movies = imdbMovies.map(movie => ({
      ...movie,
      bechdelScore: bechdelMap.get(Number(movie.normalized_id)) ?? null
    }));

    const { genre, yearGroup, rating, bechdelScore } = req.query;

    if (genre && genre !== "all") {
      movies = movies.filter(movie =>
        Array.isArray(movie.genre) &&
        movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (yearGroup === "new") {
      movies = movies.filter(movie => Number(movie.year) >= 2019);
    }

    if (yearGroup === "old") {
      movies = movies.filter(movie => Number(movie.year) <= 2018);
    }

    if (rating === "high") {
      movies = movies.filter(movie => Number(movie.rating) >= 7);
    }

    if (rating === "low") {
      movies = movies.filter(movie => Number(movie.rating) < 7);
    }

    if (bechdelScore !== undefined && bechdelScore !== "") {
      movies = movies.filter(
        movie => Number(movie.bechdelScore) === Number(bechdelScore)
      );
    }

    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
