using System;
using System.Data.SqlClient;
using System.Configuration;

public partial class api_CheckClasseUsed : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        // Récupère l'IDCLASSE depuis la query string
        string idClasseStr = Request.QueryString["IDCLASSE"] ?? "";
        int idClasse = 0;

        if (!int.TryParse(idClasseStr, out idClasse))
        {
            // Si pas un entier valide, bloquer la suppression par sécurité
            Response.ContentType = "application/json";
            Response.Write("true");
            Response.End();
            return;
        }

        bool used = false;

        string cs = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection con = new SqlConnection(cs))
        {
            string sql = @"SELECT COUNT(*) FROM ELEVES WHERE CLASSE = @idClasse";

            SqlCommand cmd = new SqlCommand(sql, con);
            cmd.Parameters.AddWithValue("@idClasse", idClasse);

            con.Open();
            int count = (int)cmd.ExecuteScalar();
            used = count > 0;
        }

        // Retour JSON : true si utilisé, false sinon
        Response.ContentType = "application/json";
        Response.Write(used.ToString().ToLower());
        Response.End();
    }
}
