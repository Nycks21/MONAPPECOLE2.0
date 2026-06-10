<%@ WebHandler Language="C#" Class="GetBulletins" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;
using System.IO;

public class GetBulletins : IHttpHandler, IRequiresSessionState
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        context.Response.Charset = "utf-8";
        context.Response.Cache.SetNoStore();

        if (context.Session["authenticated"] == null || !(bool)context.Session["authenticated"])
        {
            context.Response.StatusCode = 401;
            context.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        try
        {
            // Lire le corps de la requête pour la méthode POST
            string requestBody = "";
            if (context.Request.HttpMethod == "POST")
            {
                using (var reader = new StreamReader(context.Request.InputStream))
                {
                    requestBody = reader.ReadToEnd();
                }
            }

            var serializer = new JavaScriptSerializer();
            
            // Traitement selon la méthode HTTP
            if (context.Request.HttpMethod == "POST" && !string.IsNullOrEmpty(requestBody))
            {
                var data = serializer.Deserialize<Dictionary<string, object>>(requestBody);
                
                string classeId = data.ContainsKey("classeId") ? data["classeId"].ToString() : null;
                string matiereId = data.ContainsKey("matiereId") ? data["matiereId"].ToString() : null;
                string periodeId = data.ContainsKey("periodeId") ? data["periodeId"].ToString() : null;

                if (string.IsNullOrEmpty(classeId) || string.IsNullOrEmpty(matiereId) || string.IsNullOrEmpty(periodeId))
                {
                    context.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants\"}");
                    return;
                }

                GetBulletinsForSaisie(context, classeId, matiereId, periodeId);
                return;
            }
            
            // Si GET ou autre, retourner succès avec tableau vide
            context.Response.Write("{\"success\":true,\"data\":[]}");
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }
    }

    private void GetBulletinsForSaisie(HttpContext context, string classeId, string matiereId, string periodeId)
    {
        var eleves = new List<object>();
        decimal? globalCoeff1 = null;
        decimal? globalCoeff2 = null;
        decimal? globalCoeffProjet = null;

        try
        {
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();

                // 1. Vérifier si la table BULLETINS_COEFFS existe
                bool tableCoeffsExists = false;
                string checkTableSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'BULLETINS_COEFFS'";
                using (var checkCmd = new SqlCommand(checkTableSql, conn))
                {
                    tableCoeffsExists = (int)checkCmd.ExecuteScalar() > 0;
                }

                // 2. Récupérer les coefficients globaux sauvegardés (si la table existe)
                if (tableCoeffsExists)
                {
                    string getCoeffsSql = @"
                        SELECT COEFF1, COEFF2, COEFF_PROJET 
                        FROM BULLETINS_COEFFS 
                        WHERE MATIERE_ID = @matiereId AND CLASSE_ID = @classeId AND PERIODE = @periodeId";
                    
                    using (var coeffCmd = new SqlCommand(getCoeffsSql, conn))
                    {
                        coeffCmd.Parameters.AddWithValue("@matiereId", new Guid(matiereId));
                        coeffCmd.Parameters.AddWithValue("@classeId", Convert.ToInt32(classeId));
                        coeffCmd.Parameters.AddWithValue("@periodeId", periodeId);
                        
                        using (var reader = coeffCmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                globalCoeff1 = reader["COEFF1"] != DBNull.Value ? Convert.ToDecimal(reader["COEFF1"]) : (decimal?)1;
                                globalCoeff2 = reader["COEFF2"] != DBNull.Value ? Convert.ToDecimal(reader["COEFF2"]) : (decimal?)2;
                                globalCoeffProjet = reader["COEFF_PROJET"] != DBNull.Value ? Convert.ToDecimal(reader["COEFF_PROJET"]) : (decimal?)1;
                            }
                        }
                    }
                }

                // 3. Récupérer la liste des élèves avec leurs notes
                string sql = @"
                    SELECT 
                        ROW_NUMBER() OVER (ORDER BY e.NOM) AS NUMERO,
                        e.MATRICULE,
                        e.NOM,
                        b.NOTE1,
                        b.NOTE2,
                        b.NOTE_PROJET,
                        ISNULL(b.APPRECIATION, '') AS APPRECIATION,
                        ISNULL(b.STATUT, 'Non saisi') AS STATUT,
                        b.ID AS NOTE_ID,
                        CONVERT(VARCHAR(10), b.DATE_EVAL1, 103) AS DATE_EVAL1,
                        CONVERT(VARCHAR(10), b.DATE_EVAL2, 103) AS DATE_EVAL2,
                        CONVERT(VARCHAR(10), b.DATE_EVAL_PROJET, 103) AS DATE_EVAL_PROJET
                    FROM ELEVES e
                    LEFT JOIN BULLETINS b ON e.MATRICULE = b.ELEVE_MATRICULE 
                        AND b.MATIERE_ID = @matiereId 
                        AND b.PERIODE = @periodeId
                    WHERE e.CLASSE = @classeId
                      AND e.STATUT = 'actif'
                    ORDER BY e.NOM ASC";

                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@classeId", Convert.ToInt32(classeId));
                    cmd.Parameters.AddWithValue("@matiereId", new Guid(matiereId));
                    cmd.Parameters.AddWithValue("@periodeId", periodeId);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            // Récupérer les notes individuelles de l'élève (si elles existent)
                            decimal? note1 = reader["NOTE1"] != DBNull.Value ? Convert.ToDecimal(reader["NOTE1"]) : (decimal?)null;
                            decimal? note2 = reader["NOTE2"] != DBNull.Value ? Convert.ToDecimal(reader["NOTE2"]) : (decimal?)null;
                            decimal? noteProjet = reader["NOTE_PROJET"] != DBNull.Value ? Convert.ToDecimal(reader["NOTE_PROJET"]) : (decimal?)null;
                            
                            // Si l'élève a des notes individuelles, on utilise ses coefficients individuels
                            // Sinon, on utilisera les coefficients globaux
                            decimal? coeff1 = null;
                            decimal? coeff2 = null;
                            decimal? coeffProjet = null;
                            
                            // Vérifier si l'élève a des coefficients individuels dans sa ligne de bulletin
                            // Pour cela, il faudrait des colonnes COEFF1, COEFF2, COEFF_PROJET dans BULLETINS
                            // Si elles n'existent pas, on utilise les coefficients globaux
                            
                            eleves.Add(new
                            {
                                Numero = reader["NUMERO"],
                                EleveId = reader["MATRICULE"].ToString(),
                                Nom = reader["NOM"].ToString(),
                                Note1 = note1,
                                Note2 = note2,
                                NoteProjet = noteProjet,
                                Appreciation = reader["APPRECIATION"].ToString(),
                                Statut = reader["STATUT"].ToString(),
                                NoteId = reader["NOTE_ID"] != DBNull.Value ? reader["NOTE_ID"].ToString() : null,
                                DateEval1 = reader["DATE_EVAL1"] != DBNull.Value ? reader["DATE_EVAL1"].ToString() : null,
                                DateEval2 = reader["DATE_EVAL2"] != DBNull.Value ? reader["DATE_EVAL2"].ToString() : null,
                                DateEvalP = reader["DATE_EVAL_PROJET"] != DBNull.Value ? reader["DATE_EVAL_PROJET"].ToString() : null
                            });
                        }
                    }
                }
            }

            // Préparer la réponse avec les coefficients
            var result = new 
            { 
                success = true, 
                eleves = eleves,
                coefficients = new 
                { 
                    coeff1 = globalCoeff1 ?? 1, 
                    coeff2 = globalCoeff2 ?? 2, 
                    coeffProjet = globalCoeffProjet ?? 1 
                }
            };
            
            context.Response.Write(new JavaScriptSerializer().Serialize(result));
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}