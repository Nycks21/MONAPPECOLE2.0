<%@ WebHandler Language="C#" Class="GetAbsence" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

// CORRECTION : IRequiresSessionState ajouté pour accès à ctx.Session["authenticated"]
public class GetAbsence : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset     = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        var list = new List<object>();
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        try
        {
            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"SELECT A.*,
                         C.NOM  AS CLASSE_NOM,
                         R.ANNEE AS ANNEE_TEXTE
                  FROM   ABSENCES A
                  LEFT JOIN CLASSES C ON A.CLASSE = C.ID
                  LEFT JOIN RANNEE  R ON A.ANNEE_ID = R.ID
                  ORDER BY A.DATE_DEBUT DESC", conn))
            {
                conn.Open();
                var rdr = cmd.ExecuteReader();
                while (rdr.Read())
                {
                    list.Add(new {
                        ID          = rdr["ID"].ToString(),
                        ANNEE_TEXTE = rdr["ANNEE_TEXTE"].ToString(),
                        MATRICULE   = rdr["MATRICULE"].ToString(),
                        NOM         = rdr["NOM"].ToString(),
                        CLASSE_NOM  = rdr["CLASSE_NOM"].ToString(),
                        TYPE        = rdr["TYPE"].ToString(),
                        DATE_DEBUT  = rdr["DATE_DEBUT"] != DBNull.Value
                                        ? Convert.ToDateTime(rdr["DATE_DEBUT"]).ToString("dd/MM/yyyy HH:mm")
                                        : "",
                        DATE_FIN    = rdr["DATE_FIN"] != DBNull.Value
                                        ? Convert.ToDateTime(rdr["DATE_FIN"]).ToString("dd/MM/yyyy HH:mm")
                                        : "",
                        DUREE       = rdr["DUREE"].ToString(),
                        JUSTIF      = rdr["JUSTIF"] != DBNull.Value && Convert.ToBoolean(rdr["JUSTIF"]),
                        COMMENTAIRES = rdr["COMMENTAIRES"].ToString()
                    });
                }
            }

            ctx.Response.Write(ser.Serialize(new { success = true, data = list }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write(ser.Serialize(new { success = false, message = ex.Message }));
        }
    }

    public bool IsReusable { get { return false; } }
}
