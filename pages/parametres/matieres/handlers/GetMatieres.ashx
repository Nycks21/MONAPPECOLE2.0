<%@ WebHandler Language="C#" Class="GetMatieres" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetMatieres : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset     = "utf-8";
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
            using (var cmd  = new SqlCommand(
                @"SELECT m.ID,
                         m.NOM,
                         m.ENSEIGNANT         AS ENSEIGNANT_ID,
                         u.NOM                AS ENSEIGNANT_NOM,
                         m.COEFFICIENT,
                         m.HEURES_SEMAINE,
                         m.CLASSE_ID,
                         c.NOM                AS CLASSE_NOM,
                         m.CREATED_AT
                  FROM   [dbo].[MATIERES] m
                  LEFT JOIN [dbo].[USERS]   u ON u.IDUSER = m.ENSEIGNANT
                  LEFT JOIN [dbo].[CLASSES] c ON c.ID     = m.CLASSE_ID
                  ORDER  BY c.NOM ASC, m.NOM ASC", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new
                        {
                            ID             = reader.IsDBNull(0) ? "" : reader.GetGuid(0).ToString(),
                            NOM            = reader.IsDBNull(1) ? "" : reader.GetString(1),

                            ENSEIGNANT_ID  = reader.IsDBNull(2) ? 0  : reader.GetInt32(2),
                            ENSEIGNANT     = reader.IsDBNull(3) ? "" : reader.GetString(3),

                            COEFFICIENT    = reader.IsDBNull(4) ? 0m : reader.GetDecimal(4),
                            HEURES_SEMAINE = reader.IsDBNull(5) ? 0  : reader.GetInt32(5),

                            CLASSE_ID      = reader.IsDBNull(6) ? 0  : reader.GetInt32(6),
                            CLASSE_NOM     = reader.IsDBNull(7) ? "" : reader.GetString(7),

                            CREATED_AT     = reader.IsDBNull(8) ? null
                                           : reader.GetDateTime(8).ToString("yyyy-MM-dd HH:mm:ss")
                        });
                    }
                }
            }

            ctx.Response.Write(new JavaScriptSerializer().Serialize(
                new { success = true, matieres = list }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":"
                + new JavaScriptSerializer().Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
}