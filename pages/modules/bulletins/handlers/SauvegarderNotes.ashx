<%@ WebHandler Language="C#" Class="SauvegarderCoeffs" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class SauvegarderCoeffs : IHttpHandler, IRequiresSessionState
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
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
            {
                body = reader.ReadToEnd();
            }

            var ser = new JavaScriptSerializer();
            
            // Extraire les valeurs manuellement
            string matiereId = ExtractValue(body, "matiereId");
            string classeId = ExtractValue(body, "classeId");
            string periode = ExtractValue(body, "periode");
            string coeff1Str = ExtractValue(body, "coeff1");
            string coeff2Str = ExtractValue(body, "coeff2");
            string coeffProjetStr = ExtractValue(body, "coeffProjet");
            
            int coeff1 = 1;
            int coeff2 = 1;
            int coeffProjet = 2;
            
            if (!string.IsNullOrEmpty(coeff1Str)) int.TryParse(coeff1Str, out coeff1);
            if (!string.IsNullOrEmpty(coeff2Str)) int.TryParse(coeff2Str, out coeff2);
            if (!string.IsNullOrEmpty(coeffProjetStr)) int.TryParse(coeffProjetStr, out coeffProjet);

            if (string.IsNullOrEmpty(matiereId) || string.IsNullOrEmpty(classeId) || string.IsNullOrEmpty(periode))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants\"}");
                return;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                string sql = @"
                    IF EXISTS (SELECT 1 FROM BULLETINS_COEFFS 
                               WHERE MATIERE_ID = @matiereId AND CLASSE_ID = @classeId AND PERIODE = @periode)
                    BEGIN
                        UPDATE BULLETINS_COEFFS 
                        SET COEFF1 = @coeff1,
                            COEFF2 = @coeff2,
                            COEFF_PROJET = @coeffProjet,
                            UPDATED_AT = GETDATE()
                        WHERE MATIERE_ID = @matiereId AND CLASSE_ID = @classeId AND PERIODE = @periode
                    END
                    ELSE
                    BEGIN
                        INSERT INTO BULLETINS_COEFFS (ID, MATIERE_ID, CLASSE_ID, PERIODE, COEFF1, COEFF2, COEFF_PROJET, CREATED_AT, UPDATED_AT)
                        VALUES (NEWID(), @matiereId, @classeId, @periode, @coeff1, @coeff2, @coeffProjet, GETDATE(), GETDATE())
                    END";

                using (var cmd = new SqlCommand(sql, conn))
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
            string errorMsg = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + errorMsg + "\"}");
        }
    }

    private string ExtractValue(string json, string key)
    {
        if (string.IsNullOrEmpty(json)) return "";
        
        string searchKey = "\"" + key + "\"";
        int keyIndex = json.IndexOf(searchKey);
        if (keyIndex == -1) return "";
        
        int colonIndex = json.IndexOf(":", keyIndex);
        if (colonIndex == -1) return "";
        
        int startIndex = colonIndex + 1;
        while (startIndex < json.Length && (json[startIndex] == ' ' || json[startIndex] == '\t'))
        {
            startIndex++;
        }
        
        if (startIndex >= json.Length) return "";
        
        if (json[startIndex] == '"')
        {
            startIndex++;
            int endIndex = json.IndexOf("\"", startIndex);
            if (endIndex == -1) return "";
            return json.Substring(startIndex, endIndex - startIndex);
        }
        else
        {
            int endIndex = startIndex;
            while (endIndex < json.Length && json[endIndex] != ',' && json[endIndex] != '}' && json[endIndex] != ' ')
            {
                endIndex++;
            }
            return json.Substring(startIndex, endIndex - startIndex);
        }
    }

    public bool IsReusable { get { return false; } }
}