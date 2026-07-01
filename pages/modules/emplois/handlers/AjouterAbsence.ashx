<%@ WebHandler Language="C#" Class="AjouterAbsence" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterAbsence : IHttpHandler, IRequiresSessionState
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
                body = reader.ReadToEnd();
            
            var ser = new JavaScriptSerializer();
            var data = ser.Deserialize<dynamic>(body);
            
            string matricule = data["matricule"];
            string nom = data["nom"];
            string classeNom = data["classe"];
            DateTime dateDebut = DateTime.Parse(data["dateDebut"].ToString());
            DateTime dateFin = DateTime.Parse(data["dateFin"].ToString());
            string motif = data.ContainsKey("motif") ? data["motif"].ToString() : "";
            bool justifie = data.ContainsKey("justifie") ? Convert.ToBoolean(data["justifie"]) : false;
            string justification = data.ContainsKey("justification") ? data["justification"].ToString() : "";
            
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            int anneeId = GetCurrentAnneeId(connStr);
            int classeId = GetClasseIdByName(connStr, classeNom);
            
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(@"
                INSERT INTO ABSENCES (ID, ANNEE_ID, MATRICULE, NOM, CLASSE, DATE_DEBUT, DATE_FIN, MOTIF, JUSTIFIE, JUSTIFICATION, CREATED_AT)
                VALUES (NEWID(), @anneeId, @matricule, @nom, @classeId, @dateDebut, @dateFin, @motif, @justifie, @justification, GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@anneeId", anneeId);
                cmd.Parameters.AddWithValue("@matricule", matricule);
                cmd.Parameters.AddWithValue("@nom", nom);
                cmd.Parameters.AddWithValue("@classeId", classeId);
                cmd.Parameters.AddWithValue("@dateDebut", dateDebut);
                cmd.Parameters.AddWithValue("@dateFin", dateFin);
                cmd.Parameters.AddWithValue("@motif", motif);
                cmd.Parameters.AddWithValue("@justifie", justifie ? 1 : 0);
                cmd.Parameters.AddWithValue("@justification", justification);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
            
            ctx.Response.Write("{\"success\":true,\"message\":\"Absence enregistrée avec succès\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }
    
    private int GetCurrentAnneeId(string connStr)
    {
        using (var conn = new SqlConnection(connStr))
        using (var cmd = new SqlCommand("SELECT TOP 1 ID FROM RANNEE WHERE CLOTURE = 0 ORDER BY DATE_DEBUT DESC", conn))
        {
            conn.Open();
            object result = cmd.ExecuteScalar();
            return result != null ? Convert.ToInt32(result) : 1;
        }
    }
    
    private int GetClasseIdByName(string connStr, string className)
    {
        using (var conn = new SqlConnection(connStr))
        using (var cmd = new SqlCommand("SELECT TOP 1 ID FROM CLASSES WHERE NOM = @nom", conn))
        {
            cmd.Parameters.AddWithValue("@nom", className);
            conn.Open();
            object result = cmd.ExecuteScalar();
            return result != null ? Convert.ToInt32(result) : 1;
        }
    }
    
    public bool IsReusable { get { return false; } }
}