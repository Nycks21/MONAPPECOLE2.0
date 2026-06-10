<%@ WebHandler Language="C#" Class="ModifierBulletin" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class ModifierBulletin : IHttpHandler, IRequiresSessionState
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

        try
        {
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var ser = new JavaScriptSerializer();
            var data = ser.Deserialize<Dictionary<string, object>>(body);

            if (data == null)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Données invalides\"}");
                return;
            }

            // Récupérer les paramètres
            string id = data.ContainsKey("ID") ? data["ID"].ToString() : null;
            decimal? note1 = data.ContainsKey("NOTE1") && data["NOTE1"] != null ? Convert.ToDecimal(data["NOTE1"]) : (decimal?)null;
            decimal? note2 = data.ContainsKey("NOTE2") && data["NOTE2"] != null ? Convert.ToDecimal(data["NOTE2"]) : (decimal?)null;
            decimal? noteProjet = data.ContainsKey("NOTE_PROJET") && data["NOTE_PROJET"] != null ? Convert.ToDecimal(data["NOTE_PROJET"]) : (decimal?)null;
            decimal? coeff1 = data.ContainsKey("COEFF1") && data["COEFF1"] != null ? Convert.ToDecimal(data["COEFF1"]) : (decimal?)1;
            decimal? coeff2 = data.ContainsKey("COEFF2") && data["COEFF2"] != null ? Convert.ToDecimal(data["COEFF2"]) : (decimal?)2;
            decimal? coeffProjet = data.ContainsKey("COEFF_PROJET") && data["COEFF_PROJET"] != null ? Convert.ToDecimal(data["COEFF_PROJET"]) : (decimal?)1;
            string appreciation = data.ContainsKey("APPRECIATION") ? data["APPRECIATION"].ToString() : "";
            string matricule = data.ContainsKey("ELEVE_MATRICULE") ? data["ELEVE_MATRICULE"].ToString() : "";
            string matiereId = data.ContainsKey("MATIERE_ID") ? data["MATIERE_ID"].ToString() : "";
            string periode = data.ContainsKey("PERIODE") ? data["PERIODE"].ToString() : "";

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                
                // Vérifier si l'enregistrement existe
                string checkSql = "SELECT COUNT(*) FROM BULLETINS WHERE ID = @id OR (ELEVE_MATRICULE = @matricule AND MATIERE_ID = @matiereId AND PERIODE = @periode)";
                using (var checkCmd = new SqlCommand(checkSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@id", string.IsNullOrEmpty(id) ? (object)DBNull.Value : new Guid(id));
                    checkCmd.Parameters.AddWithValue("@matricule", matricule);
                    checkCmd.Parameters.AddWithValue("@matiereId", string.IsNullOrEmpty(matiereId) ? (object)DBNull.Value : new Guid(matiereId));
                    checkCmd.Parameters.AddWithValue("@periode", periode);
                    
                    int exists = (int)checkCmd.ExecuteScalar();
                    
                    if (exists > 0 && !string.IsNullOrEmpty(id))
                    {
                        // Mise à jour
                        string updateSql = @"
                            UPDATE BULLETINS 
                            SET NOTE1 = @note1,
                                NOTE2 = @note2,
                                NOTE_PROJET = @noteProjet,
                                COEFF1 = @coeff1,
                                COEFF2 = @coeff2,
                                COEFF_PROJET = @coeffProjet,
                                APPRECIATION = @appreciation,
                                STATUT = 'En cours',
                                UPDATED_AT = GETDATE()
                            WHERE ID = @id";
                        
                        using (var cmd = new SqlCommand(updateSql, conn))
                        {
                            cmd.Parameters.AddWithValue("@id", new Guid(id));
                            cmd.Parameters.AddWithValue("@note1", note1.HasValue ? (object)note1.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@note2", note2.HasValue ? (object)note2.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@noteProjet", noteProjet.HasValue ? (object)noteProjet.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@coeff1", coeff1.HasValue ? (object)coeff1.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@coeff2", coeff2.HasValue ? (object)coeff2.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@coeffProjet", coeffProjet.HasValue ? (object)coeffProjet.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@appreciation", string.IsNullOrEmpty(appreciation) ? (object)DBNull.Value : appreciation);
                            cmd.ExecuteNonQuery();
                        }
                    }
                    else if (!string.IsNullOrEmpty(matricule) && !string.IsNullOrEmpty(matiereId) && !string.IsNullOrEmpty(periode))
                    {
                        // Insertion
                        string insertSql = @"
                            INSERT INTO BULLETINS 
                            (ID, ELEVE_MATRICULE, MATIERE_ID, NOTE1, NOTE2, NOTE_PROJET, 
                             COEFF1, COEFF2, COEFF_PROJET, APPRECIATION, PERIODE, STATUT, CREATED_AT, UPDATED_AT)
                            VALUES 
                            (NEWID(), @matricule, @matiereId, @note1, @note2, @noteProjet,
                             @coeff1, @coeff2, @coeffProjet, @appreciation, @periode, 'En cours', GETDATE(), GETDATE())";
                        
                        using (var cmd = new SqlCommand(insertSql, conn))
                        {
                            cmd.Parameters.AddWithValue("@matricule", matricule);
                            cmd.Parameters.AddWithValue("@matiereId", new Guid(matiereId));
                            cmd.Parameters.AddWithValue("@periode", periode);
                            cmd.Parameters.AddWithValue("@note1", note1.HasValue ? (object)note1.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@note2", note2.HasValue ? (object)note2.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@noteProjet", noteProjet.HasValue ? (object)noteProjet.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@coeff1", coeff1.HasValue ? (object)coeff1.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@coeff2", coeff2.HasValue ? (object)coeff2.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@coeffProjet", coeffProjet.HasValue ? (object)coeffProjet.Value : DBNull.Value);
                            cmd.Parameters.AddWithValue("@appreciation", string.IsNullOrEmpty(appreciation) ? (object)DBNull.Value : appreciation);
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Bulletin modifié avec succès\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}