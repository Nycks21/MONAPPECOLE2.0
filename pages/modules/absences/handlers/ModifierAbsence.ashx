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

            Guid absenceId = Guid.Parse(payload["id"].ToString());
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                
                // Cas simple : juste justification
                if (payload.ContainsKey("justifie") && (bool)payload["justifie"] == true && !payload.ContainsKey("type"))
                {
                    string motif = payload.ContainsKey("motif") ? payload["motif"].ToString() : "";
                    using (var cmd = new SqlCommand(
                        "UPDATE ABSENCES SET JUSTIF = 1, COMMENTAIRES = @commentaires, UPDATED_AT = GETDATE() WHERE ID = @id", conn))
                    {
                        cmd.Parameters.AddWithValue("@id", absenceId);
                        cmd.Parameters.AddWithValue("@commentaires", motif);
                        cmd.ExecuteNonQuery();
                    }
                }
                else
                {
                    // Modification complète
                    string matricule = payload["matricule"].ToString();
                    string type = payload["type"].ToString();
                    DateTime dateDebut = DateTime.Parse(payload["dateDebut"].ToString());
                    DateTime dateFin = payload.ContainsKey("dateFin") ? DateTime.Parse(payload["dateFin"].ToString()) : dateDebut;
                    decimal duree = payload.ContainsKey("duree") ? Convert.ToDecimal(payload["duree"]) : 1;
                    string commentaire = payload.ContainsKey("motif") ? payload["motif"].ToString() : "";
                    
                    // Récupérer les infos de l'élève
                    string nom = "";
                    int classeId = 0;
                    int anneeId = 0;
                    using (var cmdGet = new SqlCommand("SELECT NOM, CLASSE, ANNEE_ID FROM ELEVES WHERE MATRICULE = @mat", conn))
                    {
                        cmdGet.Parameters.AddWithValue("@mat", matricule);
                        var rdr = cmdGet.ExecuteReader();
                        if (rdr.Read())
                        {
                            nom = rdr["NOM"].ToString();
                            classeId = Convert.ToInt32(rdr["CLASSE"]);
                            anneeId = Convert.ToInt32(rdr["ANNEE_ID"]);
                        }
                        rdr.Close();
                    }
                    
                    using (var cmd = new SqlCommand(
                        @"UPDATE ABSENCES 
                          SET ANNEE_ID = @anneeId,
                              MATRICULE = @matricule,
                              NOM = @nom,
                              CLASSE = @classe,
                              TYPE = @type,
                              DATE_DEBUT = @dateDebut,
                              DATE_FIN = @dateFin,
                              DUREE = @duree,
                              COMMENTAIRES = @commentaires,
                              UPDATED_AT = GETDATE()
                          WHERE ID = @id", conn))
                    {
                        cmd.Parameters.AddWithValue("@id", absenceId);
                        cmd.Parameters.AddWithValue("@anneeId", anneeId);
                        cmd.Parameters.AddWithValue("@matricule", matricule);
                        cmd.Parameters.AddWithValue("@nom", nom);
                        cmd.Parameters.AddWithValue("@classe", classeId);
                        cmd.Parameters.AddWithValue("@type", type);
                        cmd.Parameters.AddWithValue("@dateDebut", dateDebut);
                        cmd.Parameters.AddWithValue("@dateFin", dateFin);
                        cmd.Parameters.AddWithValue("@duree", duree);
                        cmd.Parameters.AddWithValue("@commentaires", commentaire);
                        cmd.ExecuteNonQuery();
                    }
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Absence modifiée avec succès.\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + new JavaScriptSerializer().Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
}