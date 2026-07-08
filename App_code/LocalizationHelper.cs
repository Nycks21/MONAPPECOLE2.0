using System;
using System.Globalization;
using System.Threading;
using System.Web;
using System.Web.UI;
using System.Web.SessionState;
using System.Text;

public static class LocalizationHelper
{
    // Langues supportées
    public static readonly string[] SupportedCultures = { "fr", "en", "mg" };
    
    // Noms des langues
    public static readonly string[] CultureNames = { "Français", "English", "Malagasy" };
    
    // Drapeaux
    public static readonly string[] CultureFlags = { "🇫🇷", "🇬🇧", "🇲🇬" };

    // Noms courts
    public static readonly string[] CultureShortNames = { "FR", "EN", "MG" };

    /// <summary>
    /// Obtient la culture actuelle
    /// </summary>
    public static CultureInfo CurrentCulture
    {
        get
        {
            if (HttpContext.Current != null && HttpContext.Current.Session != null)
            {
                string culture = HttpContext.Current.Session["CurrentCulture"] as string;
                if (!string.IsNullOrEmpty(culture) && Array.Exists(SupportedCultures, c => c == culture))
                {
                    return new CultureInfo(culture);
                }
            }
            return new CultureInfo("fr");
        }
    }

    /// <summary>
    /// Code de la langue actuelle
    /// </summary>
    public static string CurrentCultureCode
    {
        get { return CurrentCulture.Name; }
    }

    /// <summary>
    /// Définit la culture pour la session en cours
    /// </summary>
    public static void SetCulture(string cultureCode)
    {
        if (string.IsNullOrEmpty(cultureCode))
            return;

        if (!Array.Exists(SupportedCultures, c => c == cultureCode))
            return;

        if (HttpContext.Current != null && HttpContext.Current.Session != null)
        {
            HttpContext.Current.Session["CurrentCulture"] = cultureCode;
            
            var culture = new CultureInfo(cultureCode);
            Thread.CurrentThread.CurrentCulture = culture;
            Thread.CurrentThread.CurrentUICulture = culture;
            
            if (HttpContext.Current.CurrentHandler is Page)
            {
                Page page = (Page)HttpContext.Current.CurrentHandler;
                page.UICulture = cultureCode;
                page.Culture = cultureCode;
            }

            // Cookie pour persister la langue
            SetCultureCookie(cultureCode);
        }
    }

    private static void SetCultureCookie(string cultureCode)
    {
        try
        {
            if (HttpContext.Current == null || HttpContext.Current.Response == null) return;

            var cookie = new HttpCookie("UserLanguage")
            {
                Value = cultureCode,
                Expires = DateTime.UtcNow.AddYears(1),
                HttpOnly = true,
                Secure = HttpContext.Current.Request.IsSecureConnection,
                Path = "/"
            };
            HttpContext.Current.Response.Cookies.Set(cookie);
        }
        catch { }
    }

    private static string GetCultureFromCookie()
    {
        try
        {
            if (HttpContext.Current == null || HttpContext.Current.Request == null) return null;
            var cookie = HttpContext.Current.Request.Cookies["UserLanguage"];
            return cookie != null ? cookie.Value : null;
        }
        catch { return null; }
    }

    /// <summary>
    /// Obtient une traduction depuis les ressources
    /// </summary>
    public static string GetString(string key)
    {
        try
        {
            var resource = HttpContext.GetGlobalResourceObject("AppResources", key);
            if (resource != null)
                return resource.ToString();

            // Fallback en français
            var fallbackCulture = new CultureInfo("fr");
            Thread.CurrentThread.CurrentUICulture = fallbackCulture;
            resource = HttpContext.GetGlobalResourceObject("AppResources", key);
            Thread.CurrentThread.CurrentUICulture = CurrentCulture;
            
            return resource != null ? resource.ToString() : key;
        }
        catch
        {
            return key;
        }
    }

    /// <summary>
    /// Obtient une traduction avec formatage
    /// </summary>
    public static string GetString(string key, params object[] args)
    {
        try
        {
            string value = GetString(key);
            return string.Format(value, args);
        }
        catch
        {
            return key;
        }
    }

    /// <summary>
/// Rendu HTML du sélecteur de langue (version simplifiée et robuste)
/// </summary>
public static string RenderLanguageSelector()
{
    try
    {
        var html = new System.Text.StringBuilder();
        string currentCulture = CurrentCultureCode;

        html.Append(@"<div class=""language-selector"" style=""display:inline-block;position:relative;"">");
        html.Append(@"<button class=""btn btn-sm btn-outline-secondary dropdown-toggle"" type=""button"" style=""background:transparent;border:1px solid rgba(255,255,255,0.3);color:#fff;padding:4px 10px;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:13px;"">");
        
        int currentIndex = Array.IndexOf(SupportedCultures, currentCulture);
        if (currentIndex >= 0)
        {
            html.AppendFormat(@"<span style=""font-size:16px;"">{0}</span>", CultureFlags[currentIndex]);
            html.AppendFormat(@"<span style=""font-size:13px;"">{0}</span>", CultureNames[currentIndex]);
        }
        else
        {
            html.Append(@"🌍");
            html.Append(@" Langue");
        }
        
        html.Append(@" <span style=""font-size:10px;opacity:0.6;"">▼</span>");
        html.Append(@"</button>");
        
        html.Append(@"<div class=""dropdown-menu"" style=""position:absolute;top:100%;right:0;left:auto;min-width:160px;padding:6px 0;margin-top:4px;background:#2d3436;border:1px solid rgba(255,255,255,0.1);border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.4);display:none;z-index:99999;"">");
        html.Append(@"<div style=""padding:6px 14px;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.05);"">🌐 Langue</div>");

        for (int i = 0; i < SupportedCultures.Length; i++)
        {
            bool isActive = (SupportedCultures[i] == currentCulture);
            string activeBg = isActive ? "background:rgba(79,125,243,0.15);" : "";
            string activeColor = isActive ? "color:#5b8def;" : "";
            string checkMark = isActive ? @" <i class=""fas fa-check"" style=""color:#34ce57;margin-left:auto;""></i>" : "";
            
            html.AppendFormat(@"<a class=""dropdown-item"" href=""#"" onclick=""setLanguage('{0}'); return false;"" style=""display:flex;align-items:center;gap:10px;padding:7px 14px;font-size:13px;color:#e8edf5;text-decoration:none;cursor:pointer;transition:background 0.2s;{1}{2}"">",
                SupportedCultures[i], activeBg, activeColor);
            html.AppendFormat(@"<span style=""font-size:18px;"">{0}</span>", CultureFlags[i]);
            html.AppendFormat(@"<span>{0}</span>", CultureNames[i]);
            html.Append(checkMark);
            html.Append(@"</a>");
        }

        html.Append(@"</div></div>");

        // Script pour gérer le toggle du dropdown
        html.Append(@"
        <script>
            (function() {
                // Gérer le toggle du dropdown
                var selectors = document.querySelectorAll('.language-selector');
                for (var i = 0; i < selectors.length; i++) {
                    var selector = selectors[i];
                    var btn = selector.querySelector('button');
                    var dropdown = selector.querySelector('.dropdown-menu');
                    
                    if (btn && dropdown) {
                        btn.addEventListener('click', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            var d = this.parentNode.querySelector('.dropdown-menu');
                            if (d) {
                                d.classList.toggle('show');
                                if (d.classList.contains('show')) {
                                    d.style.display = 'block';
                                } else {
                                    d.style.display = 'none';
                                }
                            }
                        });
                    }
                }
                
                // Fermer le dropdown si on clique ailleurs
                document.addEventListener('click', function(e) {
                    var allSelectors = document.querySelectorAll('.language-selector');
                    for (var i = 0; i < allSelectors.length; i++) {
                        var selector = allSelectors[i];
                        var dropdown = selector.querySelector('.dropdown-menu');
                        if (dropdown && !selector.contains(e.target)) {
                            dropdown.classList.remove('show');
                            dropdown.style.display = 'none';
                        }
                    }
                });
                
                // Fonction pour changer la langue
                window.setLanguage = function(culture) {
                    var currentUrl = window.location.href;
                    var separator = currentUrl.indexOf('?') > -1 ? '&' : '?';
                    var newUrl = currentUrl + separator + 'lang=' + culture;
                    // Nettoyer les doublons
                    newUrl = newUrl.replace(/([?&])lang=[^&]*&/g, '$1');
                    newUrl = newUrl.replace(/([?&])lang=[^&]*$/, '');
                    if (newUrl.indexOf('?') > -1) {
                        newUrl = newUrl + '&lang=' + culture;
                    } else {
                        newUrl = newUrl + '?lang=' + culture;
                    }
                    window.location.href = newUrl;
                };
            })();
        </script>");

        return html.ToString();
    }
    catch (Exception ex)
    {
        System.Diagnostics.Debug.WriteLine("Erreur RenderLanguageSelector: " + ex.Message);
        return "<span style='color:red;'>⚠️ Erreur langue</span>";
    }
}

    /// <summary>
    /// Gère la langue depuis l'URL ou la session (compatible .NET 4.0)
    /// </summary>
    public static void HandleLanguage()
    {
        try
        {
            if (HttpContext.Current == null) return;

            HttpRequest request = HttpContext.Current.Request;
            HttpResponse response = HttpContext.Current.Response;
            HttpSessionState session = HttpContext.Current.Session;

            // Vérifier si la langue est dans l'URL
            string langParam = request.QueryString["lang"];
            if (!string.IsNullOrEmpty(langParam))
            {
                SetCulture(langParam);
                
                // Supprimer le paramètre lang de l'URL tout en conservant les autres paramètres
                var urlBuilder = new StringBuilder();
                urlBuilder.Append(request.Url.AbsolutePath);
                
                bool firstParam = true;
                foreach (string key in request.QueryString.Keys)
                {
                    if (!string.IsNullOrEmpty(key) && key.ToLower() != "lang")
                    {
                        if (firstParam)
                        {
                            urlBuilder.Append("?");
                            firstParam = false;
                        }
                        else
                        {
                            urlBuilder.Append("&");
                        }
                        urlBuilder.AppendFormat("{0}={1}", key, request.QueryString[key]);
                    }
                }
                
                response.Redirect(urlBuilder.ToString());
                return;
            }

            // Si pas dans l'URL, utiliser la session, le cookie ou le navigateur
            if (session != null)
            {
                string sessionCulture = session["CurrentCulture"] as string;
                if (string.IsNullOrEmpty(sessionCulture))
                {
                    // Essayer le cookie
                    string cookieCulture = GetCultureFromCookie();
                    if (!string.IsNullOrEmpty(cookieCulture) && Array.Exists(SupportedCultures, c => c == cookieCulture))
                    {
                        SetCulture(cookieCulture);
                    }
                    else
                    {
                        // Utiliser la langue du navigateur
                        string browserCulture = "fr";
                        if (request.UserLanguages != null && request.UserLanguages.Length > 0)
                        {
                            browserCulture = request.UserLanguages[0].Split('-')[0];
                        }
                        
                        if (Array.Exists(SupportedCultures, c => c == browserCulture))
                        {
                            SetCulture(browserCulture);
                        }
                        else
                        {
                            SetCulture("fr");
                        }
                    }
                }
                else
                {
                    var culture = new CultureInfo(sessionCulture);
                    Thread.CurrentThread.CurrentCulture = culture;
                    Thread.CurrentThread.CurrentUICulture = culture;
                }
            }
        }
        catch { }
    }

    /// <summary>
    /// Vérifie si une clé de ressource existe
    /// </summary>
    public static bool ResourceExists(string key)
    {
        try
        {
            var resource = HttpContext.GetGlobalResourceObject("AppResources", key);
            return resource != null;
        }
        catch
        {
            return false;
        }
    }
}