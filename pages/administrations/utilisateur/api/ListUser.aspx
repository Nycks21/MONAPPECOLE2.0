<%@ Page Language="C#" AutoEventWireup="true" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Collections.Generic" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.Clear();

    // CORS / cache
    Response.AddHeader("Cache-Control", "no-cache, no-store");

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            // Récupérer toutes les colonnes utiles
            // PRENOM peut être absent dans certaines tables — utiliser ISNULL pour sécuriser
            string query = @"
                SELECT IDUSER,
                       USERNAME,
                       NOM,
                       ISNULL(EMAIL, '')      AS EMAIL,
                       ISNULL(TELEPHONE, '') AS TELEPHONE,
                       ROLEID,
                       CREATED_AT,
                       CAST(ISNULL(ACTIVE, 0) AS BIT) AS ACTIVE
                FROM   USERS
                WHERE  ROLEID <> 0
                ORDER  BY NOM ASC";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                var users = new List<Dictionary<string, object>>();

                while (reader.Read())
                {
                    users.Add(new Dictionary<string, object>
                    {
                        { "IDUSER",    reader["IDUSER"] },
                        { "USERNAME",  reader["USERNAME"] },
                        { "NOM",       reader["NOM"] },
                        { "EMAIL",     reader["EMAIL"] },
                        { "TELEPHONE", reader["TELEPHONE"] },
                        { "ROLEID",    reader["ROLEID"] },
                        { "CREATED_AT",    reader["CREATED_AT"] },
                        { "ACTIVE",    reader["ACTIVE"] }
                    });
                }

                Response.Write(new JavaScriptSerializer().Serialize(users));
            }
        }
    }
    catch (Exception ex)
    {
        string safe = ex.Message.Replace("\"", "'").Replace("\n", " ").Replace("\r", " ");
        Response.Write("{\"success\":false,\"error\":\"" + safe + "\"}");
    }
    finally
    {
        Response.End();
    }
}
</script>
