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
                @"SELECT c.ID,
                         c.NOM,
                         c.NIVEAU_ID,
                         n.NOM        AS NIVEAU_NOM,
                         c.EFFECTIF,
                         c.TITULAIRE_ID,
                         u.NOM        AS TITULAIRE_NOM,
                         c.SALLE_ID,
                         s.NUMERO     AS SALLE_NUMERO,
                         c.STATUT
                  FROM   [dbo].[Classes]  c
                  LEFT JOIN [dbo].[Niveaux] n ON n.ID       = c.NIVEAU_ID
                  LEFT JOIN [dbo].[USERS]   u ON u.IDUSER   = c.TITULAIRE_ID
                  LEFT JOIN [dbo].[Salles]  s ON s.ID       = c.SALLE_ID
                  ORDER  BY c.NOM ASC", conn))
            {
                conn.Open();
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(new
                        {
                            ID           = reader.IsDBNull(0) ? "" : reader.GetInt32(0).ToString(),
                            NOM          = reader.IsDBNull(1) ? "" : reader.GetString(1),

                            // GUID brut — pour pré-remplir le select Niveau en mode édition
                            NIVEAU_ID    = reader.IsDBNull(2) ? "" : reader.GetGuid(2).ToString(),
                            // Nom lisible — affiché dans le tableau
                            NIVEAU       = reader.IsDBNull(3) ? "" : reader.GetString(3),

                            EFFECTIF     = reader.IsDBNull(4) ? 0 : reader.GetInt32(4),

                            // ID entier — pour pré-remplir le select Titulaire en mode édition
                            TITULAIRE_ID = reader.IsDBNull(5) ? 0 : reader.GetInt32(5),
                            // Nom lisible — affiché dans le tableau
                            TITULAIRE    = reader.IsDBNull(6) ? "" : reader.GetString(6),

                            // GUID brut — pour pré-remplir le select Salle en mode édition
                            SALLE_ID     = reader.IsDBNull(7) ? "" : reader.GetGuid(7).ToString(),
                            // Numéro lisible — affiché dans le tableau
                            SALLE        = reader.IsDBNull(8) ? "" : reader.GetString(8),

                            STATUT       = !reader.IsDBNull(9) && reader.GetBoolean(9)
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
