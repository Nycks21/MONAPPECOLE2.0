<%@ WebHandler Language="C#" Class="SaveCoeffs" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class SaveCoeffs : IHttpHandler, IRequiresSessionState
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

        try
        {
            // Lecture simple du corps
            string body = new StreamReader(ctx.Request.InputStream).ReadToEnd();
            
            // Méthode simple: remplacer les guillemets et extraire
            string matiereId = "";
            string classeId = "";
            string periode = "";
            int coeff1 = 1;
            int coeff2 = 1;
            int coeffProjet = 2;
            
            // Extraction manuelle simple
            matiereId = GetValue(body, "matiereId");
            classeId = GetValue(body, "classeId");
            periode = GetValue(body, "periode");
            
            string c1 = GetValue(body, "coeff1");
            string c2 = GetValue(body, "coeff2");
            string cp = GetValue(body, "coeffProjet");
            
            int.TryParse(c1, out coeff1);
            int.TryParse(c2, out coeff2);
            int.TryParse(cp, out coeffProjet);

            if (string.IsNullOrEmpty(matiereId) || string.IsNullOrEmpty(classeId) || string.IsNullOrEmpty(periode))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants\"}");
                return;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();
                
                // S'assurer que la table existe
                string createSql = @"
                    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BULLETINS_COEFFS')
                    BEGIN
                        CREATE TABLE BULLETINS_COEFFS (
                            ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                            MATIERE_ID UNIQUEIDENTIFIER NOT NULL,
                            CLASSE_ID INT NOT NULL,
                            PERIODE NVARCHAR(10) NOT NULL,
                            COEFF1 INT NOT NULL DEFAULT 1,
                            COEFF2 INT NOT NULL DEFAULT 1,
                            COEFF_PROJET INT NOT NULL DEFAULT 2,
                            CREATED_AT DATETIME DEFAULT GETDATE(),
                            UPDATED_AT DATETIME DEFAULT GETDATE()
                        )
                    END";
                using (SqlCommand cmd = new SqlCommand(createSql, conn))
                {
                    cmd.ExecuteNonQuery();
                }
                
                // Upsert
                string sql = @"
                    IF EXISTS (SELECT 1 FROM BULLETINS_COEFFS 
                               WHERE MATIERE_ID = @matiereId AND CLASSE_ID = @classeId AND PERIODE = @periode)
                    BEGIN
                        UPDATE BULLETINS_COEFFS 
                        SET COEFF1 = @coeff1, COEFF2 = @coeff2, COEFF_PROJET = @coeffProjet, UPDATED_AT = GETDATE()
                        WHERE MATIERE_ID = @matiereId AND CLASSE_ID = @classeId AND PERIODE = @periode
                    END
                    ELSE
                    BEGIN
                        INSERT INTO BULLETINS_COEFFS (ID, MATIERE_ID, CLASSE_ID, PERIODE, COEFF1, COEFF2, COEFF_PROJET, CREATED_AT, UPDATED_AT)
                        VALUES (NEWID(), @matiereId, @classeId, @periode, @coeff1, @coeff2, @coeffProjet, GETDATE(), GETDATE())
                    END";
                    
                using (SqlCommand cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.AddWithValue("@matiereId", new Guid(matiereId));
                    cmd.Parameters.AddWithValue("@classeId", Convert.ToInt32(classeId));
                    cmd.Parameters.AddWithValue("@periode", periode);
                    cmd.Parameters.AddWithValue("@coeff1", coeff1);
                    cmd.Parameters.AddWithValue("@coeff2", coeff2);
                    cmd.Parameters.AddWithValue("@coeffProjet", coeffProjet);
                    cmd.ExecuteNonQuery();
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Coefficients sauvegardés\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }
    }
    
    private string GetValue(string json, string key)
    {
        string search = "\"" + key + "\":";
        int idx = json.IndexOf(search);
        if (idx == -1) return "";
        
        idx = idx + search.Length;
        while (idx < json.Length && (json[idx] == ' ' || json[idx] == '\t')) idx++;
        
        if (idx >= json.Length) return "";
        
        if (json[idx] == '"')
        {
            idx++;
            int end = json.IndexOf("\"", idx);
            if (end == -1) return "";
            return json.Substring(idx, end - idx);
        }
        
        int endIdx = idx;
        while (endIdx < json.Length && json[endIdx] != ',' && json[endIdx] != '}') endIdx++;
        
        return json.Substring(idx, endIdx - idx);
    }

    public bool IsReusable { get { return false; } }
}