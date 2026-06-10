<%@ WebHandler Language="C#" Class="ModifierHistoriquePaiement" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class ModifierHistoriquePaiement : IHttpHandler, IRequiresSessionState
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

            Guid id = Guid.Parse(data["id"].ToString());
            string matricule = data["matricule"].ToString();
            decimal montant = Convert.ToDecimal(data["montant"]);
            DateTime datePaie = DateTime.Parse(data["datePaiement"].ToString());
            string modePaie = data["modePaiement"].ToString();
            string reference = data.ContainsKey("reference") ? data["reference"].ToString() : "";
            string commentaire = data.ContainsKey("commentaire") ? data["commentaire"].ToString() : "";
            
            // NOUVEAUX CHAMPS
            string moisPaiement = data.ContainsKey("moisPaiement") ? data["moisPaiement"].ToString() : "";
            string annee = data.ContainsKey("annee") ? data["annee"].ToString() : "";

            if (montant <= 0)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Montant invalide\"}");
                return;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // 1. Récupérer l'ancien montant et le FRAIS_ID
                        decimal ancienMontant = 0;
                        Guid fraisId = Guid.Empty;
                        decimal ancienPaye = 0;

                        using (var cmd = new SqlCommand(@"
                            SELECT h.MONTANT, h.FRAIS_ID, f.PAYE
                            FROM HISTORIQUE_PAIEMENTS h
                            INNER JOIN FRAIS f ON h.FRAIS_ID = f.ID
                            WHERE h.ID = @id", conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@id", id);
                            using (var rdr = cmd.ExecuteReader())
                            {
                                if (!rdr.Read())
                                {
                                    transaction.Rollback();
                                    ctx.Response.Write("{\"success\":false,\"message\":\"Paiement introuvable\"}");
                                    return;
                                }
                                ancienMontant = rdr.GetDecimal(0);
                                fraisId = rdr.GetGuid(1);
                                ancienPaye = rdr.GetDecimal(2);
                            }
                        }

                        // 2. Mettre à jour HISTORIQUE_PAIEMENTS avec MOIS et ANNEE
                        using (var cmd = new SqlCommand(@"
                            UPDATE HISTORIQUE_PAIEMENTS
                            SET MONTANT = @montant,
                                MOIS = @moisPaiement,
                                ANNEE = @annee,
                                DATE_PAIEMENT = @datePaie,
                                MODE_PAIEMENT = @mode,
                                REFERENCE = @ref,
                                COMMENTAIRE = @comm
                            WHERE ID = @id", conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@montant", montant);
                            cmd.Parameters.AddWithValue("@moisPaiement", string.IsNullOrEmpty(moisPaiement) ? (object)DBNull.Value : moisPaiement);
                            cmd.Parameters.AddWithValue("@annee", string.IsNullOrEmpty(annee) ? (object)DBNull.Value : annee);
                            cmd.Parameters.AddWithValue("@datePaie", datePaie);
                            cmd.Parameters.AddWithValue("@mode", modePaie);
                            cmd.Parameters.AddWithValue("@ref", string.IsNullOrEmpty(reference) ? (object)DBNull.Value : reference);
                            cmd.Parameters.AddWithValue("@comm", string.IsNullOrEmpty(commentaire) ? (object)DBNull.Value : commentaire);
                            cmd.Parameters.AddWithValue("@id", id);
                            cmd.ExecuteNonQuery();
                        }

                        // 3. Mettre à jour PAYE dans FRAIS
                        decimal nouveauPaye = ancienPaye - ancienMontant + montant;
                        
                        string updateFraisSql = @"
                            UPDATE FRAIS
                            SET PAYE = @nouveauPaye,
                                MOIS = @moisPaiement,
                                ANNEE = @annee,
                                UPDATED_AT = GETDATE()
                            WHERE ID = @fraisId";

                        using (var cmd = new SqlCommand(updateFraisSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@nouveauPaye", nouveauPaye);
                            cmd.Parameters.AddWithValue("@moisPaiement", string.IsNullOrEmpty(moisPaiement) ? (object)DBNull.Value : moisPaiement);
                            cmd.Parameters.AddWithValue("@annee", string.IsNullOrEmpty(annee) ? (object)DBNull.Value : annee);
                            cmd.Parameters.AddWithValue("@fraisId", fraisId);
                            cmd.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        ctx.Response.Write("{\"success\":true,\"message\":\"Paiement modifié avec succès\"}");
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
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}