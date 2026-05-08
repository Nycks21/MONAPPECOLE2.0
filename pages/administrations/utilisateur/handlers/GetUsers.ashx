<%@ WebHandler Language="C#" Class="GetUsers" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetUsers : IHttpHandler, IRequiresSessionState
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
                @"SELECT IDUSER, NOM
                  FROM   [dbo].[USERS]
                  WHERE ROLEID = '3'
                  ORDER  BY NOM ASC", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new
                        {
                            ID  = reader.IsDBNull(0) ? 0 : reader.GetInt32(0), // IDUSER → exposé comme ID au JS
                            NOM = reader.IsDBNull(1) ? "" : reader.GetString(1)
                        });
                    }
                }
            }

            ctx.Response.Write(new JavaScriptSerializer().Serialize(
                new { success = true, users = list }));
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
