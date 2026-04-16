using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.UI;

// ════════════════════════════════════════════════════════════
//  CLASSE DE BASE — authentification & helpers partagés
// ════════════════════════════════════════════════════════════
public abstract class BasePage : Page
{
    protected string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    protected override void OnPreInit(EventArgs e)
    {
        base.OnPreInit(e);

        if (!IsUserAuthenticated())
            ForceLogout(false);

        if (!IsTokenValid())
            ForceLogout(true);
    }

    protected bool IsUserAuthenticated()
    {
        return Session["authenticated"] != null && (bool)Session["authenticated"];
    }

    protected bool IsTokenValid()
    {
        if (Session["IDUSER"] == null || Session["SESSION_TOKEN"] == null)
            return false;

        int idUser;
        if (!int.TryParse(Session["IDUSER"].ToString(), out idUser))
            return false;

        try
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            using (SqlCommand cmd = new SqlCommand(
                "SELECT SESSION_TOKEN FROM USERS WHERE IDUSER = @id", conn))
            {
                cmd.Parameters.AddWithValue("@id", idUser);
                conn.Open();
                object result = cmd.ExecuteScalar();
                return result != null
                    && result.ToString() == Session["SESSION_TOKEN"].ToString();
            }
        }
        catch
        {
            return false;
        }
    }

    protected void SetUsername()
    {
        if (Session["username"] == null) return;
        string username = Session["username"].ToString().Replace("'", "\\'");
        string script =
            "document.addEventListener('DOMContentLoaded',function(){" +
            "var el=document.getElementById('navbarUsername');" +
            "if(el){el.innerText='" + username + "';}});";
        ClientScript.RegisterStartupScript(GetType(), "username", script, true);
    }

    protected void ForceLogout(bool autrePC)
    {
        Response.Cache.SetCacheability(HttpCacheability.NoCache);
        Response.Cache.SetNoStore();
        Response.AppendHeader("Pragma", "no-cache");
        Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        Session.Clear();
        Session.Abandon();
        Response.Redirect(
            autrePC ? "~/auth/Login.aspx?msg=other_pc" : "~/auth/Login.aspx", true);
    }

    protected T ExecuteScalar<T>(SqlConnection conn, string sql, object parameters = null)
    {
        using (SqlCommand cmd = new SqlCommand(sql, conn))
        {
            if (parameters != null)
                foreach (var p in parameters.GetType().GetProperties())
                    cmd.Parameters.AddWithValue("@" + p.Name,
                        p.GetValue(parameters) ?? DBNull.Value);

            object val = cmd.ExecuteScalar();
            return val != null && val != DBNull.Value
                ? (T)Convert.ChangeType(val, typeof(T))
                : default(T);
        }
    }

    protected T ExecuteScalarConn<T>(string sql, object parameters = null)
    {
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            return ExecuteScalar<T>(conn, sql, parameters);
        }
    }
}

// ════════════════════════════════════════════════════════════
//  PAGE DASHBOARD
// ════════════════════════════════════════════════════════════
public partial class dashboard : BasePage
{
    // ── Champs hérités de l'ancienne page identification ─────
    protected string connectedUsername = "";
    protected int    userCount   = 0;
    protected int    userCountNa = 0;
    protected int    userCountTo = 0;
    protected int    maxUsers    = 0;
    protected string expirationDateString = "";

    // ════════════════════════════════════════════════════════
    //  PAGE_INIT — intercepte les appels AJAX avant Page_Load
    // ════════════════════════════════════════════════════════
    protected void Page_Init(object sender, EventArgs e)
    {
        string action = Request.QueryString["action"];
        if (string.IsNullOrEmpty(action)) return;

        // La vérification d'auth est déjà faite dans OnPreInit (BasePage).
        // On réexpose juste le 401 pour le client JS.
        if (!IsUserAuthenticated())
        {
            Response.StatusCode = 401;
            Response.ContentType = "application/json";
            Response.Write("{\"error\":\"non autorisé\"}");
            Response.End();
            return;
        }

        Response.Clear();

        try
        {
            switch (action)
            {
                case "loadpage":
                    Response.ContentType = "text/html";
                    Response.Write(LoadChildPageContent());
                    break;
                case "kpi":         Response.ContentType = "application/json"; Response.Write(GetKpiJson());         break;
                case "presences":   Response.ContentType = "application/json"; Response.Write(GetPresencesJson());   break;
                case "repartition": Response.ContentType = "application/json"; Response.Write(GetRepartitionJson()); break;
                case "reussite":    Response.ContentType = "application/json"; Response.Write(GetReussiteJson());    break;
                case "frais":       Response.ContentType = "application/json"; Response.Write(GetFraisJson());       break;
                case "absences":    Response.ContentType = "application/json"; Response.Write(GetAbsencesJson());    break;
                case "activite":    Response.ContentType = "application/json"; Response.Write(GetActiviteJson());    break;
                default:
                    Response.ContentType = "application/json";
                    Response.Write("{\"error\":\"action inconnue\"}");
                    break;
            }
        }
        catch (Exception ex)
        {
            Response.ContentType = "application/json";
            Response.Write("{\"error\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }

        Response.End();
    }

    // ════════════════════════════════════════════════════════
    //  PAGE_LOAD — contenu initial
    // ════════════════════════════════════════════════════════
    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsPostBack)
        {
            connectedUsername = Session["username"] != null ? Session["username"].ToString() : "";
            SetUsername();
            litPageContent.Text = GetDashboardSectionHtml();

            ReadLicenceFile();
            LoadUserCount();
            LoadUserCountNa();
            LoadUserCountTo();
        }
    }

    // ════════════════════════════════════════════════════════
    //  CHARGEMENT PAGE ENFANT
    // ════════════════════════════════════════════════════════

    /// <summary>
    /// Lit le fichier .aspx demandé (param "page") et en extrait
    /// uniquement les blocs &lt;section class="content"&gt;.
    /// </summary>
    private string LoadChildPageContent()
    {
        string page = Request.QueryString["page"];
        if (string.IsNullOrEmpty(page))
            return "<p class='text-danger'>Page non spécifiée.</p>";

        // Sécurité : interdire les remontées de répertoire
        if (page.Contains("..") || page.Contains("\\") ||
            !page.EndsWith(".aspx", StringComparison.OrdinalIgnoreCase))
            return "<p class='text-danger'>Chemin invalide.</p>";

        string physicalPath = Server.MapPath("~/" + page.TrimStart('/'));

        if (!File.Exists(physicalPath))
            return "<p class='text-danger'>Page introuvable : "
                   + HttpUtility.HtmlEncode(page) + "</p>";

        string raw       = File.ReadAllText(physicalPath, System.Text.Encoding.UTF8);
        string extracted = ExtractSections(raw);

        return string.IsNullOrWhiteSpace(extracted)
            ? "<p class='text-warning'>Aucun bloc &lt;section class=\"content\"&gt; trouvé dans cette page.</p>"
            : extracted;
    }

    private string ExtractSections(string html)
    {
        var result = new System.Text.StringBuilder();
        int pos    = 0;

        while (pos < html.Length)
        {
            int sectionStart = FindSectionContent(html, pos);
            if (sectionStart < 0) break;

            int tagEnd = html.IndexOf('>', sectionStart);
            if (tagEnd < 0) break;

            int depth  = 1;
            int search = tagEnd + 1;

            while (depth > 0 && search < html.Length)
            {
                int nextOpen  = html.IndexOf("<section",  search, StringComparison.OrdinalIgnoreCase);
                int nextClose = html.IndexOf("</section", search, StringComparison.OrdinalIgnoreCase);

                if (nextClose < 0) break;

                if (nextOpen >= 0 && nextOpen < nextClose)
                {
                    depth++;
                    search = nextOpen + 1;
                }
                else
                {
                    depth--;
                    if (depth == 0)
                    {
                        int closeEnd = html.IndexOf('>', nextClose);
                        if (closeEnd < 0) closeEnd = nextClose + 9;
                        result.Append(html, sectionStart, closeEnd - sectionStart + 1);
                        result.Append("\n");
                        pos = closeEnd + 1;
                    }
                    else
                    {
                        search = nextClose + 1;
                    }
                }
            }

            if (depth != 0) break; // balise mal fermée
        }

        return result.ToString();
    }

    private int FindSectionContent(string html, int startPos)
    {
        int pos = startPos;
        while (pos < html.Length)
        {
            int idx = html.IndexOf("<section", pos, StringComparison.OrdinalIgnoreCase);
            if (idx < 0) return -1;

            int tagEnd = html.IndexOf('>', idx);
            if (tagEnd < 0) return -1;

            string tag = html.Substring(idx, tagEnd - idx + 1);

            if (Regex.IsMatch(tag,
                    @"class\s*=\s*[""'][^""']*\bcontent\b[^""']*[""']",
                    RegexOptions.IgnoreCase))
                return idx;

            pos = tagEnd + 1;
        }
        return -1;
    }

    // ════════════════════════════════════════════════════════
    //  CONTENU INITIAL DU DASHBOARD
    // ════════════════════════════════════════════════════════
    private string GetDashboardSectionHtml()
    {
        string thisFolder  = Path.GetDirectoryName(Server.MapPath("~/pages/dashboard/dashboard.aspx"));
        string contentPath = Path.Combine(thisFolder, "dashboard-content.aspx");

        if (!File.Exists(contentPath))
            return "<p class='text-warning p-3'>Fichier introuvable : " + contentPath + "</p>";

        string raw = File.ReadAllText(contentPath, System.Text.Encoding.UTF8);
        return ExtractSections(raw);
    }

    // ════════════════════════════════════════════════════════
    //  KPI — chiffres clés
    // ════════════════════════════════════════════════════════
    private string GetKpiJson()
    {
        var data = new Dictionary<string, object>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            data["totalEleves"] = ExecuteScalar<int>(conn, "SELECT COUNT(*) FROM ELEVES");

            // Rentrée scolaire : septembre de l'année courante ou précédente
            int anneeRentree = DateTime.Now.Month >= 9 ? DateTime.Now.Year : DateTime.Now.Year - 1;
            data["nouveauxRentree"] = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM ELEVES WHERE ACTIF=1" +
                " AND YEAR(DATE_INSCRIPTION)=@yr AND MONTH(DATE_INSCRIPTION)>=9",
                new { yr = anneeRentree });

            data["totalClasses"] = ExecuteScalar<int>(conn, "SELECT COUNT(*) FROM CLASSES");

            // Correction SQL : pas de WHERE avant GROUP BY
            data["moyEleves"] = ExecuteScalar<int>(conn,
                @"SELECT ISNULL(AVG(nb), 0)
                  FROM (SELECT COUNT(*) AS nb FROM ELEVES GROUP BY IDCLASSE) t");

            int mois  = DateTime.Now.Month;
            int annee = DateTime.Now.Year;

            int presents = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM ABSENCES WHERE JUSTIFIE=1 AND MONTH(DATEABS)=@m AND YEAR(DATEABS)=@y",
                new { m = mois, y = annee });
            int absents = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM ABSENCES WHERE MONTH(DATEABS)=@m AND YEAR(DATEABS)=@y",
                new { m = mois, y = annee });

            int totalJours = presents + absents;
            data["tauxPresence"] = totalJours > 0
                ? Math.Round((double)presents / totalJours * 100, 1)
                : 0;

            int moisPrec  = mois  == 1 ? 12     : mois  - 1;
            int anneePrec = mois  == 1 ? annee - 1 : annee;

            int absentsPrec = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM ABSENCES WHERE MONTH(DATEABS)=@m AND YEAR(DATEABS)=@y",
                new { m = moisPrec, y = anneePrec });
            data["variationPresence"] = absents - absentsPrec;

            data["fraisImpayes"] = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM FRAIS WHERE PAYE=0 AND ANNULEE=0");
            data["variationImpayes"] = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM FRAIS WHERE PAYE=0 AND ANNULEE=0" +
                " AND MONTH(DATEECHEANCE)=@m AND YEAR(DATEECHEANCE)=@y",
                new { m = moisPrec, y = anneePrec });

            data["garcons"] = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM ELEVES WHERE ACTIF=1 AND SEXE='Garçon'");
            data["filles"] = ExecuteScalar<int>(conn,
                "SELECT COUNT(*) FROM ELEVES WHERE ACTIF=1 AND SEXE='Fille'");
        }

        return new JavaScriptSerializer().Serialize(data);
    }

    // ════════════════════════════════════════════════════════
    //  PRÉSENCES — 7 derniers jours (hors week-end)
    // ════════════════════════════════════════════════════════
    private string GetPresencesJson()
    {
        var labels   = new List<string>();
        var presents = new List<int>();
        var absents  = new List<int>();
        int total    = ExecuteScalarConn<int>("SELECT COUNT(*) FROM ELEVES");

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            for (int i = 6; i >= 0; i--)
            {
                DateTime jour = DateTime.Today.AddDays(-i);
                if (jour.DayOfWeek == DayOfWeek.Saturday ||
                    jour.DayOfWeek == DayOfWeek.Sunday) continue;

                int absJour = ExecuteScalar<int>(conn,
                    "SELECT COUNT(*) FROM ABSENCES WHERE CONVERT(date,DATEABS)=@d",
                    new { d = jour.ToString("yyyy-MM-dd") });

                labels.Add(jour.ToString("ddd dd"));
                absents.Add(absJour);
                presents.Add(Math.Max(0, total - absJour));
            }
        }

        return new JavaScriptSerializer().Serialize(new { labels, presents, absents });
    }

    // ════════════════════════════════════════════════════════
    //  RÉPARTITION PAR NIVEAU
    // ════════════════════════════════════════════════════════
    private string GetRepartitionJson()
    {
        var niveaux = new List<string>();
        var counts  = new List<int>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            string sql = @"SELECT c.LIBELLE_NIVEAU, COUNT(e.IDELEVE) AS NB
                           FROM CLASSES c
                           LEFT JOIN ELEVES e ON e.IDCLASSE = c.IDCLASSE AND e.ACTIF = 1
                           GROUP BY c.LIBELLE_NIVEAU
                           ORDER BY c.LIBELLE_NIVEAU";

            using (SqlCommand cmd = new SqlCommand(sql, conn))
            using (SqlDataReader dr = cmd.ExecuteReader())
                while (dr.Read())
                {
                    niveaux.Add(dr.GetString(0));
                    counts.Add(dr.GetInt32(1));
                }
        }

        return new JavaScriptSerializer().Serialize(new { niveaux, counts });
    }

    // ════════════════════════════════════════════════════════
    //  TAUX DE RÉUSSITE PAR CLASSE
    // ════════════════════════════════════════════════════════
    private string GetReussiteJson()
    {
        var items = new List<object>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            string annee = DateTime.Now.Month >= 9
                ? DateTime.Now.Year + "-" + (DateTime.Now.Year + 1)
                : (DateTime.Now.Year - 1) + "-" + DateTime.Now.Year;

            string sql = @"SELECT TOP 6
                               c.LIBELLE_CLASSE,
                               ROUND(AVG(CAST(n.MOYENNE AS FLOAT)) / 20.0 * 100, 1) AS TAUX
                           FROM NOTES n
                           JOIN ELEVES e  ON e.IDELEVE  = n.IDELEVE
                           JOIN CLASSES c ON c.IDCLASSE = e.IDCLASSE
                           WHERE n.ANNEE_SCOLAIRE = @annee
                           GROUP BY c.LIBELLE_CLASSE
                           ORDER BY TAUX DESC";

            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@annee", annee);
                using (SqlDataReader dr = cmd.ExecuteReader())
                    while (dr.Read())
                        items.Add(new
                        {
                            classe = dr.GetString(0),
                            taux   = Math.Round(dr.GetDouble(1), 1)
                        });
            }
        }

        return new JavaScriptSerializer().Serialize(items);
    }

    // ════════════════════════════════════════════════════════
    //  FRAIS SCOLAIRES — 7 derniers mois
    // ════════════════════════════════════════════════════════
    private string GetFraisJson()
    {
        var labels  = new List<string>();
        var payes   = new List<int>();
        var impayes = new List<int>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            for (int i = 6; i >= 0; i--)
            {
                DateTime m = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).AddMonths(-i);
                labels.Add(m.ToString("MMM"));
                payes.Add(ExecuteScalar<int>(conn,
                    "SELECT COUNT(*) FROM FRAIS WHERE PAYE=1" +
                    " AND MONTH(DATEPAIEMENT)=@m AND YEAR(DATEPAIEMENT)=@y",
                    new { m = m.Month, y = m.Year }));
                impayes.Add(ExecuteScalar<int>(conn,
                    "SELECT COUNT(*) FROM FRAIS WHERE PAYE=0 AND ANNULEE=0" +
                    " AND MONTH(DATEECHEANCE)=@m AND YEAR(DATEECHEANCE)=@y",
                    new { m = m.Month, y = m.Year }));
            }
        }

        return new JavaScriptSerializer().Serialize(new { labels, payes, impayes });
    }

    // ════════════════════════════════════════════════════════
    //  TOP ABSENCES
    // ════════════════════════════════════════════════════════
    private string GetAbsencesJson()
    {
        var rows = new List<object>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            string sql = @"SELECT TOP 8
                               e.NOM + ' ' + e.PRENOM AS NomComplet,
                               c.LIBELLE_CLASSE,
                               COUNT(a.IDABSENCE) AS NbAbs
                           FROM ABSENCES a
                           JOIN ELEVES  e ON e.IDELEVE  = a.IDELEVE
                           JOIN CLASSES c ON c.IDCLASSE = e.IDCLASSE
                           WHERE MONTH(a.DATEABS) = @m AND YEAR(a.DATEABS) = @y
                           GROUP BY e.NOM, e.PRENOM, c.LIBELLE_CLASSE
                           ORDER BY NbAbs DESC";

            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                cmd.Parameters.AddWithValue("@m", DateTime.Now.Month);
                cmd.Parameters.AddWithValue("@y", DateTime.Now.Year);

                using (SqlDataReader dr = cmd.ExecuteReader())
                    while (dr.Read())
                    {
                        int nb = dr.GetInt32(2);
                        rows.Add(new
                        {
                            nom    = dr.GetString(0),
                            classe = dr.GetString(1),
                            nb,
                            statut = nb >= 7 ? "Critique" : nb >= 4 ? "Surveiller" : "Normal"
                        });
                    }
            }
        }

        return new JavaScriptSerializer().Serialize(rows);
    }

    // ════════════════════════════════════════════════════════
    //  ACTIVITÉ RÉCENTE (données statiques — à remplacer par BDD)
    // ════════════════════════════════════════════════════════
    private string GetActiviteJson()
    {
        var items = new List<object>
        {
            new { type = "success", texte = "Nouvel élève inscrit",       detail = "Razafy Marie — 6ème A", temps = "Il y a 23 min" },
            new { type = "danger",  texte = "Absence signalée",           detail = "Rakoto Jean — 3ème B",  temps = "Il y a 1h"     },
            new { type = "warning", texte = "Paiement reçu",              detail = "Frais 2ème trimestre",  temps = "Il y a 2h"     },
            new { type = "info",    texte = "Bulletin généré",            detail = "5ème A — 58 élèves",    temps = "Hier 15h30"    },
            new { type = "success", texte = "Emploi du temps mis à jour", detail = "4ème A",                temps = "Hier 09h15"    },
        };
        return new JavaScriptSerializer().Serialize(items);
    }

    // ════════════════════════════════════════════════════════
    //  LICENCE
    // ════════════════════════════════════════════════════════
    private void ReadLicenceFile()
    {
        string path = Server.MapPath("~/bin/Licence.key");
        expirationDateString = "Date non définie";
        maxUsers = 0;

        if (!File.Exists(path))
        {
            expirationDateString = "Fichier licence non trouvé";
            return;
        }

        bool inHistorique = false;
        foreach (string rawLine in File.ReadAllLines(path))
        {
            string line = rawLine.Trim();

            if (line.StartsWith("//Historiques")) { inHistorique = true; continue; }
            if (!inHistorique || line.StartsWith("//") || line == "") continue;

            if (line.StartsWith("EXPIRATIONS="))
                expirationDateString = line.Substring("EXPIRATIONS=".Length).Trim();
            else if (line.StartsWith("MAX_USERSS="))
                int.TryParse(line.Substring("MAX_USERSS=".Length).Trim(), out maxUsers);
        }
    }

    // ════════════════════════════════════════════════════════
    //  COMPTEURS UTILISATEURS
    // ════════════════════════════════════════════════════════
    private void LoadUserCount()
    {
        userCount = ExecuteScalarConn<int>(
            "SELECT COUNT(*) FROM USERS WHERE ACTIVE = 1 AND ROLEID <> 0");
    }

    private void LoadUserCountNa()
    {
        userCountNa = ExecuteScalarConn<int>(
            "SELECT COUNT(*) FROM USERS WHERE ACTIVE = 0 AND ROLEID <> 0");
    }

    private void LoadUserCountTo()
    {
        userCountTo = ExecuteScalarConn<int>(
            "SELECT COUNT(*) FROM USERS WHERE ROLEID <> 0");
    }

    // ════════════════════════════════════════════════════════
    //  BACKUP
    // ════════════════════════════════════════════════════════
    protected void btnBackup_Click(object sender, EventArgs e)
    {
        try
        {
            string backupPath;
            using (SqlConnection cn = new SqlConnection(connStr))
            using (SqlCommand cmd = new SqlCommand("BackupAndGetPath", cn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                var output = new SqlParameter("@BackupPath", SqlDbType.NVarChar, 300)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(output);
                cn.Open();
                cmd.ExecuteNonQuery();
                backupPath = output.Value.ToString();
            }

            if (!File.Exists(backupPath))
            {
                ShowAlert("Erreur lors de la création du backup.");
                return;
            }

            DownloadFile(backupPath);
        }
        catch (Exception ex)
        {
            ShowAlert("Erreur lors de la sauvegarde : " + ex.Message);
        }
    }

    private void DownloadFile(string filePath)
    {
        var file = new FileInfo(filePath);
        Response.Clear();
        Response.ContentType = "application/octet-stream";
        Response.AddHeader("Content-Disposition", "attachment; filename=" + file.Name);
        Response.AddHeader("Content-Length", file.Length.ToString());
        Response.TransmitFile(file.FullName);
        Response.Flush();
        Response.End();
    }

    private void ShowAlert(string message)
    {
        Response.Write(
            "<script>alert('" + message.Replace("'", "\\'") + "');</script>");
    }
}
