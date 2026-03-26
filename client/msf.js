console.log("msf.js laddades");

let allMovies = [];
let activeFilters = {
  genre: "all",
  yearGroup: "all",
  rating: "all",
  bechdelScore: ""
};

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

async function loadMovies() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/movies");

    if (!response.ok) {
      throw new Error("Kunde inte hämta filmer");
    }

    allMovies = await response.json();
    console.log("Filmer:", allMovies);

    renderHomeSections();
    setupSearch();
  } catch (error) {
    console.error("Fel:", error);
  }
}

function renderHomeSections() {
  const popularRow = document.getElementById("popular-row");
  const actionRow = document.getElementById("action-row");
  const scifiRow = document.getElementById("scifi-row");

  if (!popularRow || !actionRow || !scifiRow) return;

  popularRow.innerHTML = "";
  actionRow.innerHTML = "";
  scifiRow.innerHTML = "";

  const popularMovies = shuffleArray(
    allMovies.filter(movie => movie.year >= 2022 && movie.year <= 2023)
  ).slice(0, 12);

  const actionMovies = shuffleArray(
    allMovies.filter(movie =>
      Array.isArray(movie.genre) && movie.genre.includes("Action")
    )
  ).slice(0, 12);

  const scifiMovies = shuffleArray(
    allMovies.filter(movie =>
      Array.isArray(movie.genre) && movie.genre.includes("Sci-Fi")
    )
  ).slice(0, 12);

  renderMovies(popularMovies, popularRow);
  renderMovies(actionMovies, actionRow);
  renderMovies(scifiMovies, scifiRow);

  document.querySelector("#popular-row").closest(".movie-row-section").style.display = "block";
  document.querySelector("#action-row").closest(".movie-row-section").style.display = "block";
  document.querySelector("#scifi-row").closest(".movie-row-section").style.display = "block";
}

function applyFilters() {
  let filtered = [...allMovies];

  if (activeFilters.genre !== "all") {
    filtered = filtered.filter(movie =>
      Array.isArray(movie.genre) &&
      movie.genre.some(g => g.toLowerCase() === activeFilters.genre.toLowerCase())
    );
  }

  if (activeFilters.yearGroup === "new") {
    filtered = filtered.filter(movie => Number(movie.year) >= 2019);
  } else if (activeFilters.yearGroup === "old") {
    filtered = filtered.filter(movie => Number(movie.year) <= 2018);
  }

  if (activeFilters.rating === "high") {
    filtered = filtered.filter(movie => Number(movie.rating) >= 7);
  } else if (activeFilters.rating === "low") {
    filtered = filtered.filter(movie => Number(movie.rating) < 7);
  }

  if (activeFilters.bechdelScore !== "") {
    filtered = filtered.filter(
      movie => Number(movie.bechdelScore) === Number(activeFilters.bechdelScore)
    );
  }

  const popularSection = document.querySelector("#popular-row").closest(".movie-row-section");
  const actionSection = document.querySelector("#action-row").closest(".movie-row-section");
  const scifiSection = document.querySelector("#scifi-row").closest(".movie-row-section");

  popularSection.style.display = "block";
  actionSection.style.display = "none";
  scifiSection.style.display = "none";

  popularSection.querySelector("h2").textContent = `Filtered movies (${filtered.length})`;

  renderMovies(filtered.slice(0, 50), document.getElementById("popular-row"));
  closeFilterModal();
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
  modalGenre.textContent = Array.isArray(movie.genre) ? movie.genre.join(", ") : "Unknown";
  modalYear.textContent = movie.year ?? "Unknown";
  modalRating.textContent = movie.rating ?? "0";
  modalBScore.textContent = movie.bechdelScore ?? "0";
  modalDesc.textContent = movie.description || "No description available.";

  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

function closeMovieModal() {
  const modal = document.getElementById("movieModal");
  modal.classList.remove("show");
  document.body.classList.remove("modal-open");
}

function renderMovies(movieList, container) {
  container.innerHTML = "";

  if (!movieList.length) {
    container.innerHTML = `<p style="color:white;">No movies found.</p>`;
    return;
  }

  movieList.forEach((movie) => {
    const card = document.createElement("div");
    card.className = "movie-card";

    card.innerHTML = `
      <img src="${getPosterUrl(movie)}" alt="${movie.name || "Movie poster"}" class="movie-poster">
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
        <p>${movie.year ?? ""}</p>
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

function openFilterModal() {
  document.getElementById("filterModal").classList.add("show");
  document.body.classList.add("modal-open");
}

function closeFilterModal() {
  document.getElementById("filterModal").classList.remove("show");
  document.body.classList.remove("modal-open");
}

function setupFilterEvents() {
  const filterButton = document.getElementById("filterButton");
  const closeFilterModalBtn = document.getElementById("closeFilterModal");
  const filterModal = document.getElementById("filterModal");

  filterButton?.addEventListener("click", openFilterModal);
  closeFilterModalBtn?.addEventListener("click", closeFilterModal);

  filterModal?.addEventListener("click", (event) => {
    if (event.target === filterModal) {
      closeFilterModal();
    }
  });

  document.querySelectorAll(".filter-option").forEach(button => {
    button.addEventListener("click", () => {
      activeFilters.genre = button.dataset.filter;
      applyFilters();
    });
  });

  document.querySelectorAll(".year-filter").forEach(button => {
    button.addEventListener("click", () => {
      const yearValue = button.dataset.year;

      if (yearValue === "New movies") activeFilters.yearGroup = "new";
      else if (yearValue === "Old movies") activeFilters.yearGroup = "old";
      else activeFilters.yearGroup = "all";

      applyFilters();
    });
  });

  document.querySelectorAll(".rating-filter").forEach(button => {
    button.addEventListener("click", () => {
      activeFilters.rating =
        button.dataset.rating === "all" ? "all" : button.dataset.rating;
      applyFilters();
    });
  });

  document.querySelectorAll('input[name="bechdelScore"]').forEach(radio => {
    radio.addEventListener("change", () => {
      activeFilters.bechdelScore = radio.value;
      applyFilters();
    });
  });
}

function setupModalEvents() {
  const closeModalBtn = document.getElementById("closeModal");
  const modal = document.getElementById("movieModal");

  closeModalBtn?.addEventListener("click", closeMovieModal);

  modal?.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeMovieModal();
    }
  });
}

function resetToHomePage() {
  activeFilters = {
    genre: "all",
    yearGroup: "all",
    rating: "all",
    bechdelScore: ""
  };

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchInput) searchInput.value = "";
  if (searchResults) {
    searchResults.innerHTML = "";
    searchResults.classList.remove("show");
  }

  renderHomeSections();

  document.querySelector(".home-page")?.scrollIntoView({
    behavior: "smooth"
  });
}

function setupNavLinks() {
  const moviesLink = document.getElementById("moviesLink");
  const footerMoviesLink = document.getElementById("footerMoviesLink");

  moviesLink?.addEventListener("click", (event) => {
    event.preventDefault();
    resetToHomePage();
  });

  footerMoviesLink?.addEventListener("click", (event) => {
    event.preventDefault();
    resetToHomePage();
  });
}

async function init() {
  await loadMovies();
  setupSearch();
  setupModalEvents();
  setupFilterEvents();
  setupNavLinks();
}

init();


