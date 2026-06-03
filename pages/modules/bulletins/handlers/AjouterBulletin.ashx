<%@ WebHandler Language="C#" Class="AjouterBulletin" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterBulletin : IHttpHandler, IRequiresSessionState
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

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

            var payload = ser.Deserialize<BulletinPayload>(body);
            if (payload == null) throw new ArgumentException("Données invalides.");

            if (string.IsNullOrEmpty(payload.MATRICULE)) throw new ArgumentException("Le matricule est obligatoire.");
            if (string.IsNullOrEmpty(payload.MATIERE_ID)) throw new ArgumentException("La matière est obligatoire.");
            if (string.IsNullOrEmpty(payload.PERIODE)) throw new ArgumentException("La période est obligatoire.");

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                // Vérifier si un bulletin existe déjà pour cet élève, cette matière et cette période
                string checkSql = @"SELECT COUNT(*) FROM BULLETINS 
                                    WHERE ELEVE_MATRICULE = @matricule 
                                    AND MATIERE_ID = @matiereId 
                                    AND PERIODE = @periode";
                
                using (var checkCmd = new SqlCommand(checkSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@matricule", payload.MATRICULE);
                    checkCmd.Parameters.AddWithValue("@matiereId", new Guid(payload.MATIERE_ID));
                    checkCmd.Parameters.AddWithValue("@periode", payload.PERIODE);
                    
                    int existing = Convert.ToInt32(checkCmd.ExecuteScalar());
                    if (existing > 0)
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Un bulletin existe déjà pour cet élève dans cette matière et période\"}");
                        return;
                    }
                }

                // Insérer le bulletin avec les 3 notes
                string insertSql = @"INSERT INTO BULLETINS 
                    (ELEVE_MATRICULE, MATIERE_ID, NOTE1, NOTE2, NOTE_PROJET, APPRECIATION, PERIODE, STATUT, CREATED_AT, UPDATED_AT) 
                    VALUES (@matricule, @matiereId, @note1, @note2, @noteProjet, @appreciation, @periode, 'Non saisi', GETDATE(), GETDATE())";
                
                using (var cmd = new SqlCommand(insertSql, conn))
                {
                    cmd.Parameters.AddWithValue("@matricule", payload.MATRICULE);
                    cmd.Parameters.AddWithValue("@matiereId", new Guid(payload.MATIERE_ID));
                    cmd.Parameters.AddWithValue("@note1", payload.NOTE1.HasValue ? (object)payload.NOTE1.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@note2", payload.NOTE2.HasValue ? (object)payload.NOTE2.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@noteProjet", payload.NOTE_PROJET.HasValue ? (object)payload.NOTE_PROJET.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@appreciation", string.IsNullOrEmpty(payload.APPRECIATION) ? (object)DBNull.Value : payload.APPRECIATION);
                    cmd.Parameters.AddWithValue("@periode", payload.PERIODE);
                    
                    cmd.ExecuteNonQuery();
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Bulletin ajouté avec succès.\"}");
        }
        catch (SqlException ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"Erreur base de données: " + ser.Serialize(ex.Message) + "\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = (ex is ArgumentException) ? 400 : 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
    
    private class BulletinPayload
    {
        public string MATRICULE { get; set; }
        public string MATIERE_ID { get; set; }
        public decimal? NOTE1 { get; set; }
        public decimal? NOTE2 { get; set; }
        public decimal? NOTE_PROJET { get; set; }
        public string APPRECIATION { get; set; }
        public string PERIODE { get; set; }
    }
}