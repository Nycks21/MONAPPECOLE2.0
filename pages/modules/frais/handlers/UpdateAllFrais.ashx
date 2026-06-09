<%@ WebHandler Language="C#" Class="UpdateAllFrais" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class UpdateAllFrais : IHttpHandler, IRequiresSessionState
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
            int insertedCount = 0;
            int anneeId = 1;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                // 1. Récupérer l'année active
                string getAnneeSql = "SELECT TOP 1 ID FROM RANNEE WHERE CLOTURE = 0 ORDER BY DATE_DEBUT DESC";
                using (var cmd = new SqlCommand(getAnneeSql, conn))
                {
                    var result = cmd.ExecuteScalar();
                    if (result != null) anneeId = Convert.ToInt32(result);
                }

                // 2. Vérifier qu'il existe des tarifs pour cette année
                int tarifCount = 0;
                using (var cmd = new SqlCommand(
                    "SELECT COUNT(*) FROM TARIFS_ECOLAGE WHERE ANNEE_ID = @anneeId AND STATUT = 1", conn))
                {
                    cmd.Parameters.AddWithValue("@anneeId", anneeId);
                    tarifCount = (int)cmd.ExecuteScalar();
                }

                if (tarifCount == 0)
                {
                    ctx.Response.Write("{\"success\":false,\"message\":\"Aucun tarif actif trouvé pour l'année en cours. Veuillez d'abord créer les tarifs par classe.\"}");
                    return;
                }

                // 3. Mettre à jour le TOTAL des frais existants
                // NE PAS toucher à RESTE, PROGRESSION, STATUT (colonnes calculées)
                string updateSql = @"
                    UPDATE f
                    SET f.TOTAL = t.MONTANT,
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

                // 4. Insérer les nouveaux élèves (pas encore dans FRAIS)
                string insertSql = @"
                    INSERT INTO FRAIS (ID, ANNEE_ID, MATRICULE, NOM, CLASSE, TOTAL, PAYE, TARIF_ID, CREATED_AT)
                    SELECT
                        NEWID(), @anneeId, e.MATRICULE, e.NOM, e.CLASSE,
                        t.MONTANT, 0, t.ID, GETDATE()
                    FROM ELEVES e
                    INNER JOIN TARIFS_ECOLAGE t ON t.CLASSE_ID = e.CLASSE AND t.ANNEE_ID = @anneeId AND t.STATUT = 1
                    WHERE NOT EXISTS (
                        SELECT 1 FROM FRAIS f WHERE f.MATRICULE = e.MATRICULE AND f.ANNEE_ID = @anneeId
                    )";

                using (var cmd = new SqlCommand(insertSql, conn))
                {
                    cmd.Parameters.AddWithValue("@anneeId", anneeId);
                    insertedCount = cmd.ExecuteNonQuery();
                }
            }

            string message = updatedCount + " élève(s) mis à jour";
            if (insertedCount > 0)
                message += ", " + insertedCount + " nouvel(aux) élève(s) ajouté(s)";
            message += ".";

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