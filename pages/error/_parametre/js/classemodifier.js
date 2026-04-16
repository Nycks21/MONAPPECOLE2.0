// Pré-remplir le formulaire pour modification
function modifierContact(userId) {
    const user = table.row((idx, data) => data.IdUtilisateur == userId).data();
  
    if (!user) {
        alert("Utilisateur introuvable !");
        return;
    }
  
    // Remplir le formulaire
    $('#Username').val(user.Username).prop('readonly', true); // ne pas modifier
    $('#Nom').val(user.Nom);
    $('#Prenom').val(user.Prenom);
    $('#Email').val(user.Email);
    $('#RoleId').val(user.RoleId || "").prop('disabled', true); // rôle non modifiable
    $('#Password').val("").prop('disabled', true); // mot de passe non modifiable
  
    $('#ContactsForm').data('editing', userId);
}

// Soumission unique du formulaire
$('#ContactsForm').on('submit', function(e){
    e.preventDefault();

    const userId = $(this).data('editing');
    if (!userId) return alert("Aucun utilisateur sélectionné !");

    const body = {
        IdUtilisateur: userId,
        Nom: $('#Nom').val().trim(),
        Prenom: $('#Prenom').val().trim(),
        Email: $('#Email').val().trim()
    };

    $.ajax({
        url: "api/UpdateUser.aspx", // update seulement Nom, Prénom, Email
        type: "POST",
        data: body,
        success: function(response) {
            if (response.status === "success") {
                alert(response.message);
                loadUsers(); // recharge la table
                $('#ContactsForm')[0].reset();
                $('#ContactsForm').removeData('editing');
            } else {
                alert(response.message || "Erreur serveur");
            }
        },
        error: function(xhr) {
            console.error(xhr.responseText);
            alert("Erreur serveur : " + xhr.statusText);
        }
    });
});

// Initialisation
$(document).ready(loadUsers);
