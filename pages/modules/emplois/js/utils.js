'use strict';
var Emploi = Emploi || {};
Emploi.utils = {
    escapeHtml: function(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    generateHourSlots: function() {
        var slots = [];
        for (var h = 7; h <= 18; h++) {
            var debut = String(h).padStart(2, '0') + ':00';
            var fin = String(h + 1).padStart(2, '0') + ':00';
            slots.push({
                label: debut + ' – ' + fin,
                value: debut
            });
        }
        return slots;
    },

    normalizeTime: function(time) {
        if (!time) return '';
        var parts = time.split(':');
        if (parts.length === 2) {
            return String(parseInt(parts[0], 10)).padStart(2, '0') + ':' + parts[1];
        }
        return time;
    },

    showToast: function(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;
        var container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = 'position:fixed; bottom:24px; right:24px; display:flex; flex-direction:column; gap:10px; z-index:9999;';
            document.body.appendChild(container);
        }
        var colors = {
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        var bg = colors[type] || colors.info;
        var toast = document.createElement('div');
        toast.style.cssText = `
            background: ${bg};
            color: #fff;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
            min-width: 200px;
            opacity: 0;
            transform: translateX(20px);
            transition: all 0.3s ease;
        `;
        toast.textContent = message;
        container.appendChild(toast);
        requestAnimationFrame(function() {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(function() { toast.remove(); }, 300);
        }, duration);
    },

    openModal: function(id) {
        document.getElementById(id).style.display = 'flex';
    },

    closeModal: function(id) {
        document.getElementById(id).style.display = 'none';
    },

    showSpinner: function() {
        document.getElementById('spinnerOverlay').style.display = 'flex';
    },

    hideSpinner: function() {
        document.getElementById('spinnerOverlay').style.display = 'none';
    }
};