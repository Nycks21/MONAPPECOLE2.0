<%@ WebHandler Language="C#" Class="GetAnnee" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetAnnee : IHttpHandler, IRequiresSessionState
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
            using (var cmd  = new SqlCommand("SELECT ID, ANNEE, DATE_DEBUT, DATE_FIN, CLOTURE, DATE_CLOTURE, CREATED_AT FROM [dbo].[RANNEE] ORDER BY DATE_DEBUT DESC", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new {
                            ID           = reader.GetInt32(0),
                            ANNEE        = reader.GetString(1),
                            DATE_DEBUT   = reader.GetDateTime(2),
                            DATE_FIN     = reader.GetDateTime(3),
                            CLOTURE      = reader.GetBoolean(4),
                            DATE_CLOTURE = reader.IsDBNull(5) ? null : (DateTime?)reader.GetDateTime(5),
                            CREATED_AT   = reader.GetDateTime(6)
                        });
                    }
                }
            }

            ctx.Response.Write(new JavaScriptSerializer().Serialize(new { success = true, Annees = list }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + new JavaScriptSerializer().Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
}