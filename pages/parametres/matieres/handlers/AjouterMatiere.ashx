<%@ WebHandler Language="C#" Class="AjouterMatiere" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterMatiere : IHttpHandler, IRequiresSessionState
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

            var payload = ser.Deserialize<MatierePayload>(body);

            if (payload == null)
                throw new ArgumentException("Données invalides.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"INSERT INTO [dbo].[MATIERES] 
                  (NOM, ENSEIGNANT, COEFFICIENT, HEURES_SEMAINE, NIVEAU, SALLE, CREATED_AT) 
                  VALUES 
                  (@nom, @ens, @coeff, @heures, @niveau, @salle, GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@nom",    payload.NOM.Trim());
                cmd.Parameters.AddWithValue("@ens",    payload.ENSEIGNANT.Trim());
                cmd.Parameters.AddWithValue("@coeff",  payload.COEFFICIENT);
                cmd.Parameters.AddWithValue("@heures", payload.HEURES_SEMAINE);
                cmd.Parameters.AddWithValue("@niveau", payload.NIVEAU ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@salle",  payload.SALLE ?? (object)DBNull.Value);

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            ctx.Response.Write("{\"success\":true}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable => false;

    private class MatierePayload
    {
        public string  NOM            { get; set; }
        public string  ENSEIGNANT     { get; set; }
        public decimal COEFFICIENT    { get; set; }
        public int     HEURES_SEMAINE { get; set; }
        public string  NIVEAU         { get; set; }
        public string  SALLE          { get; set; }
    }
}