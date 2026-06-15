﻿<%@ Page Language="C#" ResponseEncoding="utf-8" EnableSessionState="True" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Collections.Generic" %>

<script runat="server">
private string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    Response.Clear();
    Response.Cache.SetNoStore();

    try
    {
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

        string username = GetStringValue(data, "USERNAME");
        string nom = GetStringValue(data, "NOM");
        string password = GetStringValue(data, "PWD");
        string email = GetStringValue(data, "EMAIL");
        string telephone = GetStringValue(data, "TELEPHONE");
        int roleId = GetIntValue(data, "ROLEID", 1);
        int active = GetIntValue(data, "ACTIVE", 1);
        
        List<string> permissions = new List<string>();
        if (data.ContainsKey("PERMISSIONS") && data["PERMISSIONS"] != null)
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

        if (!IsValidEmail(email))
        {
            WriteResponse(false, "Format d'email invalide");
            return;
        }

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

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

            // Sérialiser les permissions en JSON
            string permissionsJson = serializer.Serialize(permissions);

            using (SqlCommand cmd = new SqlCommand(
                @"INSERT INTO USERS (USERNAME, NOM, PWD, EMAIL, ROLEID, TELEPHONE, ACTIVE, MENU_PERMISSIONS, CREATED_AT, UPDATED_AT)
                  OUTPUT INSERTED.IDUSER
                  VALUES (@USERNAME, @NOM, @PWD, @EMAIL, @ROLEID, @TELEPHONE, @ACTIVE, @MENU_PERMISSIONS, GETDATE(), GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@USERNAME", username);
                cmd.Parameters.AddWithValue("@NOM", nom);
                cmd.Parameters.AddWithValue("@PWD", password);  // Mot de passe en clair
                cmd.Parameters.AddWithValue("@EMAIL", email);
                cmd.Parameters.AddWithValue("@ROLEID", roleId);
                cmd.Parameters.AddWithValue("@TELEPHONE", string.IsNullOrEmpty(telephone) ? (object)DBNull.Value : telephone);
                cmd.Parameters.AddWithValue("@ACTIVE", active);
                cmd.Parameters.AddWithValue("@MENU_PERMISSIONS", permissionsJson);

                int newUserId = (int)cmd.ExecuteScalar();
                
                WriteResponse(true, "Utilisateur ajouté avec succès", newUserId);
            }
        }
    }
    catch (SqlException ex)
    {
        if (ex.Number == 2627)
        {
            WriteResponse(false, "Ce nom d'utilisateur existe déjà");
        }
        else if (ex.Number == 547)
        {
            WriteResponse(false, "Violation de contrainte de clé étrangère");
        }
        else
        {
            WriteResponse(false, "Erreur SQL: " + ex.Message);
        }
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
</script>