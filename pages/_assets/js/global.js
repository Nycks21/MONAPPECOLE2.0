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
       GESTION DU MENU ACTIF (TOUTE LA LOGIQUE ICI)
    ══════════════════════════════════════════════════ */
    
    function setActiveMenu() {
        var currentUrl = window.location.pathname.toLowerCase();
        var menuLinks = document.querySelectorAll('.sidebar .nav-link');
        
        // Mapping des pages vers les codes de menu
        var pageToMenu = {
            'index.aspx': 'dashboard',
            'dashboard': 'dashboard',
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
        
        // Déterminer la page active
        var activePage = null;
        for (var page in pageToMenu) {
            if (currentUrl.indexOf(page) !== -1) {
                activePage = pageToMenu[page];
                break;
            }
        }
        
        // Cas particulier : page d'accueil
        if (currentUrl === '/' || currentUrl.indexOf('index.aspx') !== -1 || currentUrl.indexOf('dashboard') !== -1) {
            activePage = 'dashboard';
        }
        
        // Cas particuliers pour les correspondances
        if (currentUrl.indexOf('utilitaires') !== -1) {
            activePage = 'importation';
        }
        if (currentUrl.indexOf('utilisateur') !== -1) {
            activePage = 'utilisateurs';
        }
        if (currentUrl.indexOf('requete') !== -1) {
            activePage = 'requetes';
        }
        if (currentUrl.indexOf('annee') !== -1 && currentUrl.indexOf('annee') !== -1) {
            activePage = 'annees';
        }
        
        // Appliquer la classe active
        menuLinks.forEach(function(link) {
            link.classList.remove('active');
            var href = link.getAttribute('href');
            if (href && activePage) {
                if (href.indexOf(activePage) !== -1) {
                    link.classList.add('active');
                }
            }
        });
        
        // Debug (optionnel - à supprimer en production)
        // console.log('Page active:', activePage);
    }
    
    function addMenuHoverEffect() {
        var menuLinks = document.querySelectorAll('.sidebar .nav-link');
        menuLinks.forEach(function(link) {
            link.removeEventListener('mouseenter', onMenuMouseEnter);
            link.removeEventListener('mouseleave', onMenuMouseLeave);
            link.addEventListener('mouseenter', onMenuMouseEnter);
            link.addEventListener('mouseleave', onMenuMouseLeave);
        });
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
        setTimeout(function() {
            setActiveMenu();
            addMenuHoverEffect();
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Exposer les fonctions pour les appels ultérieurs (AJAX, etc.)
    window.setActiveMenu = setActiveMenu;
    window.addMenuHoverEffect = addMenuHoverEffect;
    window.refreshActiveMenu = function() {
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

// ════════════════════════════════════════════════════════════════
// TREE VIEW / ACCORDÉON
// ════════════════════════════════════════════════════════════════

function initTreeview() {
    var treeviewToggles = document.querySelectorAll('.treeview-toggle');
    
    treeviewToggles.forEach(function(toggle) {
        toggle.removeEventListener('click', handleTreeviewClick);
        toggle.addEventListener('click', handleTreeviewClick);
    });
    
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

// ============================================================================
// ACTIVER LE MENU ACTIF - MÉTHODE SIMPLE
// ============================================================================
(function() {
    // Obtenir le nom de la page courante
    var currentPage = window.location.pathname.split('/').pop();
    var currentFolder = window.location.pathname.split('/')[1] || '';
    
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
    
    // Déterminer le menu actif
    var activeMenu = menuMapping[currentPage];
    
    // Cas particulier pour dashboard
    if (currentPage === '' || currentPage === 'index.aspx' || currentPage === 'dashboard') {
        activeMenu = 'dashboard';
    }
    
    // Cas particulier pour les dossiers
    if (currentFolder === 'eleves') activeMenu = 'eleves';
    if (currentFolder === 'absences') activeMenu = 'absences';
    if (currentFolder === 'bulletins') activeMenu = 'bulletins';
    if (currentFolder === 'frais') activeMenu = 'frais';
    if (currentFolder === 'niveaux') activeMenu = 'niveaux';
    if (currentFolder === 'salles') activeMenu = 'salles';
    if (currentFolder === 'classes') activeMenu = 'classes';
    if (currentFolder === 'matieres') activeMenu = 'matieres';
    
    // Appliquer la classe active
    if (activeMenu) {
        var menuLinks = document.querySelectorAll('.sidebar .nav-link');
        for (var i = 0; i < menuLinks.length; i++) {
            var link = menuLinks[i];
            var menuCode = link.getAttribute('data-menu');
            if (menuCode === activeMenu) {
                link.classList.add('active');
                break;
            }
        }
    }
    
    // Ajouter l'effet de survol
    var links = document.querySelectorAll('.sidebar .nav-link');
    for (var i = 0; i < links.length; i++) {
        links[i].addEventListener('mouseenter', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '#e9ecef';
            }
        });
        links[i].addEventListener('mouseleave', function() {
            if (!this.classList.contains('active')) {
                this.style.backgroundColor = '';
            }
        });
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    initTreeview();
});

// ============================================================================
// EXPOSITION GLOBALE DES FONCTIONS POUR LES AUTRES PAGES
// ============================================================================
window.forceHideSpinner = forceHideSpinner;
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;
window.ajax = ajax;
window.loadLang = loadLang;