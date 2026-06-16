<%@ Page Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Net" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.Clear();
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    try
    {
        string action = Request.QueryString["action"] ?? "check";
        string currentVersion = Request.QueryString["version"] ?? "2.1.17";
        
        if (action == "check")
        {
            // ✅ Vérifier la version actuelle
            string latestVersion = "2.2.0"; // À mettre à jour manuellement
            bool hasUpdate = IsNewerVersion(latestVersion, currentVersion);
            
            var result = new
            {
                success = true,
                hasUpdate = hasUpdate,
                currentVersion = currentVersion,
                latestVersion = latestVersion,
                releaseDate = "16/06/2026",
                updateSize = "15.2 Mo",
                downloadUrl = "/pages/administrations/utilisateur/updates/update_" + latestVersion + ".zip",
                changelog = new string[]
                {
                    "✨ Nouvelle interface pour la gestion des utilisateurs",
                    "🐛 Correction du bug de sauvegarde automatique",
                    "⚡ Optimisation des requêtes SQL",
                    "🔒 Renforcement de la sécurité des sessions",
                    "📱 Amélioration de l'affichage mobile",
                    "🔄 Synchronisation automatique des données",
                    "📊 Nouveaux rapports de performance"
                },
                lastCheck = DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")
            };
            
            var serializer = new JavaScriptSerializer();
            Response.Write(serializer.Serialize(result));
        }
        else
        {
            Response.Write("{\"success\":false,\"message\":\"Action inconnue\"}");
        }
    }
    catch (Exception ex)
    {
        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
        Response.Write("{\"success\":false,\"message\":\"" + safeMessage + "\"}");
    }
}

private bool IsNewerVersion(string latest, string current)
{
    try
    {
        var latestParts = latest.Split('.');
        var currentParts = current.Split('.');
        
        for (int i = 0; i < Math.Min(latestParts.Length, currentParts.Length); i++)
        {
            int latestNum = int.Parse(latestParts[i]);
            int currentNum = int.Parse(currentParts[i]);
            
            if (latestNum > currentNum) return true;
            if (latestNum < currentNum) return false;
        }
        
        return latestParts.Length > currentParts.Length;
    }
    catch
    {
        return false;
    }
}
</script>