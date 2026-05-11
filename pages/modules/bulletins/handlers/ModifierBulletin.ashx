<%@ WebHandler Language="C#" Class="ModifierBulletin" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class ModifierBulletin : IHttpHandler, IRequiresSessionState
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

            Guid bulletinId;
            if (!Guid.TryParse(payload.ID, out bulletinId))
                throw new ArgumentException("ID du bulletin invalide.");

            if (payload.NOTE < 0 || payload.NOTE > 20)
                throw new ArgumentException("La note doit être entre 0 et 20.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            using (var conn = new SqlConnection(connStr))
            {
                string sql = @"UPDATE BULLETINS SET 
                                NOTE = @note,
                                COMMENTAIRE = @commentaire,
                                UPDATED_AT = GETDATE()
                              WHERE ID = @id";
                
                using (var cmd = new SqlCommand(sql, conn))
                {
                    cmd.Parameters.Add("@id", System.Data.SqlDbType.UniqueIdentifier).Value = bulletinId;
                    cmd.Parameters.Add("@note", System.Data.SqlDbType.Decimal).Value = payload.NOTE;
                    cmd.Parameters.Add("@commentaire", System.Data.SqlDbType.NVarChar).Value = string.IsNullOrEmpty(payload.COMMENTAIRE) ? (object)DBNull.Value : payload.COMMENTAIRE;
                    
                    conn.Open();
                    if (cmd.ExecuteNonQuery() == 0)
                        throw new Exception("Bulletin introuvable.");
                }
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Bulletin modifié avec succès.\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
    
    private class BulletinPayload
    {
        public string ID { get; set; }
        public decimal NOTE { get; set; }
        public string COMMENTAIRE { get; set; }
    }
}