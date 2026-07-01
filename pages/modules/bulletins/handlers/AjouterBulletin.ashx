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

            // Calculer TOTAL_NOTE si non fourni
            decimal totalNote = 0;
            if (payload.TOTAL_NOTE.HasValue)
            {
                totalNote = payload.TOTAL_NOTE.Value;
            }
            else
            {
                // Calcul automatique si les coefficients sont disponibles
                totalNote = CalculerTotalNote(payload);
            }

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                // Vérifier si un bulletin existe déjà
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

                // Insérer avec TOTAL_NOTE
                string insertSql = @"INSERT INTO BULLETINS 
                    (ID, ELEVE_MATRICULE, MATIERE_ID, NOTE1, NOTE2, NOTE_PROJET, TOTAL_NOTE, APPRECIATION, PERIODE, STATUT, CREATED_AT, UPDATED_AT) 
                    VALUES (NEWID(), @matricule, @matiereId, @note1, @note2, @noteProjet, @totalNote, @appreciation, @periode, 'Non saisi', GETDATE(), GETDATE())";
                
                using (var cmd = new SqlCommand(insertSql, conn))
                {
                    cmd.Parameters.AddWithValue("@matricule", payload.MATRICULE);
                    cmd.Parameters.AddWithValue("@matiereId", new Guid(payload.MATIERE_ID));
                    cmd.Parameters.AddWithValue("@note1", payload.NOTE1.HasValue ? (object)payload.NOTE1.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@note2", payload.NOTE2.HasValue ? (object)payload.NOTE2.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@noteProjet", payload.NOTE_PROJET.HasValue ? (object)payload.NOTE_PROJET.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@totalNote", totalNote);
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

    private decimal CalculerTotalNote(BulletinPayload payload)
    {
        // Valeurs par défaut si coefficients non disponibles
        decimal coeff1 = 1;
        decimal coeff2 = 2;
        decimal coeffProjet = 1;
        
        decimal total = 0;
        if (payload.NOTE1.HasValue && payload.NOTE1.Value >= 0 && payload.NOTE1.Value <= 20)
            total += payload.NOTE1.Value * coeff1;
        if (payload.NOTE2.HasValue && payload.NOTE2.Value >= 0 && payload.NOTE2.Value <= 20)
            total += payload.NOTE2.Value * coeff2;
        if (payload.NOTE_PROJET.HasValue && payload.NOTE_PROJET.Value >= 0 && payload.NOTE_PROJET.Value <= 20)
            total += payload.NOTE_PROJET.Value * coeffProjet;
        
        return total;
    }

    public bool IsReusable { get { return false; } }
    
    private class BulletinPayload
    {
        public string MATRICULE { get; set; }
        public string MATIERE_ID { get; set; }
        public decimal? NOTE1 { get; set; }
        public decimal? NOTE2 { get; set; }
        public decimal? NOTE_PROJET { get; set; }
        public decimal? TOTAL_NOTE { get; set; }  // ✅ Nouveau champ
        public string APPRECIATION { get; set; }
        public string PERIODE { get; set; }
    }
}