<%@ Page Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.IO" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.Clear();
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    try
    {
        if (Session["authenticated"] == null || !(bool)Session["authenticated"])
        {
            Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }
        
        int userRole = Session["USERROLE"] != null ? Convert.ToInt32(Session["USERROLE"]) : -1;
        if (userRole != 0)
        {
            Response.Write("{\"success\":false,\"message\":\"Droits insuffisants\"}");
            return;
        }
        
        if (Request.Files.Count == 0)
        {
            Response.Write("{\"success\":false,\"message\":\"Aucun fichier reçu\"}");
            return;
        }
        
        HttpPostedFile file = Request.Files[0];
        string fileName = Path.GetFileName(file.FileName);
        
        if (!fileName.ToLower().EndsWith(".bak"))
        {
            Response.Write("{\"success\":false,\"message\":\"Le fichier doit être au format .bak\"}");
            return;
        }
        
        // Vérifier la taille (max 100 Mo)
        if (file.ContentLength > 100 * 1024 * 1024)
        {
            Response.Write("{\"success\":false,\"message\":\"Le fichier dépasse la taille maximale de 100 Mo\"}");
            return;
        }
        
        string tempFolder = Server.MapPath("~/App_Data/Backups");
        if (!Directory.Exists(tempFolder))
        {
            Directory.CreateDirectory(tempFolder);
        }
        
        string tempFilePath = Path.Combine(tempFolder, "restore_" + DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".bak");
        file.SaveAs(tempFilePath);
        
        // Vérifier que le fichier a bien été sauvegardé
        if (File.Exists(tempFilePath))
        {
            FileInfo info = new FileInfo(tempFilePath);
            Response.Write("{\"success\":true,\"filePath\":\"" + tempFilePath.Replace("\\", "\\\\") + "\",\"message\":\"Fichier uploadé avec succès\",\"size\":" + info.Length + "}");
        }
        else
        {
            Response.Write("{\"success\":false,\"message\":\"Erreur lors de la sauvegarde du fichier\"}");
        }
    }
    catch (Exception ex)
    {
        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
        Response.Write("{\"success\":false,\"message\":\"" + safeMessage + "\"}");
    }
}
</script>