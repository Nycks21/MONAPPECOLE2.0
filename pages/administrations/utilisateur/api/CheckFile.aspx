<%@ Page Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.IO" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.Clear();
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    try
    {
        string path = Request.QueryString["path"];
        
        if (string.IsNullOrEmpty(path))
        {
            Response.Write("{\"exists\":false,\"message\":\"Chemin manquant\"}");
            return;
        }
        
        // ✅ Remplacer les / par des \ pour Windows
        string windowsPath = path.Replace("/", "\\");
        
        bool exists = File.Exists(windowsPath);
        
        string json = "{\"exists\":" + exists.ToString().ToLower() + ",\"path\":\"" + windowsPath.Replace("\\", "\\\\") + "\"}";
        Response.Write(json);
    }
    catch (Exception ex)
    {
        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
        Response.Write("{\"exists\":false,\"message\":\"" + safeMessage + "\"}");
    }
}
</script>