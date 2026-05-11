<%@ WebHandler Language="C#" Class="GetActivite" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Collections.Generic;

public class GetActivite : IHttpHandler
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

                // 1. Dernières absences signalées
                string sqlAbsences = @"
                    SELECT TOP 3
                        'Nouvelle absence' AS TEXTE,
                        e.NOM AS DETAIL,
                        FORMAT(a.CREATED_AT, 'HH:mm') AS TEMPS,
                        'danger' AS TYPE
                    FROM ABSENCES a
                    LEFT JOIN ELEVES e ON a.MATRICULE = e.MATRICULE
                    WHERE a.CREATED_AT >= DATEADD(day, -7, GETDATE())
                    ORDER BY a.CREATED_AT DESC";

                using (SqlCommand cmd = new SqlCommand(sqlAbsences, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        data.Add(new
                        {
                            texte = reader["TEXTE"].ToString(),
                            detail = reader["DETAIL"]?.ToString() ?? "Un élève",
                            temps = reader["TEMPS"].ToString(),
                            type = reader["TYPE"].ToString()
                        });
                    }
                }

                // 2. Derniers paiements
                string sqlPaiements = @"
                    SELECT TOP 2
                        'Paiement enregistré' AS TEXTE,
                        e.NOM AS DETAIL,
                        FORMAT(f.CREATED_AT, 'HH:mm') AS TEMPS,
                        'success' AS TYPE
                    FROM FRAIS f
                    LEFT JOIN ELEVES e ON f.MATRICULE = e.MATRICULE
                    WHERE f.CREATED_AT >= DATEADD(day, -7, GETDATE())
                    ORDER BY f.CREATED_AT DESC";

                using (SqlCommand cmd = new SqlCommand(sqlPaiements, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        data.Add(new
                        {
                            texte = reader["TEXTE"].ToString(),
                            detail = reader["DETAIL"]?.ToString() ?? "Un élève",
                            temps = reader["TEMPS"].ToString(),
                            type = reader["TYPE"].ToString()
                        });
                    }
                }

                // 3. Derniers bulletins ajoutés
                string sqlBulletins = @"
                    SELECT TOP 2
                        'Bulletin ajouté' AS TEXTE,
                        e.NOM AS DETAIL,
                        FORMAT(b.CREATED_AT, 'HH:mm') AS TEMPS,
                        'info' AS TYPE
                    FROM BULLETINS b
                    LEFT JOIN ELEVES e ON b.MATRICULE = e.MATRICULE
                    WHERE b.CREATED_AT >= DATEADD(day, -7, GETDATE())
                    ORDER BY b.CREATED_AT DESC";

                using (SqlCommand cmd = new SqlCommand(sqlBulletins, conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        data.Add(new
                        {
                            texte = reader["TEXTE"].ToString(),
                            detail = reader["DETAIL"]?.ToString() ?? "Un élève",
                            temps = reader["TEMPS"].ToString(),
                            type = reader["TYPE"].ToString()
                        });
                    }
                }

                // Si pas de données
                if (data.Count == 0)
                {
                    data.Add(new { texte = "Bienvenue", detail = "Tableau de bord", temps = "maintenant", type = "info" });
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