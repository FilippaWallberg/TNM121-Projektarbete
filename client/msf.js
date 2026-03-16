console.log("msf.js laddades");

let allMovies = [];
let bechdelMap = new Map();

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getPosterUrl(movie) {
  return `http://127.0.0.1:3000/media/${movie.normalized_id}.png`;
}

async function loadBechdelScores() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/bechdel");

    if (!response.ok) {
      throw new Error("Kunde inte hämta bechdel-data");
    }

    const bechdelData = await response.json();

    bechdelMap = new Map(
        bechdelData.data.map(item => [Number(item.normalized_imdb_id), item.rating])
    );

    console.log("Bechdel-data laddad:", bechdelMap);
} catch (error) {
    console.error("Fel vid hämtning av bechdel-data:", error);
  }
}

async function loadMovies() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/movies");

    if (!response.ok) {
      throw new Error("Kunde inte hämta filmer");
    }

    const movies = await response.json();
    allMovies = movies;

    console.log("Filmer:", movies);

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

    renderMovies(popularMovies, popularRow);
    renderMovies(actionMovies, actionRow);
    renderMovies(scifiMovies, scifiRow);

    setupSearch();
  } catch (error) {
    console.error("Fel:", error);
  }
}

function openMovieModal(movie) {
  const modal = document.getElementById("movieModal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalGenre = document.getElementById("modalGenre");
  const modalYear = document.getElementById("modalYear");
  const modalRating = document.getElementById("modalRating");
  const modalBScore = document.getElementById("modalBScore");
  const modalDesc = document.getElementById("modalDesc");

  modalImg.src = getPosterUrl(movie);
  modalImg.alt = movie.name || "Movie Poster";
  modalTitle.textContent = movie.name || "Unknown title";
  modalGenre.textContent = Array.isArray(movie.genre)
    ? movie.genre.join(", ")
    : "Unknown";
  modalYear.textContent = movie.year ?? "Unknown";
  modalRating.textContent = movie.rating ?? "0";
  modalBScore.textContent = bechdelMap.get(Number(movie.normalized_id)) ?? "0";
  modalDesc.textContent = movie.description || "No description available.";

  modal.style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeMovieModal() {
  const modal = document.getElementById("movieModal");
  modal.style.display = "none";
  document.body.classList.remove("modal-open");
}

function renderMovies(movieList, container) {
  container.innerHTML = "";

  movieList.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const posterUrl = getPosterUrl(movie);

    card.innerHTML = `
      <img src="${posterUrl}" alt="${movie.name || 'Movie poster'}" class="movie-poster">
    `;

    card.addEventListener("click", () => openMovieModal(movie));
    container.appendChild(card);
  });
}

function renderSearchResults(results) {
  const searchResults = document.getElementById("searchResults");

  if (!results.length) {
    searchResults.innerHTML = `<div class="search-result-card">No movies found</div>`;
    searchResults.classList.add("show");
    return;
  }

  searchResults.innerHTML = "";

  results.forEach(movie => {
    const card = document.createElement("div");
    card.className = "search-result-card";

    card.innerHTML = `
      <img src="${getPosterUrl(movie)}" alt="${movie.name}">
      <div class="search-result-info">
        <h4>${movie.name}</h4>
        <p>${movie.year ?? "Unknown year"}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      openMovieModal(movie);
      searchResults.classList.remove("show");
      searchResults.innerHTML = "";
      document.getElementById("searchInput").value = movie.name;
    });

    searchResults.appendChild(card);
  });

  searchResults.classList.add("show");
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (!searchInput || !searchResults) return;

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();

    if (!value) {
      searchResults.innerHTML = "";
      searchResults.classList.remove("show");
      return;
    }

    const filteredMovies = allMovies
      .filter(movie => movie.name && movie.name.toLowerCase().includes(value))
      .slice(0, 6);

    renderSearchResults(filteredMovies);
  });

  document.addEventListener("click", (event) => {
    if (!searchResults.contains(event.target) && event.target !== searchInput) {
      searchResults.classList.remove("show");
    }
  });
}

function setupModalEvents() {
  const closeModalBtn = document.getElementById("closeModal");
  const modal = document.getElementById("movieModal");

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeMovieModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeMovieModal();
      }
    });
  }
}

async function init() {
  await loadBechdelScores();
  await loadMovies();
  setupModalEvents();
}

init();




