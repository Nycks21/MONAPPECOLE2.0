using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;

public static class AuthHelper
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    // Structure d'un menu
    public class MenuItem
    {
        public string Code { get; set; }
        public string Text { get; set; }
        public string Url { get; set; }
        public string Icon { get; set; }
        public string Section { get; set; }
        public int Order { get; set; }
        public List<MenuItem> Children { get; set; }

        public MenuItem()
        {
            Children = new List<MenuItem>();
        }
    }

    // Définition de tous les menus disponibles
    public static readonly List<MenuItem> AllMenus = new List<MenuItem>
    {
        new MenuItem { Code = "dashboard", Text = "Dashboard", Url = "../../accueil/dashboards/index.aspx", Icon = "fas fa-chalkboard", Section = "Accueil", Order = 1 },
        new MenuItem { Code = "eleves", Text = "Liste des élèves", Url = "../../modules/eleves/eleves.aspx", Icon = "fas fa-users", Section = "Modules", Order = 2 },
        new MenuItem { Code = "absences", Text = "Retards & Absences", Url = "../../modules/absences/absences.aspx", Icon = "fas fa-calendar-times", Section = "Modules", Order = 3 },
        new MenuItem { Code = "bulletins", Text = "Bulletins", Url = "../../modules/bulletins/bulletins.aspx", Icon = "fas fa-file-alt", Section = "Modules", Order = 4 },
        new MenuItem { Code = "frais", Text = "Frais scolaires", Url = "../../modules/frais/frais.aspx", Icon = "fas fa-money-bill-wave", Section = "Ecolage", Order = 5 },
        new MenuItem { Code = "niveaux", Text = "Niveau", Url = "../../parametres/niveaux/niveaux.aspx", Icon = "fas fa-layer-group", Section = "Paramètres", Order = 6 },
        new MenuItem { Code = "salles", Text = "Salle", Url = "../../parametres/salles/salles.aspx", Icon = "fas fa-door-open", Section = "Paramètres", Order = 7 },
        new MenuItem { Code = "classes", Text = "Classes", Url = "../../parametres/classes/classes.aspx", Icon = "fas fa-folder", Section = "Paramètres", Order = 8 },
        new MenuItem { Code = "matieres", Text = "Matières", Url = "../../parametres/matieres/matieres.aspx", Icon = "fas fa-book", Section = "Paramètres", Order = 9 },
        new MenuItem { Code = "importation", Text = "Importation élèves", Url = "../../administrations/utilitaires/utilitaires.aspx", Icon = "fas fa-cogs", Section = "Utilitaires", Order = 10 },
        new MenuItem { Code = "annees", Text = "Années", Url = "../../administrations/annee/annee.aspx", Icon = "fas fa-calendar-alt", Section = "Administrations", Order = 11 },
        new MenuItem { Code = "utilisateurs", Text = "Utilisateur", Url = "../../administrations/utilisateur/utilisateur.aspx", Icon = "fas fa-user", Section = "Administrations", Order = 12 },
        new MenuItem { Code = "requetes", Text = "Requêtes SQL", Url = "../../administrations/requete/requetes.aspx", Icon = "fas fa-database", Section = "Administrations", Order = 13 }
    };

    // Récupérer les permissions de l'utilisateur
    public static List<string> GetUserPermissions()
    {
        var session = HttpContext.Current.Session;

        if (session != null && session["USER_PERMISSIONS"] != null)
        {
            return session["USER_PERMISSIONS"] as List<string>;
        }

        // SuperAdmin voit tout
        if (IsSuperAdmin())
        {
            var allPerms = new List<string>();
            foreach (var menu in AllMenus)
            {
                allPerms.Add(menu.Code);
            }
            if (session != null) session["USER_PERMISSIONS"] = allPerms;
            return allPerms;
        }

        // Admin voit tout sauf requetes
        if (IsAdmin())
        {
            var adminPerms = new List<string>();
            foreach (var menu in AllMenus)
            {
                if (menu.Code != "requetes")
                {
                    adminPerms.Add(menu.Code);
                }
            }
            if (session != null) session["USER_PERMISSIONS"] = adminPerms;
            return adminPerms;
        }

        // Pour les autres utilisateurs : charger depuis la base
        int? userId = GetCurrentUserId();
        if (userId.HasValue && userId.Value > 0)
        {
            var permissions = LoadPermissionsFromDatabase(userId.Value);
            if (session != null) session["USER_PERMISSIONS"] = permissions;
            return permissions;
        }

        return new List<string>();
    }

    private static List<string> LoadPermissionsFromDatabase(int userId)
    {
        var permissions = new List<string>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            string checkColumnQuery = @"
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'USERS' AND COLUMN_NAME = 'MENU_PERMISSIONS'";

            SqlCommand checkCmd = new SqlCommand(checkColumnQuery, conn);
            int columnExists = (int)checkCmd.ExecuteScalar();

            if (columnExists > 0)
            {
                string sql = "SELECT MENU_PERMISSIONS FROM USERS WHERE IDUSER = @id";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@id", userId);
                object result = cmd.ExecuteScalar();

                if (result != null && result != DBNull.Value && !string.IsNullOrEmpty(result.ToString()))
                {
                    try
                    {
                        var serializer = new JavaScriptSerializer();
                        permissions = serializer.Deserialize<List<string>>(result.ToString());
                    }
                    catch { }
                }
            }
            else
            {
                string sql = "SELECT PERMISSION_NAME FROM USER_PERMISSIONS WHERE USER_ID = @id";
                SqlCommand cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@id", userId);
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        permissions.Add(reader["PERMISSION_NAME"].ToString());
                    }
                }
            }
        }

        return permissions;
    }

    // ============================================================
    // MÉTHODE HASPERMISSION
    // ============================================================
    public static bool HasPermission(string permissionCode)
    {
        // SuperAdmin voit tout (y compris Requêtes SQL)
        if (IsSuperAdmin()) return true;

        // Admin voit tout SAUF le menu Requêtes SQL
        if (IsAdmin() && permissionCode != "requetes") return true;

        // Pour les autres utilisateurs, vérifier dans les permissions
        var permissions = GetUserPermissions();
        return permissions.Contains(permissionCode);
    }

    // Récupérer les menus autorisés pour l'utilisateur
    public static List<MenuItem> GetAuthorizedMenus()
    {
        var authorizedMenus = new List<MenuItem>();

        foreach (var menu in AllMenus)
        {
            if (HasPermission(menu.Code))
            {
                authorizedMenus.Add(menu);
            }
        }

        return authorizedMenus;
    }

    // ============================================================
    // GÉNÉRATION DU HTML DES MENUS - SANS CLASSE "ACTIVE"
    // La classe "active" est gérée par JavaScript (global.js)
    // ============================================================
    // Générer le HTML des menus - Version avec data-menu
    public static string RenderMenuHTML()
    {
        try
        {
            var menus = GetAuthorizedMenus();

            if (menus == null || menus.Count == 0)
            {
                return "<div class='nav-section' style='padding:15px;text-align:center;'>Aucun menu disponible<br><small>Contactez l'administrateur</small></div>";
            }

            var sections = new Dictionary<string, List<MenuItem>>();

            foreach (var menu in menus)
            {
                if (!sections.ContainsKey(menu.Section))
                {
                    sections[menu.Section] = new List<MenuItem>();
                }
                sections[menu.Section].Add(menu);
            }

            var html = new System.Text.StringBuilder();
            html.Append(@"<ul class=""nav-pills"">");

            foreach (var section in sections)
            {
                html.AppendFormat(@"
                <li class=""nav-item"">
                    <div class=""nav-section"">{0}</div>", section.Key);

                foreach (var menu in section.Value)
                {
                    // Ajout de l'attribut data-menu avec le code du menu
                    html.AppendFormat(@"
                    <a href=""{0}"" class=""nav-link"" data-menu=""{1}"">
                        <div style=""width:30px; text-align:center; margin-right:10px;"">
                            <i class=""{2}""></i>
                        </div>
                        <span>{3}</span>
                    </a>", menu.Url, menu.Code, menu.Icon, menu.Text);
                }

                html.Append(@"</li>");
            }

            html.Append(@"</ul>");
            return html.ToString();
        }
        catch (Exception ex)
        {
            return "<div style='color:red;padding:10px;'>Erreur: " + ex.Message + "</div>";
        }
    }

    // Sauvegarder les permissions d'un utilisateur
    public static bool SaveUserPermissions(int userId, List<string> permissions)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();

                string checkColumnQuery = @"
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'USERS' AND COLUMN_NAME = 'MENU_PERMISSIONS'";

                SqlCommand checkCmd = new SqlCommand(checkColumnQuery, conn);
                int columnExists = (int)checkCmd.ExecuteScalar();

                if (columnExists > 0)
                {
                    var serializer = new JavaScriptSerializer();
                    string permissionsJson = serializer.Serialize(permissions);

                    string sql = "UPDATE USERS SET MENU_PERMISSIONS = @permissions WHERE IDUSER = @id";
                    SqlCommand cmd = new SqlCommand(sql, conn);
                    cmd.Parameters.AddWithValue("@permissions", permissionsJson);
                    cmd.Parameters.AddWithValue("@id", userId);
                    cmd.ExecuteNonQuery();
                }
                else
                {
                    string deleteSql = "DELETE FROM USER_PERMISSIONS WHERE USER_ID = @id";
                    SqlCommand deleteCmd = new SqlCommand(deleteSql, conn);
                    deleteCmd.Parameters.AddWithValue("@id", userId);
                    deleteCmd.ExecuteNonQuery();

                    foreach (string perm in permissions)
                    {
                        string insertSql = "INSERT INTO USER_PERMISSIONS (USER_ID, PERMISSION_NAME) VALUES (@id, @perm)";
                        SqlCommand insertCmd = new SqlCommand(insertSql, conn);
                        insertCmd.Parameters.AddWithValue("@id", userId);
                        insertCmd.Parameters.AddWithValue("@perm", perm);
                        insertCmd.ExecuteNonQuery();
                    }
                }

                var session = HttpContext.Current.Session;
                if (session != null && session["IDUSER"] != null && Convert.ToInt32(session["IDUSER"]) == userId)
                {
                    session["USER_PERMISSIONS"] = permissions;
                }

                return true;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine("Erreur SaveUserPermissions: " + ex.Message);
            return false;
        }
    }

    // ============================================================
    // MÉTHODES EXISTANTES
    // ============================================================

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

    private static int? GetUserRoleId()
    {
        var session = HttpContext.Current.Session;
        if (session == null || session["USERROLE"] == null) return null;
        try { return Convert.ToInt32(session["USERROLE"]); }
        catch { return null; }
    }

    private static int? GetCurrentUserId()
    {
        var session = HttpContext.Current.Session;
        if (session == null || session["IDUSER"] == null) return null;
        try { return Convert.ToInt32(session["IDUSER"]); }
        catch { return null; }
    }

    public static string GetUserRole()
    {
        var session = HttpContext.Current.Session;
        if (session != null && session["USERROLE"] != null)
        {
            return session["USERROLE"].ToString();
        }
        return "";
    }

    public static string GetUserName()
    {
        var session = HttpContext.Current.Session;
        if (session != null && session["username"] != null)
        {
            return session["username"].ToString();
        }
        return "";
    }

    public static string GetProfesseurId()
    {
        var session = HttpContext.Current.Session;
        if (session != null && session["IDUSER"] != null)
        {
            return session["IDUSER"].ToString();
        }
        return "0";
    }

    public static string GetClassesAutorisees()
    {
        var session = HttpContext.Current.Session;
        if (session != null && session["ClassesAutorisees"] != null)
        {
            return session["ClassesAutorisees"].ToString();
        }
        return "[]";
    }

    public static string GetMatieresAutorisees()
    {
        var session = HttpContext.Current.Session;
        if (session != null && session["MatieresAutorisees"] != null)
        {
            return session["MatieresAutorisees"].ToString();
        }
        return "[]";
    }

    public static bool IsSuperAdmin()
    {
        var roleId = GetUserRoleId();
        return roleId.HasValue && roleId.Value == 0;
    }

    public static bool IsAdmin()
    {
        var roleId = GetUserRoleId();
        return roleId.HasValue && (roleId.Value == 0 || roleId.Value == 1);
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

    private static bool IsTokenValid()
    {
        var session = HttpContext.Current.Session;
        if (session == null || session["IDUSER"] == null || session["SESSION_TOKEN"] == null) return false;

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
        var session = HttpContext.Current.Session;
        if (session == null || session["username"] == null) return;
        string username = session["username"].ToString().Replace("'", "\\'");
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
        get
        {
            var version = ConfigurationManager.AppSettings["Version"];
            return string.IsNullOrEmpty(version) ? "1.0.0" : version;
        }
    }

    public static int GetCurrentAnneeId()
    {
        var session = HttpContext.Current.Session;
        if (session != null && session["ID_ANNEE_ACTIVE"] != null)
        {
            return Convert.ToInt32(session["ID_ANNEE_ACTIVE"]);
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