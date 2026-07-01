<%@ WebHandler Language="C#" Class="GetBulletins" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetBulletins : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetCacheability(HttpCacheability.NoCache);
        ctx.Response.TrySkipIisCustomErrors = true;

        var ser = new JavaScriptSerializer();

        try
        {
            if (ctx.Session == null || ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
            {
                ctx.Response.StatusCode = 401;
                ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }

            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            if (string.IsNullOrEmpty(body))
            {
                ctx.Response.StatusCode = 400;
                ctx.Response.Write("{\"success\":false,\"message\":\"Corps de requête vide\"}");
                return;
            }

            Dictionary<string, object> data = null;

            try
            {
                data = ser.Deserialize<Dictionary<string, object>>(body);
            }
            catch (Exception ex)
            {
                ctx.Response.StatusCode = 400;
                ctx.Response.Write("{\"success\":false,\"message\":\"Erreur de parsing JSON: " + ex.Message.Replace("\"", "'") + "\"}");
                return;
            }

            if (data == null)
            {
                ctx.Response.StatusCode = 400;
                ctx.Response.Write("{\"success\":false,\"message\":\"Données JSON invalides\"}");
                return;
            }

            int classeId = 0;
            string matiereId = "";
            string periode = "";

            if (data.ContainsKey("classeId") && data["classeId"] != null)
            {
                if (!int.TryParse(data["classeId"].ToString(), out classeId))
                {
                    ctx.Response.StatusCode = 400;
                    ctx.Response.Write("{\"success\":false,\"message\":\"classeId invalide\"}");
                    return;
                }
            }
            else
            {
                ctx.Response.StatusCode = 400;
                ctx.Response.Write("{\"success\":false,\"message\":\"classeId manquant\"}");
                return;
            }

            if (data.ContainsKey("matiereId") && data["matiereId"] != null)
            {
                matiereId = data["matiereId"].ToString();
            }
            else
            {
                ctx.Response.StatusCode = 400;
                ctx.Response.Write("{\"success\":false,\"message\":\"matiereId manquant\"}");
                return;
            }

            if (data.ContainsKey("periodeId") && data["periodeId"] != null)
            {
                periode = data["periodeId"].ToString();
            }
            else
            {
                ctx.Response.StatusCode = 400;
                ctx.Response.Write("{\"success\":false,\"message\":\"periodeId manquant\"}");
                return;
            }

            Guid matiereGuid;
            if (!Guid.TryParse(matiereId, out matiereGuid))
            {
                ctx.Response.StatusCode = 400;
                ctx.Response.Write("{\"success\":false,\"message\":\"matiereId invalide (format GUID attendu)\"}");
                return;
            }

            string connStr = "";
            if (ConfigurationManager.ConnectionStrings["MaConnexion"] != null)
            {
                connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            }

            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.StatusCode = 500;
                ctx.Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion non trouvée\"}");
                return;
            }

            var eleves = new List<Dictionary<string, object>>();
            Dictionary<string, object> coefficients = null;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                // 1. Récupérer les coefficients
                string coeffSql = @"
                    SELECT COEFF1, COEFF2, COEFF_PROJET
                    FROM BULLETINS_COEFFS
                    WHERE MATIERE_ID = @matiereId 
                      AND CLASSE_ID = @classeId 
                      AND PERIODE = @periode";

                using (var cmd = new SqlCommand(coeffSql, conn))
                {
                    cmd.Parameters.AddWithValue("@classeId", classeId);
                    cmd.Parameters.AddWithValue("@matiereId", matiereGuid);
                    cmd.Parameters.AddWithValue("@periode", periode);

                    using (var rdr = cmd.ExecuteReader())
                    {
                        if (rdr.Read())
                        {
                            coefficients = new Dictionary<string, object>();
                            coefficients["coeff1"] = Convert.ToDecimal(rdr["COEFF1"]);
                            coefficients["coeff2"] = Convert.ToDecimal(rdr["COEFF2"]);
                            coefficients["coeffProjet"] = Convert.ToDecimal(rdr["COEFF_PROJET"]);
                        }
                    }
                }

                // 2. Récupérer les élèves avec leurs notes et TOTAL_NOTE
                string sql = @"
                    SELECT
                        e.MATRICULE,
                        e.NOM,
                        b.ID,
                        b.NOTE1,
                        b.NOTE2,
                        b.NOTE_PROJET,
                        b.TOTAL_NOTE,    -- ✅ Ajout de TOTAL_NOTE
                        b.APPRECIATION,
                        b.STATUT,
                        b.DATE_EVAL1,
                        b.DATE_EVAL2,
                        b.DATE_EVAL_PROJET
                    FROM ELEVES e
                    LEFT JOIN BULLETINS b
                        ON b.ELEVE_MATRICULE = e.MATRICULE
                       AND b.MATIERE_ID      = @matiereId
                       AND b.PERIODE         = @periode
                    WHERE e.CLASSE = @classeId
                      AND e.STATUT = 'actif'
                    ORDER BY e.NOM ASC";

                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@classeId", classeId);
                    cmd.Parameters.AddWithValue("@matiereId", matiereGuid);
                    cmd.Parameters.AddWithValue("@periode", periode);

                    using (var rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            var eleve = new Dictionary<string, object>();
                            eleve["EleveId"] = rdr["MATRICULE"].ToString();
                            eleve["Nom"] = rdr["NOM"].ToString();
                            eleve["BulletinId"] = rdr["ID"] is DBNull ? null : rdr["ID"].ToString();
                            eleve["Note1"] = rdr["NOTE1"] is DBNull ? null : (object)Convert.ToDecimal(rdr["NOTE1"]);
                            eleve["Note2"] = rdr["NOTE2"] is DBNull ? null : (object)Convert.ToDecimal(rdr["NOTE2"]);
                            eleve["NoteProjet"] = rdr["NOTE_PROJET"] is DBNull ? null : (object)Convert.ToDecimal(rdr["NOTE_PROJET"]);
                            eleve["TotalNote"] = rdr["TOTAL_NOTE"] is DBNull ? null : (object)Convert.ToDecimal(rdr["TOTAL_NOTE"]); // ✅ TOTAL_NOTE
                            eleve["Appreciation"] = rdr["APPRECIATION"] is DBNull ? "" : rdr["APPRECIATION"].ToString();
                            eleve["Statut"] = rdr["STATUT"] is DBNull ? "Non saisi" : rdr["STATUT"].ToString();
                            eleve["DateEval1"] = rdr["DATE_EVAL1"] is DBNull ? null : (object)((DateTime)rdr["DATE_EVAL1"]).ToString("yyyy-MM-dd");
                            eleve["DateEval2"] = rdr["DATE_EVAL2"] is DBNull ? null : (object)((DateTime)rdr["DATE_EVAL2"]).ToString("yyyy-MM-dd");
                            eleve["DateEvalProjet"] = rdr["DATE_EVAL_PROJET"] is DBNull ? null : (object)((DateTime)rdr["DATE_EVAL_PROJET"]).ToString("yyyy-MM-dd");
                            eleves.Add(eleve);
                        }
                    }
                }
            }

            if (coefficients == null)
            {
                coefficients = new Dictionary<string, object>();
                coefficients["coeff1"] = 1.0m;
                coefficients["coeff2"] = 2.0m;
                coefficients["coeffProjet"] = 1.0m;
            }

            var result = new Dictionary<string, object>();
            result["success"] = true;
            result["eleves"] = eleves;
            result["coefficients"] = coefficients;

            ctx.Response.Write(ser.Serialize(result));
        }
        catch (SqlException sqlEx)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"Erreur SQL: " + sqlEx.Message.Replace("\"", "'") + "\", \"errorCode\": " + sqlEx.Number + "}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string safeMsg = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + safeMsg + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}