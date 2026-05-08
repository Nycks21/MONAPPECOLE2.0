<%@ WebHandler Language="C#" Class="SupprimerNiveau" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class SupprimerNiveau : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        // Configuration de la réponse
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

        // Vérification de la session
        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        // Vérification de la méthode POST
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

            // Utilisation du Payload typé pour récupérer l'ID en string (GUID)
            var payload = ser.Deserialize<IdPayload>(body);

            // Validation du GUID
            Guid idGuid;
            if (payload == null || string.IsNullOrWhiteSpace(payload.ID) || !Guid.TryParse(payload.ID, out idGuid))
                throw new ArgumentException("Identifiant (GUID) invalide.");

            // Utilisation de la chaîne de connexion standardisée
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand("DELETE FROM [dbo].[NIVEAUX] WHERE ID = @id", conn))
            {
                // Utilisation explicite du type UniqueIdentifier
                cmd.Parameters.Add("@id", System.Data.SqlDbType.UniqueIdentifier).Value = idGuid;
                
                conn.Open();
                int rows = cmd.ExecuteNonQuery();

                if (rows == 0)
                    throw new Exception("Niveau introuvable ou déjà supprimé.");
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
            
            // Gestion spécifique pour les erreurs de clés étrangères (ex: si des classes sont liées au niveau)
            string msg = ex.Message.Contains("REFERENCE constraint") 
                ? "Impossible de supprimer ce niveau car il est utilisé par une ou plusieurs classes." 
                : ex.Message;

            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(msg) + "}");
        }
    }

    public bool IsReusable
    {
        get { return false; }
    }

    // Classe interne mise à jour : ID est maintenant une string pour recevoir le GUID
    private class IdPayload 
    { 
        public string ID { get; set; } 
    }
}