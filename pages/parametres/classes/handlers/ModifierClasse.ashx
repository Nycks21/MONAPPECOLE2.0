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

            if (payload == null)
                throw new ArgumentException("Données invalides.");
            if (payload.ID <= 0)
                throw new ArgumentException("ID invalide.");
            if (string.IsNullOrWhiteSpace(payload.NOM))
                throw new ArgumentException("Le nom de la classe est obligatoire.");
            if (string.IsNullOrWhiteSpace(payload.TITULAIRE))
                throw new ArgumentException("Le titulaire est obligatoire.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"UPDATE [dbo].[Classes]
                  SET    NOM       = @nom,
                         NIVEAU    = @niveau,
                         TITULAIRE = @titulaire,
                         SALLE     = @salle,
                         EFFECTIF  = @effectif,
                         STATUT    = @statut
                  WHERE  ID = @id", conn))
            {
                cmd.Parameters.AddWithValue("@id",        payload.ID);
                cmd.Parameters.AddWithValue("@nom",       payload.NOM.Trim());
                cmd.Parameters.AddWithValue("@niveau",    payload.NIVEAU    ?? "");
                cmd.Parameters.AddWithValue("@titulaire", payload.TITULAIRE.Trim());
                cmd.Parameters.AddWithValue("@salle",     payload.SALLE     ?? "");
                cmd.Parameters.AddWithValue("@effectif",  payload.EFFECTIF);
                cmd.Parameters.AddWithValue("@statut",    payload.STATUT    ?? "Actif");

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
        public int    ID        { get; set; }
        public string NOM       { get; set; }
        public string NIVEAU    { get; set; }
        public string TITULAIRE { get; set; }
        public string SALLE     { get; set; }
        public int    EFFECTIF  { get; set; }
        public string STATUT    { get; set; }
    }
}
