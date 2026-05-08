// salles.cs — ASP.NET Web Forms / .NET Framework 4.8
// Paramètres généraux > Salles de classe

using System;
using System.Web.UI;

public partial class salles : Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        AuthHelper.VerifySession(this);
    }
}
