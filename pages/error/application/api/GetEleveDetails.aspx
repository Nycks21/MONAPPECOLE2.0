<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";

    if (Request.HttpMethod != "GET")
    {
        Response.StatusCode = 405;
        Response.Write("{\"status\":\"error\",\"message\":\"Méthode non autorisée\"}");
        Response.End();
        return;
    }

    string id = Request.QueryString["id"];
    if (string.IsNullOrEmpty(id))
    {
        Response.StatusCode = 400;
        Response.Write("{\"status\":\"error\",\"message\":\"ID manquant\"}");
        Response.End();
        return;
    }

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            string query = @"
                SELECT NOM, PRENOM, CLASSE, CONTACT
                FROM ELEVES
                WHERE IDELEVES = @Id";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@Id", id);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        string nom = reader["NOM"] != DBNull.Value ? reader["NOM"].ToString() : "";
                        string prenom = reader["PRENOM"] != DBNull.Value ? reader["PRENOM"].ToString() : "";
                        string classe = reader["CLASSE"] != DBNull.Value ? reader["CLASSE"].ToString() : "";
                        string contact = reader["CONTACT"] != DBNull.Value ? reader["CONTACT"].ToString() : "";

                        var result = new
                        {
                            libelle = (prenom + " " + nom).Trim(),
                            classe = classe,
                            contact = contact
                        };

                        var serializer = new JavaScriptSerializer();
                        string json = serializer.Serialize(result);
                        Response.Write(json);
                    }
                    else
                    {
                        Response.StatusCode = 404;
                        Response.Write("{\"status\":\"error\",\"message\":\"Élève non trouvé\"}");
                    }
                }
            }
        }
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        Response.Write("{\"status\":\"error\",\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
    Response.End();
}
</script>
