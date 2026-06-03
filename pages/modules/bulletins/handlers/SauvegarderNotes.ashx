<%@ WebHandler Language="C#" Class="SauvegarderNotes" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class SauvegarderNotes : IHttpHandler, IRequiresSessionState
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

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

        try
        {
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var ser = new JavaScriptSerializer();
            var payload = ser.Deserialize<NotesPayload>(body);

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                string sql = @"UPDATE BULLETINS 
                               SET NOTE1 = @note1, 
                                   NOTE2 = @note2, 
                                   NOTE_PROJET = @noteProjet, 
                                   APPRECIATION = @appreciation,
                                   STATUT = 'En cours',
                                   UPDATED_AT = GETDATE()
                               WHERE ELEVE_MATRICULE = @matricule 
                               AND MATIERE_ID = @matiereId 
                               AND PERIODE = @periode";

                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@note1", payload.NOTE1.HasValue ? (object)payload.NOTE1.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@note2", payload.NOTE2.HasValue ? (object)payload.NOTE2.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@noteProjet", payload.NOTE_PROJET.HasValue ? (object)payload.NOTE_PROJET.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@appreciation", string.IsNullOrEmpty(payload.APPRECIATION) ? (object)DBNull.Value : payload.APPRECIATION);
                    cmd.Parameters.AddWithValue("@matricule", payload.ELEVE_MATRICULE);
                    cmd.Parameters.AddWithValue("@matiereId", new Guid(payload.MATIERE_ID));
                    cmd.Parameters.AddWithValue("@periode", payload.PERIODE);

                    int rowsAffected = cmd.ExecuteNonQuery();
                    
                    if (rowsAffected == 0)
                    {
                        // Si le bulletin n'existe pas, le créer
                        string insertSql = @"INSERT INTO BULLETINS 
                            (ELEVE_MATRICULE, MATIERE_ID, NOTE1, NOTE2, NOTE_PROJET, APPRECIATION, PERIODE, STATUT, CREATED_AT, UPDATED_AT) 
                            VALUES (@matricule, @matiereId, @note1, @note2, @noteProjet, @appreciation, @periode, 'En cours', GETDATE(), GETDATE())";
                        
                        using (var insertCmd = new SqlCommand(insertSql, conn))
                        {
                            insertCmd.Parameters.AddWithValue("@matricule", payload.ELEVE_MATRICULE);
                            insertCmd.Parameters.AddWithValue("@matiereId", new Guid(payload.MATIERE_ID));
                            insertCmd.Parameters.AddWithValue("@note1", payload.NOTE1.HasValue ? (object)payload.NOTE1.Value : DBNull.Value);
                            insertCmd.Parameters.AddWithValue("@note2", payload.NOTE2.HasValue ? (object)payload.NOTE2.Value : DBNull.Value);
                            insertCmd.Parameters.AddWithValue("@noteProjet", payload.NOTE_PROJET.HasValue ? (object)payload.NOTE_PROJET.Value : DBNull.Value);
                            insertCmd.Parameters.AddWithValue("@appreciation", string.IsNullOrEmpty(payload.APPRECIATION) ? (object)DBNull.Value : payload.APPRECIATION);
                            insertCmd.Parameters.AddWithValue("@periode", payload.PERIODE);
                            insertCmd.ExecuteNonQuery();
                        }
                    }
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Notes sauvegardées\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
    
    private class NotesPayload
    {
        public string ELEVE_MATRICULE { get; set; }
        public string MATIERE_ID { get; set; }
        public string PERIODE { get; set; }
        public decimal? NOTE1 { get; set; }
        public decimal? NOTE2 { get; set; }
        public decimal? NOTE_PROJET { get; set; }
        public string APPRECIATION { get; set; }
    }
}