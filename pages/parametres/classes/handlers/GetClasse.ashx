<%@ WebHandler Language="C#" Class="GetClasse" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetClasse : IHttpHandler, IRequiresSessionState
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
                @"SELECT ID, NOM, NIVEAU_ID, EFFECTIF, TITULAIRE, SALLE_ID, STATUT
                  FROM   [dbo].[Classes]
                  ORDER  BY NOM ASC", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new
                        {
                            ID         = reader.IsDBNull(0) ? "" : reader.GetGuid(0).ToString(),
                            NOM        = reader.IsDBNull(1) ? "" : reader.GetString(1),
                            
                            // Ici, on récupère le NOM du niveau (String) issu de la jointure
                            NIVEAU_ID     = reader.IsDBNull(2) ? "" : reader.GetString(2),
                            
                            EFFECTIF   = reader.IsDBNull(3) ? 0 : reader.GetInt32(3),
                            TITULAIRE  = reader.IsDBNull(4) ? "" : reader.GetString(4),
                            
                            // Ici, on récupère le NUMÉRO de la salle (String) issu de la jointure
                            SALLE_ID      = reader.IsDBNull(5) ? "" : reader.GetString(5),
                            
                            STATUT     = !reader.IsDBNull(6) && reader.GetBoolean(6),
                            CREATED_AT = reader.IsDBNull(7) ? null : reader.GetDateTime(7).ToString("yyyy-MM-dd HH:mm:ss")
                        });
                    }
                }
            }

            ctx.Response.Write(new JavaScriptSerializer().Serialize(
                new { success = true, Classes = list }));
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
