/* ═══════════════════════════════════════════════════════════════
   global.js — Gestion Scolaire
   Version unifiée — conflits résolus, logiques préservées
   ═══════════════════════════════════════════════════════════════
*/

// ============================================================================
// INITIALISATION - ATTENDRE QUE jQuery SOIT CHARGÉ
// ============================================================================

// ✅ Attendre que le DOM soit prêt AVANT d'utiliser jQuery
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier que jQuery est bien chargé
    if (typeof $ !== 'undefined') {
        console.log("🔵 Page chargée - Initialisation GlobalJS");
        initDarkMode();
    } else {
        // Fallback : réessayer après un délai
        setTimeout(function() {
            if (typeof $ !== 'undefined') {
                console.log("🔵 Page chargée (retard) - Initialisation GlobalJS");
                initDarkMode();
            }
        }, 500);
    }
});

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

    // ✅ Attendre que le DOM soit chargé pour ajouter les écouteurs
    document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('click', function (e) {
            var target = e.target;
            if (!target) return;
            var isToggle = target.id === 'menuToggle' || !!target.closest('#menuToggle');
            if (isToggle) onMenuToggleClick(e);
        });
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
    fetch(apiUrl('/_assets/lang/' + lang + '.json'))
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
// SPINNER - Version unifiée
// ─────────────────────────────────────────────
// ✅ Éviter la duplication
if (!window._spinnerDefined) {
    window._spinnerDefined = true;
    
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

    function hideSpinner() { 
        forceHideSpinner(); 
    }
    
    window.forceHideSpinner = forceHideSpinner;
    window.showSpinner = showSpinner;
    window.hideSpinner = hideSpinner;
}

function ajax(url, payload) {
    return fetch(apiUrl(url), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
    }).then(function (r) {
        if (!r.ok) throw new Error('Erreur HTTP ' + r.status);
        return r.json();
    });
}

// ============================================================================
// CONSTRUCTION D'URL SÉCURISÉE (ANTI MIXED-CONTENT)
// ============================================================================
// ✅ BUG CORRIGÉ : derrière un tunnel ngrok (ngrok http PORT), le serveur
// IIS local tourne en HTTP et ne sait pas qu'il est exposé en HTTPS.
// Toute URL absolue construite côté serveur (redirections, en-têtes Location,
// liens générés) ou résolue dans certains contextes navigateur peut donc
// hériter du scheme "http://" alors que la page est chargée en "https://",
// ce qui déclenche un blocage "Mixed Content".
//
// apiUrl() reconstruit systématiquement l'URL avec le PROTOCOLE ET L'HÔTE
// RÉELS de la page actuelle (window.location), quel que soit le scheme
// d'origine du chemin fourni. Cela neutralise le problème à la source,
// peu importe d'où vient l'incohérence (cache, proxy, réponse serveur...).
function apiUrl(path) {
    if (!path) return path;
    try {
        // Construit l'URL absolue (gère aussi bien les chemins relatifs
        // "api/x.aspx" que les chemins absolus "/pages/.../x.aspx").
        var resolved = new URL(path, window.location.origin + window.location.pathname);
        resolved.protocol = window.location.protocol; // force https si la page est en https
        resolved.host = window.location.host;          // force le bon host
        return resolved.toString();
    } catch (e) {
        // Si l'URL ne peut pas être analysée, on renvoie le chemin original
        return path;
    }
}
window.apiUrl = apiUrl;

// ✅ Garde-fou supplémentaire : intercepter fetch() pour réécrire
// automatiquement toute requête http:// vers https:// quand la page est
// elle-même chargée en https://. Cela protège même les appels qui auraient
// été oubliés lors d'une mise à jour future du code, sans rien casser
// pour les requêtes déjà correctes.
(function patchFetchForMixedContent() {
    if (window._fetchPatchedForHttps) return;
    window._fetchPatchedForHttps = true;

    var originalFetch = window.fetch;
    window.fetch = function (input, init) {
        try {
            if (window.location.protocol === 'https:' && typeof input === 'string' && input.indexOf('http://') === 0) {
                console.warn('⚠️ Requête http:// interceptée et corrigée en https:// →', input);
                input = 'https://' + input.substring('http://'.length);
            }
        } catch (e) { /* ignorer et laisser fetch gérer l'erreur normalement */ }
        return originalFetch.call(this, input, init);
    };
})();

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

// ✅ Initialiser Treeview après chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    initTreeview();
    // initDarkMode est déjà appelé plus haut
});

// ============================================================================
// MAINTENANCE - 2 VÉRIFICATIONS UNIQUEMENT (VERSION UNIFIÉE GLOBALE)
// ============================================================================

const API_BASE = '/pages/administrations/utilisateur/api/BackupDatabase.aspx';
let countdownTimer = null;
let isBannerShown = false;

// ─── DÉMARRAGE : 2 VÉRIFICATIONS ────────────────────────────────────
function startMaintenanceChecker() {
    // ✅ Éviter les doublons
    if (window._maintenanceInitialized) {
        console.log('⚠️ Maintenance déjà initialisée, ignoré');
        return;
    }
    window._maintenanceInitialized = true;
    
    console.log('🔍 Vérification 1/2 - Immédiate');
    
    // 1ère vérification immédiate
    checkStatus(1);
    
    // 2ème vérification après 5 secondes
    setTimeout(() => {
        console.log('🔍 Vérification 2/2 - Après 5s');
        checkStatus(2);
    }, 5000);
}

// ─── VÉRIFICATION UNIQUE ────────────────────────────────────────────
async function checkStatus(checkNumber) {
    try {
        const url = apiUrl(`${API_BASE}?action=check&t=${Date.now()}`);
        const response = await fetch(url);
        const data = await response.json();
        
        console.log(`📊 Résultat vérification ${checkNumber}/2:`, data);
        
        // Cas 1: Maintenance exécutée
        if (data.isExecuted) {
            console.log('✅ Maintenance déjà exécutée');
            clearAllBanners();
            return;
        }
        
        // Cas 2: Maintenance programmée → bannière de déconnexion
        if (data.isMaintenance && data.maintenanceTime) {
            const userRole = document.getElementById('hfUserRole')?.value || '';
            if (userRole !== '0' && !isBannerShown) {
                isBannerShown = true;
                showMaintenanceBanner(data.maintenanceTime);
            }
            removeBanner('blockedBanner');
            return;
        }
        
        // Cas 3: Blocage actif → bannière de blocage
        if (data.isBlocked && data.remainingSeconds > 0) {
            showBlockedBanner(data.remainingSeconds);
            removeBanner('globalMaintenanceBanner');
            return;
        }
        
        // Cas 4: Rien → nettoyer
        clearAllBanners();
        
    } catch (e) {
        console.log('⚠️ Erreur vérification:', e);
    }
}

// ─── NETTOYAGE ──────────────────────────────────────────────────────
function clearAllBanners() {
    removeBanner('globalMaintenanceBanner');
    removeBanner('blockedBanner');
    enableInteractions();
}

function removeBanner(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function enableInteractions() {
    document.querySelectorAll('button, a, input, select, .nav-link, .btn').forEach(el => {
        el.style.pointerEvents = '';
        el.style.opacity = '';
    });
}

function disableInteractions() {
    document.querySelectorAll('button, a, input, select, .nav-link, .btn').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });
}

// ─── BANNIÈRE MAINTENANCE ──────────────────────────────────────────
function showMaintenanceBanner(maintenanceTime) {
    if (document.getElementById('globalMaintenanceBanner')) return;
    
    const version = document.querySelector('[data-version]')?.getAttribute('data-version') || '2.1.17';
    const banner = createBannerElement('globalMaintenanceBanner');
    
    banner.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 14px;">
                <i class="fas fa-database" style="font-size: 28px; color: #ffc107;"></i>
                <div>
                    <div style="font-weight: bold; font-size: 16px; color: #ffc107;">⚠️ MAINTENANCE PROGRAMMÉE</div>
                    <div style="font-size: 13px; opacity: 0.9;">Sauvegarde de la base de données</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 10px; opacity: 0.8;">Déconnexion à</div>
                    <div style="font-size: 14px; font-weight: bold;">${maintenanceTime}</div>
                </div>
                <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; opacity: 0.8;">Temps restant</div>
                    <div id="countdownDisplay" style="font-size: 32px; font-weight: bold; font-family: monospace; color: #ffc107;">--:--:--</div>
                </div>
                <div style="width: 1px; height: 40px; background: rgba(255,255,255,0.3);"></div>
                <div style="text-align: center;">
                    <div style="font-size: 10px; opacity: 0.7;">Version</div>
                    <div style="font-weight: bold; font-size: 14px;">v${version}</div>
                </div>
            </div>
        </div>
        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.2); border-radius: 4px; margin-top: 10px; overflow: hidden;">
            <div id="progressBar" style="width: 0%; height: 100%; background: linear-gradient(90deg, #ffc107, #28a745); transition: width 1s linear;"></div>
        </div>
    `;
    
    document.body.appendChild(banner);
    startCountdown(maintenanceTime);
    injectStyles();
}

// ─── BANNIÈRE BLOCAGE ──────────────────────────────────────────────
function showBlockedBanner(remainingSeconds) {
    const isLoginPage = window.location.pathname.includes('Login.aspx');
    
    let banner = document.getElementById('blockedBanner');
    if (banner) {
        updateBlockBanner(remainingSeconds);
        return;
    }
    
    banner = createBannerElement('blockedBanner', '#dc3545');
    banner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; flex-wrap: wrap;">
            <i class="fas fa-lock" style="font-size: 28px;"></i>
            <div>
                <strong style="font-size: 16px;">🔒 COMPTE TEMPORAIREMENT BLOQUÉ</strong><br>
                <span style="font-size: 13px;">Maintenance en cours. Réessayez dans</span>
            </div>
            <div style="background: rgba(255,255,255,0.2); padding: 8px 20px; border-radius: 50px;">
                <span id="blockCountdown" style="font-size: 32px; font-weight: bold; font-family: monospace;">${remainingSeconds}s</span>
            </div>
        </div>
        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.3); border-radius: 4px; margin-top: 10px;">
            <div id="blockProgress" style="width: ${(1 - remainingSeconds / 60) * 100}%; height: 100%; background: #ffc107; transition: width 1s linear;"></div>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    if (!isLoginPage) {
        disableInteractions();
    }
    
    startBlockCountdown(remainingSeconds);
    injectStyles();
}

// ─── UTILITAIRES ────────────────────────────────────────────────────
function createBannerElement(id, bgColor = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)') {
    const banner = document.createElement('div');
    banner.id = id;
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: ${bgColor};
        color: white;
        padding: 14px 20px;
        z-index: 99999;
        font-family: 'Segoe UI', Arial, sans-serif;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
        animation: slideUp 0.5s ease;
        border-top: 3px solid #ffc107;
    `;
    return banner;
}

function injectStyles() {
    if (document.getElementById('maintenanceStyles')) return;
    const style = document.createElement('style');
    style.id = 'maintenanceStyles';
    style.textContent = `
        @keyframes slideUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulseAlert {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
    `;
    document.head.appendChild(style);
}

// ─── COMPTEURS ──────────────────────────────────────────────────────
function startCountdown(targetTime) {
    if (countdownTimer) clearInterval(countdownTimer);
    
    const target = new Date();
    const [hours, minutes] = targetTime.split(':');
    target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    if (target < new Date()) target.setDate(target.getDate() + 1);
    
    countdownTimer = setInterval(() => {
        const diff = target - new Date();
        
        if (diff <= 0) {
            clearInterval(countdownTimer);
            handleDisconnect();
        } else {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            
            const el = document.getElementById('countdownDisplay');
            const progress = document.getElementById('progressBar');
            
            if (el) {
                el.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                if (diff < 60000) {
                    el.style.animation = 'pulseAlert 0.5s infinite';
                    el.style.color = '#ff6b6b';
                }
            }
            if (progress) {
                const totalSec = Math.floor(diff / 1000);
                progress.style.width = `${Math.min(100, (1 - totalSec / 86400) * 100)}%`;
            }
        }
    }, 1000);
}

function startBlockCountdown(seconds) {
    if (countdownTimer) clearInterval(countdownTimer);
    
    let remaining = seconds;
    const MAX = 60;
    
    countdownTimer = setInterval(() => {
        remaining--;
        const el = document.getElementById('blockCountdown');
        const progress = document.getElementById('blockProgress');
        
        if (el) el.textContent = remaining + 's';
        if (progress) {
            progress.style.width = `${Math.min(100, ((MAX - remaining) / MAX) * 100)}%`;
        }
        
        if (remaining <= 0) {
            clearInterval(countdownTimer);
            removeBanner('blockedBanner');
            enableInteractions();
            if (window.location.pathname.includes('Login.aspx')) {
                window.location.reload();
            }
        }
    }, 1000);
}

function updateBlockBanner(remaining) {
    const el = document.getElementById('blockCountdown');
    const progress = document.getElementById('blockProgress');
    if (el) el.textContent = remaining + 's';
    if (progress) {
        progress.style.width = `${Math.min(100, ((60 - remaining) / 60) * 100)}%`;
    }
}

// ─── DÉCONNEXION ──────────────────────────────────────────────────
function handleDisconnect() {
    const banner = document.getElementById('globalMaintenanceBanner');
    if (banner) {
        banner.style.background = '#28a745';
        banner.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; padding: 10px;">
                <i class="fas fa-sync-alt fa-spin" style="font-size: 32px;"></i>
                <div style="text-align: center;">
                    <strong style="font-size: 18px;">🔄 MAINTENANCE EN COURS</strong><br>
                    <span style="font-size: 14px;">Sauvegarde de la base de données en cours...</span>
                    <div style="font-size: 13px; margin-top: 5px; opacity: 0.9;">⏳ Redirection...</div>
                </div>
            </div>
        `;
    }
    
    clearAllBanners();
    setTimeout(() => {
        window.location.href = '../../../auth/Login.aspx?msg=maintenance';
    }, 5000);
}

// ─── EXPOSITION GLOBALE ────────────────────────────────────────────
window.startMaintenanceChecker = startMaintenanceChecker;

// ─── DÉMARRAGE AUTOMATIQUE DE LA MAINTENANCE ──────────────────────
// ✅ Version robuste qui fonctionne sur TOUTES les pages SANS jQuery

function initMaintenance() {
    if (window._maintenanceInitialized) {
        return;
    }
    
    // Attendre que le DOM soit prêt
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(startMaintenanceChecker, 300);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(startMaintenanceChecker, 300);
        });
    }
}

// Démarrer la maintenance
initMaintenance();

// Fallback après 3 secondes si pas démarré
setTimeout(function() {
    if (!window._maintenanceInitialized) {
        console.log('🔵 Forçage maintenance (fallback)');
        startMaintenanceChecker();
    }
}, 3000);

// ============================================================================
// GESTION DES MODALS
// ============================================================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (id === 'editHistoriqueModal') {
            modal.style.zIndex = '999999';
        } else {
            modal.style.zIndex = '9999';
        }
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.zIndex = modal.style.zIndex;
        }
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
        const anyOpen = ['paymentModal', 'editHistoriqueModal', 'tarifModal', 'restoreModal'].some(function(mid) {
            const m = document.getElementById(mid);
            return m && m.style.display === 'flex';
        });
        if (!anyOpen) {
            document.body.style.overflow = '';
        }
    }
}

// ============================================
// GESTION DU SÉLECTEUR DE LANGUE - VERSION .NET 4.0
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Initialisation du sélecteur de langue...');
    
    // Récupérer tous les sélecteurs
    var selectors = document.querySelectorAll('.language-selector');
    console.log('📦 Sélecteurs trouvés:', selectors.length);
    
    for (var i = 0; i < selectors.length; i++) {
        var selector = selectors[i];
        var btn = selector.querySelector('.btn');
        var dropdown = selector.querySelector('.dropdown-menu');
        
        if (btn && dropdown) {
            console.log('✅ Sélecteur ' + i + ' initialisé');
            
            // Toggle du dropdown - utiliser une closure pour conserver la référence
            (function(btnRef, dropdownRef) {
                btnRef.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    dropdownRef.classList.toggle('show');
                    console.log('📂 Dropdown toggled:', dropdownRef.classList.contains('show'));
                });
            })(btn, dropdown);
        } else {
            console.warn('⚠️ Sélecteur ' + i + ' incomplet:', {
                btn: !!btn,
                dropdown: !!dropdown
            });
        }
    }
    
    // Fermer le dropdown si on clique ailleurs
    document.addEventListener('click', function(e) {
        var allDropdowns = document.querySelectorAll('.language-selector .dropdown-menu');
        for (var i = 0; i < allDropdowns.length; i++) {
            var dropdown = allDropdowns[i];
            var parent = dropdown.parentNode;
            if (parent && !parent.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        }
    });
    
    // ✅ Fonction améliorée qui conserve les paramètres GET (compatible .NET 4.0)
    window.setLanguage = function(culture) {
        console.log('🌐 Changement de langue vers:', culture);
        var currentUrl = window.location.href;
        var separator = currentUrl.indexOf('?') > -1 ? '&' : '?';
        var newUrl = currentUrl + separator + 'lang=' + culture;
        
        // Nettoyer les doublons de lang
        newUrl = newUrl.replace(/([?&])lang=[^&]*&/g, '$1');
        newUrl = newUrl.replace(/([?&])lang=[^&]*$/, '');
        
        // Réajouter la langue
        if (newUrl.indexOf('?') > -1) {
            newUrl = newUrl + '&lang=' + culture;
        } else {
            newUrl = newUrl + '?lang=' + culture;
        }
        
        window.location.href = newUrl;
    };
    
    console.log('✅ Sélecteur de langue initialisé');
});

// ============================================================================
// EXPOSITION GLOBALE
// ============================================================================
window.ajax = ajax;
window.loadLang = loadLang;
window.initDarkMode = initDarkMode;
window.openModal = openModal;
window.closeModal = closeModal;