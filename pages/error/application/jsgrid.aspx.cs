using System;
using System.Data.SqlClient;
using System.Configuration;

public partial class application_jsgrid : System.Web.UI.Page
{
    protected string connectedUsername = "";

    protected void Page_Load(object sender, EventArgs e)
    {
        if (!IsUserAuthenticated())
            return;

        if (!IsTokenValid())
            return;

        LoadUsername();
    }

    // ============================
    // AUTHENTIFICATION
    // ============================
    private bool IsUserAuthenticated()
    {
        if (Session["authenticated"] == null || !(bool)Session["authenticated"])
        {
            ForceLogout(false);
            return false;
        }
        return true;
    }

    // ============================
    // USERNAME
    // ============================
    private void LoadUsername()
    {
        connectedUsername = Session["username"] != null
            ? Session["username"].ToString()
            : "";
    }

    // ============================
    // TOKEN AUTRE PC
    // ============================
    private bool IsTokenValid()
    {
        if (Session["IDUSER"] == null || Session["SESSION_TOKEN"] == null)
        {
            ForceLogout(true);
            return false;
        }

        int idUser = (int)Session["IDUSER"];
        string token = Session["SESSION_TOKEN"].ToString();

        using (SqlConnection conn = new SqlConnection(
            ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString))
        {
            SqlCommand cmd = new SqlCommand(
                "SELECT SESSION_TOKEN FROM USERS WHERE IDUSER=@id", conn);
            cmd.Parameters.AddWithValue("@id", idUser);

            conn.Open();
            object result = cmd.ExecuteScalar();

            if (result == null || result.ToString() != token)
            {
                ForceLogout(true);
                return false;
            }
        }
        return true;
    }

    // ============================
    // LOGOUT
    // ============================
    private void ForceLogout(bool otherPc)
    {
        Session.Clear();
        Session.Abandon();

        if (otherPc)
            Response.Redirect("~/auth/Login.aspx?msg=other_pc", true);
        else
            Response.Redirect("~/auth/Login.aspx", true);
    }
}
