<%@ Page Language="C#" AutoEventWireup="true" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Collections.Generic" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json; charset=utf-8";
    Response.Clear();

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            // Requête avec jointure sur la table CLASSES pour récupérer le libellé de la classe
            string query = @"
                SELECT 
                    E.IDELEVES, 
                    E.MATRICULE, 
                    E.NOM, 
                    E.PRENOM, 
                    E.SEXE, 
                    C.LABEL AS ClasseLabel, 
                    E.CONTACT, 
                    E.ADRESSE
                FROM ELEVES E
                LEFT JOIN CLASSES C ON 
                    TRY_CAST(E.CLASSE AS INT) = C.IDCLASSE
                ORDER BY E.NOM ASC";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                var users = new List<Dictionary<string, object>>();

                while (reader.Read())
                {
                    users.Add(new Dictionary<string, object>
                    {
                        { "IDELEVES", reader["IDELEVES"] },
                        { "Matricule", reader["MATRICULE"] },
                        { "Nom", reader["NOM"] },
                        { "Prenom", reader["PRENOM"] },
                        { "Sexe", reader["SEXE"] },
                        { "Classe", reader["ClasseLabel"] != DBNull.Value ? reader["ClasseLabel"] : "" }, // libellé classe
                        { "Contact", reader["CONTACT"] },
                        { "Adresse", reader["ADRESSE"] }
                    });
                }

                string json = new JavaScriptSerializer().Serialize(users);
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
        Response.Flush();
        Response.End();
    }
}
</script>
