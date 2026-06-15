<%@ Page Language="C#" ContentType="application/json" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Data.SqlClient" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    try
    {
        if (Session["authenticated"] == null || !(bool)Session["authenticated"])
        {
            Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }
        
        int currentUserId = Session["IDUSER"] != null ? Convert.ToInt32(Session["IDUSER"]) : 0;
        int currentRole = Session["USERROLE"] != null ? Convert.ToInt32(Session["USERROLE"]) : -1;
        
        if (currentRole != 0)
        {
            Response.Write("{\"success\":false,\"message\":\"Seul un SuperAdmin peut bloquer les utilisateurs\"}");
            return;
        }
        
        string body = new System.IO.StreamReader(Request.InputStream).ReadToEnd();
        int duration = 1;
        
        try
        {
            var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            var data = serializer.Deserialize<Dictionary<string, object>>(body);
            if (data.ContainsKey("duration"))
            {
                duration = Convert.ToInt32(data["duration"]);
            }
        }
        catch { }
        
        DateTime blockUntil = DateTime.Now.AddMinutes(duration);
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
        
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            
            // Ajouter la colonne si elle n'existe pas
            string checkColumn = @"
                IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                               WHERE TABLE_NAME = 'USERS' AND COLUMN_NAME = 'BLOCKED_UNTIL')
                BEGIN
                    ALTER TABLE USERS ADD BLOCKED_UNTIL DATETIME NULL
                END";
            
            using (SqlCommand checkCmd = new SqlCommand(checkColumn, conn))
            {
                checkCmd.ExecuteNonQuery();
            }
            
            // Bloquer tous les utilisateurs SAUF le SuperAdmin actuel
            string sql = @"
                UPDATE USERS 
                SET BLOCKED_UNTIL = @BlockUntil
                WHERE IDUSER != @CurrentUserId AND ROLEID != 0";
            
            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@BlockUntil", blockUntil);
                cmd.Parameters.AddWithValue("@CurrentUserId", currentUserId);
                int affected = cmd.ExecuteNonQuery();
                
                Response.Write("{\"success\":true,\"message\":\"" + affected + " utilisateur(s) bloqué(s) pour " + duration + " minute(s)\", \"count\":" + affected + "}");
            }
        }
    }
    catch (Exception ex)
    {
        Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
}
</script>