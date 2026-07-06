<%@ WebHandler Language="C#" Class="UpdateEvent" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class UpdateEvent : IHttpHandler, IRequiresSessionState
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

            string id = data.ContainsKey("id") ? data["id"].ToString() : "";
            if (string.IsNullOrEmpty(id))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"ID manquant\"}");
                return;
            }

            int userId = Convert.ToInt32(ctx.Session["IDUSER"]);
            string title = data.ContainsKey("title") ? data["title"].ToString() : "Sans titre";
            string type = data.ContainsKey("type") ? data["type"].ToString() : "autre";
            string start = data.ContainsKey("start") ? data["start"].ToString() : null;
            string end = data.ContainsKey("end") ? data["end"].ToString() : null;
            string color = data.ContainsKey("color") ? data["color"].ToString() : "#6f42c1";
            string description = data.ContainsKey("description") ? data["description"].ToString() : "";
            string location = data.ContainsKey("location") ? data["location"].ToString() : "";
            string publique = data.ContainsKey("publique") ? data["publique"].ToString() : "all";
            string url = data.ContainsKey("url") ? data["url"].ToString() : "";
            string heureDebut = data.ContainsKey("heureDebut") ? data["heureDebut"].ToString() : "";
            string heureFin = data.ContainsKey("heureFin") ? data["heureFin"].ToString() : "";

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                // Vérifier que l'événement appartient à l'utilisateur
                string checkSql = "SELECT COUNT(*) FROM CALENDAREVENTS WHERE ID = @id AND (IDUSER = @userId OR IDUSER IS NULL)";
                using (var checkCmd = new SqlCommand(checkSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@id", id);
                    checkCmd.Parameters.AddWithValue("@userId", userId);
                    int count = (int)checkCmd.ExecuteScalar();
                    if (count == 0)
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Événement non trouvé ou non autorisé\"}");
                        return;
                    }
                }

                string sql = @"
                    UPDATE CALENDAREVENTS SET
                        TITRE = @title,
                        DATE_DEBUT = @start,
                        DATE_FIN = @end,
                        COULEUR = @color,
                        HEURE_DEBUT = @heureDebut,
                        HEURE_FIN = @heureFin,
                        DESCRIPTION = @description,
                        TYPE = @type,
                        LIEU = @location,
                        PUBLIQUE = @publique,
                        URL = @url
                    WHERE ID = @id";

                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    cmd.Parameters.AddWithValue("@title", title);
                    cmd.Parameters.AddWithValue("@start", string.IsNullOrEmpty(start) ? (object)DBNull.Value : DateTime.Parse(start));
                    cmd.Parameters.AddWithValue("@end", string.IsNullOrEmpty(end) ? (object)DBNull.Value : DateTime.Parse(end));
                    cmd.Parameters.AddWithValue("@color", color);
                    cmd.Parameters.AddWithValue("@heureDebut", string.IsNullOrEmpty(heureDebut) ? (object)DBNull.Value : heureDebut);
                    cmd.Parameters.AddWithValue("@heureFin", string.IsNullOrEmpty(heureFin) ? (object)DBNull.Value : heureFin);
                    cmd.Parameters.AddWithValue("@description", string.IsNullOrEmpty(description) ? (object)DBNull.Value : description);
                    cmd.Parameters.AddWithValue("@type", type);
                    cmd.Parameters.AddWithValue("@location", string.IsNullOrEmpty(location) ? (object)DBNull.Value : location);
                    cmd.Parameters.AddWithValue("@publique", publique);
                    cmd.Parameters.AddWithValue("@url", string.IsNullOrEmpty(url) ? (object)DBNull.Value : url);

                    cmd.ExecuteNonQuery();
                }
            }

            var result = new Dictionary<string, object>();
            result["success"] = true;
            result["message"] = "Événement modifié avec succès";

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