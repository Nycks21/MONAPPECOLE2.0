<%@ WebHandler Language="C#" Class="ModifierEleve" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class ModifierEleve : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        try
        {
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var payload = ser.Deserialize<ElevePayload>(body);
            if (payload == null) throw new ArgumentException("Données invalides.");

            // ID unique de l'élève (GUID)
            Guid eleveGuid;
            if (string.IsNullOrEmpty(payload.ID) || !Guid.TryParse(payload.ID, out eleveGuid))
                throw new ArgumentException("ID d'élève invalide.");

            // Validation de la classe (INT)
            int classeId;
            if (payload.CLASSE == null || !int.TryParse(payload.CLASSE.ToString(), out classeId)) 
                throw new ArgumentException("Classe invalide.");

            // DATE_NAISSANCE
            DateTime? dateNaiss = null;
            if (!string.IsNullOrEmpty(payload.DATE_NAISSANCE))
            {
                DateTime d;
                if (DateTime.TryParse(payload.DATE_NAISSANCE, out d)) dateNaiss = d;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"UPDATE [dbo].[ELEVES] SET 
                    NOM=@nom, 
                    CLASSE=@classe, 
                    EMAIL=@email, 
                    TELEPHONE=@tel, 
                    STATUT=@statut, 
                    GENRE=@genre, 
                    DATE_NAISSANCE=@dateNaiss, 
                    ADRESSE=@adresse, 
                    PARENT=@parent, 
                    UPDATED_AT=GETDATE() 
                  WHERE ID=@id", conn))
            {
                // Note : ANNEE_ID et MATRICULE sont retirés du UPDATE car ils sont grisés (non modifiables)
                
                cmd.Parameters.Add("@id", System.Data.SqlDbType.UniqueIdentifier).Value = eleveGuid;
                cmd.Parameters.Add("@nom", System.Data.SqlDbType.NVarChar, 255).Value = payload.NOM.Trim();
                cmd.Parameters.Add("@classe", System.Data.SqlDbType.Int).Value = classeId;
                
                cmd.Parameters.Add("@email", System.Data.SqlDbType.NVarChar, 255).Value = (payload.EMAIL != null) ? (object)payload.EMAIL.Trim() : DBNull.Value;
                cmd.Parameters.Add("@tel", System.Data.SqlDbType.NVarChar, 50).Value = (payload.TELEPHONE != null) ? (object)payload.TELEPHONE.Trim() : DBNull.Value;
                
                string statut = (string.IsNullOrEmpty(payload.STATUT)) ? "actif" : payload.STATUT.Trim().ToLower();
                cmd.Parameters.Add("@statut", System.Data.SqlDbType.NVarChar, 20).Value = statut;

                string genre = (string.IsNullOrEmpty(payload.GENRE)) ? "M" : payload.GENRE.Trim().ToUpper().Substring(0, 1);
                cmd.Parameters.Add("@genre", System.Data.SqlDbType.NChar, 1).Value = genre;

                cmd.Parameters.Add("@dateNaiss", System.Data.SqlDbType.Date).Value = (dateNaiss.HasValue) ? (object)dateNaiss.Value : DBNull.Value;
                cmd.Parameters.Add("@adresse", System.Data.SqlDbType.NVarChar, 500).Value = (payload.ADRESSE != null) ? (object)payload.ADRESSE.Trim() : DBNull.Value;
                cmd.Parameters.Add("@parent", System.Data.SqlDbType.NVarChar, 255).Value = (payload.PARENT != null) ? (object)payload.PARENT.Trim() : DBNull.Value;

                conn.Open();
                if (cmd.ExecuteNonQuery() == 0) throw new Exception("Élève introuvable ou aucune modification effectuée.");
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Profil élève mis à jour avec succès.\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
    
    private class ElevePayload {
        public string ID { get; set; }
        public string NOM { get; set; }
        public string CLASSE { get; set; }
        public string EMAIL { get; set; }
        public string TELEPHONE { get; set; }
        public string STATUT { get; set; }
        public string GENRE { get; set; }
        public string DATE_NAISSANCE { get; set; }
        public string ADRESSE { get; set; }
        public string PARENT { get; set; }
    }
}