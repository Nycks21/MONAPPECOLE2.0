using System;
using System.Data.SqlClient;
using System.Configuration;

namespace MonAppEcole.pages._parametre
{
    public partial class parammatiere : System.Web.UI.Page
    {
        protected string connectedmatiere = "";
        protected string connectedUsername = "";

        // Connexion sécurisée via Web.config
        protected readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        protected void Page_Load(object sender, EventArgs e)
        {
            // ============================
            // SÉCURITÉ : SESSION EXISTANTE
            // ============================
            if (Session["authenticated"] == null || !(Session["authenticated"] is bool) || !(bool)Session["authenticated"])
            {
                ForceLogout(false);
                return;
            }


            // ============================
            // SÉCURITÉ : TOKEN (AUTRE PC)
            // ============================
            if (!IsTokenValid())
            {
                ForceLogout(true);
                return;
            }

            // ============================
            // AFFICHAGE classe NAVBAR
            // ============================
            if (Session["username"] != null)
            {
                connectedUsername = Session["username"].ToString();
            }
        }

        // ============================
        // VÉRIFICATION TOKEN
        // ============================
        private bool IsTokenValid()
        {
            if (Session["IDUSER"] == null || Session["SESSION_TOKEN"] == null)
                return false;

            int idUser;
            if (!int.TryParse(Session["IDUSER"].ToString(), out idUser))
                return false;

            try
            {
                using (SqlConnection conn = new SqlConnection(connStr))
                using (SqlCommand cmd = new SqlCommand("SELECT SESSION_TOKEN FROM USERS WHERE IDUSER = @id", conn))
                {
                    cmd.Parameters.AddWithValue("@id", idUser);
                    conn.Open();
                    object result = cmd.ExecuteScalar();

                    return result != null && result.ToString() == Session["SESSION_TOKEN"].ToString();
                }
            }
            catch (Exception ex)
            {
                // Logue l'erreur ou gère-la selon ta politique (ex: logger en fichier)
                ShowError("Erreur lors de la vérification du token.");
                return false;
            }
        }


        // ============================
        // LOGOUT CENTRALISÉ
        // ============================
        private void ForceLogout(bool otherPc)
        {
            Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");

            Session.Clear();
            Session.Abandon();

            if (otherPc)
                Response.Redirect("~/auth/Login.aspx?msg=other_pc", true);
            else
                Response.Redirect("~/auth/Login.aspx", true);
        }

        // ============================
        // AFFICHAGE ERREUR SIMPLE
        // ============================
        private void ShowError(string message)
        {
            // Exemple simple avec JavaScript alert (à personnaliser)
            string safeMsg = message.Replace("'", "\\'").Replace("\r", "").Replace("\n", "");
            Response.Write("<script>alert('" + safeMsg + "');</script>");
        }
    }
}
