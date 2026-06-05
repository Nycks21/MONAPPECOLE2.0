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
            var data = ser.Deserialize<dynamic>(body);

            Guid id = Guid.Parse(data["id"].ToString());
            string matricule = data["matricule"];
            decimal montant = Convert.ToDecimal(data["montant"]);
            DateTime datePaiement = DateTime.Parse(data["datePaiement"].ToString());
            string modePaiement = data["modePaiement"].ToString();
            string reference = data.ContainsKey("reference") ? data["reference"].ToString() : "";
            string commentaire = data.ContainsKey("commentaire") ? data["commentaire"].ToString() : "";

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // Récupérer l'ancien montant du paiement
                        string selectSql = @"
                            SELECT MONTANT, FRAIS_ID 
                            FROM HISTORIQUE_PAIEMENTS 
                            WHERE ID = @id";
                        
                        Guid fraisId = Guid.Empty;
                        decimal ancienMontant = 0;
                        
                        using (var cmd = new SqlCommand(selectSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@id", id);
                            using (var reader = cmd.ExecuteReader())
                            {
                                if (reader.Read())
                                {
                                    ancienMontant = reader.GetDecimal(0);
                                    fraisId = reader.GetGuid(1);
                                }
                            }
                        }
                        
                        // Mettre à jour l'historique
                        string updateSql = @"
                            UPDATE HISTORIQUE_PAIEMENTS 
                            SET MONTANT = @montant,
                                DATE_PAIEMENT = @datePaiement,
                                MODE_PAIEMENT = @modePaiement,
                                REFERENCE = @reference,
                                COMMENTAIRE = @commentaire
                            WHERE ID = @id";
                        
                        using (var cmd = new SqlCommand(updateSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@montant", montant);
                            cmd.Parameters.AddWithValue("@datePaiement", datePaiement);
                            cmd.Parameters.AddWithValue("@modePaiement", modePaiement);
                            cmd.Parameters.AddWithValue("@reference", reference);
                            cmd.Parameters.AddWithValue("@commentaire", commentaire);
                            cmd.Parameters.AddWithValue("@id", id);
                            cmd.ExecuteNonQuery();
                        }
                        
                        // Mettre à jour la table FRAIS (ajuster le PAYE)
                        string updateFraisSql = @"
                            UPDATE FRAIS 
                            SET PAYE = PAYE - @ancienMontant + @nouveauMontant,
                                UPDATED_AT = GETDATE()
                            WHERE ID = @fraisId";
                        
                        using (var cmd = new SqlCommand(updateFraisSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@ancienMontant", ancienMontant);
                            cmd.Parameters.AddWithValue("@nouveauMontant", montant);
                            cmd.Parameters.AddWithValue("@fraisId", fraisId);
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

            ctx.Response.Write("{\"success\":true,\"message\":\"Paiement modifié avec succès\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}