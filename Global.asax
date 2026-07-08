<%@ Application Language="C#" %>
<script runat="server">
    protected void Application_BeginRequest(object sender, EventArgs e)
    {
        var ctx = HttpContext.Current;
        string path = ctx.Request.Path ?? "";

        // ════════════════════════════════════════════════════════════════
        // GESTION DE LA LANGUE (MULTI-LANGAGE)
        // ════════════════════════════════════════════════════════════════
        LocalizationHelper.HandleLanguage();

        // ════════════════════════════════════════════════════════════════
        // ✅ BUG CORRIGÉ : CAUSE RACINE DU MIXED CONTENT DERRIÈRE NGROK
        // ════════════════════════════════════════════════════════════════
        string forwardedProto = ctx.Request.Headers["X-Forwarded-Proto"];
        if (!string.IsNullOrEmpty(forwardedProto) &&
            forwardedProto.Equals("https", StringComparison.OrdinalIgnoreCase) &&
            !ctx.Request.IsSecureConnection)
        {
            ctx.Request.ServerVariables.Set("HTTPS", "on");
            ctx.Request.ServerVariables.Set("SERVER_PORT_SECURE", "1");
        }

        // Ignorer fichiers statiques
        string lower = path.ToLower();
        if (lower.EndsWith(".css") || lower.EndsWith(".js") || lower.EndsWith(".png") ||
            lower.EndsWith(".jpg") || lower.EndsWith(".jpeg") || lower.EndsWith(".gif") ||
            lower.EndsWith(".woff") || lower.EndsWith(".woff2") || lower.EndsWith(".ttf") ||
            lower.Contains("/plugins/") || lower.Contains("/dist/") || lower.Contains("/content/") ||
            lower.Contains("/_assets/"))
        {
            return;
        }

        ctx.Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
        ctx.Response.Cache.SetNoStore();
        ctx.Response.Cache.SetExpires(DateTime.UtcNow.AddYears(-1));
        ctx.Response.AppendHeader("Pragma", "no-cache");
        ctx.Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        ctx.Response.AppendHeader("Expires", "0");

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