/* ═══════════════════════════════════════════════════════════════
   global.js — Gestion Scolaire
   Version unifiée — conflits résolus, logiques préservées
   ═══════════════════════════════════════════════════════════════

   Comportement sidebar :
     • Desktop  : .main-sidebar  ↔  .sidebar-collapsed  (250px → 60px)
                  .content-wrapper ↔  .sidebar-collapsed  (margin-left suit)
                  .main-header  :  left suit via CSS (left: var(--sidebar-w))
     • Mobile   : .main-sidebar  ↔  .sidebar-open  (slide-in depuis -250px)
                  + overlay pour fermer en cliquant dehors ou swipe gauche
═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ─── Constantes ─────────────────────────────────────────────────── */
    var MOBILE_BP   = 768;
    var STORAGE_KEY = 'sidebarCollapsed';

    /* ─── Références DOM ─────────────────────────────────────────────── */
    var sidebar, contentWrapper, mainHeader, overlay;

    /* ─── Utilitaires ────────────────────────────────────────────────── */
    function isMobile() {
        return window.innerWidth <= MOBILE_BP;
    }

    /* ─── Création unique de l'overlay ──────────────────────────────── */
    function createOverlay() {
        overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            document.body.appendChild(overlay);
        }
        overlay.addEventListener('click', closeSidebarMobile);
    }

    /* ─── Résolution des références DOM ──────────────────────────────── */
    function resolveDOM() {
        sidebar       = document.getElementById('sidebar');
        contentWrapper = document.getElementById('contentWrapper');
        mainHeader    = document.querySelector('.main-header');
    }

    /* ══════════════════════════════════════════════════
       MOBILE : slide-in / slide-out
    ══════════════════════════════════════════════════ */
    function openSidebarMobile() {
        if (!sidebar) return;
        sidebar.classList.add('sidebar-open');
        sidebar.classList.remove('sidebar-collapsed');
        if (overlay) overlay.classList.add('visible');
        document.body.style.overflow = 'hidden'; // empêche le scroll du fond
    }

    function closeSidebarMobile() {
        if (!sidebar) return;
        sidebar.classList.remove('sidebar-open');
        if (overlay) overlay.classList.remove('visible');
        document.body.style.overflow = '';
    }

    /* ══════════════════════════════════════════════════
       DESKTOP : collapse 250px ↔ 60px
    ══════════════════════════════════════════════════ */
    function toggleDesktop() {
        if (!sidebar) return;

        var isCollapsed = sidebar.classList.toggle('sidebar-collapsed');

        if (contentWrapper) {
            contentWrapper.classList.toggle('sidebar-collapsed', isCollapsed);
        }

        // Ajuste le left de la topbar si elle ne suit pas via CSS variable
        if (mainHeader) {
            mainHeader.style.left = isCollapsed ? '60px' : '250px';
        }

        // Persister l'état
        try {
            localStorage.setItem(STORAGE_KEY, isCollapsed ? '1' : '0');
        } catch (e) { /* localStorage peut être bloqué */ }
    }

    /* ─── Restaurer l'état desktop au chargement ─────────────────────── */
    function restoreDesktopState() {
        if (isMobile()) return;
        try {
            if (localStorage.getItem(STORAGE_KEY) === '1') {
                if (sidebar) sidebar.classList.add('sidebar-collapsed');
                if (contentWrapper) contentWrapper.classList.add('sidebar-collapsed');
                if (mainHeader) mainHeader.style.left = '60px';
            }
        } catch (e) { /* silencieux */ }
    }

    /* ══════════════════════════════════════════════════
       GESTIONNAIRE BURGER — délégation sur document
    ══════════════════════════════════════════════════ */
    function onMenuToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        // Résoudre DOM si nécessaire (navigation SPA ou chargement tardif)
        if (!sidebar) resolveDOM();
        if (!sidebar) return;

        if (isMobile()) {
            sidebar.classList.contains('sidebar-open')
                ? closeSidebarMobile()
                : openSidebarMobile();
        } else {
            toggleDesktop();
        }
    }

    document.addEventListener('click', function (e) {
        var target = e.target;
        if (!target) return;
        var isToggle = target.id === 'menuToggle' || !!target.closest('#menuToggle');
        if (isToggle) onMenuToggleClick(e);
    });

    /* ─── Fermer sidebar mobile si on clique sur un lien nav ──────── */
    function bindNavLinks() {
        if (!sidebar) return;
        sidebar.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                if (isMobile()) closeSidebarMobile();
            });
        });
    }

    /* ─── Swipe mobile (touch) ────────────────────────────────────── */
    var touchStartX = 0;
    var touchStartY = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        if (!isMobile()) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;

        // Ignorer les swipes principalement verticaux
        if (Math.abs(dy) > Math.abs(dx)) return;

        if (dx < -60) closeSidebarMobile();          // swipe gauche → fermer
        if (dx > 60 && touchStartX < 40) openSidebarMobile(); // swipe droit depuis le bord → ouvrir
    }, { passive: true });

    /* ─── Resize : nettoyer l'état mobile si on passe en desktop ───── */
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (!isMobile()) {
                closeSidebarMobile();   // retire sidebar-open + overlay
                restoreDesktopState();
            }
        }, 100);
    });

    /* ══════════════════════════════════════════════════
       NOTIFICATIONS DROPDOWN
    ══════════════════════════════════════════════════ */
    document.addEventListener('click', function (e) {
        var notifToggle   = document.getElementById('notifToggle');
        var notifDropdown = document.getElementById('notifDropdown');
        if (!notifToggle || !notifDropdown) return;

        if (notifToggle.contains(e.target)) {
            e.stopPropagation();
            var isOpen = notifDropdown.classList.toggle('show');
            notifToggle.setAttribute('aria-expanded', String(isOpen));
        } else if (!notifDropdown.contains(e.target)) {
            notifDropdown.classList.remove('show');
            notifToggle.setAttribute('aria-expanded', 'false');
        }
    });

    /* ══════════════════════════════════════════════════
       PLEIN ÉCRAN
    ══════════════════════════════════════════════════ */
    document.addEventListener('click', function (e) {
        if (!e.target) return;
        var fsToggle = e.target.id === 'fullscreenToggle'
            ? e.target
            : e.target.closest('#fullscreenToggle');
        if (!fsToggle) return;

        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen &&
                document.documentElement.requestFullscreen().catch(function () {});
        } else {
            document.exitFullscreen && document.exitFullscreen().catch(function () {});
        }
    });

    /* ══════════════════════════════════════════════════
       BADGE VERSION
    ══════════════════════════════════════════════════ */
    function injectVersionBadge() {
        var version = document.body
            ? document.body.getAttribute('data-version')
            : null;
        if (!version || document.getElementById('appVersionBadge')) return;

        var badge = document.createElement('div');
        badge.id = 'appVersionBadge';
        badge.textContent = 'v' + version;
        document.body.appendChild(badge);
    }

    /* ══════════════════════════════════════════════════
       INITIALISATION
    ══════════════════════════════════════════════════ */
    function init() {
        resolveDOM();
        createOverlay();
        restoreDesktopState();
        bindNavLinks();
        injectVersionBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

/* ══════════════════════════════════════════════════
   i18n — Exposé globalement (toutes les pages)
══════════════════════════════════════════════════ */
var i18n = {};

function loadLang(lang) {
    lang = lang || localStorage.getItem('appLang') || 'fr';
    fetch('/_assets/lang/' + lang + '.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            i18n = data;
            localStorage.setItem('appLang', lang);
            applyTranslations();
        })
        .catch(function () { /* fichier de langue absent — silencieux */ });
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key  = el.getAttribute('data-i18n');
        var keys = key.split('.');
        var val  = i18n;
        keys.forEach(function (k) { val = val && val[k]; });
        if (val) el.textContent = val;
    });
}

// ─────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────
function forceHideSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.display = 'none';
    s.style.visibility = 'hidden';
    s.style.opacity = '0';
    s.setAttribute('aria-hidden', 'true');
}
function showSpinner() {
    var s = document.getElementById('spinnerOverlay');
    if (!s) return;
    s.style.opacity = '1';
    s.style.visibility = 'visible';
    s.style.display = 'flex';
    s.removeAttribute('aria-hidden');
}
function hideSpinner() { forceHideSpinner(); }

// ─────────────────────────────────────────────
// AJAX — helper générique
// ─────────────────────────────────────────────
function ajax(url, payload) {
    return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    }).then(function (r) {
        if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
        return r.json();
    });
}
