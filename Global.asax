<%@ Application Language="C#" %>
<script runat="server">
    protected void Application_BeginRequest(object sender, EventArgs e)
    {
        var ctx = HttpContext.Current;
        string path = ctx.Request.Path ?? "";

        // ════════════════════════════════════════════════════════════════
        // ✅ BUG CORRIGÉ : CAUSE RACINE DU MIXED CONTENT DERRIÈRE NGROK
        // ════════════════════════════════════════════════════════════════
        // Quand on lance "ngrok http PORT", le site tourne en HTTP en local
        // et ngrok ajoute le HTTPS uniquement côté client. IIS/ASP.NET ne
        // sait donc pas qu'il est en réalité exposé en HTTPS : tout ce que
        // le code serveur génère à partir de Request.Url (redirections,
        // liens absolus, Response.Redirect, etc.) reste en "http://", ce
        // que le navigateur bloque ensuite (Mixed Content) puisque la page
        // a été chargée en "https://".
        //
        // ngrok ajoute automatiquement l'en-tête "X-Forwarded-Proto: https"
        // sur chaque requête transmise. On l'utilise ici pour réécrire le
        // schéma vu par ASP.NET, afin que TOUT le reste du pipeline (y
        // compris Request.Url, Response.Redirect, etc.) se comporte comme
        // si la requête était nativement en HTTPS.
        string forwardedProto = ctx.Request.Headers["X-Forwarded-Proto"];
        if (!string.IsNullOrEmpty(forwardedProto) &&
            forwardedProto.Equals("https", StringComparison.OrdinalIgnoreCase) &&
            !ctx.Request.IsSecureConnection)
        {
            // ServerVariables["HTTPS"] et "SERVER_PORT_SECURE" pilotent la
            // valeur de Request.IsSecureConnection et donc Request.Url.Scheme.
            ctx.Request.ServerVariables.Set("HTTPS", "on");
            ctx.Request.ServerVariables.Set("SERVER_PORT_SECURE", "1");
        }

        // Ignorer fichiers statiques (images, CSS, JS, polices...)
        string lower = path.ToLower();
        if (lower.EndsWith(".css") || lower.EndsWith(".js") || lower.EndsWith(".png") ||
            lower.EndsWith(".jpg") || lower.EndsWith(".jpeg") || lower.EndsWith(".gif") ||
            lower.EndsWith(".woff") || lower.EndsWith(".woff2") || lower.EndsWith(".ttf") ||
            lower.Contains("/plugins/") || lower.Contains("/dist/") || lower.Contains("/content/"))
        {
            return;
        }

        ctx.Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
        ctx.Response.Cache.SetNoStore();
        ctx.Response.Cache.SetExpires(DateTime.UtcNow.AddYears(-1));
        ctx.Response.AppendHeader("Pragma", "no-cache");
        ctx.Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        ctx.Response.AppendHeader("Expires", "0");

        // ✅ Renforcement : si la requête est confirmée HTTPS (réelle ou via
        // X-Forwarded-Proto ci-dessus), on demande aussi au navigateur de
        // préférer systématiquement le HTTPS pour toute ressource de cette
        // page, en filet de sécurité supplémentaire.
        if (ctx.Request.IsSecureConnection)
        {
            ctx.Response.AppendHeader("Content-Security-Policy", "upgrade-insecure-requests");
        }
    }
    protected void Application_Start(object sender, EventArgs e)
    {
        // Augmenter la limite de taille JSON dans le sérialiseur
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;
    }
</script>
