'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES — Module Bulletins
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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

    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
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
        + 'min-width:280px;max-width:500px;box-shadow:0 4px 12px rgba(0,0,0,.15);opacity:0;transition:opacity .3s ease,transform .3s ease;'
        + 'margin-bottom:10px;cursor:pointer;z-index:9999;transform:translateY(-10px);';
    toast.innerHTML = '<div style="display:flex;align-items:center;gap:10px;">'
        + '<i class="fas ' + icons[type] + '" style="font-size:18px;"></i>'
        + '<span style="flex:1;">' + message + '</span>'
        + '<i class="fas fa-times" style="cursor:pointer;opacity:0.6;"></i>'
        + '</div>';

    container.appendChild(toast);
    requestAnimationFrame(function() {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    var close = function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 350);
    };

    var closeBtn = toast.querySelector('.fa-times');
    if (closeBtn) closeBtn.addEventListener('click', close);
    toast.addEventListener('click', close);
    toastTimeout = setTimeout(close, duration);
}

// ─────────────────────────────────────────────────────────────────────────────
// INDICATEUR DE CHARGEMENT
// ─────────────────────────────────────────────────────────────────────────────

function showLoading(message) {
    var overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        var msgEl = overlay.querySelector('.loading-message');
        if (msgEl) {
            msgEl.textContent = message || 'Chargement en cours...';
        } else {
            var msg = document.createElement('div');
            msg.className = 'loading-message';
            msg.textContent = message || 'Chargement en cours...';
            msg.style.cssText = 'color:white;margin-top:15px;font-size:14px;font-weight:500;';
            overlay.appendChild(msg);
        }
    }
}

function hideLoading() {
    var overlay = document.getElementById('spinnerOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function showSpinner() { showLoading(); }
function hideSpinner() { hideLoading(); }

// ─────────────────────────────────────────────────────────────────────────────
// GESTION DES ERREURS RÉSEAU
// ─────────────────────────────────────────────────────────────────────────────

async function fetchWithErrorHandling(url, options) {
    options = options || {};
    try {
        var response = await fetch(url, options);

        if (!response.ok) {
            var errorMessage = 'Erreur HTTP ' + response.status;

            switch (response.status) {
                case 400: errorMessage = 'Requête invalide. Vérifiez les données envoyées.'; break;
                case 401: errorMessage = 'Session expirée. Veuillez vous reconnecter.'; break;
                case 403: errorMessage = 'Vous n\'avez pas les droits nécessaires.'; break;
                case 404: errorMessage = 'Service introuvable. Contactez l\'administrateur.'; break;
                case 500: errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.'; break;
                case 503: errorMessage = 'Service indisponible. Veuillez réessayer plus tard.'; break;
                default: errorMessage = 'Erreur serveur (' + response.status + '). Veuillez réessayer.';
            }

            try {
                var errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                var text = await response.text();
                if (text.toLowerCase().indexOf('<!doctype') !== -1 || text.toLowerCase().indexOf('<html') !== -1) {
                    errorMessage = 'Le service a renvoyé une page d\'erreur. Contactez l\'administrateur.';
                }
            }

            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        if (error.message.indexOf('Failed to fetch') !== -1 || error.message.indexOf('NetworkError') !== -1) {
            throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion réseau.');
        }
        if (error.message.indexOf('timeout') !== -1 || error.message.indexOf('aborted') !== -1) {
            throw new Error('La requête a expiré. Veuillez réessayer.');
        }
        throw error;
    }
}

// Exposer les fonctions globalement
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;
window.fetchWithErrorHandling = fetchWithErrorHandling;
window.escapeHtml = escapeHtml;