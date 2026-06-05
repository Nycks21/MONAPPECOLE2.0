<%@ Page Language="C#" AutoEventWireup="true" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Collections.Generic" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.ContentEncoding = System.Text.Encoding.UTF8;
    Response.Clear();
    Response.AddHeader("Cache-Control", "no-cache, no-store");
    Response.Cache.SetNoStore();

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            // Vérifier si la colonne MENU_PERMISSIONS existe
            string checkColumnQuery = @"
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'USERS' AND COLUMN_NAME = 'MENU_PERMISSIONS'";
            
            SqlCommand checkCmd = new SqlCommand(checkColumnQuery, conn);
            int columnExists = (int)checkCmd.ExecuteScalar();

            string query = @"
                SELECT IDUSER, USERNAME, NOM, ISNULL(EMAIL, '') AS EMAIL, 
                       ISNULL(TELEPHONE, '') AS TELEPHONE, ROLEID, CREATED_AT, 
                       CAST(ISNULL(ACTIVE, 0) AS BIT) AS ACTIVE";
            
            if (columnExists > 0)
            {
                query += ", ISNULL(MENU_PERMISSIONS, '[]') AS MENU_PERMISSIONS";
            }
            
            query += " FROM USERS ORDER BY NOM ASC";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                var users = new List<Dictionary<string, object>>();
                var serializer = new JavaScriptSerializer();

                while (reader.Read())
                {
                    var user = new Dictionary<string, object>();
                    user["IDUSER"] = reader["IDUSER"];
                    user["USERNAME"] = reader["USERNAME"];
                    user["NOM"] = reader["NOM"];
                    user["EMAIL"] = reader["EMAIL"];
                    user["TELEPHONE"] = reader["TELEPHONE"];
                    user["ROLEID"] = reader["ROLEID"];
                    user["CREATED_AT"] = Convert.ToDateTime(reader["CREATED_AT"]);
                    user["ACTIVE"] = reader["ACTIVE"];
                    
                    // Charger les permissions
                    if (columnExists > 0 && reader["MENU_PERMISSIONS"] != DBNull.Value)
                    {
                        string permsJson = reader["MENU_PERMISSIONS"].ToString();
                        if (!string.IsNullOrEmpty(permsJson) && permsJson != "[]")
                        {
                            try
                            {
                                user["PERMISSIONS"] = serializer.Deserialize<List<string>>(permsJson);
                            }
                            catch
                            {
                                user["PERMISSIONS"] = new List<string>();
                            }
                        }
                        else
                        {
                            user["PERMISSIONS"] = new List<string>();
                        }
                    }
                    else
                    {
                        user["PERMISSIONS"] = new List<string>();
                    }
                    
                    users.Add(user);
                }

                Response.Write(serializer.Serialize(users));
            }
        }
    }
    catch (Exception ex)
    {
        string safe = ex.Message.Replace("\"", "'").Replace("\n", " ").Replace("\r", " ");
        Response.Write("{\"success\":false,\"error\":\"" + safe + "\"}");
    }
    finally
    {
        Response.End();
    }
}
</script>