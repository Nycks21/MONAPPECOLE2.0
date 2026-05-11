<%@ WebHandler Language="C#" Class="GetReussite" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class GetReussite : IHttpHandler
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

                var data = new List<object>();

                string sql = @"
                    SELECT 
                        c.NOM AS CLASSE,
                        AVG(CASE WHEN b.NOTE >= 10 THEN 1 ELSE 0 END) * 100 AS TAUX
                    FROM BULLETINS b
                    LEFT JOIN CLASSES c ON b.CLASSE = c.ID
                    GROUP BY c.NOM
                    ORDER BY TAUX DESC";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        data.Add(new
                        {
                            classe = reader["CLASSE"]?.ToString() ?? "Non définie",
                            taux = Math.Round(Convert.ToDouble(reader["TAUX"]), 1)
                        });
                    }
                }

                // Données démo si table vide
                if (data.Count == 0)
                {
                    data.Add(new { classe = "6ème A", taux = 88.5 });
                    data.Add(new { classe = "6ème B", taux = 82.0 });
                    data.Add(new { classe = "5ème A", taux = 75.5 });
                    data.Add(new { classe = "4ème A", taux = 69.0 });
                    data.Add(new { classe = "3ème A", taux = 58.5 });
                }

                var result = new { success = true, data = data };
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