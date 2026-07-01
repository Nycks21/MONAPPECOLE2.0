<%@ WebHandler Language="C#" Class="ModifierAbsence" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class ModifierAbsence : IHttpHandler, IRequiresSessionState
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

            if (data == null)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Données invalides\"}");
                return;
            }

            // Vérifier que l'ID existe
            if (!data.ContainsKey("id") || data["id"] == null)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"ID manquant\"}");
                return;
            }

            Guid absenceId = Guid.Parse(data["id"].ToString());
            string matricule = data.ContainsKey("matricule") ? data["matricule"].ToString() : "";
            string nom = data.ContainsKey("nom") ? data["nom"].ToString() : "";
            string classeNom = data.ContainsKey("classe") ? data["classe"].ToString() : "";
            
            DateTime dateDebut = DateTime.Now;
            if (data.ContainsKey("dateDebut") && data["dateDebut"] != null)
            {
                dateDebut = DateTime.Parse(data["dateDebut"].ToString());
            }
            
            DateTime dateFin = dateDebut;
            if (data.ContainsKey("dateFin") && data["dateFin"] != null)
            {
                dateFin = DateTime.Parse(data["dateFin"].ToString());
            }
            
            string motif = data.ContainsKey("motif") ? data["motif"].ToString() : "";
            bool justifie = data.ContainsKey("justifie") && Convert.ToBoolean(data["justifie"]);
            string justification = data.ContainsKey("justification") ? data["justification"].ToString() : "";

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            int anneeId = GetCurrentAnneeId(connStr);
            int classeId = GetClasseIdByName(connStr, classeNom);

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                
                using (var cmd = new SqlCommand(@"
                    UPDATE ABSENCES 
                    SET ANNEE_ID = @anneeId,
                        MATRICULE = @matricule,
                        NOM = @nom,
                        CLASSE = @classeId,
                        DATE_DEBUT = @dateDebut,
                        DATE_FIN = @dateFin,
                        MOTIF = @motif,
                        JUSTIFIE = @justifie,
                        JUSTIFICATION = @justification,
                        UPDATED_AT = GETDATE()
                    WHERE ID = @id", conn))
                {
                    cmd.Parameters.AddWithValue("@id", absenceId);
                    cmd.Parameters.AddWithValue("@anneeId", anneeId);
                    cmd.Parameters.AddWithValue("@matricule", matricule);
                    cmd.Parameters.AddWithValue("@nom", nom);
                    cmd.Parameters.AddWithValue("@classeId", classeId);
                    cmd.Parameters.AddWithValue("@dateDebut", dateDebut);
                    cmd.Parameters.AddWithValue("@dateFin", dateFin);
                    cmd.Parameters.AddWithValue("@motif", motif);
                    cmd.Parameters.AddWithValue("@justifie", justifie ? 1 : 0);
                    cmd.Parameters.AddWithValue("@justification", justification);
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    
                    if (rowsAffected > 0)
                    {
                        ctx.Response.Write("{\"success\":true,\"message\":\"Absence modifiée avec succès\"}");
                    }
                    else
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Aucune modification effectuée\"}");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    private int GetCurrentAnneeId(string connStr)
    {
        try
        {
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand("SELECT TOP 1 ID FROM RANNEE WHERE CLOTURE = 0 ORDER BY DATE_DEBUT DESC", conn))
            {
                conn.Open();
                object result = cmd.ExecuteScalar();
                return result != null ? Convert.ToInt32(result) : 1;
            }
        }
        catch
        {
            return 1;
        }
    }

    private int GetClasseIdByName(string connStr, string className)
    {
        try
        {
            if (string.IsNullOrEmpty(className)) return 1;
            
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand("SELECT TOP 1 ID FROM CLASSES WHERE NOM = @nom", conn))
            {
                cmd.Parameters.AddWithValue("@nom", className);
                conn.Open();
                object result = cmd.ExecuteScalar();
                return result != null ? Convert.ToInt32(result) : 1;
            }
        }
        catch
        {
            return 1;
        }
    }

    public bool IsReusable { get { return false; } }
}