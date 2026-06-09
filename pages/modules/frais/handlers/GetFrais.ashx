<%@ WebHandler Language="C#" Class="GetFrais" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetFrais : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetNoStore();

        try
        {
            if (ctx.Session == null || ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
            {
                ctx.Response.StatusCode = 401;
                ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }

            var list = new List<object>();
            
            var connSetting = ConfigurationManager.ConnectionStrings["MaConnexion"];
            string connStr = connSetting != null ? connSetting.ConnectionString : "";
            
            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion non trouvée\"}");
                return;
            }

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                
                string query = @"
                    SELECT 
                        f.ID, 
                        f.MATRICULE, 
                        f.NOM, 
                        ISNULL(c.NOM, 'Non defini') AS CLASSE_NOM,
                        ISNULL(f.TOTAL, 0) AS TOTAL,
                        ISNULL(f.PAYE, 0) AS PAYE,
                        ISNULL(f.RESTE, 0) AS RESTE,
                        ISNULL(f.PROGRESSION, 0) AS PROGRESSION,
                        ISNULL(f.STATUT, 'Non paye') AS STATUT,
                        CONVERT(VARCHAR(10), f.DERNIER_PAIEMENT, 103) AS DERNIER_PAIEMENT,
                        ISNULL(r.ANNEE, '') AS ANNEE_TEXTE
                    FROM FRAIS f
                    LEFT JOIN CLASSES c ON f.CLASSE = c.ID
                    LEFT JOIN RANNEE r ON f.ANNEE_ID = r.ID
                    ORDER BY f.NOM ASC";
                
                using (var cmd = new SqlCommand(query, conn))
                {
                    using (var rdr = cmd.ExecuteReader())
                    {
                        while (rdr.Read())
                        {
                            list.Add(new {
                                ID = rdr["ID"].ToString(),
                                MATRICULE = rdr["MATRICULE"].ToString(),
                                NOM = rdr["NOM"].ToString(),
                                CLASSE_NOM = rdr["CLASSE_NOM"].ToString(),
                                TOTAL = Convert.ToDecimal(rdr["TOTAL"]),
                                PAYE = Convert.ToDecimal(rdr["PAYE"]),
                                RESTE = Convert.ToDecimal(rdr["RESTE"]),
                                PROGRESSION = Convert.ToDecimal(rdr["PROGRESSION"]),
                                STATUT = rdr["STATUT"].ToString(),
                                DERNIER_PAIEMENT = rdr["DERNIER_PAIEMENT"].ToString(),
                                ANNEE_TEXTE = rdr["ANNEE_TEXTE"].ToString()
                            });
                        }
                    }
                }
            }
            
            var serializer = new JavaScriptSerializer();
            ctx.Response.Write(serializer.Serialize(new { success = true, data = list }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}