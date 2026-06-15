<%@ Page Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.IO" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.Clear();
    
    try
    {
        string action = Request.QueryString["action"];
        
        if (action == "prepare")
        {
            PrepareBackup();
        }
        else if (action == "execute")
        {
            ExecuteBackup();
        }
        else if (action == "check")
        {
            CheckBackup();
        }
        else
        {
            Response.ContentType = "application/json";
            Response.Write("{\"success\":false,\"message\":\"Action non reconnue\"}");
        }
    }
    catch (Exception ex)
    {
        Response.ContentType = "application/json";
        Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
}

private string GetBackupFolder()
{
    string folder = Server.MapPath("~/App_Data/Backups");
    if (!Directory.Exists(folder))
    {
        Directory.CreateDirectory(folder);
    }
    return folder;
}

private void PrepareBackup()
{
    string time = Request.QueryString["time"];
    if (string.IsNullOrEmpty(time)) time = DateTime.Now.AddMinutes(5).ToString("HH:mm");
    
    Application.Lock();
    Application["MaintenanceMode"] = true;
    Application["MaintenanceTime"] = time;
    Application.UnLock();
    
    Response.ContentType = "application/json";
    Response.Write("{\"success\":true,\"message\":\"Sauvegarde programmée à " + time + "\"}");
}

private void ExecuteBackup()
{
    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
        
        if (string.IsNullOrEmpty(connStr))
        {
            Response.ContentType = "application/json";
            Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion non trouvée\"}");
            return;
        }
        
        string backupFolder = GetBackupFolder();
        string fileName = "backup_" + DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".bak";
        string filePath = Path.Combine(backupFolder, fileName);
        string dbName = "MONAPPECOLE2";
        
        // Sauvegarde de la base de données
        string sql = "BACKUP DATABASE [" + dbName + "] TO DISK = N'" + filePath + "' WITH FORMAT";
        
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                cmd.CommandTimeout = 300;
                int result = cmd.ExecuteNonQuery();
            }
        }
        
        // Vérifier que le fichier a été créé
        if (File.Exists(filePath))
        {
            // Nettoyer les flags de maintenance
            Application.Lock();
            Application["MaintenanceMode"] = false;
            Application.Remove("MaintenanceTime");
            Application.UnLock();
            
            // Obtenir la taille du fichier
            FileInfo fileInfo = new FileInfo(filePath);
            long fileSize = fileInfo.Length;
            string sizeText = FormatFileSize(fileSize);
            
            // Lire le fichier pour le téléchargement
            byte[] bytes = File.ReadAllBytes(filePath);
            
            // Envoyer le fichier en téléchargement
            Response.Clear();
            Response.ContentType = "application/octet-stream";
            Response.AppendHeader("Content-Disposition", "attachment; filename=" + fileName);
            Response.BinaryWrite(bytes);
            
            // Note : Le fichier reste dans App_Data/Backups pour archivage
        }
        else
        {
            Response.ContentType = "application/json";
            Response.Write("{\"success\":false,\"message\":\"Le fichier de sauvegarde n'a pas été créé\"}");
        }
    }
    catch (Exception ex)
    {
        try
        {
            Application.Lock();
            Application["MaintenanceMode"] = false;
            Application.Remove("MaintenanceTime");
            Application.UnLock();
        }
        catch { }
        
        Response.ContentType = "application/json";
        Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
}

private string FormatFileSize(long bytes)
{
    string[] sizes = { "o", "Ko", "Mo", "Go", "To" };
    double len = bytes;
    int order = 0;
    while (len >= 1024 && order < sizes.Length - 1)
    {
        order++;
        len = len / 1024;
    }
    return string.Format("{0:0.##} {1}", len, sizes[order]);
}

private void CheckBackup()
{
    bool isMaintenance = false;
    string time = "";
    
    try
    {
        if (Application["MaintenanceMode"] != null)
        {
            isMaintenance = (bool)Application["MaintenanceMode"];
        }
        if (isMaintenance && Application["MaintenanceTime"] != null)
        {
            time = Application["MaintenanceTime"].ToString();
        }
    }
    catch { }
    
    Response.ContentType = "application/json";
    Response.Write("{\"success\":true,\"isMaintenance\":" + (isMaintenance ? "true" : "false") + ",\"maintenanceTime\":\"" + time + "\"}");
}
</script>