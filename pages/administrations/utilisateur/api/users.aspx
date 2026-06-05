﻿﻿<%@ Page Language="C#" ResponseEncoding="utf-8" EnableSessionState="True" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.Security.Cryptography" %>
<%@ Import Namespace="System.Text" %>

<script runat="server">
private string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.ContentEncoding = System.Text.Encoding.UTF8;
    Response.Clear();
    Response.Cache.SetNoStore();

    try
    {
        // Gestion des requêtes OPTIONS (CORS preflight)
        if (Request.HttpMethod == "OPTIONS")
        {
            Response.StatusCode = 200;
            Response.End();
            return;
        }

        if (Request.HttpMethod != "POST")
        {
            Response.StatusCode = 405;
            WriteResponse(false, "Méthode non autorisée");
            return;
        }

        // Lire le corps de la requête
        string jsonString = "";
        using (var reader = new System.IO.StreamReader(Request.InputStream))
        {
            jsonString = reader.ReadToEnd();
        }

        if (string.IsNullOrEmpty(jsonString))
        {
            WriteResponse(false, "Données JSON vides");
            return;
        }

        var serializer = new JavaScriptSerializer();
        Dictionary<string, object> data = null;
        
        try
        {
            data = serializer.Deserialize<Dictionary<string, object>>(jsonString);
        }
        catch (Exception ex)
        {
            WriteResponse(false, "Format JSON invalide: " + ex.Message);
            return;
        }

        if (data == null)
        {
            WriteResponse(false, "Données invalides");
            return;
        }

        // Extraction des valeurs avec vérification
        string username = GetStringValue(data, "USERNAME");
        string nom = GetStringValue(data, "NOM");
        string password = GetStringValue(data, "PWD");
        string email = GetStringValue(data, "EMAIL");
        string telephone = GetStringValue(data, "TELEPHONE");
        int roleId = GetIntValue(data, "ROLEID", 1);
        int active = GetIntValue(data, "ACTIVE", 1);
        
        // Récupérer les permissions si présentes
        List<string> permissions = new List<string>();
        if (data.ContainsKey("PERMISSIONS"))
        {
            object permsObj = data["PERMISSIONS"];
            if (permsObj is ArrayList)
            {
                foreach (var p in (ArrayList)permsObj)
                {
                    permissions.Add(p.ToString());
                }
            }
        }

        // Validation
        if (string.IsNullOrEmpty(username))
        {
            WriteResponse(false, "Le nom d'utilisateur est requis");
            return;
        }
        if (string.IsNullOrEmpty(nom))
        {
            WriteResponse(false, "Le nom complet est requis");
            return;
        }
        if (string.IsNullOrEmpty(password))
        {
            WriteResponse(false, "Le mot de passe est requis");
            return;
        }
        if (password.Length < 8)
        {
            WriteResponse(false, "Le mot de passe doit contenir au moins 8 caractères");
            return;
        }
        if (string.IsNullOrEmpty(email))
        {
            WriteResponse(false, "L'email est requis");
            return;
        }

        // Validation email simple
        if (!IsValidEmail(email))
        {
            WriteResponse(false, "Format d'email invalide");
            return;
        }

        // Hash du mot de passe
        string hashedPassword = HashPassword(password);

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            // Vérifier si l'utilisateur existe déjà
            using (SqlCommand checkCmd = new SqlCommand("SELECT COUNT(*) FROM USERS WHERE USERNAME = @USERNAME", conn))
            {
                checkCmd.Parameters.AddWithValue("@USERNAME", username);
                int existing = (int)checkCmd.ExecuteScalar();
                if (existing > 0)
                {
                    WriteResponse(false, "Ce nom d'utilisateur existe déjà");
                    return;
                }
            }

            // Insérer l'utilisateur
            using (SqlCommand cmd = new SqlCommand(
                @"INSERT INTO USERS (USERNAME, NOM, PWD, EMAIL, ROLEID, TELEPHONE, ACTIVE, CREATED_AT)
                  OUTPUT INSERTED.IDUSER
                  VALUES (@USERNAME, @NOM, @PWD, @EMAIL, @ROLEID, @TELEPHONE, @ACTIVE, GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@USERNAME", username);
                cmd.Parameters.AddWithValue("@NOM", nom);
                cmd.Parameters.AddWithValue("@PWD", hashedPassword);
                cmd.Parameters.AddWithValue("@EMAIL", email);
                cmd.Parameters.AddWithValue("@ROLEID", roleId);
                cmd.Parameters.AddWithValue("@TELEPHONE", string.IsNullOrEmpty(telephone) ? (object)DBNull.Value : telephone);
                cmd.Parameters.AddWithValue("@ACTIVE", active);

                int newUserId = (int)cmd.ExecuteScalar();
                
                // Sauvegarder les permissions si présentes
                if (permissions.Count > 0)
                {
                    SavePermissions(newUserId, permissions, conn);
                }
                
                WriteResponse(true, "Utilisateur ajouté avec succès", newUserId);
            }
        }
    }
    catch (SqlException ex) when (ex.Number == 2627)
    {
        WriteResponse(false, "Ce nom d'utilisateur existe déjà");
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        WriteResponse(false, ex.Message.Replace("\"", "'").Replace("\r", "").Replace("\n", " "));
    }
}

private string GetStringValue(Dictionary<string, object> data, string key)
{
    if (data.ContainsKey(key) && data[key] != null)
        return data[key].ToString();
    return "";
}

private int GetIntValue(Dictionary<string, object> data, string key, int defaultValue)
{
    if (data.ContainsKey(key) && data[key] != null)
    {
        try
        {
            return Convert.ToInt32(data[key]);
        }
        catch
        {
            return defaultValue;
        }
    }
    return defaultValue;
}

private bool IsValidEmail(string email)
{
    try
    {
        var addr = new System.Net.Mail.MailAddress(email);
        return addr.Address == email;
    }
    catch
    {
        return false;
    }
}

private void SavePermissions(int userId, List<string> permissions, SqlConnection conn)
{
    // Supprimer les anciennes permissions
    using (SqlCommand deleteCmd = new SqlCommand("DELETE FROM USER_PERMISSIONS WHERE USER_ID = @USER_ID", conn))
    {
        deleteCmd.Parameters.AddWithValue("@USER_ID", userId);
        deleteCmd.ExecuteNonQuery();
    }

    // Ajouter les nouvelles permissions
    foreach (string perm in permissions)
    {
        using (SqlCommand insertCmd = new SqlCommand(
            "INSERT INTO USER_PERMISSIONS (USER_ID, PERMISSION_NAME) VALUES (@USER_ID, @PERMISSION_NAME)", conn))
        {
            insertCmd.Parameters.AddWithValue("@USER_ID", userId);
            insertCmd.Parameters.AddWithValue("@PERMISSION_NAME", perm);
            insertCmd.ExecuteNonQuery();
        }
    }
}

private void WriteResponse(bool success, string message, int userId = 0)
{
    var serializer = new JavaScriptSerializer();
    var response = new Dictionary<string, object>();
    response["success"] = success;
    response["message"] = message;
    if (userId > 0)
    {
        response["userId"] = userId;
    }
    Response.Write(serializer.Serialize(response));
}

private string HashPassword(string password)
{
    using (SHA256 sha256 = SHA256.Create())
    {
        byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}
</script>