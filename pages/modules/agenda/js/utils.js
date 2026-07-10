'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES — Module Agenda
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function rgbToHex(rgb) {
    var match = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#3c8dbc';
    
    var r = parseInt(match[1]);
    var g = parseInt(match[2]);
    var b = parseInt(match[3]);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function showLoading(message) {
    var overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        var msgEl = overlay.querySelector('.loading-message');
        if (!msgEl) {
            msgEl = document.createElement('div');
            msgEl.className = 'loading-message';
            msgEl.style.cssText = 'color:white; margin-top:15px; font-size:14px; font-weight:500;';
            overlay.appendChild(msgEl);
        }
        msgEl.textContent = message || 'Chargement en cours...';
    }
}

function hideLoading() {
    var overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 10000;
    
    var container = document.getElementById('toastContainer');
    if (!container) return;

    container.style.position = 'fixed';
    container.style.zIndex = '99999';
    container.style.pointerEvents = 'none';
    
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
        + 'min-width:280px;max-width:500px;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;'
        + 'transition:opacity .3s ease;margin-bottom:10px;cursor:pointer;z-index:9999;';
    toast.innerHTML = '<div style="display:flex;align-items:center;gap:10px;">'
        + '<i class="fas ' + icons[type] + '" style="font-size:18px;"></i>'
        + '<span style="flex:1;">' + message + '</span>'
        + '</div>';
    
    container.appendChild(toast);
    requestAnimationFrame(function() { toast.style.opacity = '1'; });
    
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 350);
    }, duration);
}

function getEventColor(type) {
    return EVENT_COLORS[type] || '#6c757d';
}

function getTypeLabel(type) {
    return TYPE_LABELS[type] || type || 'Événement';
}

function formatEventDate(dateStr) {
    if (!dateStr) return '';
    try {
        var d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
    } catch (e) { return dateStr; }
}

function formatEventTime(dateStr) {
    if (!dateStr) return '';
    try {
        var d = new Date(dateStr);
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
}