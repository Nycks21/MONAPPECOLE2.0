// ============================================================================
// GESTION COMPLÈTE DES UTILISATEURS - FICHIER UNIFIÉ
// ============================================================================

let table;
let currentMode = null; // "ajout" ou "modification"
let currentUserId = null; // ✅ STOCKER L'ID ICI

// ============================================================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ============================================================================
$(document).ready(() => {
    console.log("🔵 Page chargée - Initialisation");
    
    resetToInitialState();
    loadUsers();
    setupPasswordStrengthBar();
    setupUsernameValidation();
    bindButtonEvents();
});

// ============================================================================
// CONFIGURATION DE LA BARRE DE SÉCURITÉ MOT DE PASSE
// ============================================================================
function setupPasswordStrengthBar() {
    $("#Password").on("input", function () {
        const password = $(this).val();
        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        let width = "0%";
        let color = "red";
        let text = "Mot de passe trop faible (min. 8 caractères)";

        if (password.length < 8) {
            width = "25%";
            color = "red";
        } else if (strength <= 2) {
            width = "40%";
            color = "#f0ad4e";
            text = "Mot de passe faible";
        } else if (strength === 3 || strength === 4) {
            width = "70%";
            color = "#5bc0de";
            text = "Mot de passe moyen";
        } else if (strength >= 5) {
            width = "100%";
            color = "#5cb85c";
            text = "Mot de passe fort";
        }

        $("#passwordStrengthBar").css({
            width: width,
            backgroundColor: color
        });

        $("#passwordInfo").text(text).css("color", color);
    });
}

// ============================================================================
// BIND DES ÉVÉNEMENTS BOUTONS
// ============================================================================
function bindButtonEvents() {
    
    // ➕ BOUTON AJOUTER
    $("#btnAjouter").off("click").on("click", function (e) {
        e.preventDefault();
        console.log("🟢 Mode AJOUT activé");
        
        currentMode = "ajout";
        currentUserId = null; // ✅ RESET ID
        
        $("#ContactsForm")[0].reset();
        $("#Active").prop("checked", true);
        
        setFormEditMode(true);
        
        $("#Username").prop("readonly", false).prop("disabled", false);
        $("#Username").css({
            "background-color": "#ffffff",
            "cursor": "text",
            "color": "#495057"
        });
        
        $("#btnValider")
            .html('<i class="fas fa-save"></i> Enregistrer')
            .removeClass("btn-warning")
            .addClass("btn-success");
    });

    // ❌ BOUTON ANNULER
    $("#btnAnnuler").off("click").on("click", function (e) {
        e.preventDefault();
        console.log("🟡 Annulation - Retour à l'état initial");
        
        currentMode = null;
        currentUserId = null; // ✅ RESET ID
        
        $("#ContactsForm")[0].reset();
        $("#Active").prop("checked", true);
        
        $("#Username").css({
            "background-color": "#ffffff",
            "cursor": "text",
            "color": "#495057"
        });
        
        resetToInitialState();
    });

    // ✅ BOUTON VALIDER
    $("#btnValider").off("click").on("click", function (e) {
        e.preventDefault();
        console.log("🟢 Bouton VALIDER cliqué - Mode:", currentMode);
        
        if (currentMode === "modification") {
            console.log("➡️ Mode MODIFICATION - ID:", currentUserId);
            if (!currentUserId) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'ID utilisateur non défini'
                });
                return;
            }
            updateUser(currentUserId);
        } else if (currentMode === "ajout") {
            console.log("➡️ Mode AJOUT");
            createUser();
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Aucune action',
                text: 'Veuillez cliquer sur "Ajouter" ou "Modifier" d\'abord'
            });
        }
    });
}

// ============================================================================
// GESTION DES ÉTATS DU FORMULAIRE
// ============================================================================
function resetToInitialState() {
    currentMode = null;
    currentUserId = null;
    
    $("#btnAjouter").prop("disabled", false);
    $("#btnValider, #btnAnnuler").prop("disabled", true);
    $("#Username, #Nom, #Prenom, #Email, #Password, #ConfirmPassword").prop("readonly", true).prop("disabled", true);
    $("#RoleId, #Active").prop("disabled", true);
    $("#Active").prop("checked", true);
    
    $("#btnValider")
        .html('<i class="fas fa-save"></i> Enregistrer')
        .removeClass("btn-warning btn-success")
        .addClass("btn-success");
}

function setFormEditMode(active) {
    $("#btnAjouter").prop("disabled", active);
    $("#btnValider, #btnAnnuler").prop("disabled", !active);
    $("#Username, #Nom, #Prenom, #Email, #Password, #ConfirmPassword").prop("readonly", !active).prop("disabled", !active);
    $("#RoleId, #Active").prop("disabled", !active);
}

// ============================================================================
// UTILITAIRE JSON SÉCURISÉ
// ============================================================================
async function safeJson(res) {
    try {
        return await res.json();
    } catch (e) {
        console.error("❌ Erreur parsing JSON:", e);
        return { success: false, message: "Erreur de parsing JSON" };
    }
}

// ============================================================================
// CHARGER LA LISTE DES UTILISATEURS
// ============================================================================
function loadUsers() {
    console.log("📋 Chargement des utilisateurs...");
    
    fetch("api/ListUser.aspx")
        .then(safeJson)
        .then(data => {
            if (!Array.isArray(data)) {
                console.error("❌ Réponse invalide :", data);
                return;
            }

            const filteredData = data.filter(user => user.Role !== 0);
            console.log("✅ Utilisateurs chargés:", filteredData.length);

            if (!table) {
                table = $('#contactsTable').DataTable({
                    data: filteredData,
                    orderCellsTop: true,
                    fixedHeader: true,
                    responsive: true,
                    autoWidth: false,
                    ordering: false,
                    searching: true,
                    columns: [
                        { data: 'USERNAME' , className: 'text-center'},
                        { data: 'NOM' , className: 'text-center'},
                        { data: 'PRENOM' , className: 'text-center' },
                        { data: 'EMAIL', className: 'text-center' },
                        {
                            data: 'ROLEID',
                            title: 'Rôle',
                            className: 'text-center',
                            render: function (data) {
                                if (data == true || data == 1) {
                                    return '<span class="badge bg-secondary">Admin</span>';
                                } 
                                if (data == true || data == 2) {
                                    return '<span class="badge bg-warning">User</span>';
                                }
                                else {
                                    return '<span class="badge bg-danger">Super Admin</span>';
                                }
                            }
                        },
                        {
                            data: 'ACTIVE',
                            title: 'Actif',
                            className: 'text-center',
                            render: function (data) {
                                if (data == true || data == 1) {
                                    return '<span class="badge bg-success">Oui</span>';
                                } else {
                                    return '<span class="badge bg-danger">Non</span>';
                                }
                            }
                        },
                        
                        {
                            data: null,
                            orderable: false,
                            title: 'Action',
                            className: 'text-center',
                            render: function (data, type, row) {
                                return `
                                    <button class="btn btn-sm btn-primary" onclick="modifierContact(${row.IDUSER})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="supprimerContact(${row.IDUSER})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                `;
                            }
                        }
                    ],
                    dom: `
                        <"row"<"col-md-12"t>>
                        <"row mt-3 align-items-center"
                            <"col-md-3 d-flex justify-content-start"l>
                            <"col-md-4 d-flex justify-content-center"i>
                            <"col-md-5 d-flex justify-content-end"p>
                        >
                    `,
                    language: {
                        zeroRecords: "Aucun enregistrement trouvé",
                        search: " ",
                        searchPlaceholder: "Tapez pour rechercher...",
                        lengthMenu: "Afficher _MENU_ lignes",
                        info: "Affichage de _START_ à _END_ sur _TOTAL_ utilisateurs",
                        infoEmpty: "Affichage de 0 à 0 sur 0 enregistrements",
                        infoFiltered: "(filtrés depuis _MAX_ utilisateurs)"
                    },
                    columnDefs: [
                        { width: "10%", targets: [0] },
                        { width: "20%", className: "text-left", targets: [1, 2] },
                        { width: "20%", className: "text-left", targets: [3] },
                        { width: "10%", className: "text-center", targets: [4] },
                        { width: "10%", orderable: false, targets: 5 }
                    ]
                });

                $('#contactsTable thead tr:eq(1) th').each(function (i) {
                    if (i === 5) return;
                    $('input', this).on('keyup change', function () {
                        if (table.column(i).search() !== this.value) {
                            table.column(i).search(this.value).draw();
                        }
                    });
                });
            } else {
                table.clear().rows.add(filteredData).draw();
            }
        })
        .catch(err => {
            console.error("❌ Erreur:", err);
            Swal.fire({
                icon: 'error',
                title: 'Erreur de chargement',
                text: err.message
            });
        });
}

// ============================================================================
// CRÉER UN UTILISATEUR (AJOUT)
// ============================================================================
async function createUser() {
    console.log("➕ Création d'un nouvel utilisateur");
    
    const username = $("#Username").val().trim();
    const password = $("#Password").val().trim();
    const confirmPassword = $("#ConfirmPassword").val().trim();
    
    if (!username || !$("#Nom").val().trim() || !$("#Prenom").val().trim() || !$("#Email").val().trim()) {
        Swal.fire({
            icon: 'error',
            title: "Champs manquants",
            text: "Veuillez remplir tous les champs obligatoires."
        });
        return;
    }
    
    if (password.length < 8) {
        Swal.fire({
            icon: 'error',
            title: "Mot de passe trop court",
            text: "Le mot de passe doit contenir au moins 8 caractères."
        });
        return;
    }
    
    let strength = 0;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 1) {
        Swal.fire({
            icon: 'error',
            title: "Sécurité faible",
            text: "Ajoutez des majuscules, chiffres ou caractères spéciaux."
        });
        return;
    }
    
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: "Erreur",
            text: "Les mots de passe ne correspondent pas."
        });
        return;
    }
    
    const body = {
        USERNAME: username,
        NOM: $("#Nom").val().trim(),
        PRENOM: $("#Prenom").val().trim(),
        PWD: password,
        EMAIL: $("#Email").val().trim(),
        ROLEID: $("#RoleId").val(),
        ACTIVE: $("#Active").is(":checked") ? "true" : "false"
    };
    
    console.log("📤 Données à envoyer:", body);
    
    try {
        const res = await fetch("api/users.aspx", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: data.message || "Utilisateur ajouté !",
                timer: 1500,
                showConfirmButton: false
            });
            
            setTimeout(() => {
                location.reload(true);
            }, 1500);
        } else {
            Swal.fire({
                icon: 'error',
                title: "Erreur lors de l'ajout",
                text: data.message || "Erreur inconnue"
            });
        }
    } catch (err) {
        console.error("❌ Erreur:", err);
        Swal.fire({
            icon: 'error',
            title: "Erreur de communication",
            text: err.message
        });
    }
}

// ============================================================================
// METTRE À JOUR UN UTILISATEUR (MODIFICATION)
// ============================================================================
async function updateUser(userId) {
    console.log("💾 Mise à jour utilisateur ID:", userId);
    
    const password = $("#Password").val().trim();
    const confirmPassword = $("#ConfirmPassword").val().trim();
    
    if (!$("#Nom").val().trim() || !$("#Prenom").val().trim() || !$("#Email").val().trim()) {
        Swal.fire({
            icon: 'error',
            title: "Champs manquants",
            text: "Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email)."
        });
        return;
    }
    
    if (password && password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: "Erreur",
            text: "Les mots de passe ne correspondent pas."
        });
        return;
    }
    
    if (password) {
        if (password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: "Mot de passe trop court",
                text: "Le mot de passe doit contenir au moins 8 caractères."
            });
            return;
        }
        
        let strength = 0;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength <= 1) {
            Swal.fire({
                icon: 'error',
                title: "Sécurité faible",
                text: "Ajoutez des majuscules, chiffres ou caractères spéciaux."
            });
            return;
        }
    }
    
    const params = new URLSearchParams({
        id: userId,
        nom: $("#Nom").val().trim(),
        prenom: $("#Prenom").val().trim(),
        email: $("#Email").val().trim(),
        roleId: $("#RoleId").val(),
        active: $("#Active").prop("checked") ? 1 : 0
    });
    
    if (password) {
        params.append('password', password);
    }
    
    console.log("📤 Données à envoyer:", params.toString());
    
    try {
        const res = await fetch(`api/UpdateUser.aspx?${params.toString()}`, {
            method: 'POST'
        });
        
        const result = await safeJson(res);
        console.log("📥 Réponse serveur:", result);
        
        if (result.success || result.status === "success") {
            Swal.fire({
                icon: 'success',
                title: "Utilisateur modifié avec succès !",
                timer: 1500,
                showConfirmButton: false
            });
            
            setTimeout(() => {
                location.reload(true);
            }, 1500);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: result.message || "Erreur lors de la modification"
            });
        }
    } catch (err) {
        console.error("❌ Erreur réseau:", err);
        Swal.fire({
            icon: 'error',
            title: "Erreur de communication",
            text: err.message
        });
    }
}

// ============================================================================
// SUPPRIMER UN UTILISATEUR
// ============================================================================
async function supprimerContact(id) {
    console.log("🗑️ Suppression utilisateur ID:", id);
    
    if (!id) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'ID invalide'
        });
        return;
    }

    const result = await Swal.fire({
        title: 'Confirmer la suppression',
        text: "Voulez-vous vraiment supprimer cet utilisateur ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch("api/DeleteUser.aspx", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${encodeURIComponent(id)}`
            });

            const data = await safeJson(res);

            if (data.status === "success" || data.success) {
                Swal.fire({
                    icon: 'success',
                    title: data.message || "Utilisateur supprimé avec succès",
                    showConfirmButton: false,
                    timer: 1500
                });

                setTimeout(() => {
                    location.reload(true);
                }, 1500);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: data.message || "Erreur lors de la suppression"
                });
            }
        } catch (err) {
            console.error("❌ Erreur:", err);
            Swal.fire({
                icon: 'error',
                title: "Erreur de communication",
                text: err.message
            });
        }
    }
}

// ============================================================================
// MODIFIER UN UTILISATEUR
// ============================================================================
function modifierContact(id) {
    console.log("✏️ MODIFICATION utilisateur ID:", id);
    
    if (!id) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'ID invalide'
        });
        return;
    }

    const data = table.rows().data().toArray();
    const user = data.find(u => u.IDUSER == id);

    if (!user) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Utilisateur introuvable'
        });
        return;
    }

    // ✅ STOCKER L'ID ET LE MODE
    currentMode = "modification";
    currentUserId = user.IDUSER;

    $("#Username").val(user.USERNAME);
    $("#Nom").val(user.NOM);
    $("#Prenom").val(user.PRENOM);
    $("#Email").val(user.EMAIL);
    $("#RoleId").val(user.ROLEID);
    $("#Active").prop("checked", user.ACTIVE == true || user.ACTIVE == 1);
    $("#Password").val("");
    $("#ConfirmPassword").val("");
    
    console.log("📝 Formulaire rempli - Mode:", currentMode, "- ID:", currentUserId);

    setFormEditMode(true);
    
    $("#Username").prop("readonly", true).prop("disabled", true);
    $("#Username").css({
        "background-color": "#e9ecef",
        "cursor": "not-allowed",
        "color": "#6c757d"
    });
    
    $("#btnValider")
        .html('<i class="fas fa-sync-alt"></i> Mettre à jour')
        .removeClass("btn-success")
        .addClass("btn-warning");
    
    console.log("✅ Mode MODIFICATION activé");
}

// ============================================================================
// VÉRIFICATION USERNAME (OPTIONNEL)
// ============================================================================
function setupUsernameValidation() {
    // Fonction optionnelle - vous pouvez la laisser vide si vous ne voulez pas de validation en temps réel
}

// ============================================================================
// RENDRE LES FONCTIONS GLOBALES
// ============================================================================
window.loadUsers = loadUsers;
window.supprimerContact = supprimerContact;
window.modifierContact = modifierContact;
window.updateUser = updateUser;
window.createUser = createUser;