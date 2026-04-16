document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById('ImageFile');
  const preview = document.getElementById('preview');
  const errorMsg = document.getElementById('error-msg');

  // ⛔ Si l’input image n’existe pas sur la page, on stop
  if (!input || !preview || !errorMsg) return;

  input.addEventListener('change', () => {
      errorMsg.textContent = '';
      const file = input.files[0];

      if (!file) {
          preview.style.display = 'none';
          preview.src = '';
          return;
      }

      const img = new Image();

      img.onload = function () {
          if (img.height > img.width) {
              // ✅ Format portrait OK
              preview.src = URL.createObjectURL(file);
              preview.style.display = 'block';
          } else {
              // ❌ Format paysage non supporté
              resetImage('Veuillez sélectionner une image au format portrait (hauteur > largeur).');
          }
      };

      img.onerror = function () {
          resetImage('Impossible de charger cette image.');
      };

      img.src = URL.createObjectURL(file);
  });

  function resetImage(message) {
      preview.style.display = 'none';
      preview.src = '';
      errorMsg.textContent = message;
      input.value = '';
  }
});
