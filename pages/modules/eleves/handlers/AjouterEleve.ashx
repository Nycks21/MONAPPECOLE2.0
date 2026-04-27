<%@ WebHandler Language="C#" Class="AjouterEleve" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterEleve : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

        // 1. Vérification de l'authentification
        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        // 2. Vérification de la méthode POST
        if (ctx.Request.HttpMethod != "POST")
        {
            ctx.Response.StatusCode = 405;
            ctx.Response.Write("{\"success\":false,\"message\":\"Méthode non autorisée\"}");
            return;
        }

        try
        {
            // 3. Lecture du corps de la requête JSON
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var payload = ser.Deserialize<ElevePayload>(body);

            // 4. Validations de base
            if (payload == null) throw new ArgumentException("Données invalides.");
            if (string.IsNullOrWhiteSpace(payload.NOM)) throw new ArgumentException("Le nom est obligatoire.");
            if (string.IsNullOrWhiteSpace(payload.MATRICULE)) throw new ArgumentException("Le matricule est obligatoire.");

            // Conversion des identifiants (GUID et INT)
            Guid classeGuid;
            if (!Guid.TryParse(payload.CLASSE, out classeGuid))
                throw new ArgumentException("La classe sélectionnée est invalide.");

            int anneeId;
            if (!int.TryParse(payload.ANNEE_ID, out anneeId))
                throw new ArgumentException("L'année scolaire est invalide.");

            // 5. Connexion à la base de données
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"INSERT INTO [dbo].[ELEVES]
                    (ID, ANNEE_ID, MATRICULE, NOM, CLASSE_ID, EMAIL, TELEPHONE, STATUT, CREATED_AT, UPDATED_AT)
                  VALUES
                    (NEWID(), @anneeId, @matricule, @nom, @classeId, @email, @tel, @statut, GETDATE(), GETDATE())", conn))
            {
                // Paramètres
                cmd.Parameters.Add("@anneeId",   System.Data.SqlDbType.Int).Value = anneeId;
                cmd.Parameters.Add("@matricule", System.Data.SqlDbType.NVarChar).Value = payload.MATRICULE.Trim();
                cmd.Parameters.Add("@nom",       System.Data.SqlDbType.NVarChar).Value = payload.NOM.Trim();
                cmd.Parameters.Add("@classeId",  System.Data.SqlDbType.UniqueIdentifier).Value = classeGuid;
                
                // Gestion des valeurs optionnelles (NULL)
                cmd.Parameters.Add("@email",     System.Data.SqlDbType.NVarChar).Value = (object)payload.EMAIL ?? DBNull.Value;
                cmd.Parameters.Add("@tel",       System.Data.SqlDbType.NVarChar).Value = (object)payload.TELEPHONE ?? DBNull.Value;
                
                // Statut par défaut 'Actif' si non précisé ou vide
                string finalStatut = string.IsNullOrWhiteSpace(payload.STATUT) ? "Actif" : payload.STATUT;
                cmd.Parameters.Add("@statut",    System.Data.SqlDbType.NVarChar).Value = finalStatut;

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            // Réponse de succès
            ctx.Response.Write("{\"success\":true, \"message\":\"Élève ajouté avec succès\"}");
        }
        catch (ArgumentException ex)
        {
            ctx.Response.StatusCode = 400;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string msg = ex.Message;
            
            // Gestion propre des doublons de matricule (Contrainte UNIQUE dans SQL)
            if (msg.Contains("UNIQUE") || msg.Contains("PRIMARY"))
                msg = "Erreur : Ce matricule est déjà utilisé par un autre élève.";
            
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(msg) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    // Structure des données reçues du JavaScript (eleves.js)
    private class ElevePayload
    {
        public string ANNEE_ID { get; set; }
        public string MATRICULE { get; set; }
        public string NOM       { get; set; }
        public string CLASSE    { get; set; } // Reçu comme string GUID
        public string EMAIL     { get; set; }
        public string TELEPHONE { get; set; }
        public string STATUT    { get; set; }
    }
}