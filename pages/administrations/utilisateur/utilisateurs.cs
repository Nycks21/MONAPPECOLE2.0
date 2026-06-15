using System;
using System.Web.UI;

public partial class utilisateurs : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        // Vérifier les droits d'accès
        if (!AuthHelper.IsAdmin() && !AuthHelper.IsSuperAdmin())
        {
            Response.Redirect("../../accueil/dashboards/index.aspx");
        }

        // Ajouter une classe CSS au body via JavaScript
        if (AuthHelper.IsSuperAdmin())
        {
            // Enregistrer un script pour ajouter la classe au body
            string script = "document.body.classList.add('superadmin-mode');";
            ClientScript.RegisterStartupScript(this.GetType(), "superadmin", script, true);
        }
        
        hfUserRole.Value = AuthHelper.GetUserRole();
    }
}