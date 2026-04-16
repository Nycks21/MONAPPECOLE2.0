<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.Data" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    // ✅ Définir l'encodage UTF-8 AVANT tout
    Response.ContentType = "application/json; charset=utf-8";
    Response.ContentEncoding = System.Text.Encoding.UTF8;
    Response.Clear();

    if (Request.HttpMethod != "POST")
    {
        WriteJson(405, "error", "Méthode non autorisée");
        return;
    }

    // Accepter QueryString
    string idStr      = Request.QueryString["id"];
    string nom        = Request.QueryString["nom"];
    string email      = Request.QueryString["email"];
    string roleStr    = Request.QueryString["roleId"];
    string telephone         = Request.QueryString["telephone"];
    string activeStr  = Request.QueryString["active"];
    string password   = Request.QueryString["password"];
    
    // Trim manuel
    if (nom != null) nom = nom.Trim();
    if (email != null) email = email.Trim();
    if (telephone != null) telephone = telephone.Trim();
    if (password != null) password = password.Trim();

    // Validation ID
    int id;
    if (string.IsNullOrEmpty(idStr) || !int.TryParse(idStr, out id))
    {
        WriteJson(400, "error", "ID utilisateur invalide ou manquant");
        return;
    }

    // Validation champs obligatoires
    if (string.IsNullOrEmpty(nom) ||
        string.IsNullOrEmpty(email))
    {
        WriteJson(400, "error", "Nom et Email sont requis");
        return;
    }

    // Role
    int roleId = 0;
    if (!string.IsNullOrEmpty(roleStr))
        int.TryParse(roleStr, out roleId);

    // Active
    bool active = false;
    if (!string.IsNullOrEmpty(activeStr))
        active = activeStr == "1" || activeStr.Equals("true", StringComparison.OrdinalIgnoreCase);

    try
    {
        var connSetting = ConfigurationManager.ConnectionStrings["MaConnexion"];

        if (connSetting == null)
        {
            WriteJson(500, "error", "Chaîne de connexion introuvable");
            return;
        }

        using (SqlConnection conn = new SqlConnection(connSetting.ConnectionString))
        {
            conn.Open();

            // Construire la requête dynamiquement
            string query = @"
                UPDATE USERS SET 
                    NOM = @NOM,
                    EMAIL = @EMAIL,
                    ROLEID = @ROLEID,
                    TELEPHONE = @TELEPHONE,
                    ACTIVE = @ACTIVE";
            
            // Ajouter le mot de passe seulement s'il est fourni
            if (!string.IsNullOrEmpty(password))
            {
                query += ", PWD = @PWD";
            }
            
            query += " WHERE IDUSER = @ID";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                cmd.Parameters.Add("@NOM", SqlDbType.NVarChar, 100).Value = nom;
                cmd.Parameters.Add("@EMAIL", SqlDbType.NVarChar, 255).Value = email;
                cmd.Parameters.Add("@ROLEID", SqlDbType.Int).Value = roleId;
                cmd.Parameters.Add("@TELEPHONE", SqlDbType.NVarChar, 100).Value = telephone;
                cmd.Parameters.Add("@ACTIVE", SqlDbType.Bit).Value = active;
                cmd.Parameters.Add("@ID", SqlDbType.Int).Value = id;
                
                // Ajouter le paramètre mot de passe seulement si fourni
                if (!string.IsNullOrEmpty(password))
                {
                    cmd.Parameters.Add("@PWD", SqlDbType.NVarChar, 255).Value = password;
                }

                int rows = cmd.ExecuteNonQuery();

                if (rows > 0)
                {
                    WriteJson(200, "success", "Utilisateur mis à jour avec succès");
                }
                else
                {
                    WriteJson(404, "error", "Utilisateur non trouvé");
                }
            }
        }
    }
    catch (System.Threading.ThreadAbortException)
    {
        // ✅ IGNORER cette exception (causée par Response.End())
        // Ne rien faire
    }
    catch (Exception ex)
    {
        // Log détaillé pour débogage
        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", "").Replace("\n", " ");
        WriteJson(500, "error", "Erreur serveur: " + safeMessage);
    }
}

private void WriteJson(int statusCode, string status, string message)
{
    try
    {
        Response.StatusCode = statusCode;
        
        // ✅ Échapper correctement les caractères JSON
        message = message.Replace("\\", "\\\\")
                        .Replace("\"", "\\\"")
                        .Replace("\r", "")
                        .Replace("\n", " ");
        
        string success = (status == "success") ? "true" : "false";
        string json = "{\"status\":\"" + status + "\",\"success\":" + success + ",\"message\":\"" + message + "\"}";
        
        Response.Write(json);
        Response.Flush(); // ✅ Forcer l'envoi
        
        // ✅ Utiliser CompleteRequest au lieu de End
        HttpContext.Current.ApplicationInstance.CompleteRequest();
    }
    catch (System.Threading.ThreadAbortException)
    {
        // Ignorer
    }
}
</script>