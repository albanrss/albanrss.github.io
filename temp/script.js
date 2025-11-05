const content = document.getElementById("content");

const getCat = async () => {
    const request = await fetch("https://cataas.com/cat");

    if (!request.ok) {
        console.log("Error during cat");
        return;
    }

    const blob = await request.blob();
    const imgURL = URL.createObjectURL(blob);

    const img = document.createElement("img");
    img.src = imgURL;
    content.appendChild(img);
};

getCat();
