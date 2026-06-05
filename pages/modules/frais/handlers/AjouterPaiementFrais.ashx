<%@ WebHandler Language="C#" Class="AjouterPaiementFrais" %>

using System;
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

            var payload = ser.Deserialize<PaiementPayload>(body);
            if (payload == null) throw new ArgumentException("Données invalides.");

            if (string.IsNullOrEmpty(payload.matricule))
                throw new ArgumentException("Matricule requis.");
            
            if (payload.montant <= 0)
                throw new ArgumentException("Montant invalide.");

            // Récupérer l'utilisateur connecté
            int userId = 0;
            string username = "Système";
            if (ctx.Session["IDUSER"] != null)
                userId = Convert.ToInt32(ctx.Session["IDUSER"]);
            if (ctx.Session["username"] != null)
                username = ctx.Session["username"].ToString();

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // Récupérer les infos actuelles du frais
                        string selectSql = @"
                            SELECT ID, TOTAL, PAYE, RESTE, CLASSE, NOM, ANNEE_ID 
                            FROM FRAIS 
                            WHERE MATRICULE = @matricule";
                        
                        Guid fraisId = Guid.Empty;
                        decimal ancienPaye = 0;
                        decimal ancienReste = 0;
                        int classeId = 0;
                        string nom = "";
                        int anneeId = 0;

                        using (var cmd = new SqlCommand(selectSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@matricule", payload.matricule);
                            using (var reader = cmd.ExecuteReader())
                            {
                                if (reader.Read())
                                {
                                    fraisId = reader.GetGuid(0);
                                    ancienPaye = reader.GetDecimal(2);
                                    ancienReste = reader.GetDecimal(3);
                                    classeId = reader.GetInt32(4);
                                    nom = reader.GetString(5);
                                    anneeId = reader.GetInt32(6);
                                }
                                else
                                {
                                    throw new Exception("Élève non trouvé dans la table des frais.");
                                }
                            }
                        }

                        decimal nouveauPaye = ancienPaye + payload.montant;
                        decimal nouveauReste = ancienReste - payload.montant;

                        // Mettre à jour le montant payé
                        string updateSql = @"UPDATE FRAIS 
                                            SET PAYE = @nouveauPaye,
                                                MODEPAIE = @modePaiement,
                                                REFERENCE = @reference,
                                                COMMENTAIRE = @commentaire,
                                                DERNIER_PAIEMENT = @datePaiement,
                                                UPDATED_AT = GETDATE()
                                            WHERE MATRICULE = @matricule";
                        
                        using (var cmd = new SqlCommand(updateSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@nouveauPaye", nouveauPaye);
                            cmd.Parameters.AddWithValue("@modePaiement", payload.modePaiement ?? "Especes");
                            cmd.Parameters.AddWithValue("@reference", string.IsNullOrEmpty(payload.reference) ? (object)DBNull.Value : payload.reference);
                            cmd.Parameters.AddWithValue("@commentaire", string.IsNullOrEmpty(payload.commentaire) ? (object)DBNull.Value : payload.commentaire);
                            cmd.Parameters.AddWithValue("@datePaiement", payload.datePaiement);
                            cmd.Parameters.AddWithValue("@matricule", payload.matricule);
                            
                            int rowsAffected = cmd.ExecuteNonQuery();
                            if (rowsAffected == 0)
                                throw new Exception("Élève non trouvé.");
                        }
                        
                        // Insérer l'historique du paiement
                        string insertSql = @"INSERT INTO HISTORIQUE_PAIEMENTS 
                                            (ID, FRAIS_ID, MATRICULE, NOM, CLASSE, ANNEE_ID,
                                             MONTANT, DATE_PAIEMENT, MODE_PAIEMENT, REFERENCE, COMMENTAIRE,
                                             USER_ID, USERNAME,
                                             ANCIEN_PAYE, ANCIEN_RESTE, NOUVEAU_PAYE, NOUVEAU_RESTE, CREATED_AT)
                                            VALUES (NEWID(), @fraisId, @matricule, @nom, @classeId, @anneeId,
                                                    @montant, @datePaiement, @mode, @reference, @commentaire,
                                                    @userId, @username,
                                                    @ancienPaye, @ancienReste, @nouveauPaye, @nouveauReste, GETDATE())";
                        
                        using (var cmd = new SqlCommand(insertSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@fraisId", fraisId);
                            cmd.Parameters.AddWithValue("@matricule", payload.matricule);
                            cmd.Parameters.AddWithValue("@nom", nom);
                            cmd.Parameters.AddWithValue("@classeId", classeId);
                            cmd.Parameters.AddWithValue("@anneeId", anneeId);
                            cmd.Parameters.AddWithValue("@montant", payload.montant);
                            cmd.Parameters.AddWithValue("@datePaiement", payload.datePaiement);
                            cmd.Parameters.AddWithValue("@mode", payload.modePaiement ?? "Especes");
                            cmd.Parameters.AddWithValue("@reference", string.IsNullOrEmpty(payload.reference) ? (object)DBNull.Value : payload.reference);
                            cmd.Parameters.AddWithValue("@commentaire", string.IsNullOrEmpty(payload.commentaire) ? (object)DBNull.Value : payload.commentaire);
                            cmd.Parameters.AddWithValue("@userId", userId);
                            cmd.Parameters.AddWithValue("@username", username);
                            cmd.Parameters.AddWithValue("@ancienPaye", ancienPaye);
                            cmd.Parameters.AddWithValue("@ancienReste", ancienReste);
                            cmd.Parameters.AddWithValue("@nouveauPaye", nouveauPaye);
                            cmd.Parameters.AddWithValue("@nouveauReste", nouveauReste);
                            cmd.ExecuteNonQuery();
                        }
                        
                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Paiement enregistré avec succès.\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    private class PaiementPayload
    {
        public string matricule { get; set; }
        public decimal montant { get; set; }
        public DateTime datePaiement { get; set; }
        public string modePaiement { get; set; }
        public string reference { get; set; }
        public string commentaire { get; set; }
    }
}