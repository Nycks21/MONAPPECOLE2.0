/* ═══════════════════════════════════════════════════════════════
   global.js — Gestion Scolaire
   Version unifiée — conflits résolus, logiques préservées
   ═══════════════════════════════════════════════════════════════
*/

(function () {
    'use strict';

    /* ─── Constantes ─────────────────────────────────────────────────── */
    var MOBILE_BP = 768;
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
        sidebar = document.getElementById('sidebar');
        contentWrapper = document.getElementById('contentWrapper');
        mainHeader = document.querySelector('.main-header');
    }

    /* ══════════════════════════════════════════════════
       MOBILE : slide-in / slide-out
    ══════════════════════════════════════════════════ */
    function openSidebarMobile() {
        if (!sidebar) return;
        sidebar.classList.add('sidebar-open');
        sidebar.classList.remove('sidebar-collapsed');
        if (overlay) overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
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

        if (mainHeader) {
            mainHeader.style.left = isCollapsed ? '60px' : '250px';
        }

        try {
            localStorage.setItem(STORAGE_KEY, isCollapsed ? '1' : '0');
        } catch (e) { }
    }

    function restoreDesktopState() {
        if (isMobile()) return;
        try {
            if (localStorage.getItem(STORAGE_KEY) === '1') {
                if (sidebar) sidebar.classList.add('sidebar-collapsed');
                if (contentWrapper) contentWrapper.classList.add('sidebar-collapsed');
                if (mainHeader) mainHeader.style.left = '60px';
            }
        } catch (e) { }
    }

    /* ══════════════════════════════════════════════════
       GESTIONNAIRE BURGER
    ══════════════════════════════════════════════════ */
    function onMenuToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();

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

    function bindNavLinks() {
        if (!sidebar) return;
        sidebar.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                if (isMobile()) closeSidebarMobile();
            });
        });
    }

    /* ─── Swipe mobile ──────────────────────────────────────────────── */
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

        if (Math.abs(dy) > Math.abs(dx)) return;

        if (dx < -60) closeSidebarMobile();
        if (dx > 60 && touchStartX < 40) openSidebarMobile();
    }, { passive: true });

    /* ─── Resize ────────────────────────────────────────────────────── */
    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (!isMobile()) {
                closeSidebarMobile();
                restoreDesktopState();
            }
            setTimeout(setActiveMenu, 50);
        }, 100);
    });

    /* ══════════════════════════════════════════════════
       NOTIFICATIONS DROPDOWN
    ══════════════════════════════════════════════════ */
    document.addEventListener('click', function (e) {
        var notifToggle = document.getElementById('notifToggle');
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
                document.documentElement.requestFullscreen().catch(function () { });
        } else {
            document.exitFullscreen && document.exitFullscreen().catch(function () { });
        }
    });

    /* ══════════════════════════════════════════════════
       GESTION DU MENU ACTIF
    ══════════════════════════════════════════════════ */

    function setActiveMenu() {
        var currentPath = window.location.pathname.toLowerCase();
        var currentPage = currentPath.split('/').pop();
        var activeMenu = null;

        var menuMapping = {
            'index.aspx': 'dashboard',
            'eleves.aspx': 'eleves',
            'absences.aspx': 'absences',
            'bulletins.aspx': 'bulletins',
            'frais.aspx': 'frais',
            'niveaux.aspx': 'niveaux',
            'salles.aspx': 'salles',
            'classes.aspx': 'classes',
            'matieres.aspx': 'matieres',
            'utilitaires.aspx': 'importation',
            'annee.aspx': 'annees',
            'utilisateur.aspx': 'utilisateurs',
            'requetes.aspx': 'requetes'
        };

        activeMenu = menuMapping[currentPage];

        if (currentPage === '' || currentPage === 'index.aspx' || currentPage === 'dashboard' || currentPath === '/' || currentPath.indexOf('dashboard') !== -1) {
            activeMenu = 'dashboard';
        }

        if (currentPath.indexOf('/eleves/') !== -1) activeMenu = 'eleves';
        if (currentPath.indexOf('/absences/') !== -1) activeMenu = 'absences';
        if (currentPath.indexOf('/bulletins/') !== -1) activeMenu = 'bulletins';
        if (currentPath.indexOf('/frais/') !== -1) activeMenu = 'frais';
        if (currentPath.indexOf('/niveaux/') !== -1) activeMenu = 'niveaux';
        if (currentPath.indexOf('/salles/') !== -1) activeMenu = 'salles';
        if (currentPath.indexOf('/classes/') !== -1) activeMenu = 'classes';
        if (currentPath.indexOf('/matieres/') !== -1) activeMenu = 'matieres';
        if (currentPath.indexOf('/utilitaires/') !== -1) activeMenu = 'importation';
        if (currentPath.indexOf('/annee/') !== -1) activeMenu = 'annees';
        if (currentPath.indexOf('/utilisateur/') !== -1) activeMenu = 'utilisateurs';
        if (currentPath.indexOf('/requete/') !== -1) activeMenu = 'requetes';
        if (currentPath.indexOf('/dashboard/') !== -1) activeMenu = 'dashboard';
        if (currentPath.indexOf('/accueil/') !== -1) activeMenu = 'dashboard';

        var menuLinks = document.querySelectorAll('.sidebar .nav-link');
        for (var i = 0; i < menuLinks.length; i++) {
            var link = menuLinks[i];
            var menuCode = link.getAttribute('data-menu');
            link.classList.remove('active');
            if (menuCode === activeMenu) {
                link.classList.add('active');
            }
        }
    }

    function addMenuHoverEffect() {
        var menuLinks = document.querySelectorAll('.sidebar .nav-link');
        for (var i = 0; i < menuLinks.length; i++) {
            var link = menuLinks[i];
            link.removeEventListener('mouseenter', onMenuMouseEnter);
            link.removeEventListener('mouseleave', onMenuMouseLeave);
            link.addEventListener('mouseenter', onMenuMouseEnter);
            link.addEventListener('mouseleave', onMenuMouseLeave);
        }
    }

    function onMenuMouseEnter() {
        if (!this.classList.contains('active')) {
            this.style.backgroundColor = '#e9ecef';
            this.style.transition = 'all 0.2s';
        }
    }

    function onMenuMouseLeave() {
        if (!this.classList.contains('active')) {
            this.style.backgroundColor = '';
        }
    }

    /* ══════════════════════════════════════════════════
       BADGE VERSION
    ══════════════════════════════════════════════════ */
    function injectVersionBadge() {
        var version = document.body ? document.body.getAttribute('data-version') : null;
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

        setTimeout(function () {
            setActiveMenu();
            addMenuHoverEffect();
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.setActiveMenu = setActiveMenu;
    window.refreshActiveMenu = function () {
        setTimeout(setActiveMenu, 50);
    };
})();

/* ══════════════════════════════════════════════════
   i18n — Exposé globalement
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
        .catch(function () { });
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var key = el.getAttribute('data-i18n');
        var keys = key.split('.');
        var val = i18n;
        for (var i = 0; i < keys.length; i++) {
            val = val && val[keys[i]];
        }
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

// ============================================================================
// MODE SOMBRE (DARK MODE)
// ============================================================================

function initDarkMode() {
    const toggle = document.getElementById('toggleDarkMode');
    if (!toggle) return;

    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }

    toggle.addEventListener('change', function () {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });
}

// ============================================================================
// TREE VIEW / ACCORDÉON
// ============================================================================

function initTreeview() {
    var treeviewToggles = document.querySelectorAll('.treeview-toggle');

    for (var i = 0; i < treeviewToggles.length; i++) {
        var toggle = treeviewToggles[i];
        toggle.removeEventListener('click', handleTreeviewClick);
        toggle.addEventListener('click', handleTreeviewClick);
    }

    var activeLink = document.querySelector('.nav-treeview .nav-link.active');
    if (activeLink) {
        var parentTreeview = activeLink.closest('.has-treeview');
        if (parentTreeview) {
            parentTreeview.classList.add('open');
        }
    }
}

function handleTreeviewClick(e) {
    e.preventDefault();
    e.stopPropagation();

    var parentItem = this.closest('.has-treeview');
    if (parentItem) {
        parentItem.classList.toggle('open');
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initTreeview();
    initDarkMode();
});

// ============================================================================
// MAINTENANCE - BLOCAGE ET DÉCONNECTION (VERSION UNIFIÉE)
// ============================================================================

let globalMaintenanceCheck = null;
let globalCountdownInterval = null;

function startMaintenanceChecker() {
    if (globalMaintenanceCheck) clearInterval(globalMaintenanceCheck);
    
    globalMaintenanceCheck = setInterval(async () => {
        try {
            const response = await fetch('api/CheckBlockStatus.aspx');
            const data = await response.json();
            
            if (data.isBlocked && data.blockedUntil) {
                showBlockedBanner(data.blockedUntil);
            }
        } catch (e) {
            // Ignorer
        }
    }, 3000);
}

function showBlockedBanner(blockedUntil) {
    if (document.getElementById('blockedBannerGlobal')) return;
    
    const banner = document.createElement('div');
    banner.id = 'blockedBannerGlobal';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        padding: 20px;
        z-index: 99999;
        font-family: 'Segoe UI', Arial, sans-serif;
        text-align: center;
        box-shadow: 0 2px 15px rgba(0,0,0,0.3);
        animation: slideDownGlobal 0.5s ease;
    `;
    
    banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <i class="fas fa-database" style="font-size: 32px;"></i>
            <div>
                <strong style="font-size: 18px;">🔒 MAINTENANCE EN COURS</strong><br>
                <span style="font-size: 14px;">Sauvegarde de la base de données en cours</span>
            </div>
            <div style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 50px;">
                <span style="font-size: 14px;">Reconnexion dans</span><br>
                <span id="globalCountdownDisplay" style="font-size: 28px; font-weight: bold; font-family: monospace;">--:--</span>
            </div>
        </div>
        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 4px; margin-top: 15px;">
            <div id="globalProgressBar" style="width: 0%; height: 100%; background: #ffc107; transition: width 1s linear;"></div>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    // Désactiver l'interface
    document.querySelectorAll('button, a, input, select, .nav-link, .btn').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });
    
    startGlobalCountdown(blockedUntil);
}

function startGlobalCountdown(targetTime) {
    if (globalCountdownInterval) clearInterval(globalCountdownInterval);
    
    const target = new Date(targetTime);
    const maxDuration = 60 * 1000; // 1 MINUTE (60 secondes)
    
    globalCountdownInterval = setInterval(() => {
        const now = new Date();
        const diff = target - now;
        
        if (diff <= 0) {
            clearInterval(globalCountdownInterval);
            window.location.reload();
        } else {
            const secondsLeft = Math.floor(diff / 1000);
            const minutesLeft = Math.floor(secondsLeft / 60);
            const secsLeft = secondsLeft % 60;
            
            const countdownEl = document.getElementById('globalCountdownDisplay');
            const progressEl = document.getElementById('globalProgressBar');
            
            if (countdownEl) {
                countdownEl.textContent = `${minutesLeft}:${secsLeft.toString().padStart(2, '0')}`;
            }
            if (progressEl) {
                const percent = (1 - (diff / maxDuration)) * 100;
                progressEl.style.width = `${Math.min(100, percent)}%`;
            }
        }
    }, 1000);
}

// Ajouter les styles UNIQUEMENT si non existants
if (!document.getElementById('globalAnimationStyles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'globalAnimationStyles';
    styleSheet.textContent = `
        @keyframes slideDownGlobal {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Démarrer la vérification
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        startMaintenanceChecker();
    });
} else {
    if (typeof window._globalMaintenanceStarted === 'undefined') {
        window._globalMaintenanceStarted = true;
        startMaintenanceChecker();
    }
}

// ============================================================================
// EXPOSITION GLOBALE
// ============================================================================
window.forceHideSpinner = forceHideSpinner;
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;
window.ajax = ajax;
window.loadLang = loadLang;
window.initDarkMode = initDarkMode;