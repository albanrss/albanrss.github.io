const addButton = document.getElementById("addMovieButton")
const movieInput = document.getElementById("movieInput")
const selectMovieButton = document.getElementById("selectMovieButton")

/**
 * @typedef {{ userInput: string, title: string, url: string }} Movie
 * userInput : ce que l'utilisateur a tapé (conservé pour la déduplication)
 * title     : titre Wikipedia normalisé (peut différer de userInput)
 * url       : URL du thumbnail Wikipedia (vide si non trouvé)
 */

/** @type {Movie[]} */
let movieList = []

const englishMediaWikiAPIURL = "https://en.wikipedia.org/w/api.php"

// Fetches the best-matching Wikipedia title + thumbnail in a single API call.
async function getMovieInfo(name) {
    try {
        // 1ère requête : recherche textuelle pour trouver le titre exact de la page Wikipedia
        const searchUrl = `${englishMediaWikiAPIURL}?action=query&list=search&srsearch=${encodeURIComponent(name + " film")}&format=json&origin=*&srlimit=1`
        const searchResponse = await fetch(searchUrl)
        if (searchResponse.status !== 200) return { title: name, url: "" }

        const searchData = await searchResponse.json()
        const bestTitle = searchData?.query?.search?.[0]?.title
        if (!bestTitle) return { title: name, url: "" }

        // 2ème requête : récupère le thumbnail à partir du titre exact trouvé
        const infoUrl = `${englishMediaWikiAPIURL}?action=query&titles=${encodeURIComponent(bestTitle)}&prop=pageimages&pithumbsize=300&format=json&origin=*`
        const infoResponse = await fetch(infoUrl)
        if (infoResponse.status !== 200) return { title: bestTitle, url: "" }

        const infoData = await infoResponse.json()
        const pages = infoData?.query?.pages
        // L'API retourne un objet indexé par page ID, on prend la première (et unique) entrée
        const page = pages ? Object.values(pages)[0] : null
        const url = page?.thumbnail?.source || ""
        return { title: bestTitle, url }

    } catch (error) {
        console.error("Error fetching movie info for", name, error)
        return { title: name, url: "" }
    }
}

async function updateList() {
    const movieListComponent = document.getElementById("movieList")

    // Fetch missing movie info in parallel
    await Promise.all(movieList.map(async (movie, i) => {
        if (!movie.url) {
            const { title, url } = await getMovieInfo(movie.userInput)
            movieList[i] = { userInput: movie.userInput, title, url }
        }
    }))

    const newContent = movieList.map((movie, i) =>
        constructMovieCard(movie, i)
    ).join("")
    movieListComponent.innerHTML = newContent
}



async function addMovie() {
    const newMovieName = movieInput.value.trim()

    if (!newMovieName)
        return
    // Déduplication sur userInput pour éviter les doublons même si les titres Wikipedia diffèrent
    if (movieList.some(movie => movie.userInput === newMovieName))
        return

    const { title, url } = await getMovieInfo(newMovieName)
    movieList.push({ userInput: newMovieName, title, url })
    updateList()
}

addButton.addEventListener("click", addMovie)
movieInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addMovie()
    }
})



function deleteMovie(index) {
    movieList.splice(index, 1)
    updateList()
}

function constructMovieCard(movie, index) {
    const imgTag = movie.url
        ? `<img class='movieImg' src='${movie.url}' alt='${movie.title}' />`
        : "<div class='no-image'>No Image</div>"
    return `
    <div class='movieCard'>
        <button class='delete-btn' onclick='deleteMovie(${index})'>✕</button>
        ${imgTag}
        <p>${movie.title}</p>
    </div>
    `
}



function closeModal() {
    document.getElementById("selectedMovie").classList.remove("show")
}

document.querySelector(".close-modal").addEventListener("click", closeModal)
document.getElementById("selectedMovie").addEventListener("click", function(event) {
    if (event.target === this) {
        closeModal()
    }
})
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeModal()
    }
})



async function selectMovie() {
    if (movieList.length === 0) {
        alert("No movies in the list!")
        return
    }

    const randomIndex = Math.floor(Math.random() * movieList.length)
    const movie = movieList[randomIndex]

    document.getElementById("selectedMovieName").textContent = movie.title
    const imageElement = document.getElementById("selectedMovieImage")

    if (movie.url) {
        imageElement.src = movie.url
        imageElement.style.display = "block"
    } else {
        imageElement.style.display = "none"
    }

    document.getElementById("selectedMovie").classList.add("show")
}

selectMovieButton.addEventListener("click", selectMovie)
