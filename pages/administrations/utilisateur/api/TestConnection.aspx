<%@ Page Language="C#" %>
<%@ Import Namespace="System.Data.SqlClient" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.Clear();
    Response.ContentType = "application/json";
    
    try
    {
        string connectionString = "Data Source=MAHEFA_DESKTOP\\SQLECOLE;Initial Catalog=master;User ID=sa;Password=admin123;";
        
        using (SqlConnection conn = new SqlConnection(connectionString))
        {
            conn.Open();
            Response.Write("{\"success\":true,\"message\":\"Connexion réussie\"}");
        }
    }
    catch (Exception ex)
    {
        Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
}
</script>