<%@ WebHandler Language="C#" Class="GetBulletins" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetBulletins : IHttpHandler, IRequiresSessionState
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
                                b.ID,
                                b.ANNEE_ID,
                                r.ANNEE AS ANNEE_TEXTE,
                                b.MATRICULE,
                                e.NOM AS ELEVE_NOM,
                                b.CLASSE,
                                c.NOM AS CLASSE_NOM,
                                b.MATIERE_ID,
                                m.NOM AS MATIERE_NOM,
                                m.ENSEIGNANT AS ENSEIGNANT_ID,
                                u.NOM AS ENSEIGNANT_NOM,
                                m.COEFFICIENT,
                                b.NOTE,
                                b.PERIODE,
                                b.COMMENTAIRE,
                                b.CREATED_AT,
                                b.UPDATED_AT
                              FROM BULLETINS b
                              LEFT JOIN RANNEE r ON b.ANNEE_ID = r.ID
                              LEFT JOIN ELEVES e ON b.MATRICULE = e.MATRICULE
                              LEFT JOIN CLASSES c ON b.CLASSE = c.ID
                              LEFT JOIN MATIERES m ON b.MATIERE_ID = m.ID
                              LEFT JOIN USERS u ON m.ENSEIGNANT = u.IDUSER
                              ORDER BY e.NOM ASC, m.NOM ASC";

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
                                ANNEE_ID = reader.IsDBNull(1) ? 0 : reader.GetInt32(1),
                                ANNEE_TEXTE = reader.IsDBNull(2) ? "" : reader.GetString(2),
                                MATRICULE = reader.IsDBNull(3) ? "" : reader.GetString(3),
                                ELEVE_NOM = reader.IsDBNull(4) ? "" : reader.GetString(4),
                                CLASSE = reader.IsDBNull(5) ? 0 : reader.GetInt32(5),
                                CLASSE_NOM = reader.IsDBNull(6) ? "N/A" : reader.GetString(6),
                                MATIERE_ID = reader.IsDBNull(7) ? "" : reader.GetGuid(7).ToString(),
                                MATIERE_NOM = reader.IsDBNull(8) ? "" : reader.GetString(8),
                                ENSEIGNANT_ID = reader.IsDBNull(9) ? 0 : reader.GetInt32(9),
                                ENSEIGNANT_NOM = reader.IsDBNull(10) ? "" : reader.GetString(10),
                                COEFFICIENT = reader.IsDBNull(11) ? 1 : reader.GetDecimal(11),
                                NOTE = reader.IsDBNull(12) ? 0 : reader.GetDecimal(12),
                                PERIODE = reader.IsDBNull(13) ? "" : reader.GetString(13),
                                COMMENTAIRE = reader.IsDBNull(14) ? "" : reader.GetString(14),
                                CREATED_AT = reader.IsDBNull(15) ? "" : reader.GetDateTime(15).ToString("yyyy-MM-dd"),
                                UPDATED_AT = reader.IsDBNull(16) ? "" : reader.GetDateTime(16).ToString("yyyy-MM-dd")
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