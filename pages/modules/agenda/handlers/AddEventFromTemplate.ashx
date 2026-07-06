<%@ WebHandler Language="C#" Class="AddEventFromTemplate" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AddEventFromTemplate : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";

        try
        {
            if (ctx.Session == null || ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
            {
                ctx.Response.StatusCode = 401;
                ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }

            string connStr = "";
            var connSetting = ConfigurationManager.ConnectionStrings["MaConnexion"];
            if (connSetting != null)
            {
                connStr = connSetting.ConnectionString;
            }

            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Erreur de connexion\"}");
                return;
            }

            var json = new System.IO.StreamReader(ctx.Request.InputStream).ReadToEnd();
            var serializer = new JavaScriptSerializer();
            var data = serializer.Deserialize<Dictionary<string, object>>(json);

            string templateId = data.ContainsKey("templateId") ? data["templateId"].ToString() : "";
            if (string.IsNullOrEmpty(templateId))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"ID du template manquant\"}");
                return;
            }

            int userId = Convert.ToInt32(ctx.Session["IDUSER"]);
            string id = Guid.NewGuid().ToString();

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                // Vérifier que le template existe
                string checkSql = "SELECT COUNT(*) FROM EVENTTEMPLATES WHERE ID = @templateId";
                using (var checkCmd = new SqlCommand(checkSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@templateId", templateId);
                    int count = (int)checkCmd.ExecuteScalar();
                    if (count == 0)
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Template non trouvé\"}");
                        return;
                    }
                }

                string sql = @"
                    INSERT INTO CALENDAREVENTS (
                        ID,
                        IDUSER,
                        TEMPLATE_ID,
                        TITRE,
                        DATE_DEBUT,
                        DATE_FIN,
                        COULEUR,
                        HEURE_DEBUT,
                        HEURE_FIN,
                        DESCRIPTION,
                        TYPE,
                        LIEU,
                        PUBLIQUE,
                        URL,
                        CREATED_AT
                    )
                    SELECT 
                        @id,
                        @userId,
                        @templateId,
                        NOM,
                        GETDATE(),
                        GETDATE(),
                        COULEUR,
                        HEURE_DEBUT,
                        HEURE_FIN,
                        DESCRIPTION,
                        TYPE,
                        LIEU,
                        PUBLIQUE,
                        URL,
                        GETDATE()
                    FROM EVENTTEMPLATES 
                    WHERE ID = @templateId";

                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@userId", userId);
                    cmd.Parameters.AddWithValue("@templateId", templateId);
                    cmd.ExecuteNonQuery();
                }
            }

            var result = new Dictionary<string, object>();
            result["success"] = true;
            result["message"] = "Événement ajouté depuis le modèle";
            result["id"] = id;

            ctx.Response.Write(new JavaScriptSerializer().Serialize(result));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string safeMsg = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + safeMsg + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}