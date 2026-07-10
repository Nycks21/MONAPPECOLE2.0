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