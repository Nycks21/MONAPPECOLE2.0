<%@ WebHandler Language="C#" Class="ValiderDefinitivement" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

/// <summary>
/// Rôle unique : passer STATUT = 'Validé' sur les bulletins d'une classe/
/// matière/période qui ont au moins une note et qui ne sont pas déjà validés.
/// Une fois validé, le statut ne peut plus être modifié (les handlers
/// ModifierBulletin et ValiderDefinitivement le vérifient tous les deux).
/// </summary>
public class ValiderDefinitivement : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";

        try
        {
            // ── Authentification ──────────────────────────────────────────────
            if (ctx.Session == null || ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
            {
                ctx.Response.StatusCode = 401;
                ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }

            // ── Lecture du corps ──────────────────────────────────────────────
            // On remet la position à 0 car certains modules HTTP ASP.NET
            // (ex: requestValidationMode, des HttpModules personnalisés)
            // peuvent avoir partiellement lu l'InputStream avant d'arriver ici.
            string body = "";
            try
            {
                if (ctx.Request.InputStream.CanSeek)
                    ctx.Request.InputStream.Position = 0;

                using (var reader = new StreamReader(ctx.Request.InputStream, System.Text.Encoding.UTF8, false, 4096, true))
                    body = reader.ReadToEnd();
            }
            catch { /* on laisse body = "" et on tombera sur le check ci-dessous */ }

            if (string.IsNullOrWhiteSpace(body))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Corps de requête vide — vérifiez que Content-Type:application/json est bien envoyé\"}");
                return;
            }

            var ser = new JavaScriptSerializer();
            Dictionary<string, object> data;
            try
            {
                data = ser.Deserialize<Dictionary<string, object>>(body);
            }
            catch (Exception parseEx)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"JSON invalide : " + parseEx.Message.Replace("\"", "'") + "\"}");
                return;
            }

            if (data == null)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Corps de requête invalide\"}");
                return;
            }

            // ── Validation des paramètres ─────────────────────────────────────
            // Utilisation de int.TryParse pour éviter une exception non gérée
            // si classeId arrivait sous une forme inattendue (chaîne vide,
            // texte, null), ce qui se serait manifesté comme une erreur 500
            // générique peu exploitable côté client.
            if (!data.ContainsKey("classeId") || !data.ContainsKey("matiereId") || !data.ContainsKey("periodeId"))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants (classeId, matiereId, periodeId)\"}");
                return;
            }

            int classeId;
            if (!int.TryParse(Convert.ToString(data["classeId"]), out classeId) || classeId <= 0)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Identifiant de classe invalide\"}");
                return;
            }

            string matiereId = Convert.ToString(data["matiereId"]).Trim();
            string periode   = Convert.ToString(data["periodeId"]).Trim();

            if (string.IsNullOrEmpty(matiereId))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Identifiant de matière invalide\"}");
                return;
            }

            // Validation de la période contre la contrainte CHECK SQL
            // CHK_PERIODE (T1, T2, T3, Sem1, Sem2) pour renvoyer un message
            // clair plutôt qu'une exception SQL brute ou 0 ligne affectée.
            var periodesValides = new[] { "T1", "T2", "T3", "Sem1", "Sem2" };
            if (!Array.Exists(periodesValides, p => p == periode))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Période invalide\"}");
                return;
            }

            // ── Exécution SQL ─────────────────────────────────────────────────
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            int updatedCount;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                const string sql = @"
                    UPDATE BULLETINS
                    SET    STATUT     = 'Validé',
                           UPDATED_AT = GETDATE()
                    WHERE  ELEVE_MATRICULE IN (
                               SELECT MATRICULE FROM ELEVES WHERE CLASSE = @classeId
                           )
                      AND  MATIERE_ID = @matiereId
                      AND  PERIODE    = @periode
                      AND  STATUT     = 'Enregistré'";

                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@classeId",  classeId);
                    cmd.Parameters.AddWithValue("@matiereId", matiereId);
                    cmd.Parameters.AddWithValue("@periode",   periode);
                    updatedCount = cmd.ExecuteNonQuery();
                }
            }

            // ── Réponse ───────────────────────────────────────────────────────
            // Le champ "updated" permet à bulletins.js de distinguer :
            //   - 0  → aucun bulletin éligible (notes non sauvegardées ?)
            //   - >0 → N bulletins verrouillés avec succès
            ctx.Response.Write(
                "{\"success\":true,\"updated\":" + updatedCount + "}"
            );
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string msg = ex.Message.Replace("\"", "'")
                                   .Replace("\r", " ")
                                   .Replace("\n", " ");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + msg + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}
