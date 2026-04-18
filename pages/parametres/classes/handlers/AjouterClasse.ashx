<%@ WebHandler Language="C#" Class="AjouterClasse" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterClasse : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset     = "utf-8";
        ctx.Response.Cache.SetNoStore();

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

            var ser     = new JavaScriptSerializer();
            var payload = ser.Deserialize<ClassePayload>(body);

            if (string.IsNullOrWhiteSpace(payload.NOM))
                throw new ArgumentException("Le nom est obligatoire.");
            if (string.IsNullOrWhiteSpace(payload.ENSEIGNANT))
                throw new ArgumentException("L'enseignant est obligatoire.");
            if (payload.COEFFICIENT < 0.5m || payload.COEFFICIENT > 10m)
                throw new ArgumentException("Coefficient invalide.");
            if (payload.HEURES_SEMAINE < 1 || payload.HEURES_SEMAINE > 40)
                throw new ArgumentException("Heures invalides.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"INSERT INTO [dbo].[Classes]
                    (NOM, ENSEIGNANT, COEFFICIENT, HEURES_SEMAINE, NIVEAU, CREATED_AT)
                  VALUES
                    (@nom, @ens, @coeff, @heures, @niveau, GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@nom",    payload.NOM.Trim());
                cmd.Parameters.AddWithValue("@ens",    payload.ENSEIGNANT.Trim());
                cmd.Parameters.AddWithValue("@coeff",  payload.COEFFICIENT);
                cmd.Parameters.AddWithValue("@heures", payload.HEURES_SEMAINE);
                cmd.Parameters.AddWithValue("@niveau", payload.NIVEAU ?? "Tous niveaux");

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            ctx.Response.Write("{\"success\":true}");
        }
        catch (ArgumentException ex)
        {
            ctx.Response.StatusCode = 400;
            ctx.Response.Write("{\"success\":false,\"message\":"
                + new JavaScriptSerializer().Serialize(ex.Message) + "}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":"
                + new JavaScriptSerializer().Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    private class ClassePayload
    {
        public string  NOM            { get; set; }
        public string  ENSEIGNANT     { get; set; }
        public decimal COEFFICIENT    { get; set; }
        public int     HEURES_SEMAINE { get; set; }
        public string  NIVEAU         { get; set; }
    }
}
