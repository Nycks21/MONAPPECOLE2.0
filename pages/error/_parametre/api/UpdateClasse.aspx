<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.Clear();

    if (Request.HttpMethod != "POST")
    {
        Response.StatusCode = 405;
        Response.Write("{\"status\":\"error\",\"message\":\"Méthode non autorisée\"}");
        return;
    }

    string idStr = Request.Form["IdUtilisateur"];
    string nom = Request.Form["Nom"]?.Trim();
    string prenom = Request.Form["Prenom"]?.Trim();
    string email = Request.Form["Email"]?.Trim();

    if (string.IsNullOrEmpty(idStr) || !int.TryParse(idStr, out int id))
    {
        Response.Write("{\"status\":\"error\",\"message\":\"ID utilisateur invalide ou manquant\"}");
        return;
    }

    if (string.IsNullOrEmpty(nom) || string.IsNullOrEmpty(prenom) || string.IsNullOrEmpty(email))
    {
        Response.Write("{\"status\":\"error\",\"message\":\"Nom, Prénom et Email sont requis\"}");
        return;
    }

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            string query = @"UPDATE Utilisateurs SET 
                                Nom = @Nom,
                                Prenom = @Prenom,
                                Email = @Email
                             WHERE IdUtilisateur = @Id";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.AddWithValue("@Nom", nom);
                cmd.Parameters.AddWithValue("@Prenom", prenom);
                cmd.Parameters.AddWithValue("@Email", email);
                cmd.Parameters.AddWithValue("@Id", id);

                int rows = cmd.ExecuteNonQuery();
                if (rows > 0)
                    Response.Write("{\"status\":\"success\",\"message\":\"Utilisateur mis à jour avec succès\"}");
                else
                    Response.Write("{\"status\":\"error\",\"message\":\"Utilisateur non trouvé\"}");
            }
        }
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        Response.Write("{\"status\":\"error\",\"message\":\"" + ex.Message.Replace("\"","'") + "\"}");
    }
    finally
    {
        Response.End();
    }
}
</script>
