'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES — Module Élèves
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        var d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('fr-FR');
    } catch (e) {}
    return dateStr;
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;

    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;max-width:500px;width:100%;pointer-events:none;';
        document.body.appendChild(container);
    }

    var colors = {
        success: '#d4edda;color:#155724;border-left:4px solid #28a745',
        error: '#f8d7da;color:#721c24;border-left:4px solid #dc3545',
        warning: '#fff3cd;color:#856404;border-left:4px solid #ffc107',
        info: '#d1ecf1;color:#0c5460;border-left:4px solid #17a2b8'
    };

    var icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    var toast = document.createElement('div');
    toast.style.cssText = 'background:' + colors[type].split(';')[0] + ';'
        + colors[type].split(';')[1] + ';padding:12px 18px;border-radius:8px;font-size:13px;font-weight:500;'
        + 'min-width:280px;max-width:500px;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .3s ease;'
        + 'margin-bottom:10px;cursor:pointer;z-index:99999;pointer-events:auto;';
    toast.innerHTML = '<div style="display:flex;align-items:center;gap:10px;">'
        + '<i class="fas ' + icons[type] + '" style="font-size:18px;"></i>'
        + '<span style="flex:1;">' + message + '</span>'
        + '</div>';

    container.appendChild(toast);
    requestAnimationFrame(function () { toast.style.opacity = '1'; });

    setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () { if (toast.parentNode) toast.remove(); }, 350);
    }, duration);
}

function showErrorToast(message, details) {
    var container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;max-width:500px;width:100%;pointer-events:none;';
        document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.style.cssText = 'background:#f8d7da;color:#721c24;padding:15px 20px;border-radius:8px;border-left:4px solid #dc3545;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.15);pointer-events:auto;animation:slideIn 0.3s ease;';
    toast.innerHTML = '<div style="display:flex;align-items:flex-start;gap:12px;">'
        + '<i class="fas fa-exclamation-circle" style="font-size:20px;color:#dc3545;margin-top:2px;"></i>'
        + '<div style="flex:1;">'
        + '<strong style="display:block;margin-bottom:4px;">❌ Erreur</strong>'
        + '<div style="font-size:13px;">' + escapeHtml(message) + '</div>'
        + (details ? '<div style="font-size:11px;color:#6c757d;margin-top:4px;">' + escapeHtml(details) + '</div>' : '')
        + '</div>'
        + '<i class="fas fa-times" style="cursor:pointer;opacity:0.6;font-size:14px;flex-shrink:0;" onclick="this.parentElement.parentElement.remove()"></i>'
        + '</div>';

    if (!document.getElementById('toastStyles')) {
        var style = document.createElement('style');
        style.id = 'toastStyles';
        style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    setTimeout(function () {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(function () { if (toast.parentNode) toast.remove(); }, 300);
        }
    }, 8000);

    toast.querySelector('.fa-times').addEventListener('click', function () {
        toast.remove();
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────────────────────────────────────

function getNomBadge(nom) {
    return '<span style="color:#212529;font-weight:700;">' + escapeHtml(nom || '-') + '</span>';
}

function getMatriculeBadge(matricule) {
    return '<span style="background:#f1f3f5;color:#212529;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid #dee2e6;display:inline-block;">' + escapeHtml(matricule || '-') + '</span>';
}

function getStatutBadge(statut) {
    var s = (statut || '').toLowerCase();
    var style = 'padding:4px 10px;border-radius:20px;color:white;font-size:12px;font-weight:500;';
    if (s === 'actif') return '<span style="background:#28a745;' + style + '">✓ Actif</span>';
    if (s === 'suspendu') return '<span style="background:#6c757d;' + style + '">⚠ Suspendu</span>';
    return '<span style="background:#dc3545;' + style + '">✗ Inactif</span>';
}

function getClasseBadge(classeNom) {
    return '<span style="background:#fff;color:#007bff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;white-space:nowrap;">'
        + '<i class="fas fa-folder" style="margin-right:5px;font-size:10px;"></i>' + escapeHtml(classeNom)
        + '</span>';
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
}

async function fetchJson(url) {
    var res = await fetch(url);
    return safeJson(res);
}

async function safeJson(res) {
    try {
        var text = await res.text();
        if (!text?.trim()) return { success: false, message: 'Réponse vide du serveur.' };
        return JSON.parse(text);
    } catch (e) {
        return { success: false, message: 'Erreur de parsing JSON.' };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────

window.escapeHtml = escapeHtml;
window.formatDate = formatDate;
window.showToast = showToast;
window.showErrorToast = showErrorToast;
window.getNomBadge = getNomBadge;
window.getMatriculeBadge = getMatriculeBadge;
window.getStatutBadge = getStatutBadge;
window.getClasseBadge = getClasseBadge;
window.getVal = getVal;
window.setVal = setVal;
window.fetchJson = fetchJson;
window.safeJson = safeJson;