<%@ WebHandler Language="C#" Class="AjouterBulletin" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterBulletin : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";
        ctx.Response.Cache.SetNoStore();

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

            var payload = ser.Deserialize<BulletinPayload>(body);
            if (payload == null) throw new ArgumentException("Données invalides.");

            if (string.IsNullOrEmpty(payload.MATRICULE)) throw new ArgumentException("Le matricule est obligatoire.");
            if (string.IsNullOrEmpty(payload.MATIERE_ID)) throw new ArgumentException("La matière est obligatoire.");
            if (payload.NOTE < 0 || payload.NOTE > 20) throw new ArgumentException("La note doit être entre 0 et 20.");
            if (string.IsNullOrEmpty(payload.PERIODE)) throw new ArgumentException("La période est obligatoire.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            using (var conn = new SqlConnection(connStr))
            {
                // Récupérer les informations de l'élève
                string getEleveSql = "SELECT NOM, CLASSE, ANNEE_ID FROM ELEVES WHERE MATRICULE = @matricule";
                string eleveNom = "";
                int classeId = 0;
                int anneeId = 0;
                
                using (var cmd = new SqlCommand(getEleveSql, conn))
                {
                    cmd.Parameters.Add("@matricule", System.Data.SqlDbType.NVarChar, 20).Value = payload.MATRICULE;
                    conn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            eleveNom = reader.IsDBNull(0) ? "" : reader.GetString(0);
                            classeId = reader.IsDBNull(1) ? 0 : reader.GetInt32(1);
                            anneeId = reader.IsDBNull(2) ? 0 : reader.GetInt32(2);
                        }
                        else
                        {
                            throw new Exception("Élève non trouvé.");
                        }
                    }
                }
                
                // Récupérer le coefficient de la matière
                decimal coefficient = payload.COEFFICIENT > 0 ? payload.COEFFICIENT : 1;
                
                // Insérer le bulletin
                string insertSql = @"INSERT INTO BULLETINS 
                    (ANNEE_ID, MATRICULE, NOM, CLASSE, MATIERE_ID, NOTE, PERIODE, COMMENTAIRE, CREATED_AT, UPDATED_AT) 
                    VALUES (@anneeId, @matricule, @nom, @classe, @matiereId, @note, @periode, @commentaire, GETDATE(), GETDATE())";
                
                using (var cmd = new SqlCommand(insertSql, conn))
                {
                    cmd.Parameters.Add("@anneeId", System.Data.SqlDbType.Int).Value = anneeId;
                    cmd.Parameters.Add("@matricule", System.Data.SqlDbType.NVarChar, 20).Value = payload.MATRICULE;
                    cmd.Parameters.Add("@nom", System.Data.SqlDbType.NVarChar, 100).Value = eleveNom;
                    cmd.Parameters.Add("@classe", System.Data.SqlDbType.Int).Value = classeId;
                    cmd.Parameters.Add("@matiereId", System.Data.SqlDbType.UniqueIdentifier).Value = new Guid(payload.MATIERE_ID);
                    cmd.Parameters.Add("@note", System.Data.SqlDbType.Decimal).Value = payload.NOTE;
                    cmd.Parameters.Add("@periode", System.Data.SqlDbType.NVarChar, 10).Value = payload.PERIODE;
                    cmd.Parameters.Add("@commentaire", System.Data.SqlDbType.NVarChar).Value = string.IsNullOrEmpty(payload.COMMENTAIRE) ? (object)DBNull.Value : payload.COMMENTAIRE;
                    
                    cmd.ExecuteNonQuery();
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Bulletin ajouté avec succès.\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = (ex is ArgumentException) ? 400 : 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
    
    private class BulletinPayload
    {
        public string MATRICULE { get; set; }
        public string MATIERE_ID { get; set; }
        public decimal NOTE { get; set; }
        public decimal COEFFICIENT { get; set; }
        public string PERIODE { get; set; }
        public string COMMENTAIRE { get; set; }
    }
}