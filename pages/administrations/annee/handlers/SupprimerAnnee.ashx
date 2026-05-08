<%@ WebHandler Language="C#" Class="SupprimerAnnee" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class SupprimerAnnee : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset     = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

        // Vérification de la session
        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        if (ctx.Request.HttpMethod != "POST")
        {
            ctx.Response.StatusCode = 405;
            ctx.Response.Write("{\"success\":false,\"message\":\"Méthode non autorisée\"}");
            return;
        }

        try
        {
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var payload = ser.Deserialize<IdPayload>(body);

            if (payload == null || payload.ID <= 0)
                throw new ArgumentException("ID d'année invalide.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand("DELETE FROM [dbo].[RANNEE] WHERE ID = @id", conn))
            {
                cmd.Parameters.Add("@id", System.Data.SqlDbType.Int).Value = payload.ID;
                conn.Open();
                int rows = cmd.ExecuteNonQuery();
                if (rows == 0)
                    throw new Exception("Année introuvable (ID=" + payload.ID + ").");
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Année scolaire supprimée avec succès.\"}");
        }
        catch (ArgumentException ex)
        {
            ctx.Response.StatusCode = 400;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    // ID est un INT (auto-increment), pas un GUID
    private class IdPayload
    {
        public int ID { get; set; }
    }
}
