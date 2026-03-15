console.log("msf.js laddades");

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

async function loadMovies() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/movies");

    if (!response.ok) {
      throw new Error("Kunde inte hämta filmer");
    }

    const movies = await response.json();
    console.log("Filmer:", movies);
    console.log("Första filmen:", movies[0]);

    const popularRow = document.getElementById("popular-row");
    const actionRow = document.getElementById("action-row");
    const scifiRow = document.getElementById("scifi-row");

    if (!popularRow || !actionRow || !scifiRow) {
      console.error("Hittade inte en eller flera movie rows i HTML");
      return;
    }

    popularRow.innerHTML = "";
    actionRow.innerHTML = "";
    scifiRow.innerHTML = "";

    const popularMovies = shuffleArray(
        movies.filter(movie => movie.year >= 2022 && movie.year <= 2023)
    ).slice(0, 12);

    console.log("popularMovies:", popularMovies);
    console.log("popular years:", popularMovies.map(movie => movie.year));

    const actionMovies = shuffleArray(
      movies.filter(movie =>
        Array.isArray(movie.genre) && movie.genre.includes("Action")
      )
    ).slice(0, 12);

    const scifiMovies = shuffleArray(
      movies.filter(movie =>
        Array.isArray(movie.genre) && movie.genre.includes("Sci-Fi")
      )
    ).slice(0, 12);

    console.log("popularMovies:", popularMovies);
    console.log("actionMovies:", actionMovies);
    console.log("scifiMovies:", scifiMovies);

    renderMovies(popularMovies, popularRow);
    renderMovies(actionMovies, actionRow);
    renderMovies(scifiMovies, scifiRow);

  } catch (error) {
    console.error("Fel:", error);
  }
}

function renderMovies(movieList, container) {
  movieList.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const posterUrl = `http://127.0.0.1:3000/media/${movie.normalized_id}.png`;

    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.name || 'Movie poster'}" class="movie-poster">
    `;

    container.appendChild(card);
  });
}

loadMovies();



