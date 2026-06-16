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
        
        string backupFolder = Server.MapPath("~/App_Data/Backups");
        var backups = new List<object>();
        
        if (Directory.Exists(backupFolder))
        {
            var files = Directory.GetFiles(backupFolder, "*.bak");
            foreach (string file in files)
            {
                FileInfo info = new FileInfo(file);
                backups.Add(new
                {
                    name = info.Name,
                    path = file,
                    size = info.Length,
                    date = info.LastWriteTime.ToString("dd/MM/yyyy HH:mm:ss"),
                    status = "Disponible"
                });
            }
        }
        
        // Trier par date décroissante
        backups.Sort((a, b) => 
        {
            var aDate = DateTime.Parse((dynamic)a).date;
            var bDate = DateTime.Parse((dynamic)b).date;
            return bDate.CompareTo(aDate);
        });
        
        var serializer = new JavaScriptSerializer();
        Response.Write(serializer.Serialize(new { success = true, backups = backups }));
    }
    catch (Exception ex)
    {
        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
        Response.Write("{\"success\":false,\"message\":\"" + safeMessage + "\"}");
    }
}
</script>