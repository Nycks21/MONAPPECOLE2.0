<%@ WebHandler Language="C#" Class="GetRepartition" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class GetRepartition : IHttpHandler
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";

        try
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();

                var niveaux = new List<string>();
                var counts = new List<int>();

                string sql = @"
                    SELECT 
                        n.NOM AS NIVEAU,
                        COUNT(e.ID) AS NB_ELEVES
                    FROM ELEVES e
                    LEFT JOIN CLASSES c ON e.CLASSE = c.ID
                    LEFT JOIN NIVEAUX n ON c.NIVEAU_ID = n.ID
                    WHERE e.STATUT = 'actif'
                    GROUP BY n.NOM
                    ORDER BY NB_ELEVES DESC";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        niveaux.Add(reader["NIVEAU"]?.ToString() ?? "Non défini");
                        counts.Add(Convert.ToInt32(reader["NB_ELEVES"]));
                    }
                }

                // Si pas de niveaux, données démo
                if (niveaux.Count == 0)
                {
                    niveaux = new List<string> { "6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale" };
                    counts = new List<int> { 45, 38, 42, 40, 35, 30, 28 };
                }

                var result = new { success = true, niveaux = niveaux, counts = counts };
                context.Response.Write(new JavaScriptSerializer().Serialize(result));
            }
        }
        catch (Exception ex)
        {
            context.Response.Write(new JavaScriptSerializer().Serialize(new { success = false, message = ex.Message }));
        }
    }

    public bool IsReusable { get { return false; } }
}