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

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            string query = @"
                SELECT *
                FROM USERS
                WHERE ROLEID <> 0
                ORDER BY NOM ASC";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                var USERS = new List<Dictionary<string, object>>();

                while (reader.Read())
                {
                    USERS.Add(new Dictionary<string, object>
                    {
                        { "IDUSER", reader["IDUSER"] },
                        { "USERNAME", reader["USERNAME"] },
                        { "NOM", reader["NOM"] },
                        { "PRENOM", reader["PRENOM"] },
                        { "EMAIL", reader["EMAIL"] },
                        { "ROLEID", reader["ROLEID"] },
                        { "ACTIVE", reader["ACTIVE"] },
                    });
                }

                string json = new JavaScriptSerializer().Serialize(USERS);
                Response.Write(json);
            }
        }
    }
    catch (Exception ex)
    {
        string safeMsg = ex.Message.Replace("\"", "'").Replace("\n", " ").Replace("\r", " ");
        Response.Write("{\"success\":false, \"error\":\"" + safeMsg + "\"}");
    }
    finally
    {
        Response.End();
    }
}
</script>
