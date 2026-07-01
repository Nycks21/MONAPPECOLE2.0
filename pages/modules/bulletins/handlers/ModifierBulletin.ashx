<%@ WebHandler Language="C#" Class="ModifierBulletin" %>
using System;
using System.Collections.Generic;
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

        try
        {
            if (ctx.Session == null || ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
            {
                ctx.Response.StatusCode = 401;
                ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }

            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var ser = new JavaScriptSerializer();
            var data = ser.Deserialize<Dictionary<string, object>>(body);

            if (data == null || !data.ContainsKey("ELEVE_MATRICULE") || !data.ContainsKey("MATIERE_ID") || !data.ContainsKey("PERIODE"))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants (ELEVE_MATRICULE, MATIERE_ID, PERIODE)\"}");
                return;
            }

            string matricule = data["ELEVE_MATRICULE"].ToString();
            string matiereIdStr = data["MATIERE_ID"].ToString();
            string periode = data["PERIODE"].ToString();

            Guid matiereId;
            if (!Guid.TryParse(matiereIdStr, out matiereId))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"MATIERE_ID invalide (format GUID attendu)\"}");
                return;
            }

            object note1Raw = data.ContainsKey("NOTE1") ? data["NOTE1"] : null;
            object note2Raw = data.ContainsKey("NOTE2") ? data["NOTE2"] : null;
            object noteProjetRaw = data.ContainsKey("NOTE_PROJET") ? data["NOTE_PROJET"] : null;
            string appreciation = data.ContainsKey("APPRECIATION") ? Convert.ToString(data["APPRECIATION"]) : "";
            
            object totalNoteRaw = data.ContainsKey("TOTAL_NOTE") ? data["TOTAL_NOTE"] : null;

            object note1 = (note1Raw == null || note1Raw.ToString() == "") ? (object)DBNull.Value : Convert.ToDecimal(note1Raw);
            object note2 = (note2Raw == null || note2Raw.ToString() == "") ? (object)DBNull.Value : Convert.ToDecimal(note2Raw);
            object noteProjet = (noteProjetRaw == null || noteProjetRaw.ToString() == "") ? (object)DBNull.Value : Convert.ToDecimal(noteProjetRaw);
            object totalNote = (totalNoteRaw == null || totalNoteRaw.ToString() == "") ? (object)DBNull.Value : Convert.ToDecimal(totalNoteRaw);

            foreach (var n in new[] { note1, note2, noteProjet })
            {
                if (n != DBNull.Value)
                {
                    decimal val = (decimal)n;
                    if (val < 0 || val > 20)
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Les notes doivent être comprises entre 0 et 20\"}");
                        return;
                    }
                }
            }

            string connStr = "";
            if (ConfigurationManager.ConnectionStrings["MaConnexion"] != null)
            {
                connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            }

            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.StatusCode = 500;
                ctx.Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion non trouvée\"}");
                return;
            }

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                string checkSql = "SELECT STATUT FROM BULLETINS WHERE ELEVE_MATRICULE = @matricule AND MATIERE_ID = @matiereId AND PERIODE = @periode";
                string existingStatut = null;
                
                using (var checkCmd = new SqlCommand(checkSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@matricule", matricule);
                    checkCmd.Parameters.AddWithValue("@matiereId", matiereId);
                    checkCmd.Parameters.AddWithValue("@periode", periode);

                    var result = checkCmd.ExecuteScalar();
                    if (result != null)
                        existingStatut = result.ToString();
                }

                if (existingStatut == "Validé")
                {
                    ctx.Response.Write("{\"success\":false,\"message\":\"Ce bulletin est déjà validé définitivement. Les notes ne peuvent plus être modifiées.\"}");
                    return;
                }

                bool hasAnyNote = (note1 != DBNull.Value) || (note2 != DBNull.Value) || (noteProjet != DBNull.Value);
                string nouveauStatut = hasAnyNote ? "Enregistré" : "Non saisi";

                if (existingStatut != null)
                {
                    string updateSql = @"
                        UPDATE BULLETINS SET
                            NOTE1 = @note1,
                            NOTE2 = @note2,
                            NOTE_PROJET = @noteProjet,
                            TOTAL_NOTE = @totalNote,
                            APPRECIATION = @appreciation,
                            STATUT = @statut,
                            UPDATED_AT = GETDATE()
                        WHERE ELEVE_MATRICULE = @matricule 
                          AND MATIERE_ID = @matiereId 
                          AND PERIODE = @periode";

                    using (var cmd = new SqlCommand(updateSql, conn))
                    {
                        cmd.Parameters.AddWithValue("@matricule", matricule);
                        cmd.Parameters.AddWithValue("@matiereId", matiereId);
                        cmd.Parameters.AddWithValue("@periode", periode);
                        cmd.Parameters.AddWithValue("@note1", note1);
                        cmd.Parameters.AddWithValue("@note2", note2);
                        cmd.Parameters.AddWithValue("@noteProjet", noteProjet);
                        cmd.Parameters.AddWithValue("@totalNote", totalNote);
                        cmd.Parameters.AddWithValue("@appreciation", string.IsNullOrEmpty(appreciation) ? (object)DBNull.Value : appreciation);
                        cmd.Parameters.AddWithValue("@statut", nouveauStatut);
                        cmd.ExecuteNonQuery();
                    }
                }
                else
                {
                    string insertSql = @"
                        INSERT INTO BULLETINS (ID, ELEVE_MATRICULE, MATIERE_ID, NOTE1, NOTE2, NOTE_PROJET, TOTAL_NOTE, APPRECIATION, PERIODE, STATUT, CREATED_AT, UPDATED_AT)
                        VALUES (NEWID(), @matricule, @matiereId, @note1, @note2, @noteProjet, @totalNote, @appreciation, @periode, @statut, GETDATE(), GETDATE())";

                    using (var cmd = new SqlCommand(insertSql, conn))
                    {
                        cmd.Parameters.AddWithValue("@matricule", matricule);
                        cmd.Parameters.AddWithValue("@matiereId", matiereId);
                        cmd.Parameters.AddWithValue("@periode", periode);
                        cmd.Parameters.AddWithValue("@note1", note1);
                        cmd.Parameters.AddWithValue("@note2", note2);
                        cmd.Parameters.AddWithValue("@noteProjet", noteProjet);
                        cmd.Parameters.AddWithValue("@totalNote", totalNote);
                        cmd.Parameters.AddWithValue("@appreciation", string.IsNullOrEmpty(appreciation) ? (object)DBNull.Value : appreciation);
                        cmd.Parameters.AddWithValue("@statut", nouveauStatut);
                        cmd.ExecuteNonQuery();
                    }
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Bulletin mis à jour\"}");
        }
        catch (SqlException sqlEx)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"Erreur SQL: " + sqlEx.Message.Replace("\"", "'") + "\", \"errorCode\": " + sqlEx.Number + "}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string safeMsg = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + safeMsg + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}