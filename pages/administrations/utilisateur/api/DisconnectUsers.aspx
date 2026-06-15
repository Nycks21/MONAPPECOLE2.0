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
        // Vérifier que l'utilisateur est SuperAdmin
        if (Session["authenticated"] == null || !(bool)Session["authenticated"])
        {
            Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }
        
        int currentUserId = Session["IDUSER"] != null ? Convert.ToInt32(Session["IDUSER"]) : 0;
        
        // Récupérer le rôle de l'utilisateur actuel
        int currentRole = Session["USERROLE"] != null ? Convert.ToInt32(Session["USERROLE"]) : -1;
        
        if (currentRole != 0)
        {
            Response.Write("{\"success\":false,\"message\":\"Seul un SuperAdmin peut déconnecter les utilisateurs\"}");
            return;
        }
        
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
        
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            
            // Déconnecter tous les utilisateurs SAUF le SuperAdmin actuel
            // et SAUF les autres SuperAdmin
            string sql = @"
                UPDATE USERS 
                SET SESSION_TOKEN = NULL, 
                    LAST_PC = NULL,
                    LAST_LOGIN = DATEADD(MINUTE, -5, GETDATE())
                WHERE IDUSER != @CurrentUserId 
                AND ROLEID != 0";  // Ne pas déconnecter les autres SuperAdmin
            
            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@CurrentUserId", currentUserId);
                int affected = cmd.ExecuteNonQuery();
                
                Response.Write("{\"success\":true,\"message\":\"" + affected + " utilisateur(s) déconnecté(s)\", \"count\":" + affected + "}");
            }
        }
    }
    catch (Exception ex)
    {
        Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
}
</script>