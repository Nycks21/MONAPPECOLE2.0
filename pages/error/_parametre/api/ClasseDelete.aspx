<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";

    if (Request.HttpMethod != "POST")
    {
        Response.StatusCode = 405;
        Response.Write("{\"status\":\"error\",\"message\":\"Méthode non autorisée\"}");
        return;
    }

    string id = Request.Form["id"];
    if (string.IsNullOrEmpty(id))
    {
        Response.StatusCode = 400;
        Response.Write("{\"status\":\"error\",\"message\":\"ID manquant\"}");
        return;
    }

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            using (SqlCommand cmd = new SqlCommand("DELETE FROM CLASSES WHERE IDCLASSE = @Id", conn))
            {
                cmd.Parameters.AddWithValue("@Id", id);
                int rows = cmd.ExecuteNonQuery();

                if (rows > 0)
                    Response.Write("{\"status\":\"success\",\"message\":\"Classe supprimé avec succès\"}");
                else
                    Response.Write("{\"status\":\"error\",\"message\":\"Aucun Classe trouvé avec cet ID\"}");
            }
        }
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        Response.Write("{\"status\":\"error\",\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
}
</script>
