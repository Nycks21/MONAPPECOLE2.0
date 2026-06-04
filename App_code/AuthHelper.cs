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
            SetRolename(page);
        }
    }

    // Récupère le RoleId depuis la session
    private static int? GetUserRoleId()
    {
        var session = HttpContext.Current.Session;
        if (session["USERROLE"] == null) return null;
        try
        {
            return Convert.ToInt32(session["USERROLE"]);
        }
        catch
        {
            return null;
        }
    }

    // ============================================================
    // MÉTHODES POUR LES PAGES ASPX
    // ============================================================

    public static string GetUserRole()
    {
        var session = HttpContext.Current.Session;
        if (session["USERROLE"] != null)
        {
            return session["USERROLE"].ToString();
        }
        return "";
    }

    public static string GetUserName()
    {
        var session = HttpContext.Current.Session;
        if (session["username"] != null)
        {
            return session["username"].ToString();
        }
        return "";
    }

    public static string GetProfesseurId()
    {
        var session = HttpContext.Current.Session;
        if (session["IDUSER"] != null)
        {
            return session["IDUSER"].ToString();
        }
        return "0";
    }

    public static string GetClassesAutorisees()
    {
        var session = HttpContext.Current.Session;
        if (session["ClassesAutorisees"] != null)
        {
            return session["ClassesAutorisees"].ToString();
        }
        return "[]";
    }

    public static string GetMatieresAutorisees()
    {
        var session = HttpContext.Current.Session;
        if (session["MatieresAutorisees"] != null)
        {
            return session["MatieresAutorisees"].ToString();
        }
        return "[]";
    }

    // ============================================================
    // VÉRIFICATIONS DES RÔLES
    // ============================================================

    public static bool IsSuperAdmin()
    {
        var roleId = GetUserRoleId();
        return roleId.HasValue && roleId.Value == 0;
    }

    public static bool IsAdmin()
    {
        var roleId = GetUserRoleId();
        return roleId.HasValue && roleId.Value == 1;
    }

    public static bool IsProfessor()
    {
        var roleId = GetUserRoleId();
        return roleId.HasValue && roleId.Value == 3;
    }

    public static bool IsSecretaire()
    {
        var roleId = GetUserRoleId();
        return roleId.HasValue && roleId.Value == 4;
    }

    public static bool IsComptable()
    {
        var roleId = GetUserRoleId();
        return roleId.HasValue && roleId.Value == 5;
    }

    public static string GetRoleName()
    {
        var roleId = GetUserRoleId();
        if (!roleId.HasValue) return "Inconnu";
        
        switch (roleId.Value)
        {
            case 0: return "Super Administrateur";
            case 1: return "Administrateur";
            case 3: return "Professeur";
            case 4: return "Secrétaire";
            case 5: return "Comptable";
            default: return "Utilisateur";
        }
    }

    // ============================================================
    // MÉTHODES PRIVÉES
    // ============================================================

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

    private static void SetRolename(Page page)
    {
        string roleName = GetRoleName();
        string script = "var el=document.getElementById('profilUsername'); if(el){el.innerText='" + roleName + "';}";
        page.ClientScript.RegisterStartupScript(page.GetType(), "rolename", script, true);
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
        get { return ConfigurationManager.AppSettings["Version"]; }
    }

    public static int GetCurrentAnneeId()
    {
        if (HttpContext.Current.Session["ID_ANNEE_ACTIVE"] != null)
        {
            return Convert.ToInt32(HttpContext.Current.Session["ID_ANNEE_ACTIVE"]);
        }

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