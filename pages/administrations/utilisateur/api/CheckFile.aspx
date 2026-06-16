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
        
        bool exists = File.Exists(path);
        
        Response.Write("{\"exists\":" + exists.ToString().ToLower() + ",\"path\":\"" + path.Replace("\\", "\\\\") + "\"}");
    }
    catch (Exception ex)
    {
        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
        Response.Write("{\"exists\":false,\"message\":\"" + safeMessage + "\"}");
    }
}
</script>