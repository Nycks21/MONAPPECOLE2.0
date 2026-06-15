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

            // Gérer les messages toast pour la déconnexion
            string msg = Request.QueryString["msg"];
            
            if (msg == "maintenance")
            {
                ShowToast("🔒 Maintenance en cours", "Vous avez été déconnecté pour cause de maintenance. Veuillez patienter.", "warning");
            }
            else if (msg == "disconnected")
            {
                ShowToast("🔌 Déconnexion", "Vous avez été déconnecté par l'administrateur. Veuillez vous reconnecter.", "info");
            }
            else if (msg == "session_expired")
            {
                ShowToast("⏰ Session expirée", "Votre session a expiré. Veuillez vous reconnecter.", "warning");
            }
            else if (msg == "blocked")
            {
                ShowToast("🔒 Compte bloqué", "Compte temporairement bloqué. Maintenance en cours. Veuillez réessayer dans 1 minute.", "error");
            }
            else if (msg == "other_pc")
            {
                ShowToast("⚠️ Connexion ailleurs", "Vous avez été déconnecté car une autre session a été ouverte.", "warning");
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

    // ============================================================
    // AFFICHER UN TOAST (notification)
    // ============================================================

    private void ShowToast(string title, string message, string type = "info")
    {
        string icon = "";
        string bgColor = "";
        
        switch (type)
        {
            case "success":
                icon = "✅";
                bgColor = "#28a745";
                break;
            case "error":
                icon = "❌";
                bgColor = "#dc3545";
                break;
            case "warning":
                icon = "⚠️";
                bgColor = "#ffc107";
                break;
            default:
                icon = "ℹ️";
                bgColor = "#17a2b8";
                break;
        }
        
        string script = @"
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: '" + type + @"',
                title: '" + title.Replace("'", "\\'") + @"',
                text: '" + message.Replace("'", "\\'") + @"',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });";
        
        ScriptManager.RegisterStartupScript(this, GetType(), "toast_" + Guid.NewGuid().ToString(), script, true);
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
        int minutesLeft = 0;

        if (!AuthenticateUser(username, password, out idUser, out roleId, out nomComplet, out errorMessage, out minutesLeft))
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
                // Si c'est un blocage maintenance, afficher le message spécifique
                if (errorMessage.Contains("bloqué") && minutesLeft > 0)
                {
                    ShowError("⚠️ Compte temporairement bloqué. Maintenance en cours. Veuillez réessayer dans " + minutesLeft + " minute(s).");
                    StartLoginCountdown(minutesLeft * 60);
                }
                else
                {
                    ShowError(errorMessage + " — " + remaining + " tentative(s) restante(s) avant blocage.");
                }
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

        Session.Clear();
        Session["authenticated"] = true;
        Session["IDUSER"] = idUser;
        Session["username"] = nomComplet;
        Session["USERROLE"] = roleId;
        Session["SESSION_TOKEN"] = newToken;
        Session["PC"] = currentPC;

        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();

        if (roleId == 3)
        {
            var classesAutorisees = GetClassesForProfessor(idUser);
            var matieresAutorisees = GetMatieresForProfessor(idUser);

            Session["ClassesAutorisees"] = serializer.Serialize(classesAutorisees);
            Session["MatieresAutorisees"] = serializer.Serialize(matieresAutorisees);
        }
        else
        {
            Session["ClassesAutorisees"] = "[]";
            Session["MatieresAutorisees"] = "[]";
        }

        Response.Redirect("~/pages/accueil/dashboards/index.aspx", false);
        Context.ApplicationInstance.CompleteRequest();
    }

    // ============================================================
    // COMPTE À REBOURS SUR LE BOUTON DE CONNEXION
    // ============================================================

    private void StartLoginCountdown(int seconds)
    {
        string script = @"
            (function() {
                var btn = document.getElementById('" + btnLogin.ClientID + @"');
                if (!btn) return;
                
                var remaining = " + seconds + @";
                var originalText = btn.value;
                btn.disabled = true;
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
                btn.style.backgroundColor = '#6c757d';
                
                var interval = setInterval(function() {
                    remaining--;
                    if (remaining <= 0) {
                        clearInterval(interval);
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                        btn.style.backgroundColor = '#28a745';
                        btn.value = originalText;
                        
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: '✅ Vous pouvez maintenant vous connecter',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    } else {
                        var minutes = Math.floor(remaining / 60);
                        var secs = remaining % 60;
                        if (minutes > 0) {
                            btn.value = '⏳ Patientez ' + minutes + ' min ' + secs + 's';
                        } else {
                            btn.value = '⏳ Patientez ' + secs + 's';
                        }
                    }
                }, 1000);
            })();";
        
        ScriptManager.RegisterStartupScript(this, GetType(), "loginCountdown", script, true);
    }

    // ============================================================
    // MÉTHODES POUR RÉCUPÉRER LES CLASSES ET MATIÈRES DU PROFESSEUR
    // ============================================================

    private List<object> GetClassesForProfessor(int professeurId)
    {
        var classes = new List<object>();
        using (SqlConnection conn = new SqlConnection(connStr))
        {
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
                    ID = reader["ID"].ToString(),
                    NOM = reader["NOM"].ToString(),
                    COEFFICIENT = reader["COEFFICIENT"] != DBNull.Value ? Convert.ToDecimal(reader["COEFFICIENT"]) : 1,
                    CLASSE_ID = reader["CLASSE_ID"] != DBNull.Value ? Convert.ToInt32(reader["CLASSE_ID"]) : 0,
                    CLASSE_NOM = reader["CLASSE_NOM"] != DBNull.Value ? reader["CLASSE_NOM"].ToString() : ""
                };
                matieres.Add(matiere);
            }
        }
        return matieres;
    }

    // ============================================================

    private bool AuthenticateUser(string username, string password, out int idUser, out int roleId, out string nomComplet, out string errorMessage, out int minutesLeft)
    {
        idUser = 0;
        roleId = 0;
        nomComplet = "";
        errorMessage = "";
        minutesLeft = 0;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            bool hasBlockedUntilColumn = false;
            string checkColumnSql = @"
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'USERS' AND COLUMN_NAME = 'BLOCKED_UNTIL'";
            
            using (SqlCommand checkCmd = new SqlCommand(checkColumnSql, conn))
            {
                conn.Open();
                hasBlockedUntilColumn = (int)checkCmd.ExecuteScalar() > 0;
                conn.Close();
            }
            
            string sql = @"
                SELECT IDUSER, ROLEID, ACTIVE, NOM";
            
            if (hasBlockedUntilColumn)
            {
                sql += ", BLOCKED_UNTIL";
            }
            
            sql += " FROM USERS WHERE USERNAME = @u AND PWD = @p";
            
            SqlCommand cmd = new SqlCommand(sql, conn);
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

                    if (roleId != 0 && hasBlockedUntilColumn)
                    {
                        if (rd["BLOCKED_UNTIL"] != DBNull.Value)
                        {
                            DateTime blockedUntil = Convert.ToDateTime(rd["BLOCKED_UNTIL"]);
                            if (blockedUntil > DateTime.Now)
                            {
                                TimeSpan remaining = blockedUntil - DateTime.Now;
                                minutesLeft = (int)Math.Ceiling(remaining.TotalMinutes);
                                errorMessage = string.Format("⚠️ Compte temporairement bloqué. Maintenance en cours. Veuillez réessayer dans {0} minute(s).", minutesLeft);
                                return false;
                            }
                        }
                    }

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
        catch (Exception ex)
        {
            System.Diagnostics.Trace.WriteLine(ex.ToString());
            return false;
        }
    }

    private void AfficherErreur(string message)
    {
        pnlErreur.Visible = true;
        lblErreur.Text = message;
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
                btn.style.opacity = '0.6';
                btn.style.cursor = 'not-allowed';
                var remaining = " + secondsLeft + @";
                var orig = btn.value;
                btn.value = '⏳ Patienter ' + remaining + 's';
                var iv = setInterval(function() {
                    remaining--;
                    if (remaining <= 0) {
                        clearInterval(iv);
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        btn.style.cursor = 'pointer';
                        btn.value = orig;
                    } else {
                        btn.value = '⏳ Patienter ' + remaining + 's';
                    }
                }, 1000);
            })();";
        ScriptManager.RegisterStartupScript(this, GetType(), "lockoutCountdown", script, true);
    }
}