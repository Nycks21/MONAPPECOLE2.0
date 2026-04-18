// matieres.cs — ASP.NET Web Forms / .NET Framework 4.8
// Toutes les dépendances sont natives : pas de NuGet requis.

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;

public partial class matieres : Page
{
    // ============================
    // PAGE_LOAD
    // ============================
    protected void Page_Load(object sender, EventArgs e)
    {
        // Cet appel unique exécute TOUTE la logique contenue dans le helper
        AuthHelper.VerifySession(this);
    }
}
