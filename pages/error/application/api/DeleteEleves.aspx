<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.IO" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";

    if (Request.HttpMethod != "POST")
    {
        Response.StatusCode = 405;
        Response.Write("{\"status\":\"error\",\"message\":\"Méthode non autorisée\"}");
        Response.End();
        return;
    }

    string id = Request.Form["id"];
    int idInt;

    if (string.IsNullOrEmpty(id) || !int.TryParse(id, out idInt))
    {
        Response.StatusCode = 400;
        Response.Write("{\"status\":\"error\",\"message\":\"ID manquant ou invalide\"}");
        Response.End();
        return;
    }

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
        string fileName = null;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            // 1️⃣ Récupérer le nom du fichier depuis PATH
            using (SqlCommand cmdGet = new SqlCommand(
                "SELECT PATH FROM ELEVES WHERE IDELEVES = @Id", conn))
            {
                cmdGet.Parameters.AddWithValue("@Id", idInt);
                object result = cmdGet.ExecuteScalar();

                if (result != null && result != DBNull.Value)
                    fileName = result.ToString();
            }

            // 2️⃣ Supprimer l'enregistrement
            using (SqlCommand cmdDelete = new SqlCommand(
                "DELETE FROM ELEVES WHERE IDELEVES = @Id", conn))
            {
                cmdDelete.Parameters.AddWithValue("@Id", idInt);
                int rows = cmdDelete.ExecuteNonQuery();

                if (rows == 0)
                {
                    Response.StatusCode = 404;
                    Response.Write("{\"status\":\"error\",\"message\":\"Élève introuvable\"}");
                    Response.End();
                    return;
                }
            }
        }

        // 3️⃣ Supprimer le fichier image
        if (!string.IsNullOrWhiteSpace(fileName))
        {
            string fullPath = Server.MapPath("~/img/" + fileName);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }

        Response.Write("{\"status\":\"success\",\"message\":\"Élève et photo supprimés avec succès\"}");
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        string safeMessage = ex.Message.Replace("\"", "'");
        Response.Write("{\"status\":\"error\",\"message\":\"" + safeMessage + "\"}");
    }

    Response.End();
}
</script>
