/* ═══════════════════════════════════════════════════════════════
   global.js — Gestion Scolaire
   Menu toggle adapté à global.css :
     • Desktop : .main-sidebar  ↔  .sidebar-collapsed  (250px → 60px)
     •           .content-wrapper ↔  .sidebar-collapsed  (margin-left suit)
     •           .main-header  ↔  left: 60px  (via CSS var --sidebar-w)
     • Mobile  : .main-sidebar  ↔  .sidebar-open  (slide-in depuis -250px)
                 + overlay pour fermer en cliquant en dehors
═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── Seuil mobile (doit correspondre au breakpoint du CSS) ────────────────
    var MOBILE_BREAKPOINT = 768;

    // ── Création de l'overlay (utilisé en mode mobile) ───────────────────────
    var overlay = document.createElement('div');
    overlay.id = 'sidebarOverlay';
    overlay.style.cssText = [
        'display:none',
        'position:fixed',
        'inset:0',
        'background:rgba(0,0,0,.45)',
        'z-index:1050'
    ].join(';');
    document.body.appendChild(overlay);

    // ── Références DOM (résolues après DOMContentLoaded) ─────────────────────
    var sidebar, contentWrapper, mainHeader;

    function init() {
        sidebar = document.getElementById('sidebar');
        contentWrapper = document.getElementById('contentWrapper');
        mainHeader = document.querySelector('.main-header');

        if (!sidebar) return; // page sans sidebar (ex: Login)

        // Fermer la sidebar en cliquant sur l'overlay (mobile)
        overlay.addEventListener('click', closeSidebarMobile);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function isMobile() {
        return window.innerWidth <= MOBILE_BREAKPOINT;
    }

    function openSidebarMobile() {
        sidebar.classList.add('sidebar-open');
        sidebar.classList.remove('sidebar-collapsed');
        overlay.style.display = 'block';
    }

    function closeSidebarMobile() {
        sidebar.classList.remove('sidebar-open');
        overlay.style.display = 'none';
    }

    function toggleDesktop() {
        var collapsed = sidebar.classList.toggle('sidebar-collapsed');

        // Le content-wrapper et la topbar suivent via CSS :
        //   .content-wrapper.sidebar-collapsed { margin-left: 60px }
        //   .main-header suit automatiquement (left: var(--sidebar-w))
        //   → on ajoute/retire la classe sur content-wrapper aussi
        if (contentWrapper) {
            if (collapsed) {
                contentWrapper.classList.add('sidebar-collapsed');
            } else {
                contentWrapper.classList.remove('sidebar-collapsed');
            }
        }

        // Ajuste le left de la topbar si elle ne suit pas via CSS variable
        if (mainHeader) {
            mainHeader.style.left = collapsed ? '60px' : '250px';
        }
    }

    // ── Gestionnaire principal du bouton burger ───────────────────────────────
    document.addEventListener('click', function (e) {
        var toggle = e.target && (
            e.target.id === 'menuToggle' ||
            e.target.closest('#menuToggle')
        );
        if (!toggle) return;

        if (!sidebar) {
            sidebar = document.getElementById('sidebar');
            contentWrapper = document.getElementById('contentWrapper');
            mainHeader = document.querySelector('.main-header');
        }
        if (!sidebar) return;

        if (isMobile()) {
            // Mobile : slide depuis la gauche
            if (sidebar.classList.contains('sidebar-open')) {
                closeSidebarMobile();
            } else {
                openSidebarMobile();
            }
        } else {
            // Desktop : rétrécissement (250px ↔ 60px)
            toggleDesktop();
        }
    });

    // ── Fermer la sidebar mobile si on redimensionne vers desktop ────────────
    window.addEventListener('resize', function () {
        if (!isMobile()) {
            closeSidebarMobile();
        }
    });

    // ── Notifications dropdown ────────────────────────────────────────────────
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

    // ── Plein écran ───────────────────────────────────────────────────────────
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

    // ── Badge version (bas gauche) ───────────────────────────────────────────
    function injectVersionBadge() {
        var version = document.body
            ? document.body.getAttribute('data-version')
            : null;
        if (!version) return; // pas de data-version sur cette page = pas de badge

        var badge = document.createElement('div');
        badge.id = 'appVersionBadge';
        badge.textContent = 'v' + version;
        document.body.appendChild(badge);
    }

    // ── Init au chargement ────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init();
            injectVersionBadge();
        });
    } else {
        init();
        injectVersionBadge();
    }

    let lottieAnimation;

    function initLottie() {
        lottieAnimation = lottie.loadAnimation({
            container: document.getElementById('lottieContainer'), // le container HTML
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '../../_assets/json/lottieflow-loading-08-000000-easey.json' // Ajustez le chemin vers votre fichier
        });
    }

    // Appelez l'initialisation dans le ready
    $(document).ready(() => {
        initLottie();
        // ... reste de votre code
    });

})();
