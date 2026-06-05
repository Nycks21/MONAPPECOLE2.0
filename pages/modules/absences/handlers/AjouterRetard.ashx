<%@ WebHandler Language="C#" Class="AjouterRetard" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterRetard : IHttpHandler, IRequiresSessionState
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
            DateTime date = DateTime.Parse(data["date"].ToString());
            TimeSpan heurePrevue = TimeSpan.Parse(data["heurePrevue"].ToString());
            TimeSpan heureArrivee = TimeSpan.Parse(data["heureArrivee"].ToString());
            int duree = Convert.ToInt32(data["duree"]);
            string motif = data.ContainsKey("motif") ? data["motif"].ToString() : "";
            bool justifie = data.ContainsKey("justifie") ? Convert.ToBoolean(data["justifie"]) : false;
            string justification = data.ContainsKey("justification") ? data["justification"].ToString() : "";
            
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            int anneeId = GetCurrentAnneeId(connStr);
            int classeId = GetClasseIdByName(connStr, classeNom);
            
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(@"
                INSERT INTO RETARDS (ID, ANNEE_ID, MATRICULE, NOM, CLASSE, DATE_RETARD, HEURE_PREVUE, HEURE_ARRIVEE, DUREE, MOTIF, JUSTIFIE, JUSTIFICATION, CREATED_AT)
                VALUES (NEWID(), @anneeId, @matricule, @nom, @classeId, @date, @heurePrevue, @heureArrivee, @duree, @motif, @justifie, @justification, GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@anneeId", anneeId);
                cmd.Parameters.AddWithValue("@matricule", matricule);
                cmd.Parameters.AddWithValue("@nom", nom);
                cmd.Parameters.AddWithValue("@classeId", classeId);
                cmd.Parameters.AddWithValue("@date", date);
                cmd.Parameters.AddWithValue("@heurePrevue", heurePrevue);
                cmd.Parameters.AddWithValue("@heureArrivee", heureArrivee);
                cmd.Parameters.AddWithValue("@duree", duree);
                cmd.Parameters.AddWithValue("@motif", motif);
                cmd.Parameters.AddWithValue("@justifie", justifie ? 1 : 0);
                cmd.Parameters.AddWithValue("@justification", justification);
                conn.Open();
                cmd.ExecuteNonQuery();
            }
            
            ctx.Response.Write("{\"success\":true,\"message\":\"Retard enregistré avec succès\"}");
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