<%@ WebHandler Language="C#" Class="GetPresences" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.SessionState;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class GetPresences : IHttpHandler, IRequiresSessionState
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";

        try
        {
            // Vérifier l'authentification
            if (context.Session == null || context.Session["authenticated"] == null || !(bool)context.Session["authenticated"])
            {
                context.Response.StatusCode = 401;
                context.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }

            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();

                var labels = new List<string>();
                var presents = new List<int>();
                var absents = new List<int>();

                // 1. Récupérer le nombre total d'élèves actifs
                int totalEleves = 0;
                string countSql = "SELECT COUNT(*) FROM ELEVES WHERE STATUT = 'actif'";
                using (var cmd = new SqlCommand(countSql, conn))
                {
                    totalEleves = (int)cmd.ExecuteScalar();
                }
                if (totalEleves == 0) totalEleves = 50;

                // 2. Récupérer les absences des 7 derniers jours ouvrés (exclure dimanche)
                string sql = @"
                    SET DATEFIRST 1;  -- 1 = Lundi

                    WITH Dates AS (
                        SELECT TOP 10 
                            DATEADD(day, -n, CAST(GETDATE() AS DATE)) AS JOUR
                        FROM (VALUES (0),(1),(2),(3),(4),(5),(6),(7),(8),(9)) AS T(n)
                        WHERE DATEPART(weekday, DATEADD(day, -n, CAST(GETDATE() AS DATE))) != 7
                    ),
                    Dates_7 AS (
                        SELECT TOP 7 JOUR
                        FROM Dates
                        ORDER BY JOUR ASC
                    ),
                    AbsencesParJour AS (
                        SELECT 
                            CAST(DATE_DEBUT AS DATE) AS DATE_ABS,
                            COUNT(DISTINCT MATRICULE) AS NB_ABSENTS
                        FROM ABSENCES
                        WHERE DATE_DEBUT >= DATEADD(day, -12, GETDATE())  -- pour couvrir
                          AND (JUSTIFIE = 0 OR JUSTIFIE IS NULL)
                        GROUP BY CAST(DATE_DEBUT AS DATE)
                    )
                    SELECT 
                        FORMAT(d.JOUR, 'dd/MM') AS JOUR,
                        ISNULL(a.NB_ABSENTS, 0) AS ABSENTS
                    FROM Dates_7 d
                    LEFT JOIN AbsencesParJour a ON d.JOUR = a.DATE_ABS
                    ORDER BY d.JOUR ASC";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        labels.Add(reader["JOUR"].ToString());
                        int absentsCount = Convert.ToInt32(reader["ABSENTS"]);
                        int presentsCount = totalEleves - absentsCount;
                        if (presentsCount < 0) presentsCount = 0;
                        absents.Add(absentsCount);
                        presents.Add(presentsCount);
                    }
                }

                // Si aucune donnée d'absence n'existe, utiliser des données de démonstration
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
            absents = new[] { 8, 12, 5, 10, 14, 20 }
        };
    }

    public bool IsReusable { get { return false; } }
}