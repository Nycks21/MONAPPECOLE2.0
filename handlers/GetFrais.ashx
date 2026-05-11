<%@ WebHandler Language="C#" Class="GetFrais" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class GetFrais : IHttpHandler
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
                var payes = new List<double>();
                var impayes = new List<double>();

                string sql = @"
                    SELECT 
                        FORMAT(CREATED_AT, 'MM/yyyy') AS MOIS,
                        SUM(PAYE) AS PAYE,
                        SUM(RESTE) AS IMPAYE
                    FROM FRAIS
                    WHERE CREATED_AT >= DATEADD(month, -6, GETDATE())
                    GROUP BY FORMAT(CREATED_AT, 'MM/yyyy')
                    ORDER BY MIN(CREATED_AT)";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        labels.Add(reader["MOIS"].ToString());
                        payes.Add(Convert.ToDouble(reader["PAYE"]) / 1000);
                        impayes.Add(Convert.ToDouble(reader["IMPAYE"]) / 1000);
                    }
                }

                // Données démo
                if (labels.Count == 0)
                {
                    labels = new List<string> { "Jan", "Fév", "Mar", "Avr", "Mai", "Juin" };
                    payes = new List<double> { 12500, 13200, 14800, 14200, 15600, 16200 };
                    impayes = new List<double> { 2500, 2200, 1800, 2000, 1400, 1200 };
                }

                var result = new { success = true, labels = labels, payes = payes, impayes = impayes };
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