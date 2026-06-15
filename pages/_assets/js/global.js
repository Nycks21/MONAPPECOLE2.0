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

        // Mapping des pages vers les codes menu
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

        // Cas particulier pour dashboard
        if (currentPage === '' || currentPage === 'index.aspx' || currentPage === 'dashboard' || currentPath === '/' || currentPath.indexOf('dashboard') !== -1) {
            activeMenu = 'dashboard';
        }

        // =====================================================
        // CAS PARTICULIERS POUR TOUS LES CHEMINS
        // =====================================================

        // Modules
        if (currentPath.indexOf('/eleves/') !== -1) activeMenu = 'eleves';
        if (currentPath.indexOf('/absences/') !== -1) activeMenu = 'absences';
        if (currentPath.indexOf('/bulletins/') !== -1) activeMenu = 'bulletins';
        if (currentPath.indexOf('/frais/') !== -1) activeMenu = 'frais';

        // Paramètres
        if (currentPath.indexOf('/niveaux/') !== -1) activeMenu = 'niveaux';
        if (currentPath.indexOf('/salles/') !== -1) activeMenu = 'salles';
        if (currentPath.indexOf('/classes/') !== -1) activeMenu = 'classes';
        if (currentPath.indexOf('/matieres/') !== -1) activeMenu = 'matieres';

        // Administrations
        if (currentPath.indexOf('/utilitaires/') !== -1) activeMenu = 'importation';
        if (currentPath.indexOf('/annee/') !== -1) activeMenu = 'annees';
        if (currentPath.indexOf('/utilisateur/') !== -1) activeMenu = 'utilisateurs';
        if (currentPath.indexOf('/requete/') !== -1) activeMenu = 'requetes';

        // Accueil
        if (currentPath.indexOf('/dashboard/') !== -1) activeMenu = 'dashboard';
        if (currentPath.indexOf('/accueil/') !== -1) activeMenu = 'dashboard';

        // Appliquer la classe active
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

        // Initialiser le menu actif et les effets de survol
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

    // Exposer les fonctions pour les appels ultérieurs
    window.setActiveMenu = setActiveMenu;
    window.refreshActiveMenu = function () {
        setTimeout(setActiveMenu, 50);
    };

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

// ============================================================================
// MODE SOMBRE (DARK MODE)
// ============================================================================

function initDarkMode() {
    const toggle = document.getElementById('toggleDarkMode');
    if (!toggle) return;

    // Vérifier si un mode est sauvegardé dans localStorage
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

// ════════════════════════════════════════════════════════════════
// TREE VIEW / ACCORDÉON
// ════════════════════════════════════════════════════════════════
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
});

// ============================================================
// MAINTENANCE - DÉCONNECTION AUTOMATIQUE
// ============================================================

let maintenanceCheckerInterval = null;
let maintenanceCountdownInterval = null;

function startMaintenanceChecker() {
    if (maintenanceCheckerInterval) clearInterval(maintenanceCheckerInterval);

    maintenanceCheckerInterval = setInterval(async () => {
        try {
            const response = await fetch('api/CheckMaintenance.aspx');
            const data = await response.json();

            if (data.isMaintenance && data.maintenanceTime) {
                showMaintenanceWarning(data.maintenanceTime);
            }
        } catch (e) {
            console.log('Erreur vérification maintenance:', e);
        }
    }, 10000); // Vérifier toutes les 10 secondes
}

function showMaintenanceWarning(maintenanceTime) {
    // Vérifier si le message existe déjà
    if (document.getElementById('maintenanceBanner')) return;

    // Récupérer la version depuis l'attribut data-version ou l'élément footer
    const versionElement = document.querySelector('[data-version]');
    const version = versionElement ? versionElement.getAttribute('data-version') : '2.1.16';

    // Créer la bannière de maintenance
    const banner = document.createElement('div');
    banner.id = 'maintenanceBanner';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        padding: 12px 20px;
        z-index: 99999;
        box-shadow: 0 -4px 15px rgba(0,0,0,0.3);
        font-family: 'Segoe UI', Arial, sans-serif;
        text-align: center;
        animation: slideUp 0.5s ease;
    `;

    banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <i class="fas fa-database" style="font-size: 24px;"></i>
                <div style="text-align: left;">
                    <div style="font-weight: bold; font-size: 14px;">⚠️ MAINTENANCE PROGRAMMÉE</div>
                    <div style="font-size: 12px; opacity: 0.9;">La base de données sera sauvegardée</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="text-align: right;">
                    <div style="font-size: 11px; opacity: 0.8;">Déconnexion automatique dans</div>
                    <div id="maintenanceCountdownDisplay" style="font-size: 28px; font-weight: bold; font-family: monospace;">--:--</div>
                </div>
                <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
                <div style="text-align: left;">
                    <div style="font-size: 10px; opacity: 0.7;">Version</div>
                    <div style="font-size: 12px; font-weight: bold;">v${version}</div>
                </div>
            </div>
        </div>
        <div style="margin-top: 10px; height: 3px; background: rgba(255,255,255,0.3); border-radius: 3px; overflow: hidden;">
            <div id="maintenanceProgressBar" style="width: 0%; height: 100%; background: white; transition: width 1s linear;"></div>
        </div>
    `;

    document.body.appendChild(banner);

    // Ajouter les styles d'animation
    if (!document.getElementById('maintenanceStyles')) {
        const style = document.createElement('style');
        style.id = 'maintenanceStyles';
        style.textContent = `
            @keyframes slideUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);
    }

    // Démarrer le compte à rebours
    startMaintenanceCountdown(maintenanceTime);
}

function startMaintenanceCountdown(targetTime) {
    if (maintenanceCountdownInterval) clearInterval(maintenanceCountdownInterval);

    const target = new Date();
    const [hours, minutes] = targetTime.split(':');
    target.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Si l'heure est déjà passée, ajouter un jour
    if (target < new Date()) {
        target.setDate(target.getDate() + 1);
    }

    maintenanceCountdownInterval = setInterval(() => {
        const now = new Date();
        const diff = target - now;

        if (diff <= 0) {
            clearInterval(maintenanceCountdownInterval);
            // Déconnecter l'utilisateur
            disconnectUserForMaintenance();
        } else {
            const minutesLeft = Math.floor(diff / 60000);
            const secondsLeft = Math.floor((diff % 60000) / 1000);

            const display = document.getElementById('maintenanceCountdownDisplay');
            if (display) {
                display.textContent = `${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`;

                // Faire clignoter si moins de 30 secondes
                if (diff < 30000) {
                    display.style.animation = 'pulse 1s infinite';
                    display.style.color = '#ffeb3b';
                }
            }

            // Mettre à jour la barre de progression
            const progressBar = document.getElementById('maintenanceProgressBar');
            if (progressBar) {
                const maxDuration = 5 * 60 * 1000; // 5 minutes max
                const percent = Math.min(100, (1 - (diff / maxDuration)) * 100);
                progressBar.style.width = `${percent}%`;
            }
        }
    }, 1000);
}

async function disconnectUserForMaintenance() {
    try {
        // Afficher un message final
        const banner = document.getElementById('maintenanceBanner');
        if (banner) {
            banner.style.background = '#28a745';
            banner.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                    <i class="fas fa-sync-alt fa-spin" style="font-size: 28px;"></i>
                    <div style="text-align: center;">
                        <div style="font-weight: bold; font-size: 16px;">🔄 Maintenance en cours</div>
                        <div style="font-size: 13px;">Redirection vers la page de connexion...</div>
                    </div>
                </div>
            `;
        }

        // Attendre 3 secondes avant redirection
        setTimeout(() => {
            window.location.href = '../../../auth/Login.aspx?msg=maintenance';
        }, 3000);

    } catch (e) {
        console.error('Erreur déconnexion:', e);
        window.location.href = '../../../auth/Login.aspx?msg=maintenance';
    }
}

// Démarrer le vérificateur au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMaintenanceChecker);
} else {
    startMaintenanceChecker();
}

// ============================================================================
// EXPOSITION GLOBALE DES FONCTIONS POUR LES AUTRES PAGES
// ============================================================================
window.forceHideSpinner = forceHideSpinner;
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;
window.ajax = ajax;
window.loadLang = loadLang;