'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatMoney(amount) {
    if (!amount && amount !== 0) return '0 MGA';
    return new Intl.NumberFormat('fr-MG').format(amount) + ' MGA';
}

function formatDateTime(dateStr) {
    if (!dateStr) return '-';
    try {
        var d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
    } catch (e) {}
    return dateStr;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    try {
        var d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toLocaleDateString('fr-FR');
    } catch (e) {}
    return dateStr;
}

function getModePaiementBadge(mode) {
    var colors = { Especes: '#28a745', Cheque: '#17a2b8', Virement: '#007bff', MobileMoney: '#ffc107' };
    var color = colors[mode] || '#6c757d';
    return '<span style="background:' + color + ';color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">' + escapeHtml(mode) + '</span>';
}

function getStatusBadge(status) {
    var cfg = {
        'Terminé': { bg: '#28a745', icon: 'fa-check-circle' },
        'En cours': { bg: '#ffc107', icon: 'fa-clock' },
        'Non payé': { bg: '#dc3545', icon: 'fa-times-circle' }
    };
    var c = cfg[status] || { bg: '#6c757d', icon: 'fa-question' };
    return '<span style="background:' + c.bg + ';color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">'
        + '<i class="fas ' + c.icon + '"></i> ' + escapeHtml(status) + '</span>';
}

function numberToWords(amount) {
    if (amount === 0) return 'Zéro';

    var units = ['', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze', 'Seize', 'Dix-sept', 'Dix-huit', 'Dix-neuf'];
    var tens = ['', 'Dix', 'Vingt', 'Trente', 'Quarante', 'Cinquante', 'Soixante', 'Soixante-dix', 'Quatre-vingt', 'Quatre-vingt-dix'];

    function convertLessThanThousand(n) {
        if (n === 0) return '';
        var result = '';
        var hundred = Math.floor(n / 100);
        var remainder = n % 100;

        if (hundred > 0) {
            if (hundred === 1) {
                result += 'Cent';
            } else {
                result += units[hundred] + ' Cent';
            }
            if (remainder > 0) result += ' ';
        }

        if (remainder > 0) {
            if (remainder < 20) {
                result += units[remainder];
            } else {
                var ten = Math.floor(remainder / 10);
                var unit = remainder % 10;
                if (ten === 7 || ten === 9) {
                    result += tens[ten - 1] + '-' + units[unit + 10];
                } else {
                    result += tens[ten];
                    if (unit > 0) {
                        if (ten === 8) result += '-';
                        result += '-' + units[unit];
                    }
                }
            }
        }
        return result + ' ';
    }

    var integerPart = Math.floor(amount);
    var result = '';
    var billions = Math.floor(integerPart / 1000000000);
    var millions = Math.floor((integerPart % 1000000000) / 1000000);
    var thousands = Math.floor((integerPart % 1000000) / 1000);
    var rest = integerPart % 1000;

    if (billions > 0) {
        result += convertLessThanThousand(billions) + ' Milliard';
        if (billions > 1) result += 's';
        if (millions > 0 || thousands > 0 || rest > 0) result += ' ';
    }
    if (millions > 0) {
        result += convertLessThanThousand(millions) + ' Million';
        if (millions > 1) result += 's';
        if (thousands > 0 || rest > 0) result += ' ';
    }
    if (thousands > 0) {
        if (thousands === 1) {
            result += 'Mille';
        } else {
            result += convertLessThanThousand(thousands) + ' Mille';
        }
        if (rest > 0) result += ' ';
    }
    if (rest > 0) {
        result += convertLessThanThousand(rest);
    }
    return result + ' Ariary';
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
            toast.style.zIndex = '99999';
            setTimeout(function () { if (toast.parentNode) toast.remove(); }, 300);
        }
    }, 8000);

    toast.querySelector('.fa-times').addEventListener('click', function () {
        toast.remove();
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSITION GLOBALE
// ─────────────────────────────────────────────────────────────────────────────

window.showToast = showToast;