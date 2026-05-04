using System;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.Configuration;

public partial class requetes : Page
{
    // ── Constantes de verrouillage (Inspirées de Login.aspx.cs) ───────────
    const int    MAX_ATTEMPTS    = 3;                   // 3 tentatives max
    const int    LOCKOUT_SECONDS = 60;                  // Blocage de 60 sec
    const string SK_ATTEMPTS     = "sql_attempts";      // Clé Session compteur
    const string SK_LOCKOUT_END  = "sql_lockout_end";   // Clé Session fin de blocage
    // ────────────────────────────────────────────────────────────────────────

    protected void Page_Load(object sender, EventArgs e)
    {
        AuthHelper.VerifySession(this);

        if (!IsPostBack)
        {
            // État initial : console verrouillée
            Session["IsAdminUnlocked"] = false;
            txtPassword.Text = "";
            
            // Vérifier si un blocage est toujours en cours au chargement initial
            CheckLockoutStatus();
        }
    }

    protected void btnValider_Click(object sender, EventArgs e) 
    {
        // 1. Vérification du verrouillage actif
        DateTime lockoutEnd = Session[SK_LOCKOUT_END] as DateTime? ?? DateTime.MinValue;

        if (DateTime.Now < lockoutEnd)
        {
            int secondsLeft = (int)Math.Ceiling((lockoutEnd - DateTime.Now).TotalSeconds);
            AfficherErreur("⛔ Bloqué", "Trop d'échecs. Réessayez dans " + secondsLeft + " s.");
            StartCountdownScript(secondsLeft);
            return;
        }

        // Blocage expiré → remise à zéro automatique
        if (lockoutEnd != DateTime.MinValue && DateTime.Now >= lockoutEnd)
        {
            Session.Remove(SK_ATTEMPTS);
            Session.Remove(SK_LOCKOUT_END);
        }

        string secretValide = WebConfigurationManager.AppSettings["LicenceSecret"];
        string saisie = txtPassword.Text.Trim();

        if (saisie == secretValide) 
        {
            // Succès : on nettoie les compteurs et on déverrouille
            Session.Remove(SK_ATTEMPTS);
            Session.Remove(SK_LOCKOUT_END);
            Session["IsAdminUnlocked"] = true;
            txtPassword.Text = ""; 
        } 
        else 
        {
            // Échec : Gestion du compteur
            Session["IsAdminUnlocked"] = false;
            
            int attempts = (Session[SK_ATTEMPTS] as int? ?? 0) + 1;
            Session[SK_ATTEMPTS] = attempts;

            int remaining = MAX_ATTEMPTS - attempts;

            if (attempts >= MAX_ATTEMPTS)
            {
                // Déclencher le blocage de 60 secondes
                Session[SK_LOCKOUT_END] = DateTime.Now.AddSeconds(LOCKOUT_SECONDS);
                Session[SK_ATTEMPTS]    = 0;
                
                AfficherErreur("⛔ Console Bloquée", "3 échecs consécutifs. Attendez " + LOCKOUT_SECONDS + " secondes.");
                StartCountdownScript(LOCKOUT_SECONDS);
            }
            else
            {
                AfficherErreur("Accès Refusé", "Code incorrect. Tentative(s) restante(s) : " + remaining);
            }
            
            txtPassword.Text = "";
        }
    }

    private void CheckLockoutStatus()
    {
        DateTime lockoutEnd = Session[SK_LOCKOUT_END] as DateTime? ?? DateTime.MinValue;
        if (DateTime.Now < lockoutEnd)
        {
            int secondsLeft = (int)Math.Ceiling((lockoutEnd - DateTime.Now).TotalSeconds);
            StartCountdownScript(secondsLeft);
        }
    }

    // Script de compte à rebours (Identique à login.aspx.cs)
    private void StartCountdownScript(int secondsLeft)
    {
        string script = @"
            (function() {
                var btn = document.getElementById('" + btnValider.ClientID + @"');
                if (!btn) return;
                btn.disabled = true;
                var remaining = " + secondsLeft + @";
                var origValue = btn.value;
                btn.value = 'Patienter ' + remaining + 's...';
                var iv = setInterval(function() {
                    remaining--;
                    if (remaining <= 0) {
                        clearInterval(iv);
                        btn.disabled = false;
                        btn.value = origValue;
                    } else {
                        btn.value = 'Patienter ' + remaining + 's...';
                    }
                }, 1000);
            })();";
        ScriptManager.RegisterStartupScript(this, GetType(), "lockoutCountdown", script, true);
    }

    private void AfficherErreur(string titre, string message)
    {
        string script = string.Format(@"Swal.fire({{
            icon: 'error',
            title: '{0}',
            text: '{1}',
            confirmButtonColor: '#d33'
        }});", titre.Replace("'", "\\'"), message.Replace("'", "\\'"));
        
        ScriptManager.RegisterStartupScript(this, GetType(), "SweetAlertError", script, true);
    }
}