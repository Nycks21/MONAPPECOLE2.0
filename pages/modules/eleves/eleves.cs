using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;

public partial class eleves : Page
{
    string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    protected void Page_Load(object sender, EventArgs e)
    {
        // ============================
        // SÉCURITÉ : SESSION
        // ============================
        if (Session["authenticated"] == null || !(bool)Session["authenticated"])
        {
            ForceLogout(false);
            return;
        }

        // ============================
        // TOKEN (autre PC)
        // ============================
        if (!IsTokenValid()) 
        {
            ForceLogout(true);
            return;
        }

        if (!IsPostBack)
        {
            SetUsername();
            // L'appel à HandleIdentificationMenu() est supprimé ici
        }
    }

    private bool IsTokenValid()
    {
        if (Session["IDUSER"] == null || Session["SESSION_TOKEN"] == null)
            return false;

        int idUser = (int)Session["IDUSER"];
        string tokenSession = Session["SESSION_TOKEN"].ToString();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            SqlCommand cmd = new SqlCommand(
                "SELECT SESSION_TOKEN FROM USERS WHERE IDUSER=@id", conn);
            cmd.Parameters.AddWithValue("@id", idUser);

            conn.Open();
            object tokenDb = cmd.ExecuteScalar();
            return tokenDb != null && tokenDb.ToString() == tokenSession;
        }
    }

    private void SetUsername()
    {
        if (Session["username"] == null) return;

        string username = Session["username"].ToString().Replace("'", "\\'");

        string script =
            "document.addEventListener('DOMContentLoaded',function(){" +
            "var el=document.getElementById('navbarUsername');" +
            "if(el){el.innerText='" + username + "';}" +
            "});";

        ClientScript.RegisterStartupScript(
            GetType(), "username", script, true);
    }

    // La méthode HandleIdentificationMenu() a été supprimée

    private void ForceLogout(bool otherPc)
    {
        Session.Clear();
        Session.Abandon();

        if (otherPc)
            Response.Redirect("~/auth/Login.aspx?msg=other_pc", true);
        else
            Response.Redirect("~/auth/Login.aspx", true);
    }
}
