'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES — Module Absences & Retards
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
        if (!isNaN(d.getTime())) {
            return d.getDate().toString().padStart(2, '0') + '/' + 
                   (d.getMonth() + 1).toString().padStart(2, '0') + '/' + 
                   d.getFullYear();
        }
    } catch(e) {}
    return dateStr.split('T')[0];
}

function formatHeure(timeStr) {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
}

function getMatriculeBadge(matricule) {
    return '<span style="background:#f1f3f5;color:#212529;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:700;border:1px solid #dee2e6;display:inline-block;">' + escapeHtml(matricule || '-') + '</span>';
}

function getNomBadge(nom) {
    return '<span style="color:#212529;font-weight:700;">' + escapeHtml(nom || '-') + '</span>';
}

function getClasseBadge(classeNom) {
    return '<span style="background:#fff;color:#007bff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid #007bff;white-space:nowrap;">'
        + '<i class="fas fa-folder" style="margin-right:5px;font-size:10px;"></i>' + escapeHtml(classeNom || '-')
        + '</span>';
}

function getJustificationBadge(justifie) {
    if (justifie) {
        return '<span style="background:#28a745;color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;">✓ Justifiée</span>';
    }
    return '<span style="background:#dc3545;color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600;">✗ Non justifiée</span>';
}

function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
}

function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val;
}

function getCheckVal(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
}

function setCheckVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.checked = val;
}

async function fetchJson(url) {
    var res = await fetch(url);
    return safeJson(res);
}

async function safeJson(res) {
    try {
        var text = await res.text();
        if (!text || !text.trim()) {
            return { success: false, message: 'Réponse vide du serveur.' };
        }
        return JSON.parse(text);
    } catch (e) {
        return { success: false, message: 'Erreur de parsing JSON.' };
    }
}

function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) {
        s.style.display = 'flex';
        s.style.visibility = 'visible';
        s.style.opacity = '1';
    }
}

function hideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (s) {
        s.style.display = 'none';
        s.style.visibility = 'hidden';
        s.style.opacity = '0';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST — Dans utils.js
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