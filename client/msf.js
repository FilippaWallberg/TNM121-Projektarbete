console.log("msf.js laddades");

async function loadMovies() {
  try {
    const response = await fetch("http://localhost:3000/api/movies");

    if (!response.ok) {
      throw new Error("Kunde inte hämta filmer");
    }

    const movies = await response.json();
    console.log("Filmer:", movies);
  } catch (error) {
    console.error("Fel:", error);
  }
}

loadMovies();

