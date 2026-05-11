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

        JavaScriptSerializer ser = new JavaScriptSerializer();

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

            var payload = ser.Deserialize<dynamic>(body);
            if (payload == null) throw new ArgumentException("Données invalides.");

            string matricule = payload["matricule"];
            string type = payload["type"];
            string dateDebut = payload["dateDebut"];
            string dateFin = payload["dateFin"];
            decimal duree = Convert.ToDecimal(payload["duree"]);
            bool justifie = payload["justifie"];
            string motif = payload.ContainsKey("motif") ? payload["motif"].ToString() : "";
            string heureDebut = payload.ContainsKey("heureDebut") ? payload["heureDebut"].ToString() : "";
            string heureFin = payload.ContainsKey("heureFin") ? payload["heureFin"].ToString() : "";

            if (string.IsNullOrEmpty(matricule)) throw new ArgumentException("Matricule requis");
            if (string.IsNullOrEmpty(type)) throw new ArgumentException("Type requis");
            if (string.IsNullOrEmpty(dateDebut)) throw new ArgumentException("Date début requise");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            // Récupérer les infos de l'élève
            string nomEleve = "";
            int classeId = 0;
            int anneeId = 0;
            
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (var cmd = new SqlCommand("SELECT NOM, CLASSE, ANNEE_ID FROM ELEVES WHERE MATRICULE = @mat", conn))
                {
                    cmd.Parameters.AddWithValue("@mat", matricule);
                    var rdr = cmd.ExecuteReader();
                    if (rdr.Read())
                    {
                        nomEleve = rdr["NOM"].ToString();
                        classeId = Convert.ToInt32(rdr["CLASSE"]);
                        anneeId = Convert.ToInt32(rdr["ANNEE_ID"]);
                    }
                    rdr.Close();
                }
            }
            
            if (string.IsNullOrEmpty(nomEleve)) throw new ArgumentException("Élève non trouvé");

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"INSERT INTO ABSENCES 
                  (ANNEE_ID, MATRICULE, NOM, CLASSE, TYPE, DATE_DEBUT, DATE_FIN, DUREE, JUSTIF, COMMENTAIRES, CREATED_AT)
                  VALUES 
                  (@anneeId, @matricule, @nom, @classe, @type, @dateDebut, @dateFin, @duree, @justif, @commentaires, GETDATE())", conn))
            {
                cmd.Parameters.AddWithValue("@anneeId", anneeId);
                cmd.Parameters.AddWithValue("@matricule", matricule);
                cmd.Parameters.AddWithValue("@nom", nomEleve);
                cmd.Parameters.AddWithValue("@classe", classeId);
                cmd.Parameters.AddWithValue("@type", type);
                cmd.Parameters.AddWithValue("@dateDebut", DateTime.Parse(dateDebut));
                cmd.Parameters.AddWithValue("@dateFin", string.IsNullOrEmpty(dateFin) ? (object)DBNull.Value : DateTime.Parse(dateFin));
                cmd.Parameters.AddWithValue("@duree", duree);
                cmd.Parameters.AddWithValue("@justif", justifie ? 1 : 0);
                cmd.Parameters.AddWithValue("@commentaires", motif);
                
                conn.Open();
                cmd.ExecuteNonQuery();
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Absence enregistrée avec succès.\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + new JavaScriptSerializer().Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
}