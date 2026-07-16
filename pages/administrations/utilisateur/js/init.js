'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// INITIALISATION — Module Utilisateurs
// ─────────────────────────────────────────────────────────────────────────────

function init() {
    console.log("🔵 Page chargée - Initialisation userJS");
    forceHideSpinner();
    preventFormAutoSubmit();
    ensureButtonsHaveTypeButton();
    loadUsers();
    attachRoleChangeListener();
    initSidebar();
    initDarkMode();
    checkLicenceLimit();
    autoCheckForUpdates();
}

function attachRoleChangeListener() {
    var roleSelect = document.getElementById('userRole');
    if (roleSelect) {
        roleSelect.removeEventListener('change', onRoleChangeHandler);
        roleSelect.addEventListener('change', onRoleChangeHandler);
    }
}

function onRoleChangeHandler(event) {
    var selectedRole = event.target.value;
    var currentPermissions = getSelectedPermissions();
    var defaultPermissions = DEFAULT_ROLE_PERMISSIONS[selectedRole] || DEFAULT_ROLE_PERMISSIONS['Administrateur'];

    var hasCustomPermissions = currentPermissions.length > 0 &&
        JSON.stringify(currentPermissions.sort()) !== JSON.stringify(defaultPermissions.sort());

    if (hasCustomPermissions && currentMode === 'modification') {
        Swal.fire({
            title: 'Changer les permissions ?',
            text: 'Cet utilisateur a des permissions personnalisées. Voulez-vous les remplacer par les permissions par défaut du rôle "' + selectedRole + '" ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, remplacer',
            cancelButtonText: 'Non, garder',
            confirmButtonColor: '#3085d6'
        }).then(function(result) {
            if (result.isConfirmed) {
                applyDefaultPermissionsByRole(selectedRole);
                Swal.fire({
                    icon: 'success',
                    title: 'Permissions mises à jour',
                    text: 'Les permissions par défaut pour ' + selectedRole + ' ont été appliquées',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    } else {
        applyDefaultPermissionsByRole(selectedRole);
    }
}

window.addEventListener('load', function() {
    setTimeout(hidePreloader, 500);
});

// Exposer globalement
window.init = init;
window.attachRoleChangeListener = attachRoleChangeListener;
window.onRoleChangeHandler = onRoleChangeHandler;

// Démarrer
$(document).ready(init);