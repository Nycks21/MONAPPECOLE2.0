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

            // Validation selon les champs réels de la table Classes
            if (string.IsNullOrWhiteSpace(payload.NOM))
                throw new ArgumentException("Le nom de la classe est obligatoire.");
            if (string.IsNullOrWhiteSpace(payload.TITULAIRE))
                throw new ArgumentException("Le titulaire est obligatoire.");
            if (payload.EFFECTIF < 0)
                throw new ArgumentException("L'effectif ne peut pas être négatif.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"INSERT INTO [dbo].[Classes]
                    (NOM, NIVEAU, TITULAIRE, SALLE, EFFECTIF, STATUT)
                  VALUES
                    (@nom, @niveau, @titulaire, @salle, @effectif, @statut)", conn))
            {
                cmd.Parameters.AddWithValue("@nom",       payload.NOM.Trim());
                cmd.Parameters.AddWithValue("@niveau",    payload.NIVEAU    ?? "");
                cmd.Parameters.AddWithValue("@titulaire", payload.TITULAIRE.Trim());
                cmd.Parameters.AddWithValue("@salle",     payload.SALLE     ?? "");
                cmd.Parameters.AddWithValue("@effectif",  payload.EFFECTIF);
                cmd.Parameters.AddWithValue("@statut",    payload.STATUT    ?? "Actif");

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
        public string NOM       { get; set; }
        public string NIVEAU    { get; set; }
        public string TITULAIRE { get; set; }
        public string SALLE     { get; set; }
        public int    EFFECTIF  { get; set; }
        public string STATUT    { get; set; }
    }
}
