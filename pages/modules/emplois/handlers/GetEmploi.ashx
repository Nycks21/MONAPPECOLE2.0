<%@ WebHandler Language="C#" Class="GetEmploi" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetEmploi : IHttpHandler, IRequiresSessionState
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

        string classeId = ctx.Request.QueryString["classe"];
        if (string.IsNullOrEmpty(classeId))
        {
            ctx.Response.Write("{\"success\":false,\"message\":\"Paramètre classe manquant\"}");
            return;
        }

        var dict = new Dictionary<string, object>();
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        try
        {
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"SELECT 
                    e.JOUR, 
                    e.HEURE_DEBUT, 
                    e.HEURE_FIN, 
                    e.MATIERE_ID, 
                    m.NOM AS MATIERE_NOM,
                    e.PROFESSEUR, 
                    e.SALLE, 
                    e.COULEUR, 
                    e.TYPE, 
                    e.URL, 
                    e.DESCRIPTION 
                  FROM EMPLOI_TEMPS e
                  LEFT JOIN MATIERES m ON e.MATIERE_ID = m.ID
                  WHERE e.CLASSE_ID = @classeId",
                conn))
            {
                cmd.Parameters.AddWithValue("@classeId", classeId);
                conn.Open();
                using (var rdr = cmd.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        string heureDebut = rdr["HEURE_DEBUT"].ToString();
                        string key = rdr["JOUR"] + "_" + heureDebut;

                        string matiereId = rdr["MATIERE_ID"].ToString();
                        string matiereNom = rdr["MATIERE_NOM"] != DBNull.Value ? rdr["MATIERE_NOM"].ToString() : matiereId;
                        string prof = rdr["PROFESSEUR"] != DBNull.Value ? rdr["PROFESSEUR"].ToString() : "";
                        string salle = rdr["SALLE"] != DBNull.Value ? rdr["SALLE"].ToString() : "";
                        string heureFin = rdr["HEURE_FIN"] != DBNull.Value ? rdr["HEURE_FIN"].ToString() : heureDebut;
                        string couleur = rdr["COULEUR"] != DBNull.Value ? rdr["COULEUR"].ToString() : "#007bff";
                        string type = rdr["TYPE"] != DBNull.Value ? rdr["TYPE"].ToString() : "cours";
                        string url = rdr["URL"] != DBNull.Value ? rdr["URL"].ToString() : "";
                        string description = rdr["DESCRIPTION"] != DBNull.Value ? rdr["DESCRIPTION"].ToString() : "";

                        dict[key] = new
                        {
                            matiere = matiereId,
                            matiere_nom = matiereNom,
                            prof,
                            salle,
                            heureFin,
                            couleur,
                            type,
                            url,
                            description
                        };
                    }
                }
            }

            ctx.Response.Write(new JavaScriptSerializer().Serialize(new { success = true, data = dict }));
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}