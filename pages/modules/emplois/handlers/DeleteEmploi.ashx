<%@ WebHandler Language="C#" Class="DeleteEmploi" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;
using System.IO;

public class DeleteEmploi : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";

        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        string json = new StreamReader(ctx.Request.InputStream).ReadToEnd();
        if (string.IsNullOrEmpty(json))
        {
            ctx.Response.Write("{\"success\":false,\"message\":\"Données JSON manquantes\"}");
            return;
        }

        try
        {
            var serializer = new JavaScriptSerializer();
            var data = serializer.Deserialize<dynamic>(json);

            string classe = data["classe"];
            string jour = data["jour"];
            string heureDebut = data["heureDebut"];

            if (string.IsNullOrEmpty(classe) || string.IsNullOrEmpty(jour) || string.IsNullOrEmpty(heureDebut))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants\"}");
                return;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                string sql = "DELETE FROM EMPLOI_TEMPS WHERE CLASSE_ID = @classe AND JOUR = @jour AND HEURE_DEBUT = @heureDebut";
                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@classe", classe);
                    cmd.Parameters.AddWithValue("@jour", jour);
                    cmd.Parameters.AddWithValue("@heureDebut", heureDebut);
                    cmd.ExecuteNonQuery();
                }
            }

            ctx.Response.Write("{\"success\":true}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}