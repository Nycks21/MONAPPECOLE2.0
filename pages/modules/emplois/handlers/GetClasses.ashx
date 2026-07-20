<%@ WebHandler Language="C#" Class="GetClasses" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetClasses : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";

        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        var list = new List<object>();
        string connStr = "";
        if (ConfigurationManager.ConnectionStrings["MaConnexion"] != null)
        {
            connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
        }

        if (string.IsNullOrEmpty(connStr))
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion manquante (MaConnexion)\"}");
            return;
        }

        try
        {
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand("SELECT ID, NOM FROM CLASSES ORDER BY NOM", conn))
            {
                conn.Open();
                using (var rdr = cmd.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        list.Add(new
                        {
                            ID = rdr["ID"].ToString(),
                            NOM = rdr["NOM"].ToString()
                        });
                    }
                }
            }
            ctx.Response.Write(new JavaScriptSerializer().Serialize(new { success = true, data = list }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    public bool IsReusable
    {
        get { return false; }
    }
}