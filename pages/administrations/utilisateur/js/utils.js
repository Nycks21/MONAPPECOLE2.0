'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES — Module Utilisateurs
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(dateValue) {
    if (!dateValue) return '-';
    var timestamp;
    if (typeof dateValue === 'string' && dateValue.match(/\/Date\((\d+)\)\//)) {
        timestamp = parseInt(dateValue.match(/\/Date\((\d+)\)\//)[1]);
    } else if (typeof dateValue === 'number') {
        timestamp = dateValue;
    } else if (dateValue instanceof Date) {
        timestamp = dateValue.getTime();
    } else {
        var parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) timestamp = parsed.getTime();
        else return '-';
    }
    var date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
}

function getRoleId(roleName) {
    var roles = {
        'SuperAdmin': 0, 'Administrateur': 1, 'Admin': 1, 'User': 2,
        'Professeur': 3, 'Secrétaire': 4, 'Comptable': 5, 'CPE': 6, 'Parent': 7
    };
    return roles[roleName] !== undefined ? roles[roleName] : 1;
}

function getUserRoleName(roleId) {
    var roles = {
        0: 'SuperAdmin', 1: 'Administrateur', 2: 'User', 3: 'Professeur',
        4: 'Secrétaire', 5: 'Comptable', 6: 'CPE', 7: 'Parent'
    };
    return roles[roleId] || 'Utilisateur';
}

function findUserById(userId) {
    return usersData.find(function(u) { return u.IDUSER == userId; });
}

async function safeJson(res) {
    try {
        var text = await res.text();
        if (!text || text.trim() === "") {
            return { success: false, message: "Réponse vide" };
        }
        text = text.replace(/^\uFEFF/, '');
        text = text.replace(/^﻿﻿/, '');
        text = text.replace(/﻿﻿$/, '');
        text = text.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
        text = text.trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Erreur parsing JSON:", e);
        return { success: false, message: "Erreur de parsing JSON" };
    }
}

function getActiveUsersCount() {
    return usersData.filter(function(u) {
        return u.ACTIVE === true || u.ACTIVE === 1 || u.ACTIVE === 'true';
    }).length;
}

function showLicenceLimitAlert(currentUsers, maxUsers, action) {
    action = action || "activer";
    var modalHtml = `
        <div style="text-align: center; padding: 10px;">
            <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #dc3545; margin-bottom: 20px;"></i>
            <h3 style="color: #dc3545; margin-bottom: 15px;">⚠️ Limite d'utilisateurs atteinte</h3>
            <p style="font-size: 14px; color: #555; margin-bottom: 10px;">
                Vous avez actuellement <strong style="color: #dc3545;">${currentUsers}</strong> utilisateur(s) <strong>actif(s)</strong>.
            </p>
            <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
                Votre licence autorise un maximum de <strong>${maxUsers}</strong> utilisateur(s) actif(s).
            </p>
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; border-radius: 5px; text-align: left;">
                <i class="fas fa-info-circle" style="color: #ffc107; margin-right: 8px;"></i>
                <span style="font-size: 13px;">Pour ${action} cet utilisateur, vous devez d'abord désactiver un autre utilisateur actif.</span>
            </div>
        </div>
    `;
    Swal.fire({ title: 'Licence dépassée', html: modalHtml, icon: 'warning', confirmButtonText: 'Compris', confirmButtonColor: '#dc3545' });
}

function getDefaultTime() {
    var now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toTimeString().slice(0, 5);
}

function apiUrl(path) {
    return path;
}

// Exposer globalement
window.escapeHtml = escapeHtml;
window.formatDate = formatDate;
window.getRoleId = getRoleId;
window.getUserRoleName = getUserRoleName;
window.findUserById = findUserById;
window.safeJson = safeJson;
window.getActiveUsersCount = getActiveUsersCount;
window.showLicenceLimitAlert = showLicenceLimitAlert;
window.getDefaultTime = getDefaultTime;
window.apiUrl = apiUrl;