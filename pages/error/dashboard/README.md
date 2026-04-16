# Gestion Scolaire — Architecture SPA

## Structure des fichiers

```
gestion-scolaire/
│
├── dashboard.aspx          ← Coquille principale (topbar, sidebar, modals, scripts)
│
├── pages/                  ← Sections injectées à la demande par spa-nav.js
│   ├── dashboard.html      ← KPIs, graphiques Chart.js, calendrier
│   ├── eleves.html         ← Liste, filtres, pagination élèves
│   ├── absences.html       ← Retards & absences + stats + table
│   ├── frais.html          ← Frais scolaires + filtres + pagination
│   ├── bulletins.html      ← Bulletins par matière
│   ├── classes.html        ← Gestion des classes
│   ├── matieres.html       ← Gestion des matières
│   └── utilisateur.html    ← Gestion des utilisateurs
│
├── js/
│   ├── spa-nav.js          ← ★ Moteur SPA (fetch + injection)
│   ├── script.js           ← Données + toute la logique métier (inchangé)
│   └── chart.umd.min.js    ← Chart.js
│
└── css/
    └── style.css           ← Styles globaux
```

## Principe de fonctionnement

### 1. Liens menu → `data-spa-page`

Chaque lien du sidebar porte un attribut `data-spa-page="nom_page"` :

```html
<a href="#" class="nav-link" data-spa-page="eleves">
    <span>Liste des élèves</span>
</a>
```

### 2. spa-nav.js intercepte les clics

```js
document.addEventListener('click', e => {
    const link = e.target.closest('[data-spa-page]');
    if (!link) return;
    e.preventDefault();
    navigateTo(link.dataset.spaPage);   // → fetch pages/eleves.html
});
```

### 3. Injection dans `<section id="pageContent">`

```js
fetch(`pages/${page}.html`)
    .then(r => r.text())
    .then(html => {
        document.getElementById('pageContent').innerHTML = html;
        // exécute les <script> inline du fragment
        // appelle le hook d'init de script.js
    });
```

### 4. Hooks d'initialisation

Chaque page peut contenir un `<script>` IIFE inline qui s'exécute 
juste après l'injection (ex: pages/absences.html rend le tableau 
depuis `absencesData` qui vit dans script.js).

### 5. Rétro-compatibilité

`spa-nav.js` expose deux alias globaux pour ne pas casser l'existant :

```js
window.loadPage      = page => navigateTo(page);
window.loadDashboard = ()   => navigateTo('dashboard');
```

## Ajouter une nouvelle page

1. Créer `pages/ma-page.html` avec uniquement le contenu `<section>`.
2. Ajouter l'entrée dans `PAGE_TITLES` et `PAGE_HOOKS` dans `spa-nav.js`.
3. Ajouter le lien dans le sidebar de `dashboard.aspx` :
   ```html
   <a href="#" class="nav-link" data-spa-page="ma-page">Ma page</a>
   ```

## Serveur

Les fichiers `pages/*.html` sont servis comme fichiers statiques ordinaires.  
En ASP.NET, aucune configuration supplémentaire n'est nécessaire — 
les fichiers `.html` dans un sous-dossier sont servis directement par IIS.
