using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.UI;

public partial class bulletins : Page
{
    // ============================
    // PAGE_LOAD
    // ============================
    protected void Page_Load(object sender, EventArgs e)
    {
        // Cet appel unique exécute TOUTE la logique contenue dans le helper
        AuthHelper.VerifySession(this);

        if (!IsPostBack)
        {
            // Récupérer les informations de l'utilisateur connecté
            hfUserRole.Value = AuthHelper.GetUserRole();
            hfUserName.Value = AuthHelper.GetUserName();
            hfProfesseurId.Value = AuthHelper.GetProfesseurId();
            
            // Récupérer les classes autorisées pour cet utilisateur
            string classesAutorisees = AuthHelper.GetClassesAutorisees();
            hfClassesAutorisees.Value = classesAutorisees;
            
            // Récupérer les matières autorisées pour cet utilisateur
            string matieresAutorisees = AuthHelper.GetMatieresAutorisees();
            hfMatieresAutorisees.Value = matieresAutorisees;
        }
    }
}