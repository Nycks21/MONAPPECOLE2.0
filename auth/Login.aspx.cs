using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Data.SqlClient;
using System.Configuration;
using System.Security.Cryptography;
using System.Drawing;
using System.Globalization;
using System.Web.UI;
using System.Collections.Generic;

public partial class Login : Page
{
    enum LicenceStatus { Valide, Manquante, Expiree, Invalide }

    string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    // ── Constantes de verrouillage ──────────────────────────────────────────
    const int MAX_ATTEMPTS = 5;
    const int LOCKOUT_SECONDS = 60;
    const string SK_ATTEMPTS = "login_attempts";
    const string SK_LOCKOUT_END = "login_lockout_end";
    // ────────────────────────────────────────────────────────────────────────

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            HideMessages();

            if (Request.QueryString["msg"] == "other_pc")
            {
                ShowError("⚠️ Compte déjà connecté ailleurs.");
            }

            DateTime expirationDate;
            int maxUsers;

            LicenceStatus status = CheckLicence(out expirationDate, out maxUsers);

            if (status != LicenceStatus.Valide)
            {
                lblLicenceInfo.Text =
                    status == LicenceStatus.Expiree ? "❌ Licence expirée."
                  : status == LicenceStatus.Manquante ? "❌ Clé de licence manquante."
                  : "❌ Licence invalide.";

                lblLicenceInfo.ForeColor = Color.Red;
                lblLicenceInfo.Font.Bold = true;
                lblLicenceInfo.Visible = true;
                return;
            }

            int daysLeft = (expirationDate.Date - DateTime.Now.Date).Days;
            int[] alertDays = { 45, 15, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 };

            if (alertDays.Contains(daysLeft))
            {
                if (daysLeft == 0)
                    lblLicenceInfo.Text = "⚠️ La licence expire aujourd'hui.";
                else if (daysLeft == 1)
                    lblLicenceInfo.Text = "⚠️ La licence expire demain.";
                else
                    lblLicenceInfo.Text = "⚠️ La licence expirera dans " + daysLeft + " jours.";

                lblLicenceInfo.ForeColor = Color.OrangeRed;
                lblLicenceInfo.Visible = true;
            }

            if (IsMaxUsersReached(maxUsers))
            {
                lblUserLimitInfo.Text = "❌ Nombre maximum d'utilisateurs atteint (" + maxUsers + ").";
                lblUserLimitInfo.ForeColor = Color.Red;
                lblUserLimitInfo.Font.Bold = true;
                lblUserLimitInfo.Visible = true;
            }
        }
    }

    protected void btnLogin_Click(object sender, EventArgs e)
    {
        DateTime lockoutEnd = Session[SK_LOCKOUT_END] as DateTime? ?? DateTime.MinValue;

        if (DateTime.Now < lockoutEnd)
        {
            int secondsLeft = (int)Math.Ceiling((lockoutEnd - DateTime.Now).TotalSeconds);
            ShowError("⛔ Trop de tentatives échouées. Réessayez dans " + secondsLeft + " seconde(s).");
            StartCountdownScript(secondsLeft);
            return;
        }

        if (lockoutEnd != DateTime.MinValue)
        {
            Session.Remove(SK_ATTEMPTS);
            Session.Remove(SK_LOCKOUT_END);
        }

        string username = txtUsername.Text.Trim();
        string password = txtPassword.Text.Trim();

        DateTime expirationDate;
        int maxUsers;

        if (CheckLicence(out expirationDate, out maxUsers) != LicenceStatus.Valide)
        {
            ShowError("Licence non valide.");
            return;
        }

        if (IsMaxUsersReached(maxUsers))
        {
            ShowError("Nombre maximum d'utilisateurs atteint (" + maxUsers + ").");
            return;
        }

        int idUser;
        int roleId;
        string nomComplet;
        string errorMessage;

        if (!AuthenticateUser(username, password, out idUser, out roleId, out nomComplet, out errorMessage))
        {
            int attempts = (Session[SK_ATTEMPTS] as int? ?? 0) + 1;
            Session[SK_ATTEMPTS] = attempts;

            int remaining = MAX_ATTEMPTS - attempts;

            if (attempts >= MAX_ATTEMPTS)
            {
                Session[SK_LOCKOUT_END] = DateTime.Now.AddSeconds(LOCKOUT_SECONDS);
                Session[SK_ATTEMPTS] = 0;
                ShowError("⛔ Compte temporairement bloqué après " + MAX_ATTEMPTS
                    + " tentatives échouées. Réessayez dans " + LOCKOUT_SECONDS + " secondes.");
                StartCountdownScript(LOCKOUT_SECONDS);
            }
            else
            {
                ShowError(errorMessage + " — " + remaining + " tentative(s) restante(s) avant blocage.");
            }
            return;
        }

        Session.Remove(SK_ATTEMPTS);
        Session.Remove(SK_LOCKOUT_END);

        string newToken = Guid.NewGuid().ToString();
        string currentPC = Environment.MachineName;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            SqlCommand cmd = new SqlCommand(@"
                UPDATE USERS
                SET SESSION_TOKEN = @token,
                    LAST_LOGIN    = GETDATE(),
                    LAST_PC       = @pc
                WHERE IDUSER = @id", conn);

            cmd.Parameters.AddWithValue("@token", newToken);
            cmd.Parameters.AddWithValue("@pc", currentPC);
            cmd.Parameters.AddWithValue("@id", idUser);

            conn.Open();
            cmd.ExecuteNonQuery();
        }

        // Dans la méthode btnLogin_Click, après l'authentification réussie
        Session.Clear();
        Session["authenticated"] = true;
        Session["IDUSER"] = idUser;
        Session["username"] = nomComplet;
        Session["USERROLE"] = roleId;
        Session["SESSION_TOKEN"] = newToken;
        Session["PC"] = currentPC;

        // ============================================================
        // STOCKER LES CLASSES ET MATIÈRES AUTORISÉES UNIQUEMENT POUR LES PROFESSEURS
        // ============================================================
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();

        if (roleId == 3) // Professeur uniquement
        {
            var classesAutorisees = GetClassesForProfessor(idUser);
            var matieresAutorisees = GetMatieresForProfessor(idUser);

            Session["ClassesAutorisees"] = serializer.Serialize(classesAutorisees);
            Session["MatieresAutorisees"] = serializer.Serialize(matieresAutorisees);
        }
        else
        {
            // Pour les autres rôles (Admin, SuperAdmin, etc.), pas de restriction
            Session["ClassesAutorisees"] = "[]";
            Session["MatieresAutorisees"] = "[]";
        }
        // ============================================================

        Response.Redirect("~/pages/accueil/dashboards/index.aspx", false);
        Context.ApplicationInstance.CompleteRequest();
    }

    // ============================================================
    // NOUVELLES MÉTHODES POUR RÉCUPÉRER LES CLASSES ET MATIÈRES DU PROFESSEUR
    // ============================================================

    private List<object> GetClassesForProfessor(int professeurId)
    {
        var classes = new List<object>();
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            // Récupérer les classes où le professeur enseigne
            string sql = @"SELECT DISTINCT c.ID, c.NOM 
                        FROM CLASSES c
                        INNER JOIN MATIERES m ON m.CLASSE_ID = c.ID
                        WHERE m.ENSEIGNANT = @professeurId
                        ORDER BY c.NOM";
            SqlCommand cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@professeurId", professeurId);
            conn.Open();
            SqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                classes.Add(new
                {
                    ID = reader["ID"].ToString(),
                    NOM = reader["NOM"].ToString()
                });
            }
        }
        return classes;
    }

    private List<object> GetMatieresForProfessor(int professeurId)
    {
        var matieres = new List<object>();
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            // Récupérer les matières avec leur classe associée
            string sql = @"SELECT m.ID, m.NOM, m.COEFFICIENT, m.CLASSE_ID, c.NOM AS CLASSE_NOM
                        FROM MATIERES m
                        INNER JOIN CLASSES c ON m.CLASSE_ID = c.ID
                        WHERE m.ENSEIGNANT = @professeurId
                        ORDER BY c.NOM, m.NOM";
            SqlCommand cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@professeurId", professeurId);
            conn.Open();
            SqlDataReader reader = cmd.ExecuteReader();
            while (reader.Read())
            {
                var matiere = new
                {
                    ID = reader["ID"].ToString(),  // GUID correct
                    NOM = reader["NOM"].ToString(),
                    COEFFICIENT = reader["COEFFICIENT"] != DBNull.Value ? Convert.ToDecimal(reader["COEFFICIENT"]) : 1,
                    CLASSE_ID = reader["CLASSE_ID"] != DBNull.Value ? Convert.ToInt32(reader["CLASSE_ID"]) : 0,
                    CLASSE_NOM = reader["CLASSE_NOM"] != DBNull.Value ? reader["CLASSE_NOM"].ToString() : ""
                };
                matieres.Add(matiere);
                Console.WriteLine(string.Format("Matière chargée: {0} - ID: {1}", matiere.NOM, matiere.ID));
            }
        }
        return matieres;
    }

    // ============================================================

    private bool AuthenticateUser(string username, string password, out int idUser, out int roleId, out string nomComplet, out string errorMessage)
    {
        idUser = 0;
        roleId = 0;
        nomComplet = "";
        errorMessage = "";

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            SqlCommand cmd = new SqlCommand(@"
                SELECT IDUSER, ROLEID, ACTIVE, NOM
                FROM USERS
                WHERE USERNAME = @u AND PWD = @p", conn);

            cmd.Parameters.AddWithValue("@u", username);
            cmd.Parameters.AddWithValue("@p", password);

            conn.Open();
            using (SqlDataReader rd = cmd.ExecuteReader())
            {
                if (rd.Read())
                {
                    bool isActive = Convert.ToInt32(rd["ACTIVE"]) == 1;

                    if (!isActive)
                    {
                        errorMessage = "Compte inactif";
                        return false;
                    }

                    idUser = Convert.ToInt32(rd["IDUSER"]);
                    roleId = Convert.ToInt32(rd["ROLEID"]);
                    nomComplet = rd["NOM"].ToString();
                    return true;
                }
            }
        }

        errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
        return false;
    }

    private bool IsMaxUsersReached(int maxUsers)
    {
        try
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                using (SqlCommand cmd = new SqlCommand(
                    "SELECT COUNT(*) FROM USERS WHERE SESSION_TOKEN IS NOT NULL", conn))
                {
                    conn.Open();
                    int activeUsers = (int)cmd.ExecuteScalar();
                    return activeUsers >= maxUsers;
                }
            }
        }
        catch (SqlException ex)
        {
            lblUserLimitInfo.Text = "Connexion à la base de données impossible. Vérifiez le serveur SQL.";
            lblUserLimitInfo.Visible = true;
            lblUserLimitInfo.Style["background-color"] = "#fff5f5";
            lblUserLimitInfo.Style["border"] = "1px solid red";
            lblUserLimitInfo.Style["border-radius"] = "8px";
            lblUserLimitInfo.Style["padding"] = "10px";
            lblUserLimitInfo.Style["display"] = "block";
            lblUserLimitInfo.Style["text-align"] = "center";
            lblUserLimitInfo.ForeColor = System.Drawing.Color.Red;
            lblUserLimitInfo.Font.Bold = true;
            System.Diagnostics.Trace.WriteLine(ex.ToString());
            return false;
        }
        catch (Exception ex)
        {
            AfficherErreur("Une erreur inattendue est survenue.");
            System.Diagnostics.Trace.WriteLine(ex.ToString());
            return false;
        }
    }

    private void AfficherErreur(string message)
    {
        pnlErreur.Visible = true;
        lblErreur.Text = message;
    }

    private void AfficherErreurToastEtOption500(string message)
    {
        string msg = message.Replace("'", "\\'");
        string script = @"
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: '" + msg + @"',
                showConfirmButton: true,
                confirmButtonText: 'Plus de détails',
                showCancelButton: true,
                cancelButtonText: 'Rester ici'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/pages/error/Error500.aspx';
                }
            });";
        ScriptManager.RegisterStartupScript(this, this.GetType(), "toastAvecOption500", script, true);
    }

    private LicenceStatus CheckLicence(out DateTime expirationDate, out int maxUsers)
    {
        expirationDate = DateTime.MinValue;
        maxUsers = 0;

        string path = Server.MapPath("~/bin/licence.key");
        if (!File.Exists(path))
            return LicenceStatus.Manquante;

        string secret = ConfigurationManager.AppSettings["LicenceSecret"];
        if (string.IsNullOrEmpty(secret))
            return LicenceStatus.Invalide;

        try
        {
            string[] lines = File.ReadAllLines(path);

            string expClear = GetValue(lines, "EXPIRATIONS", false);
            string maxClear = GetValue(lines, "MAX_USERSS", false);

            string expHash = GetValue(lines, "EXPIRATION", true);
            string maxHash = GetValue(lines, "MAX_USERS", true);
            string sigHash = GetValue(lines, "SIGNATURE", true);

            if (!DateTime.TryParseExact(expClear, "yyyy-MM-dd",
                CultureInfo.InvariantCulture, DateTimeStyles.None, out expirationDate))
                return LicenceStatus.Invalide;

            if (!int.TryParse(maxClear, out maxUsers) || maxUsers <= 0)
                return LicenceStatus.Invalide;

            string expCalc = ComputeHmacSha256(expClear, secret);
            string maxCalc = ComputeHmacSha256(maxUsers.ToString(), secret);
            string sigCalc = ComputeHmacSha256(expCalc + maxCalc, secret);

            if (expCalc != expHash || maxCalc != maxHash || sigCalc != sigHash)
                return LicenceStatus.Invalide;

            if (DateTime.Now.Date > expirationDate.Date)
                return LicenceStatus.Expiree;

            return LicenceStatus.Valide;
        }
        catch
        {
            return LicenceStatus.Invalide;
        }
    }

    private string GetValue(string[] lines, string key, bool first)
    {
        var values = lines
            .Where(l => l.StartsWith(key + "="))
            .Select(l => l.Substring(key.Length + 1).Trim())
            .ToList();

        return values.Count == 0 ? null : (first ? values.First() : values.Last());
    }

    private string ComputeHmacSha256(string data, string key)
    {
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key)))
        {
            return BitConverter
                .ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data)))
                .Replace("-", "")
                .ToLower();
        }
    }

    private void HideMessages()
    {
        lblLicenceInfo.Visible = false;
        lblUserLimitInfo.Visible = false;
        lblMessage.Visible = false;
    }

    private void ShowError(string msg)
    {
        lblMessage.Text = msg;
        lblMessage.ForeColor = Color.Red;
        lblMessage.Visible = true;
    }

    private void StartCountdownScript(int secondsLeft)
    {
        string script = @"
            (function() {
                var btn = document.getElementById('" + btnLogin.ClientID + @"');
                if (!btn) return;
                btn.disabled = true;
                var remaining = " + secondsLeft + @";
                var orig = btn.value;
                btn.value = 'Patienter ' + remaining + 's\u2026';
                var iv = setInterval(function() {
                    remaining--;
                    if (remaining <= 0) {
                        clearInterval(iv);
                        btn.disabled = false;
                        btn.value = orig;
                    } else {
                        btn.value = 'Patienter ' + remaining + 's\u2026';
                    }
                }, 1000);
            })();";
        ScriptManager.RegisterStartupScript(this, GetType(), "lockoutCountdown", script, true);
    }
}