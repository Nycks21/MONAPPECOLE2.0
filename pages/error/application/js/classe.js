document.addEventListener("DOMContentLoaded", function () {
  // Fonction pour récupérer un paramètre dans l'URL
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const lotId = getQueryParam("lotId");
  if (lotId) {
    // Supposons que le champ LOT a l'id="ddlTypeLot" ou "LotId" selon ton formulaire
    const lotField = document.getElementById("ddlTypeLot") || document.getElementById("LotId");
    if (lotField) {
      // Si c'est un select, on peut ajouter une option
      if (lotField.tagName.toLowerCase() === "select") {
        lotField.innerHTML = `<option value="${lotId}" selected>${lotId}</option>`;
        lotField.disabled = true; // optionnel : désactiver si tu veux empêcher modification
      } else {
        // Sinon, c'est probablement un input texte
        lotField.value = lotId;
        lotField.readOnly = true; // optionnel
      }
    }
  }
});