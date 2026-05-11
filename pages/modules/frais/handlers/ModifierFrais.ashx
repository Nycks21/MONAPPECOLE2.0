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

        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        try
        {
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            var list = new List<object>();

            using (var conn = new SqlConnection(connStr))
            {
                string sql = @"SELECT 
                                f.ID,
                                f.MATRICULE,
                                e.NOM,
                                c.NOM AS CLASSE_NOM,
                                r.ANNEE AS ANNEE_TEXTE,
                                f.TOTAL,
                                f.PAYE,
                                f.RESTE,
                                f.PROGRESSION,
                                f.STATUT,
                                f.DERNIER_PAIEMENT,
                                f.CREATED_AT
                              FROM FRAIS f
                              LEFT JOIN ELEVES e ON f.MATRICULE = e.MATRICULE
                              LEFT JOIN CLASSES c ON e.CLASSE = c.ID
                              LEFT JOIN RANNEE r ON e.ANNEE_ID = r.ID
                              ORDER BY e.NOM ASC";

                using (var cmd = new SqlCommand(sql, conn))
                {
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            list.Add(new
                            {
                                ID = reader.IsDBNull(0) ? "" : reader.GetGuid(0).ToString(),
                                MATRICULE = reader.IsDBNull(1) ? "" : reader.GetString(1),
                                NOM = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                CLASSE_NOM = reader.IsDBNull(3) ? "N/A" : reader.GetString(3),
                                ANNEE_TEXTE = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                TOTAL = reader.IsDBNull(5) ? 0 : reader.GetDecimal(5),
                                PAYE = reader.IsDBNull(6) ? 0 : reader.GetDecimal(6),
                                RESTE = reader.IsDBNull(7) ? 0 : reader.GetDecimal(7),
                                PROGRESSION = reader.IsDBNull(8) ? 0 : Convert.ToDouble(reader.GetDecimal(8)),
                                STATUT = reader.IsDBNull(9) ? "Non payé" : reader.GetString(9),
                                DERNIER_PAIEMENT = reader.IsDBNull(10) ? null : reader.GetDateTime(10).ToString("yyyy-MM-dd"),
                                CREATED_AT = reader.IsDBNull(11) ? null : reader.GetDateTime(11).ToString("yyyy-MM-dd")
                            });
                        }
                    }
                }
            }

            ctx.Response.Write(new JavaScriptSerializer().Serialize(new { success = true, data = list }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write(new JavaScriptSerializer().Serialize(new { success = false, message = ex.Message }));
        }
    }

    public bool IsReusable { get { return false; } }
}