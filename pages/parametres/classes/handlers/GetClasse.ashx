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
            var classesList = new List<object>();

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"SELECT ID, NOM, NIVEAU, EFFECTIF, TITULAIRE, SALLE, STATUT
                  FROM [dbo].[Classes]
                  ORDER BY NOM ASC", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        classesList.Add(new
                        {
                            ID        = reader["ID"] != DBNull.Value ? Convert.ToInt32(reader["ID"]) : 0,
                            // Remplacement du ?. par une vérification classique
                            NOM       = reader["NOM"] != DBNull.Value ? reader["NOM"].ToString() : "",
                            NIVEAU    = reader["NIVEAU"] != DBNull.Value ? reader["NIVEAU"].ToString() : "",
                            EFFECTIF  = reader["EFFECTIF"] != DBNull.Value ? Convert.ToInt32(reader["EFFECTIF"]) : 0,
                            TITULAIRE = reader["TITULAIRE"] != DBNull.Value ? reader["TITULAIRE"].ToString() : "",
                            SALLE     = reader["SALLE"] != DBNull.Value ? reader["SALLE"].ToString() : "",
                            STATUT    = reader["STATUT"] != DBNull.Value ? reader["STATUT"].ToString() : ""
                        });
                    }
                }
            }

            var json = new JavaScriptSerializer().Serialize(new { success = true, Classes = classesList });
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