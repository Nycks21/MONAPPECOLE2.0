<%@ WebHandler Language="C#" Class="SupprimerHistoriquePaiement" %>
using System;
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
            var data = ser.Deserialize<dynamic>(body);

            Guid id = Guid.Parse(data["id"].ToString());
            string matricule = data["matricule"];

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // Récupérer le montant et FRAIS_ID avant suppression
                        string selectSql = @"
                            SELECT MONTANT, FRAIS_ID 
                            FROM HISTORIQUE_PAIEMENTS 
                            WHERE ID = @id";
                        
                        decimal montant = 0;
                        Guid fraisId = Guid.Empty;
                        
                        using (var cmd = new SqlCommand(selectSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@id", id);
                            using (var reader = cmd.ExecuteReader())
                            {
                                if (reader.Read())
                                {
                                    montant = reader.GetDecimal(0);
                                    fraisId = reader.GetGuid(1);
                                }
                            }
                        }
                        
                        // Supprimer l'historique
                        string deleteSql = "DELETE FROM HISTORIQUE_PAIEMENTS WHERE ID = @id";
                        using (var cmd = new SqlCommand(deleteSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@id", id);
                            cmd.ExecuteNonQuery();
                        }
                        
                        // Mettre à jour la table FRAIS (diminuer le PAYE)
                        string updateFraisSql = @"
                            UPDATE FRAIS 
                            SET PAYE = PAYE - @montant,
                                UPDATED_AT = GETDATE()
                            WHERE ID = @fraisId";
                        
                        using (var cmd = new SqlCommand(updateFraisSql, conn, transaction))
                        {
                            cmd.Parameters.AddWithValue("@montant", montant);
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

            ctx.Response.Write("{\"success\":true,\"message\":\"Paiement supprimé avec succès\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}