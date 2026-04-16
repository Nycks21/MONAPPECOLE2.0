$(document).ready(function () {
    // 🔹 Soumission du formulaire
    $("#SaisieForm").on("submit", function (e) {
        e.preventDefault();

        const formData = new FormData();

        // Ajouter les champs texte
        formData.append("Matricule", $("#Matricule").val() || "");
        formData.append("Nom", $("#Nom").val() || "");
        formData.append("Prenom", $("#Prenom").val() || "");
        formData.append("Birthday", $("#Birthday").val() || "");
        formData.append("Sexe", $("#Sexe").val() || "");
        formData.append("Classe", $("#ddlTypeClasse").val() || "");
        formData.append("NPere", $("#NPere").val() || "");
        formData.append("NMere", $("#NMere").val() || "");
        formData.append("Contact", $("#Contact").val() || "");
        formData.append("Adresse", $("#Adresse").val() || "");

        // Ajouter le fichier image (s'il y en a un)
        const imageFile = $("#ImageFile")[0].files[0];
        if (imageFile) {
            formData.append("ImageFile", imageFile);
        }

        showSpinner();

        fetch("api/ElevePost.aspx", {
            method: "POST",
            // NE PAS mettre le header Content-Type ici !
            body: formData
        })
        .then(res => {
            hideSpinner();
            if (!res.ok) throw new Error("Erreur serveur");
            return res.json();
        })
        .then(() => {
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Élève ajouté avec succès',
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                location.reload();
            });
        })
        .catch(err => {
            hideSpinner();
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: err.message
            });
            console.error(err);
        });
    });

    // 🔹 Bouton annuler
    $("#btnAnnuler").on("click", function (e) {
        e.preventDefault();
        window.location.replace("jsgrid.aspx");
    });
});

// 🔹 Spinner
function showSpinner() {
    document.getElementById("spinnerOverlay").style.visibility = "visible";
}

function hideSpinner() {
    document.getElementById("spinnerOverlay").style.visibility = "hidden";
}
