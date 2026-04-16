/**
 * spa-nav.js — Moteur SPA (Single Page Application)
 * =====================================================
 * Écoute tous les liens [data-spa-page] du sidebar,
 * charge le fichier pages/{page}.html via fetch(),
 * injecte le HTML dans <section id="pageContent">,
 * puis appelle le hook d'initialisation de script.js.
 *
 * Chaque fichier pages/{page}.html contient
 * uniquement le contenu de la section (pas de <html>/<head>).
 */

(function () {
    'use strict';

    /* ── Titres et breadcrumbs par page ─────────────────────────── */
    const PAGE_TITLES = {
        dashboard:   'Tableau de bord',
        eleves:      'Liste des élèves',
        absences:    'Retards & Absences',
        frais:       'Frais scolaires',
        bulletins:   'Bulletins de notes',
        classes:     'Gestion des classes',
        matieres:    'Gestion des matières',
        utilisateur: 'Gestion des utilisateurs'
    };

    /* ── Hooks d'initialisation fournis par script.js ────────────── */
    const PAGE_HOOKS = {
        dashboard:   () => { if (typeof loadDashboardData  === 'function') loadDashboardData(); },
        eleves:      () => { if (typeof loadElevesPage     === 'function') loadElevesPage(); },
        absences:    () => { /* données rechargées à la volée */ },
        frais:       () => {
            if (typeof updateFraisStats    === 'function') updateFraisStats();
            if (typeof populateStudentSelect === 'function') populateStudentSelect();
            if (typeof filterFraisTable    === 'function') filterFraisTable();
        },
        bulletins:   () => { /* tableau rendu dans le HTML injecté */ },
        classes:     () => { /* tableau rendu dans le HTML injecté */ },
        matieres:    () => { /* tableau rendu dans le HTML injecté */ },
        utilisateur: () => { /* tableau rendu dans le HTML injecté */ }
    };

    /* ── État courant ─────────────────────────────────────────────── */
    let currentPage = null;

    /* ── Utilitaires DOM ──────────────────────────────────────────── */
    function showSpinner() {
        const el = document.getElementById('spinnerOverlay');
        if (el) el.classList.add('show');
    }
    function hideSpinner() {
        const el = document.getElementById('spinnerOverlay');
        if (el) el.classList.remove('show');
    }
    function setActiveLink(page) {
        document.querySelectorAll('.sidebar .nav-link').forEach(a => a.classList.remove('active'));
        const link = document.querySelector(`.sidebar [data-spa-page="${page}"]`);
        if (link) link.classList.add('active');
    }
    function setHeader(page) {
        const title = PAGE_TITLES[page] || page;
        const titleEl = document.getElementById('dynPageTitle');
        const crumbEl = document.getElementById('dynBreadcrumb');
        if (titleEl) titleEl.textContent = title;
        if (crumbEl) crumbEl.textContent = title;
    }

    /* ── Chargement d'une page ───────────────────────────────────── */
    function navigateTo(page) {
        if (page === currentPage) return;
        currentPage = page;

        setActiveLink(page);
        setHeader(page);
        showSpinner();

        fetch(`pages/${page}.html?_=${Date.now()}`)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status} — pages/${page}.html introuvable`);
                return res.text();
            })
            .then(html => {
                const section = document.getElementById('pageContent');
                section.innerHTML = html;

                /* Exécuter les éventuels <script> inline dans le fragment */
                section.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    newScript.textContent = oldScript.textContent;
                    document.body.appendChild(newScript);
                    document.body.removeChild(newScript);
                });

                /* Appeler le hook d'initialisation */
                const hook = PAGE_HOOKS[page];
                if (typeof hook === 'function') hook();
            })
            .catch(err => {
                const section = document.getElementById('pageContent');
                section.innerHTML = `
                    <div class="dash-card" style="margin-top:20px;">
                        <div class="dash-card-body text-center" style="padding:40px;">
                            <i class="fas fa-exclamation-triangle" style="font-size:48px;color:var(--danger);"></i>
                            <h3 style="margin-top:16px;">Page introuvable</h3>
                            <p style="color:#6c757d;">${err.message}</p>
                            <p style="color:#6c757d;font-size:12px;">
                                Vérifiez que le fichier <code>pages/${page}.html</code> existe sur le serveur.
                            </p>
                        </div>
                    </div>`;
                console.error('[spa-nav]', err);
            })
            .finally(() => {
                hideSpinner();
            });
    }

    /* ── Initialisation ──────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', () => {

        /* 1. Délégation de clic sur tous les liens [data-spa-page] */
        document.addEventListener('click', e => {
            const link = e.target.closest('[data-spa-page]');
            if (!link) return;
            e.preventDefault();
            navigateTo(link.dataset.spaPage);
        });

        /* 2. Menu toggle (hamburger) */
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                document.getElementById('sidebar').classList.toggle('collapsed');
                document.getElementById('contentWrapper').classList.toggle('expanded');
            });
        }

        /* 3. Notifications dropdown */
        const notifToggle = document.getElementById('notifToggle');
        if (notifToggle) {
            notifToggle.addEventListener('click', e => {
                e.stopPropagation();
                document.getElementById('notifDropdown').classList.toggle('show');
            });
            document.addEventListener('click', () => {
                const dd = document.getElementById('notifDropdown');
                if (dd) dd.classList.remove('show');
            });
        }

        /* 4. Fullscreen */
        const fsToggle = document.getElementById('fullscreenToggle');
        if (fsToggle) {
            fsToggle.addEventListener('click', () => {
                if (!document.fullscreenElement) document.documentElement.requestFullscreen();
                else document.exitFullscreen();
            });
        }

        /* 5. Preloader */
        setTimeout(() => {
            const pl = document.getElementById('preloader');
            if (pl) pl.classList.add('hide');
        }, 800);

        /* 6. Charger la page par défaut */
        navigateTo('dashboard');
    });

    /* ── API publique (utilisable depuis script.js) ───────────────── */
    window.spaNav = { navigateTo };

    /* Rétro-compatibilité : les anciens onclick="loadPage('X')" continuent de fonctionner */
    window.loadPage      = page => navigateTo(page);
    window.loadDashboard = ()   => navigateTo('dashboard');

})();
