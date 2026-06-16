<%@ Page Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.IO" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.Clear();
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    try
    {
        // Lire le corps de la requête
        string jsonBody = "";
        using (var reader = new StreamReader(Request.InputStream))
        {
            jsonBody = reader.ReadToEnd();
        }
        
        // Analyser le JSON
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        var data = serializer.Deserialize<Dictionary<string, object>>(jsonBody);
        
        string filePath = data.ContainsKey("filePath") ? data["filePath"].ToString() : "";
        string databaseName = data.ContainsKey("databaseName") ? data["databaseName"].ToString() : "MONAPPECOLE2";
        
        if (string.IsNullOrEmpty(filePath))
        {
            Response.Write("{\"success\":false,\"message\":\"Chemin du fichier manquant\"}");
            return;
        }
        
        // Remplacer les / par des \ pour Windows
        string windowsPath = filePath.Replace("/", "\\");
        
        if (!File.Exists(windowsPath))
        {
            Response.Write("{\"success\":false,\"message\":\"Le fichier n'existe pas: " + windowsPath + "\"}");
            return;
        }
        
        // ✅ CHAÎNE DE CONNEXION HARDCODÉE - Remplacez par vos identifiants
        string connectionString = "Data Source=MAHEFA_DESKTOP\\SQLECOLE;Initial Catalog=master;User ID=sa;Password=admin123;";
        
        using (SqlConnection conn = new SqlConnection(connectionString))
        {
            conn.Open();
            
            // ÉTAPE 1: Forcer la déconnexion de tous les utilisateurs
            string killUsersSql = @"
                DECLARE @kill varchar(8000) = '';
                SELECT @kill = @kill + 'KILL ' + CONVERT(varchar(5), spid) + ';'
                FROM master..sysprocesses
                WHERE dbid = DB_ID('" + databaseName + @"')
                AND spid > 50
                AND spid != @@SPID;
                
                IF @kill != ''
                BEGIN
                    EXEC(@kill);
                END
            ";
            
            using (SqlCommand cmd = new SqlCommand(killUsersSql, conn))
            {
                cmd.ExecuteNonQuery();
            }
            
            // ÉTAPE 2: Mettre la base en mode SINGLE_USER
            string setSingleUserSql = @"
                ALTER DATABASE [" + databaseName + @"]
                SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
            ";
            
            using (SqlCommand cmd = new SqlCommand(setSingleUserSql, conn))
            {
                cmd.ExecuteNonQuery();
            }
            
            // ÉTAPE 3: Restaurer la base
            string restoreSql = @"
                RESTORE DATABASE [" + databaseName + @"]
                FROM DISK = N'" + windowsPath.Replace("'", "''") + @"'
                WITH REPLACE, STATS = 10;
            ";
            
            using (SqlCommand cmd = new SqlCommand(restoreSql, conn))
            {
                cmd.CommandTimeout = 3600;
                cmd.ExecuteNonQuery();
            }
            
            // ÉTAPE 4: Remettre la base en mode MULTI_USER
            string setMultiUserSql = @"
                ALTER DATABASE [" + databaseName + @"]
                SET MULTI_USER;
            ";
            
            using (SqlCommand cmd = new SqlCommand(setMultiUserSql, conn))
            {
                cmd.ExecuteNonQuery();
            }
            
            Response.Write("{\"success\":true,\"message\":\"Restauration r\u00e9ussie\"}");
        }
    }
    catch (Exception ex)
    {
        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
        Response.Write("{\"success\":false,\"message\":\"" + safeMessage + "\"}");
    }
}
</script>