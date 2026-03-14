console.log("msf.js laddades");

async function loadMovies() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/movies");

    if (!response.ok) {
      throw new Error("Kunde inte hämta filmer");
    }

    const movies = await response.json();
    console.log("Filmer:", movies);

    const movieContainer = document.getElementById("movie-container");

    if (!movieContainer) {
      console.error("Hittade inte movie-container i HTML");
      return;
    }

    movieContainer.innerHTML = "";

    movies.forEach((movie) => {
      const card = document.createElement("div");
      card.className = "movie-card";

      card.innerHTML = `
        <h3>${movie.title || "Ingen titel"}</h3>
        <p>År: ${movie.year || "Okänt"}</p>
        <p>Genre: ${movie.genre || "Okänd genre"}</p>
      `;

      movieContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Fel:", error);
  }
}

loadMovies();

