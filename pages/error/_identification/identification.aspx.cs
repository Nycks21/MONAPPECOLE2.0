using System;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.IO;

namespace MonAppEcole.pages._identification
{
    public partial class identification : System.Web.UI.Page
    {
        protected string connectedUsername = "";
        protected int userCount = 0;
        protected int userCountNa = 0;
        protected int userCountTo = 0;
        protected int maxUsers = 0;
        protected string expirationDateString = "";

        protected string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        protected void Page_Load(object sender, EventArgs e)
        {
            ReadLicenceFile();

            if (Session["authenticated"] == null || !(Session["authenticated"] is bool) || !(bool)Session["authenticated"])
            {
                ForceLogout(false);
                return;
            }

            if (!IsTokenValid())
            {
                ForceLogout(true);
                return;
            }

            if (Session["username"] != null)
            {
                connectedUsername = Session["username"].ToString();
            }

            if (!IsPostBack)
            {
                LoadUserCount();
                LoadUserCountNa();
                LoadUserCountTo();
            }
        }

        private void ReadLicenceFile()
        {
            string path = Server.MapPath("~/bin/Licence.key");

            expirationDateString = "Date non définie";
            maxUsers = 0;

            if (!File.Exists(path))
            {
                expirationDateString = "Fichier licence non trouvé";
                return;
            }

            string[] lines = File.ReadAllLines(path);
            bool inHistorique = false;

            foreach (string rawLine in lines)
            {
                string line = rawLine.Trim();

                if (line.StartsWith("//Historiques"))
                {
                    inHistorique = true;
                    continue;
                }

                if (!inHistorique || line.StartsWith("//") || line == "")
                    continue;

                if (line.StartsWith("EXPIRATIONS="))
                {
                    expirationDateString = line.Substring("EXPIRATIONS=".Length).Trim();
                }
                else if (line.StartsWith("MAX_USERSS="))
                {
                    int.TryParse(line.Substring("MAX_USERSS=".Length).Trim(), out maxUsers);
                }
            }
        }

        private bool IsTokenValid()
        {
            if (Session["IDUSER"] == null || Session["SESSION_TOKEN"] == null)
                return false;

            int idUser;
            if (!int.TryParse(Session["IDUSER"].ToString(), out idUser))
                return false;

            using (SqlConnection conn = new SqlConnection(connStr))
            using (SqlCommand cmd = new SqlCommand("SELECT SESSION_TOKEN FROM USERS WHERE IDUSER = @id", conn))
            {
                cmd.Parameters.AddWithValue("@id", idUser);
                conn.Open();
                object result = cmd.ExecuteScalar();
                return result != null && result.ToString() == Session["SESSION_TOKEN"].ToString();
            }
        }


       private void LoadUserCount()
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            using (SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM USERS WHERE ACTIVE = 1 AND ROLEID <> 0", conn))
            {
                conn.Open();
                object result = cmd.ExecuteScalar();

                if (result != null)
                    userCount = Convert.ToInt32(result);
            }
        }

        private void LoadUserCountNa()
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            using (SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM USERS WHERE ACTIVE = 0 AND ROLEID <> 0", conn))
            {
                conn.Open();
                object result = cmd.ExecuteScalar();

                if (result != null)
                    userCountNa = Convert.ToInt32(result);
            }
        }

        private void LoadUserCountTo()
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            using (SqlCommand cmd = new SqlCommand("SELECT COUNT(*) FROM USERS WHERE ROLEID <> 0", conn))
            {
                conn.Open();
                object result = cmd.ExecuteScalar();

                if (result != null)
                    userCountTo = Convert.ToInt32(result);
            }
        }

        private void ForceLogout(bool otherPc)
        {
            Response.Cache.SetCacheability(System.Web.HttpCacheability.NoCache);
            Response.Cache.SetNoStore();
            Response.AppendHeader("Pragma", "no-cache");
            Response.AppendHeader("Cache-Control", "no-cache, no-store, must-revalidate");

            Session.Clear();
            Session.Abandon();

            if (otherPc)
                Response.Redirect("~/auth/Login.aspx?msg=other_pc", true);
            else
                Response.Redirect("~/auth/Login.aspx", true);
        }

        protected void btnBackup_Click(object sender, EventArgs e)
        {
            try
            {
                string backupPath = "";

                using (SqlConnection cn = new SqlConnection(connStr))
                using (SqlCommand cmd = new SqlCommand("BackupAndGetPath", cn))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    SqlParameter output = new SqlParameter("@BackupPath", SqlDbType.NVarChar, 300);
                    output.Direction = ParameterDirection.Output;
                    cmd.Parameters.Add(output);

                    cn.Open();
                    cmd.ExecuteNonQuery();

                    backupPath = output.Value.ToString();
                }

                if (!File.Exists(backupPath))
                {
                    ShowError("Erreur lors de la création du backup.");
                    return;
                }

                DownloadFile(backupPath);
            }
            catch (Exception ex)
            {
                ShowError("Erreur lors de la sauvegarde : " + ex.Message);
            }
        }

        private void DownloadFile(string filePath)
        {
            FileInfo file = new FileInfo(filePath);

            Response.Clear();
            Response.ContentType = "application/octet-stream";
            Response.AddHeader("Content-Disposition", "attachment; filename=" + file.Name);
            Response.AddHeader("Content-Length", file.Length.ToString());
            Response.TransmitFile(file.FullName);
            Response.Flush();
            Response.End();
        }

        private void ShowError(string message)
        {
            // Ici, tu peux afficher l’erreur dans un Label ou via un système de notification
            // Par exemple, un label ASP.NET avec ID lblError (à ajouter dans ton aspx si tu veux)
            // lblError.Text = message;
            // lblError.Visible = true;

            // Pour l’instant, on fait simple avec Response.Write (à remplacer par ta méthode)
            Response.Write(string.Format("<script>alert('{0}');</script>", message.Replace("'", "\\'")));
        }
    }
}
