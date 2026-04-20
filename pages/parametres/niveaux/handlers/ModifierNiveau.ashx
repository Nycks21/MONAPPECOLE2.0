<%@ WebHandler Language="C#" Class="ModifierSalle" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class ModifierSalle : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        // Configuration de la réponse
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

        // Sécurité : Vérification de la session
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

            var payload = ser.Deserialize<SallePayload>(body);

            if (payload == null)
                throw new ArgumentException("Données invalides.");

            // ✅ VALIDATION DU GUID
            Guid idGuid;
            if (string.IsNullOrWhiteSpace(payload.ID) || !Guid.TryParse(payload.ID, out idGuid))
                throw new ArgumentException("Identifiant de salle (GUID) invalide.");

            if (string.IsNullOrWhiteSpace(payload.NUMERO))
                throw new ArgumentException("Le numéro de salle est obligatoire.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"UPDATE [dbo].[SALLES]
                  SET    NUMERO   = @numero,
                         CAPACITE = @capacite,
                         STATUT   = @statut
                  WHERE  ID       = @id", conn))
            {
                // Utilisation du type spécifique UniqueIdentifier pour éviter les erreurs de conversion
                cmd.Parameters.Add("@id", System.Data.SqlDbType.UniqueIdentifier).Value = idGuid;
                cmd.Parameters.AddWithValue("@numero",   payload.NUMERO.Trim());
                cmd.Parameters.AddWithValue("@capacite", payload.CAPACITE);
                cmd.Parameters.AddWithValue("@statut",   payload.STATUT);

                conn.Open();
                int rows = cmd.ExecuteNonQuery();

                if (rows == 0) 
                    throw new Exception("La salle n'existe pas ou aucune modification n'a été détectée.");
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
            
            // Gestion des erreurs de contraintes (ex: numéro de salle déjà pris par une autre salle)
            string msg = (ex.Message.Contains("UNIQUE") || ex.Message.Contains("UQ_"))
                ? "Ce numéro de salle est déjà utilisé par une autre salle." 
                : ex.Message;
            
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(msg) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    private class SallePayload
    {
        public string ID { get; set; } // Reçu en tant que String (GUID)
        public string NUMERO { get; set; }
        public int CAPACITE { get; set; }
        public bool STATUT { get; set; }
    }
}