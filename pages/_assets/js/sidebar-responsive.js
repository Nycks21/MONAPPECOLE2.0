/* ═══════════════════════════════════════════════════════════════
   SIDEBAR RESPONSIVE JS — Gestion Scolaire
   À ajouter dans global.js OU juste avant </body> dans chaque page
   ═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Créer l'overlay mobile si absent ──
    function ensureOverlay() {
        if (!document.getElementById('sidebarOverlay')) {
            var overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            overlay.id = 'sidebarOverlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', closeSidebar);
        }
    }

    // ── Détecter si on est sur mobile ──
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // ── Ouvrir sidebar (mobile) ──
    function openSidebar() {
        document.body.classList.add('sidebar-open');
        document.body.classList.remove('sidebar-collapsed');
    }

    // ── Fermer sidebar (mobile) ──
    function closeSidebar() {
        document.body.classList.remove('sidebar-open');
    }

    // ── Toggle sidebar selon contexte ──
    function toggleSidebar() {
        if (isMobile()) {
            // Mobile : slide in/out
            if (document.body.classList.contains('sidebar-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        } else {
            // Desktop : collapse/expand
            document.body.classList.toggle('sidebar-collapsed');
            // Mémoriser l'état dans localStorage
            var collapsed = document.body.classList.contains('sidebar-collapsed');
            try { localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0'); } catch(e) {}
        }
    }

    // ── Restaurer l'état sidebar au chargement ──
    function restoreSidebarState() {
        if (!isMobile()) {
            try {
                var saved = localStorage.getItem('sidebarCollapsed');
                if (saved === '1') {
                    document.body.classList.add('sidebar-collapsed');
                }
            } catch(e) {}
        }
    }

    // ── Gérer le redimensionnement de la fenêtre ──
    function handleResize() {
        if (!isMobile()) {
            // Sur desktop, fermer le mode mobile si ouvert
            document.body.classList.remove('sidebar-open');
        }
    }

    // ── Fermer sidebar mobile si on clique sur un lien ──
    function bindNavLinks() {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        var links = sidebar.querySelectorAll('.nav-link');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                if (isMobile()) {
                    closeSidebar();
                }
            });
        });
    }

    // ── Initialisation ──
    document.addEventListener('DOMContentLoaded', function () {
        ensureOverlay();
        restoreSidebarState();
        bindNavLinks();

        // Bouton toggle (hamburger)
        var menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function (e) {
                e.preventDefault();
                toggleSidebar();
            });
        }

        // Resize
        window.addEventListener('resize', handleResize);

        // Swipe mobile : fermer avec swipe gauche
        var touchStartX = 0;
        document.addEventListener('touchstart', function (e) {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        document.addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            if (dx < -60 && isMobile()) {   // swipe gauche > 60px
                closeSidebar();
            }
            if (dx > 60 && isMobile()) {    // swipe droit > 60px
                openSidebar();
            }
        }, { passive: true });
    });

})();
