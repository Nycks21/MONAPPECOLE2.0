<%@ WebHandler Language="C#" Class="GetPresences" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class GetPresences : IHttpHandler
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

                var labels = new List<string>();
                var presents = new List<int>();
                var absents = new List<int>();

                string sql = @"
                    SELECT 
                        FORMAT(DATE_DEBUT, 'dd/MM') AS JOUR,
                        COUNT(*) AS TOTAL,
                        SUM(CASE WHEN JUSTIF = 1 THEN 1 ELSE 0 END) AS PRESENTS,
                        SUM(CASE WHEN JUSTIF = 0 THEN 1 ELSE 0 END) AS ABSENTS
                    FROM ABSENCES
                    WHERE DATE_DEBUT >= DATEADD(day, -7, GETDATE())
                    GROUP BY FORMAT(DATE_DEBUT, 'dd/MM')
                    ORDER BY MIN(DATE_DEBUT)";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        labels.Add(reader["JOUR"].ToString());
                        presents.Add(Convert.ToInt32(reader["PRESENTS"]));
                        absents.Add(Convert.ToInt32(reader["ABSENTS"]));
                    }
                }

                // Si pas de données, générer des données de démonstration
                if (labels.Count == 0)
                {
                    var demo = GetDemoData();
                    labels = demo.labels;
                    presents = demo.presents;
                    absents = demo.absents;
                }

                var result = new { success = true, labels = labels, presents = presents, absents = absents };
                context.Response.Write(new JavaScriptSerializer().Serialize(result));
            }
        }
        catch (Exception ex)
        {
            context.Response.Write(new JavaScriptSerializer().Serialize(new { success = false, message = ex.Message }));
        }
    }

    private dynamic GetDemoData()
    {
        return new
        {
            labels = new[] { "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam" },
            presents = new[] { 42, 38, 45, 40, 36, 30 },
            absents = new[] { 5, 8, 3, 6, 9, 12 }
        };
    }

    public bool IsReusable { get { return false; } }
}