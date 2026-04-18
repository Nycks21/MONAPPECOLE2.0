<%@ WebHandler Language="C#" Class="ModifierClasse" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class ModifierClasse : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset     = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

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

            var payload = ser.Deserialize<ClassePayload>(body);

            if (payload == null)         throw new ArgumentException("Données invalides.");
            if (payload.ID <= 0)         throw new ArgumentException("ID invalide.");
            if (string.IsNullOrEmpty(payload.NOM))       throw new ArgumentException("Le nom est obligatoire.");
            if (string.IsNullOrEmpty(payload.ENSEIGNANT)) throw new ArgumentException("L'enseignant est obligatoire.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"UPDATE [dbo].[Classes]
                  SET    NOM            = @nom,
                         ENSEIGNANT     = @ens,
                         COEFFICIENT    = @coeff,
                         HEURES_SEMAINE = @heures,
                         NIVEAU         = @niveau
                  WHERE  ID = @id", conn))
            {
                cmd.Parameters.AddWithValue("@id",     payload.ID);
                cmd.Parameters.AddWithValue("@nom",    payload.NOM.Trim());
                cmd.Parameters.AddWithValue("@ens",    payload.ENSEIGNANT.Trim());
                cmd.Parameters.AddWithValue("@coeff",  payload.COEFFICIENT);
                cmd.Parameters.AddWithValue("@heures", payload.HEURES_SEMAINE);
                cmd.Parameters.AddWithValue("@niveau", payload.NIVEAU ?? "Tous niveaux");

                conn.Open();
                int rows = cmd.ExecuteNonQuery();
                if (rows == 0) throw new Exception("Classe introuvable (ID=" + payload.ID + ").");
            }

            ctx.Response.Write("{\"success\":true}");
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

    private class ClassePayload
    {
        public int     ID            { get; set; }
        public string  NOM           { get; set; }
        public string  ENSEIGNANT    { get; set; }
        public decimal COEFFICIENT   { get; set; }
        public int     HEURES_SEMAINE{ get; set; }
        public string  NIVEAU        { get; set; }
    }
}
