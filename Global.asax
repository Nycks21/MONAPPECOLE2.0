<%@ Application Language="C#" %>
<script runat="server">
    protected void Application_BeginRequest(object sender, EventArgs e)
    {
        var ctx = HttpContext.Current;
        string path = ctx.Request.Path ?? "";

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
    }
</script>
