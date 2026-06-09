<%@ WebHandler Language="C#" Class="AjouterPaiementFrais" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterPaiementFrais : IHttpHandler, IRequiresSessionState
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

            string body = "";
            using (var reader = new StreamReader(ctx.Request.InputStream))
            {
                body = reader.ReadToEnd();
            }

            var ser = new JavaScriptSerializer();
            var data = ser.Deserialize<Dictionary<string, object>>(body);

            if (data == null)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Données invalides\"}");
                return;
            }

            string matricule = GetStringValue(data, "matricule");
            decimal montant = GetDecimalValue(data, "montant");
            DateTime datePaiement = GetDateTimeValue(data, "datePaiement");
            string modePaiement = GetStringValue(data, "modePaiement");
            string reference = GetStringValue(data, "reference");
            string commentaire = GetStringValue(data, "commentaire");

            if (string.IsNullOrEmpty(matricule))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Matricule requis\"}");
                return;
            }
            if (montant <= 0)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Montant invalide\"}");
                return;
            }

            var connSetting = ConfigurationManager.ConnectionStrings["MaConnexion"];
            string connStr = connSetting != null ? connSetting.ConnectionString : "";
            
            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Erreur de connexion à la base\"}");
                return;
            }

            string username = "Systeme";
            if (ctx.Session["username"] != null)
            {
                username = ctx.Session["username"].ToString();
            }
            
            int? userId = null;
            if (ctx.Session["IDUSER"] != null)
            {
                int uid;
                if (int.TryParse(ctx.Session["IDUSER"].ToString(), out uid))
                {
                    userId = uid;
                }
            }

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // 1. Récupérer les infos actuelles (avant mise à jour)
                        string selectSql = @"
                            SELECT ID, TOTAL, PAYE, CLASSE, NOM, ANNEE_ID 
                            FROM FRAIS 
                            WHERE MATRICULE = @matricule";
                        
                        Guid fraisId = Guid.Empty;
                        decimal ancienTotal = 0;
                        decimal ancienPaye = 0;
                        int classeId = 0;
                        string nom = "";
                        int anneeId = 0;
                        
                        using (var cmd = new SqlCommand(selectSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@matricule", matricule);
                            using (var reader = cmd.ExecuteReader())
                            {
                                if (reader.Read())
                                {
                                    fraisId = reader.GetGuid(0);
                                    ancienTotal = reader.GetDecimal(1);
                                    ancienPaye = reader.GetDecimal(2);
                                    classeId = reader.GetInt32(3);
                                    nom = reader.GetString(4);
                                    anneeId = reader.GetInt32(5);
                                }
                                else
                                {
                                    transaction.Rollback();
                                    ctx.Response.Write("{\"success\":false,\"message\":\"Élève non trouvé dans la table des frais\"}");
                                    return;
                                }
                            }
                        }

                        decimal nouveauPaye = ancienPaye + montant;
                        // RESTE, PROGRESSION, STATUT se calculent automatiquement via les colonnes calculées

                        // 2. Mettre à jour FRAIS (UNIQUEMENT PAYE et les infos de paiement)
                        // NE PAS toucher à RESTE, PROGRESSION, STATUT
                        string updateSql = @"
                            UPDATE FRAIS 
                            SET PAYE = @nouveauPaye,
                                MODEPAIE = @modePaiement,
                                REFERENCE = @reference,
                                COMMENTAIRE = @commentaire,
                                DERNIER_PAIEMENT = @datePaiement,
                                UPDATED_AT = GETDATE()
                            WHERE ID = @fraisId";
                        
                        using (var cmd = new SqlCommand(updateSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@nouveauPaye", nouveauPaye);
                            cmd.Parameters.AddWithValue("@modePaiement", modePaiement);
                            cmd.Parameters.AddWithValue("@reference", string.IsNullOrEmpty(reference) ? (object)DBNull.Value : reference);
                            cmd.Parameters.AddWithValue("@commentaire", string.IsNullOrEmpty(commentaire) ? (object)DBNull.Value : commentaire);
                            cmd.Parameters.AddWithValue("@datePaiement", datePaiement);
                            cmd.Parameters.AddWithValue("@fraisId", fraisId);
                            cmd.ExecuteNonQuery();
                        }

                        // 3. Insérer dans l'historique des paiements
                        // Note: NOUVEAU_TOTAL reste égal à ANCIEN_TOTAL (TOTAL ne change pas)
                        decimal ancienReste = ancienTotal - ancienPaye;
                        decimal nouveauReste = ancienTotal - nouveauPaye;
                        
                        string insertHistorySql = @"
                            INSERT INTO HISTORIQUE_PAIEMENTS 
                            (ID, FRAIS_ID, MATRICULE, NOM, CLASSE, ANNEE_ID, 
                             MONTANT, DATE_PAIEMENT, MODE_PAIEMENT, REFERENCE, COMMENTAIRE,
                             USER_ID, USERNAME, ANCIEN_TOTAL, ANCIEN_PAYE, ANCIEN_RESTE,
                             NOUVEAU_TOTAL, NOUVEAU_PAYE, NOUVEAU_RESTE, CREATED_AT)
                            VALUES 
                            (NEWID(), @fraisId, @matricule, @nom, @classeId, @anneeId,
                             @montant, @datePaiement, @modePaiement, @reference, @commentaire,
                             @userId, @username, @ancienTotal, @ancienPaye, @ancienReste,
                             @ancienTotal, @nouveauPaye, @nouveauReste, GETDATE())";
                        
                        using (var cmd = new SqlCommand(insertHistorySql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@fraisId", fraisId);
                            cmd.Parameters.AddWithValue("@matricule", matricule);
                            cmd.Parameters.AddWithValue("@nom", nom);
                            cmd.Parameters.AddWithValue("@classeId", classeId);
                            cmd.Parameters.AddWithValue("@anneeId", anneeId);
                            cmd.Parameters.AddWithValue("@montant", montant);
                            cmd.Parameters.AddWithValue("@datePaiement", datePaiement);
                            cmd.Parameters.AddWithValue("@modePaiement", modePaiement);
                            cmd.Parameters.AddWithValue("@reference", string.IsNullOrEmpty(reference) ? (object)DBNull.Value : reference);
                            cmd.Parameters.AddWithValue("@commentaire", string.IsNullOrEmpty(commentaire) ? (object)DBNull.Value : commentaire);
                            
                            if (userId.HasValue)
                                cmd.Parameters.AddWithValue("@userId", userId.Value);
                            else
                                cmd.Parameters.AddWithValue("@userId", DBNull.Value);
                                
                            cmd.Parameters.AddWithValue("@username", username);
                            cmd.Parameters.AddWithValue("@ancienTotal", ancienTotal);
                            cmd.Parameters.AddWithValue("@ancienPaye", ancienPaye);
                            cmd.Parameters.AddWithValue("@ancienReste", ancienReste);
                            cmd.Parameters.AddWithValue("@nouveauPaye", nouveauPaye);
                            cmd.Parameters.AddWithValue("@nouveauReste", nouveauReste);
                            cmd.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        
                        ctx.Response.Write("{\"success\":true,\"message\":\"Paiement enregistré avec succès\"}");
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string errorMsg = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + errorMsg + "\"}");
        }
    }

    private string GetStringValue(Dictionary<string, object> data, string key)
    {
        if (data.ContainsKey(key) && data[key] != null)
            return data[key].ToString();
        return "";
    }

    private decimal GetDecimalValue(Dictionary<string, object> data, string key)
    {
        if (data.ContainsKey(key) && data[key] != null)
        {
            decimal result;
            if (decimal.TryParse(data[key].ToString(), out result))
                return result;
        }
        return 0;
    }

    private DateTime GetDateTimeValue(Dictionary<string, object> data, string key)
    {
        if (data.ContainsKey(key) && data[key] != null)
        {
            DateTime result;
            if (DateTime.TryParse(data[key].ToString(), out result))
                return result;
        }
        return DateTime.Now;
    }

    public bool IsReusable { get { return false; } }
}