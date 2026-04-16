const uploadInput = document.getElementById('upload');
const imagePreview = document.getElementById('imagePreview');

uploadInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        imagePreview.innerHTML = ""; // Clear any existing content

        reader.addEventListener('load', function() {
            const img = document.createElement('img');
            img.src = this.result;
            imagePreview.appendChild(img);
        });

        reader.readAsDataURL(file);
    } else {
        imagePreview.innerHTML = "<span>Aucune image téléchargée</span>";
    }
});