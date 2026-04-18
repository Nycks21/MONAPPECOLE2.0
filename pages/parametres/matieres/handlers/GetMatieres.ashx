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
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetNoStore();

        // Vérification session
        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        try
        {
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            var matieres = new List<object>();

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"SELECT ID, NOM, ENSEIGNANT, COEFFICIENT, HEURES_SEMAINE, NIVEAU, CREATED_AT
                  FROM [dbo].[MATIERES]
                  ORDER BY NOM ASC", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        matieres.Add(new
                        {
                            ID             = reader.GetInt32(0),
                            NOM            = reader.IsDBNull(1) ? "" : reader.GetString(1),
                            ENSEIGNANT     = reader.IsDBNull(2) ? "" : reader.GetString(2),
                            COEFFICIENT    = reader.IsDBNull(3) ? 0m : reader.GetDecimal(3),
                            HEURES_SEMAINE = reader.IsDBNull(4) ? 0 : reader.GetInt32(4),
                            NIVEAU         = reader.IsDBNull(5) ? "" : reader.GetString(5),
                            CREATED_AT     = reader.IsDBNull(6) ? null : reader.GetDateTime(6).ToString("yyyy-MM-dd HH:mm:ss")
                        });
                    }
                }
            }

            var json = new JavaScriptSerializer().Serialize(new { success = true, matieres = matieres });
            ctx.Response.Write(json);
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" 
                + new JavaScriptSerializer().Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable
    {
        get { return false; }
    }
}