<%@ WebHandler Language="C#" Class="SupprimerHistoriquePaiement" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class SupprimerHistoriquePaiement : IHttpHandler, IRequiresSessionState
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

            if (data == null || !data.ContainsKey("id"))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Données invalides\"}");
                return;
            }

            Guid id = Guid.Parse(data["id"].ToString());

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // 1. Récupérer le montant et le FRAIS_ID avant suppression
                        decimal montant = 0;
                        Guid fraisId = Guid.Empty;

                        using (var cmd = new SqlCommand(
                            "SELECT MONTANT, FRAIS_ID FROM HISTORIQUE_PAIEMENTS WHERE ID = @id",
                            conn, transaction))
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
                                montant = rdr.GetDecimal(0);
                                fraisId = rdr.GetGuid(1);
                            }
                        }

                        // 2. Supprimer l'historique
                        using (var cmd = new SqlCommand(
                            "DELETE FROM HISTORIQUE_PAIEMENTS WHERE ID = @id",
                            conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@id", id);
                            cmd.ExecuteNonQuery();
                        }

                        // 3. Recalculer FRAIS (soustraire le montant supprimé)
                        string updateSql = @"
                            UPDATE FRAIS
                            SET PAYE        = CASE WHEN PAYE - @montant < 0 THEN 0 ELSE PAYE - @montant END,
                                RESTE       = CASE WHEN TOTAL - (PAYE - @montant) < 0 THEN 0
                                                   WHEN PAYE - @montant < 0 THEN TOTAL
                                                   ELSE TOTAL - (PAYE - @montant) END,
                                PROGRESSION = CASE WHEN TOTAL > 0 AND PAYE - @montant > 0
                                                   THEN ROUND(((PAYE - @montant) / TOTAL) * 100, 2)
                                                   ELSE 0 END,
                                STATUT      = CASE
                                                WHEN TOTAL <= (PAYE - @montant) AND (PAYE - @montant) > 0 THEN N'Terminé'
                                                WHEN (PAYE - @montant) > 0                               THEN N'En cours'
                                                ELSE N'Non payé'
                                              END,
                                UPDATED_AT  = GETDATE()
                            WHERE ID = @fraisId";

                        using (var cmd = new SqlCommand(updateSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@montant", montant);
                            cmd.Parameters.AddWithValue("@fraisId", fraisId);
                            cmd.ExecuteNonQuery();
                        }

                        transaction.Commit();
                        ctx.Response.Write("{\"success\":true,\"message\":\"Paiement supprimé avec succès\"}");
                    }
                    catch
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
