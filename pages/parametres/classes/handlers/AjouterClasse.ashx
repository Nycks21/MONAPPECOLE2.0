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

        // 1. Déclaration du sérialiseur au début pour qu'il soit accessible dans les blocs catch
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
            {
                body = reader.ReadToEnd();
            }

            // 2. CRUCIAL : On crée la variable payload en désérialisant le corps de la requête
            var payload = ser.Deserialize<ClassePayload>(body);

            // 3. Validation de base
            if (payload == null) 
                throw new ArgumentException("Les données envoyées sont vides ou invalides.");

            if (string.IsNullOrWhiteSpace(payload.NOM))
                throw new ArgumentException("Le nom de la classe est obligatoire.");
            
            if (string.IsNullOrWhiteSpace(payload.TITULAIRE))
                throw new ArgumentException("Le titulaire est obligatoire.");

            // 4. Conversion et validation des GUIDs (Niveau et Salle)
            Guid niveauGuid, salleGuid;
            if (!Guid.TryParse(payload.NIVEAU_ID, out niveauGuid))
                throw new ArgumentException("Le niveau sélectionné est invalide.");
            
            if (!Guid.TryParse(payload.SALLE_ID, out salleGuid))
                throw new ArgumentException("La salle sélectionnée est invalide.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"INSERT INTO [dbo].[CLASSES]
                    (ID, NOM, NIVEAU_ID, TITULAIRE, SALLE, EFFECTIF, STATUT, CREATED_AT)
                  VALUES
                    (NEWID(), @nom, @niveauId, @titulaire, @salleId, @effectif, @statut, GETDATE())", conn))
            {
                // Paramètres sécurisés avec types explicites
                cmd.Parameters.Add("@nom", System.Data.SqlDbType.NVarChar).Value = payload.NOM.Trim();
                cmd.Parameters.Add("@niveauId", System.Data.SqlDbType.UniqueIdentifier).Value = niveauGuid;
                cmd.Parameters.Add("@titulaire", System.Data.SqlDbType.NVarChar).Value = payload.TITULAIRE.Trim();
                cmd.Parameters.Add("@salleId", System.Data.SqlDbType.UniqueIdentifier).Value = salleGuid;
                cmd.Parameters.Add("@effectif", System.Data.SqlDbType.Int).Value = payload.EFFECTIF;
                
                // Conversion du statut en booléen pour le type BIT SQL
                bool isActif = (payload.STATUT == "1" || payload.STATUT == "true" || payload.STATUT == "Actif");
                cmd.Parameters.Add("@statut", System.Data.SqlDbType.Bit).Value = isActif;

                conn.Open();
                cmd.ExecuteNonQuery();
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
            
            // Gestion simplifiée des erreurs de doublons SQL
            string msg = ex.Message.Contains("UNIQUE") ? "Cette classe existe déjà." : ex.Message;
            
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(msg) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    // Structure des données attendues du JavaScript
    private class ClassePayload
    {
        public string NOM       { get; set; }
        public string NIVEAU_ID { get; set; }
        public string TITULAIRE { get; set; }
        public string SALLE_ID  { get; set; }
        public int    EFFECTIF  { get; set; }
        public string STATUT    { get; set; }
    }
}