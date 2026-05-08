// niveaux.cs — ASP.NET Web Forms / .NET Framework 4.8
// Paramètres généraux > Niveaux

using System;
using System.Web.UI;

public partial class niveaux : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        AuthHelper.VerifySession(this);
    }
}
