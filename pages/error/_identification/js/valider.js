$("#ContactsForm").on("submit", async function (e) {
    e.preventDefault();

    // 🔹 Pour l'ajout, on n'a pas besoin d'userId
    if (mode !== "ajout") {
        alert("Aucun utilisateur sélectionné !");
        return;
    }

    const body = {
        Username: $("#Username").val().trim(),
        Nom: $("#Nom").val().trim(),
        Prenom: $("#Prenom").val().trim(),
        Password: $("#Password").val().trim(),
        Email: $("#Email").val().trim(),
        RoleId: $("#RoleId").val().trim()
    };

    try {
        const res = await fetch("api/users.aspx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            if (data.success) {
                alert(data.message || "Utilisateur ajouté avec succès !");
                fetchUsers(); // Recharge la liste
                $("#ContactsForm")[0].reset();
                activerBoutonsEdition(false);
                mode = null;
            } else {
                alert(data.message || "Erreur : ce Username existe peut-être déjà !");
            }
        } else {
            alert("Erreur serveur : " + (data.error || "Réponse inattendue"));
        }
    } catch (err) {
        console.error(err);
        alert("Erreur de communication avec le serveur : " + err.message);
    }
});
