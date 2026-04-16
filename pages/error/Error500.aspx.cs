using System;
using System.Web.UI;

public partial class Error500 : Page
{
    // Bouton Retour Login
    protected void btnRetourLogin_Click(object sender, EventArgs e)
    {
        Response.Redirect("~/auth/Login.aspx");
    }

    // Bouton Télécharger la sauvegarde
    protected void btnBackup_Click(object sender, EventArgs e)
    {
        // Ici tu peux mettre ton code pour générer le backup
        // Pour l'instant, on fait juste une redirection vers la page principale
        // Remplace cette ligne par ton code de backup si besoin
        Response.Redirect("~/auth/Login.aspx");
    }
}
