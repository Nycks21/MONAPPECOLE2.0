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

            // Validation ID classe (GUID)
            Guid classeGuid;
            if (!Guid.TryParse(payload.ID, out classeGuid))
                throw new ArgumentException("ID de classe invalide.");

            if (string.IsNullOrWhiteSpace(payload.NOM))
                throw new ArgumentException("Le nom de la classe est obligatoire.");

            // Validation TITULAIRE_ID (int > 0)
            if (payload.TITULAIRE_ID <= 0)
                throw new ArgumentException("Veuillez sélectionner un titulaire valide.");

            // Validation des GUIDs Niveau et Salle
            Guid niveauGuid, salleGuid;
            if (!Guid.TryParse(payload.NIVEAU_ID, out niveauGuid))
                throw new ArgumentException("Le niveau sélectionné est invalide.");
            if (!Guid.TryParse(payload.SALLE_ID, out salleGuid))
                throw new ArgumentException("La salle sélectionnée est invalide.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"UPDATE [dbo].[Classes]
                  SET    NOM          = @nom,
                         NIVEAU_ID    = @niveauId,
                         TITULAIRE_ID = @titulaireId,
                         SALLE_ID     = @salleId,
                         EFFECTIF     = @effectif,
                         STATUT       = @statut
                  WHERE  ID = @id", conn))
            {
                cmd.Parameters.Add("@id",          System.Data.SqlDbType.UniqueIdentifier).Value = classeGuid;
                cmd.Parameters.Add("@nom",         System.Data.SqlDbType.NVarChar).Value         = payload.NOM.Trim();
                cmd.Parameters.Add("@niveauId",    System.Data.SqlDbType.UniqueIdentifier).Value = niveauGuid;
                cmd.Parameters.Add("@titulaireId", System.Data.SqlDbType.Int).Value             = payload.TITULAIRE_ID;
                cmd.Parameters.Add("@salleId",     System.Data.SqlDbType.UniqueIdentifier).Value = salleGuid;
                cmd.Parameters.Add("@effectif",    System.Data.SqlDbType.Int).Value             = payload.EFFECTIF;

                bool isActif = (payload.STATUT == "1" || payload.STATUT == "true" || payload.STATUT == "Actif");
                cmd.Parameters.Add("@statut",      System.Data.SqlDbType.Bit).Value             = isActif;

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
            string msg = ex.Message.Contains("UNIQUE") ? "Cette classe existe déjà." : ex.Message;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(msg) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    private class ClassePayload
    {
        public string ID           { get; set; }
        public string NOM          { get; set; }
        public string NIVEAU_ID    { get; set; }
        public int    TITULAIRE_ID { get; set; }
        public string SALLE_ID     { get; set; }
        public int    EFFECTIF     { get; set; }
        public string STATUT       { get; set; }
    }
}
