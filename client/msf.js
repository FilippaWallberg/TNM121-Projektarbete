console.log("msf.js laddades");

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

    const popularMovies = movies.slice(0, 5);
    const actionMovies = movies.filter(movie =>
      movie.genre && movie.genre.toLowerCase().includes("action")
    ).slice(0, 5);

    const scifiMovies = movies.filter(movie =>
      movie.genre &&
      (movie.genre.toLowerCase().includes("sci-fi") ||
       movie.genre.toLowerCase().includes("science fiction"))
    ).slice(0, 5);

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

    // Tillfällig testbild just nu
    const posterUrl = "http://127.0.0.1:3000/media/7361.png";

    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.title || 'Movie poster'}" class="movie-poster">
    `;

    container.appendChild(card);
  });
}

loadMovies();


