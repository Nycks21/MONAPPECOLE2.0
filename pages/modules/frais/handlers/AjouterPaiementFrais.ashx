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

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // Mettre à jour le montant payé
                        string updateSql = @"UPDATE FRAIS 
                                            SET PAYE = PAYE + @montant,
                                                DERNIER_PAIEMENT = @datePaiement,
                                                UPDATED_AT = GETDATE()
                                            WHERE MATRICULE = @matricule";
                        
                        using (var cmd = new SqlCommand(updateSql, conn, transaction))
                        {
                            cmd.Parameters.Add("@montant", System.Data.SqlDbType.Decimal).Value = payload.montant;
                            cmd.Parameters.Add("@datePaiement", System.Data.SqlDbType.DateTime).Value = payload.datePaiement;
                            cmd.Parameters.Add("@matricule", System.Data.SqlDbType.NVarChar, 50).Value = payload.matricule;
                            
                            int rowsAffected = cmd.ExecuteNonQuery();
                            if (rowsAffected == 0)
                                throw new Exception("Élève non trouvé.");
                        }
                        
                        // Insérer l'historique du paiement (optionnel)
                        string insertSql = @"INSERT INTO PAIEMENTS_HISTORIQUE 
                                            (MATRICULE, MONTANT, DATE_PAIEMENT, MODE_PAIEMENT, REFERENCE, COMMENTAIRE, CREATED_AT)
                                            VALUES (@matricule, @montant, @datePaiement, @mode, @reference, @commentaire, GETDATE())";
                        
                        using (var cmd = new SqlCommand(insertSql, conn, transaction))
                        {
                            cmd.Parameters.Add("@matricule", System.Data.SqlDbType.NVarChar, 50).Value = payload.matricule;
                            cmd.Parameters.Add("@montant", System.Data.SqlDbType.Decimal).Value = payload.montant;
                            cmd.Parameters.Add("@datePaiement", System.Data.SqlDbType.DateTime).Value = payload.datePaiement;
                            cmd.Parameters.Add("@mode", System.Data.SqlDbType.NVarChar, 50).Value = payload.modePaiement ?? "Espèces";
                            cmd.Parameters.Add("@reference", System.Data.SqlDbType.NVarChar, 100).Value = string.IsNullOrEmpty(payload.reference) ? (object)DBNull.Value : payload.reference;
                            cmd.Parameters.Add("@commentaire", System.Data.SqlDbType.NVarChar, 500).Value = string.IsNullOrEmpty(payload.commentaire) ? (object)DBNull.Value : payload.commentaire;
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