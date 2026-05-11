<%@ WebHandler Language="C#" Class="GetAbsencesFrequentes" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class GetAbsencesFrequentes : IHttpHandler
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
                    SELECT TOP 5
                        a.MATRICULE,
                        e.NOM,
                        c.NOM AS CLASSE,
                        COUNT(*) AS NB_ABSENCES,
                        CASE 
                            WHEN COUNT(*) >= 5 THEN 'Critique'
                            WHEN COUNT(*) >= 3 THEN 'Surveiller'
                            ELSE 'Normal'
                        END AS STATUT
                    FROM ABSENCES a
                    LEFT JOIN ELEVES e ON a.MATRICULE = e.MATRICULE
                    LEFT JOIN CLASSES c ON a.CLASSE = c.ID
                    WHERE a.DATE_DEBUT >= DATEADD(month, -1, GETDATE())
                    GROUP BY a.MATRICULE, e.NOM, c.NOM
                    ORDER BY NB_ABSENCES DESC";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        data.Add(new
                        {
                            nom = reader["NOM"]?.ToString() ?? "Inconnu",
                            classe = reader["CLASSE"]?.ToString() ?? "-",
                            nb = Convert.ToInt32(reader["NB_ABSENCES"]),
                            statut = reader["STATUT"].ToString()
                        });
                    }
                }

                // Si pas de données
                if (data.Count == 0)
                {
                    data.Add(new { nom = "RAKOTO Jean", classe = "6ème A", nb = 4, statut = "Surveiller" });
                    data.Add(new { nom = "RANDRIA Alice", classe = "5ème B", nb = 2, statut = "Normal" });
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