<%@ WebHandler Language="C#" Class="SupprimerClasse" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class SupprimerClasse : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        JavaScriptSerializer ser = new JavaScriptSerializer();

        try
        {
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var payload = ser.Deserialize<IdPayload>(body);
            int idInt;
            if (!int.TryParse(payload.ID, out idInt)) throw new ArgumentException("ID invalide.");

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand("DELETE FROM [dbo].[Classes] WHERE ID = @id", conn))
            {
                cmd.Parameters.Add("@id", System.Data.SqlDbType.Int).Value = idInt;
                conn.Open();
                cmd.ExecuteNonQuery();
            }
            ctx.Response.Write("{\"success\":true}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 400;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }
    public bool IsReusable { get { return false; } }
    private class IdPayload { public string ID { get; set; } }
}