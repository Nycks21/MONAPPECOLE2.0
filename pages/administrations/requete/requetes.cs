using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;

public partial class requetes : Page
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
