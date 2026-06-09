<%@ WebHandler Language="C#" Class="RecalculerFrais" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class RecalculerFrais : IHttpHandler, IRequiresSessionState
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

            var connSetting = ConfigurationManager.ConnectionStrings["MaConnexion"];
            string connStr = connSetting != null ? connSetting.ConnectionString : "";
            
            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion non trouvée\"}");
                return;
            }

            int updatedCount = 0;
            int classeCount = 0;
            int anneeId = 1;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                
                // Récupérer l'année active
                string getAnneeSql = "SELECT TOP 1 ID FROM RANNEE WHERE CLOTURE = 0 ORDER BY DATE_DEBUT DESC";
                using (var cmd = new SqlCommand(getAnneeSql, conn))
                {
                    var result = cmd.ExecuteScalar();
                    if (result != null) anneeId = Convert.ToInt32(result);
                }
                
                // Compter les classes avec tarifs
                string countClasseSql = "SELECT COUNT(*) FROM TARIFS_ECOLAGE WHERE ANNEE_ID = @anneeId AND STATUT = 1";
                using (var cmd = new SqlCommand(countClasseSql, conn))
                {
                    cmd.Parameters.AddWithValue("@anneeId", anneeId);
                    classeCount = (int)cmd.ExecuteScalar();
                }
                
                if (classeCount == 0)
                {
                    ctx.Response.Write("{\"success\":false,\"message\":\"Aucun tarif defini pour l'annee en cours. Veuillez d'abord creer les tarifs par classe.\"}");
                    return;
                }
                
                // Mettre à jour UNIQUEMENT TOTAL (RESTE, PROGRESSION, STATUT se calculent automatiquement)
                string updateSql = @"
                    UPDATE f 
                    SET 
                        f.TOTAL = t.MONTANT,
                        f.TARIF_ID = t.ID,
                        f.UPDATED_AT = GETDATE()
                    FROM FRAIS f
                    INNER JOIN ELEVES e ON f.MATRICULE = e.MATRICULE
                    INNER JOIN TARIFS_ECOLAGE t ON t.CLASSE_ID = e.CLASSE AND t.ANNEE_ID = @anneeId AND t.STATUT = 1
                    WHERE f.ANNEE_ID = @anneeId";
                
                using (var cmd = new SqlCommand(updateSql, conn))
                {
                    cmd.Parameters.AddWithValue("@anneeId", anneeId);
                    updatedCount = cmd.ExecuteNonQuery();
                }
            }
            
            string message = updatedCount + " eleves mis a jour avec les nouveaux tarifs (" + classeCount + " classes configurees)";
            ctx.Response.Write("{\"success\":true,\"message\":\"" + message + "\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string errorMsg = ex.Message.Replace("\"", "'").Replace("\r", "").Replace("\n", "");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + errorMsg + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}