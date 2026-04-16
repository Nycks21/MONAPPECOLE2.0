<%@ Page Language="C#" %>
<%@ Import Namespace="System" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Web" %>

<script runat="server">

    string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";

    if (Request.HttpMethod != "POST")
    {
        Response.StatusCode = 405;
        Response.Write("{\"error\":\"Méthode non autorisée\"}");
        Response.End();
        return;
    }

    try
    {
        string savePath = Server.MapPath("~/img/");
        if (!System.IO.Directory.Exists(savePath))
            System.IO.Directory.CreateDirectory(savePath);

        string fileName = null;
        if (Request.Files.Count > 0)
        {
            var file = Request.Files["ImageFile"];
            if (file != null && file.ContentLength > 0)
            {
                fileName = System.IO.Path.GetFileName(file.FileName);
                string fullPath = System.IO.Path.Combine(savePath, fileName);

                // Tu peux ajouter un contrôle sur le type ou taille du fichier ici si tu veux
                file.SaveAs(fullPath);
            }
        }

        // Récupérer les autres champs depuis Request.Form
        string matricule = Request.Form["Matricule"];
        string nom = Request.Form["Nom"];
        string prenom = Request.Form["Prenom"];
        string birthdayStr = Request.Form["Birthday"];
        string sexe = Request.Form["Sexe"];
        string classe = Request.Form["Classe"];
        string nPere = Request.Form["NPere"];
        string nMere = Request.Form["NMere"];
        string contact = Request.Form["Contact"];
        string adresse = Request.Form["Adresse"];

        DateTime birthday;
        DateTime? nullableBirthday = DateTime.TryParse(birthdayStr, out birthday) ? birthday : (DateTime?)null;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            SqlCommand cmd = new SqlCommand(@"
                INSERT INTO ELEVES
                (MATRICULE, NOM, PRENOM, BIRTHDAY, SEXE, CLASSE, NOMPERE, NOMMERE, CONTACT, ADRESSE, PATH)
                VALUES
                (@MATRICULE, @NOM, @PRENOM, @BIRTHDAY, @SEXE, @CLASSE, @NOMPERE, @NOMMERE, @CONTACT, @ADRESSE, @PATH)", conn);

            cmd.Parameters.AddWithValue("@MATRICULE", string.IsNullOrEmpty(matricule) ? (object)DBNull.Value : matricule);
            cmd.Parameters.AddWithValue("@NOM", string.IsNullOrEmpty(nom) ? (object)DBNull.Value : nom);
            cmd.Parameters.AddWithValue("@PRENOM", string.IsNullOrEmpty(prenom) ? (object)DBNull.Value : prenom);
            cmd.Parameters.AddWithValue("@BIRTHDAY", nullableBirthday.HasValue ? (object)nullableBirthday.Value : DBNull.Value);
            cmd.Parameters.AddWithValue("@SEXE", string.IsNullOrEmpty(sexe) ? (object)DBNull.Value : sexe);
            cmd.Parameters.AddWithValue("@CLASSE", string.IsNullOrEmpty(classe) ? (object)DBNull.Value : classe);
            cmd.Parameters.AddWithValue("@NOMPERE", string.IsNullOrEmpty(nPere) ? (object)DBNull.Value : nPere);
            cmd.Parameters.AddWithValue("@NOMMERE", string.IsNullOrEmpty(nMere) ? (object)DBNull.Value : nMere);
            cmd.Parameters.AddWithValue("@CONTACT", string.IsNullOrEmpty(contact) ? (object)DBNull.Value : contact);
            cmd.Parameters.AddWithValue("@ADRESSE", string.IsNullOrEmpty(adresse) ? (object)DBNull.Value : adresse);
            cmd.Parameters.AddWithValue("@PATH", string.IsNullOrEmpty(fileName) ? (object)DBNull.Value : fileName);

            cmd.ExecuteNonQuery();
        }

        Response.Write("{\"status\":\"OK\"}");
    }
    catch (Exception ex)
    {
        Response.Clear();
        Response.StatusCode = 500;
        Response.ContentType = "application/json";
        Response.Write("{\"error\":\"" + HttpUtility.JavaScriptStringEncode(ex.Message) + "\"}");
        Response.End();
    }
}


</script>
