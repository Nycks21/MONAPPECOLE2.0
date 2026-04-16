<%@ Page Language="C#" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Services" %>

<script runat="server">

    static string connStr =
        ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    [WebMethod]
    public static string UpdateEleve(EleveDTO eleve)
    {
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            SqlCommand cmd = new SqlCommand(@"
                UPDATE ELEVES SET
                    MATRICULE = @Matricule,
                    NOM = @Nom,
                    PRENOM = @Prenom,
                    BIRTHDAY = @Birthday,
                    SEXE = @Sexe,
                    CLASSE = @Classe,
                    NOMPERE = @NomPere,
                    NOMMERE = @NomMere,
                    CONTACT = @Contact,
                    ADRESSE = @Adresse,
                    PATH = @Path
                WHERE IDELEVES = @IDELEVES", conn);

            cmd.Parameters.AddWithValue("@IDELEVES", eleve.IDELEVES);

            cmd.Parameters.AddWithValue("@Matricule", (object)eleve.Matricule ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Nom", (object)eleve.Nom ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Prenom", (object)eleve.Prenom ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Birthday", (object)eleve.Birthday ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Sexe", (object)eleve.Sexe ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Classe", (object)eleve.Classe ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@NomPere", (object)eleve.NomPere ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@NomMere", (object)eleve.NomMere ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Contact", (object)eleve.Contact ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Adresse", (object)eleve.Adresse ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@Path", (object)eleve.Path ?? DBNull.Value);

            return cmd.ExecuteNonQuery() > 0 ? "UPDATED" : "NOT_FOUND";
        }
    }

    // DTO à adapter selon ta structure côté client
    public class EleveDTO
    {
        public int IDELEVES { get; set; }
        public string Matricule { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public DateTime? Birthday { get; set; }
        public string Sexe { get; set; }
        public string Classe { get; set; }
        public string NomPere { get; set; }
        public string NomMere { get; set; }
        public string Contact { get; set; }
        public string Adresse { get; set; }
        public string Path { get; set; }
    }
</script>
