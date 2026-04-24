using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;

public static class AuthHelper
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    public static void VerifySession(Page page)
    {
        HttpContext context = HttpContext.Current;
        if (context.Session["authenticated"] == null || !(bool)context.Session["authenticated"])
        {
            ForceLogout(page, false);
            return;
        }

        if (!IsTokenValid())
        {
            ForceLogout(page, true);
            return;
        }

        if (!page.IsPostBack)
        {
            SetUsername(page);
        }
    }

    // NOUVELLE MÉTHODE : Vérifie si l'utilisateur est Admin (Role 0)
    public static bool IsSuperAdmin()
    {
        var session = HttpContext.Current.Session;
        if (session["userRole"] == null) return false;
        try
        {
            return Convert.ToInt32(session["userRole"]) == 0;
        }
        catch
        {
            return false;
        }
    }

    // NOUVELLE MÉTHODE : Vérifie si l'utilisateur est Admin (Role 1)
    public static bool IsAdmin()
    {
        var session = HttpContext.Current.Session;
        if (session["userRole"] == null) return false;
        try
        {
            return Convert.ToInt32(session["userRole"]) == 1;
        }
        catch
        {
            return false;
        }
    }

    private static bool IsTokenValid()
    {
        var session = HttpContext.Current.Session;
        if (session["IDUSER"] == null || session["SESSION_TOKEN"] == null) return false;

        int idUser = (int)session["IDUSER"];
        string tokenSession = session["SESSION_TOKEN"].ToString();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            SqlCommand cmd = new SqlCommand("SELECT SESSION_TOKEN FROM USERS WHERE IDUSER=@id", conn);
            cmd.Parameters.AddWithValue("@id", idUser);
            conn.Open();
            object tokenDb = cmd.ExecuteScalar();
            return tokenDb != null && tokenDb.ToString() == tokenSession;
        }
    }

    private static void SetUsername(Page page)
    {
        if (HttpContext.Current.Session["username"] == null) return;
        string username = HttpContext.Current.Session["username"].ToString().Replace("'", "\\'");
        string script = "var el=document.getElementById('navbarUsername'); if(el){el.innerText='" + username + "';}";
        page.ClientScript.RegisterStartupScript(page.GetType(), "username", script, true);
    }

    private static void ForceLogout(Page page, bool otherPc)
    {
        HttpContext.Current.Session.Clear();
        HttpContext.Current.Session.Abandon();
        string url = otherPc ? "~/auth/Login.aspx?msg=other_pc" : "~/auth/Login.aspx";
        page.Response.Redirect(url, true);
    }

    public static string Version
    {
        get { return System.Configuration.ConfigurationManager.AppSettings["Version"]; }
    }

    public static int GetCurrentAnneeId()
    {
        if (HttpContext.Current.Session["ID_ANNEE_ACTIVE"] != null)
        {
            return Convert.ToInt32(HttpContext.Current.Session["ID_ANNEE_ACTIVE"]);
        }

        // Sinon, on récupère par défaut la dernière année non clôturée en base
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            string sql = "SELECT TOP 1 ID FROM RANNEE WHERE CLOTURE = 0 ORDER BY DATE_DEBUT DESC";
            SqlCommand cmd = new SqlCommand(sql, conn);
            conn.Open();
            object result = cmd.ExecuteScalar();
            return result != null ? (int)result : 0;
        }
    }
}