<%@ Page Language="C#" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Collections.Generic" %>

<script runat="server">
private string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.Clear();

    try
    {
        if (Request.HttpMethod == "POST")
        {
            string userCrea = "SYSTEM";
            if (Session != null && Session["username"] != null)
            {
                userCrea = Session["username"].ToString();
            }

            // Lire le JSON envoyé
            string jsonString = new System.IO.StreamReader(Request.InputStream).ReadToEnd();
            var data = new JavaScriptSerializer().Deserialize<Dictionary<string, string>>(jsonString);

            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();

                using (SqlCommand cmd = new SqlCommand(
                    @"INSERT INTO CLASSES (LABEL) VALUES (@LABEL)", conn))
                {
                    // Valeur sécurisée pour le paramètre LABEL
                    string label = "";
                    if (data.ContainsKey("LABEL") && data["LABEL"] != null)
                    {
                        label = data["LABEL"].Trim();
                    }
                    if (string.IsNullOrEmpty(label))
                    {
                        Response.StatusCode = 400;
                        Response.Write(new JavaScriptSerializer().Serialize(new
                        {
                            success = false,
                            message = "Le champ LABEL est obligatoire."
                        }));
                        Response.End();
                        return;
                    }

                    cmd.Parameters.AddWithValue("@LABEL", label);
                    int rows = cmd.ExecuteNonQuery();

                    Response.Write(new JavaScriptSerializer().Serialize(new
                    {
                        success = rows > 0,
                        message = rows > 0 ? "Classe ajoutée avec succès." : "Aucune ligne insérée."
                    }));
                }
            }
        }
        else
        {
            Response.StatusCode = 405; // Méthode non autorisée
            Response.Write(new JavaScriptSerializer().Serialize(new
            {
                success = false,
                message = "Méthode HTTP non supportée, utilisez POST."
            }));
        }
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        Response.Write(new JavaScriptSerializer().Serialize(new
        {
            success = false,
            message = ex.Message.Replace("\"", "'").Replace("\r", "").Replace("\n", "")
        }));
    }
    finally
    {
        Response.Flush();
        Response.End();
    }
}
</script>
