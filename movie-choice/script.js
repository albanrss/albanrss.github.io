const addButton = document.getElementById("addMovieButton")
const movieInput = document.getElementById("movieInput")
const selectMovieButton = document.getElementById("selectMovieButton")

let movieList = []

async function addMovie() {
    const newMovieName = movieInput.value.trim()

    if (!newMovieName)
        return
    for (const movie of movieList) {
        let name = movie[0]
        if (name == newMovieName)
            return
    }
    const exactName = await getExactName(newMovieName)
    const url = await getImageUrl(exactName)
    movieList.push([newMovieName, url])
    updateList()
}

async function updateList() {
    const movieListComponent = document.getElementById("movieList")

    let newContent = ""
    for (let i = 0; i < movieList.length; i++) {
        let name = movieList[i][0]
        let url = movieList[i][1]
        if (!url || url == "") {
            const exactName = await getExactName(name)
            const newUrl = await getImageUrl(exactName)
            movieList[i] = [name, newUrl]
        }
        name = movieList[i][0]
        url = movieList[i][1]
        newContent += constructMovieCard(name, url, i)
    }
    movieListComponent.innerHTML = newContent
}

async function getExactName(name) {
    try {
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + " film")}&format=json&origin=*`
        const response = await fetch(searchUrl)
        if (response.status !== 200)
            return ""
        const data = await response.json()
        const results = data?.query?.search
        if (results == [])
            return ""
        const bestTitle = results[0]?.title
        return bestTitle
    } catch (error) {
        console.error("Error fetching move name for", name, error)
        return ""
    }
}

async function getImageUrl(name) {
    try {
        const urlName = encodeURIComponent(name)
        const response = await fetch(
            "https://en.wikipedia.org/api/rest_v1/page/summary/" + urlName
        )
        if (response.status !== 200)
            return ""
        const data = await response.json()
        return data?.thumbnail?.source || ""
    } catch (error) {
        console.error("Error fetching image for", name, error)
        return ""
    }
}

async function selectMovie() {
    if (movieList.length === 0) {
        alert("No movies in the list!")
        return
    }

    const randomIndex = Math.floor(Math.random() * movieList.length)
    const movieName = movieList[randomIndex][0]
    const imageUrl = movieList[randomIndex][1]

    document.getElementById("selectedMovieName").textContent = movieName
    const imageElement = document.getElementById("selectedMovieImage")

    if (imageUrl) {
        imageElement.src = imageUrl
        imageElement.style.display = "block"
    } else {
        imageElement.style.display = "none"
    }

    document.getElementById("selectedMovie").classList.add("show")
}

function closeModal() {
    document.getElementById("selectedMovie").classList.remove("show")
}

function constructMovieCard(name, url, index) {
    const imgTag = url ? `<img class='movieImg' src='${url}' alt='${name}' />` : "<div class='no-image'>No Image</div>"
    return `
    <div class='movieCard'>
        <button class='delete-btn' onclick='deleteMovie(${index})'>✕</button>
        ${imgTag}
        <p>${name}</p>
    </div>
    `
}

function deleteMovie(index) {
    movieList.splice(index, 1)
    updateList()
}

addButton.addEventListener("click", addMovie)
movieInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addMovie()
    }
})
selectMovieButton.addEventListener("click", selectMovie)

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
