<%@ WebHandler Language="C#" Class="AjouterEleve" %>

using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class AjouterEleve : IHttpHandler, IRequiresSessionState
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

            var payload = ser.Deserialize<ElevePayload>(body);
            if (payload == null) throw new ArgumentException("Données invalides.");

            if (string.IsNullOrEmpty(payload.NOM)) throw new ArgumentException("Le nom est obligatoire.");
            if (string.IsNullOrEmpty(payload.MATRICULE)) throw new ArgumentException("Le matricule est obligatoire.");

            int anneeId;
            if (payload.ANNEE_ID == null || !int.TryParse(payload.ANNEE_ID.ToString(), out anneeId))
                throw new ArgumentException("L'année scolaire est invalide.");

            int classeId;
            if (payload.CLASSE == null || !int.TryParse(payload.CLASSE.ToString(), out classeId))
                throw new ArgumentException("La classe sélectionnée est invalide.");

            DateTime? dateNaiss = null;
            if (!string.IsNullOrEmpty(payload.DATE_NAISSANCE))
            {
                DateTime d;
                if (!DateTime.TryParse(payload.DATE_NAISSANCE, out d))
                    throw new ArgumentException("La date de naissance est invalide.");
                dateNaiss = d;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"INSERT INTO [dbo].[ELEVES] 
                  (ANNEE_ID, MATRICULE, NOM, CLASSE, EMAIL, TELEPHONE, STATUT, GENRE, DATE_NAISSANCE, ADRESSE, PARENT) 
                  VALUES (@anneeId, @matricule, @nom, @classe, @email, @tel, @statut, @genre, @dateNaiss, @adresse, @parent)", conn))
            {
                cmd.Parameters.Add("@anneeId", System.Data.SqlDbType.Int).Value = anneeId;
                cmd.Parameters.Add("@matricule", System.Data.SqlDbType.NVarChar, 50).Value = payload.MATRICULE.Trim();
                cmd.Parameters.Add("@nom", System.Data.SqlDbType.NVarChar, 255).Value = payload.NOM.Trim();
                cmd.Parameters.Add("@classe", System.Data.SqlDbType.Int).Value = classeId;
                
                cmd.Parameters.Add("@email", System.Data.SqlDbType.NVarChar, 255).Value = 
                    (payload.EMAIL != null) ? (object)payload.EMAIL.Trim() : DBNull.Value;
                
                cmd.Parameters.Add("@tel", System.Data.SqlDbType.NVarChar, 50).Value = 
                    (payload.TELEPHONE != null) ? (object)payload.TELEPHONE.Trim() : DBNull.Value;

                string statut = (string.IsNullOrEmpty(payload.STATUT)) ? "actif" : payload.STATUT.Trim().ToLower();
                cmd.Parameters.Add("@statut", System.Data.SqlDbType.NVarChar, 20).Value = statut;

                string genre = (string.IsNullOrEmpty(payload.GENRE)) ? "M" : payload.GENRE.Trim().ToUpper().Substring(0, 1);
                cmd.Parameters.Add("@genre", System.Data.SqlDbType.NChar, 1).Value = genre;

                cmd.Parameters.Add("@dateNaiss", System.Data.SqlDbType.Date).Value = (dateNaiss.HasValue) ? (object)dateNaiss.Value : DBNull.Value;
                
                cmd.Parameters.Add("@adresse", System.Data.SqlDbType.NVarChar, 500).Value = (payload.ADRESSE != null) ? (object)payload.ADRESSE.Trim() : DBNull.Value;
                cmd.Parameters.Add("@parent", System.Data.SqlDbType.NVarChar, 255).Value = (payload.PARENT != null) ? (object)payload.PARENT.Trim() : DBNull.Value;

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Élève ajouté avec succès.\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = (ex is ArgumentException) ? 400 : 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }
    private class ElevePayload {
        public string ANNEE_ID { get; set; }
        public string MATRICULE { get; set; }
        public string NOM { get; set; }
        public string CLASSE { get; set; }
        public string EMAIL { get; set; }
        public string TELEPHONE { get; set; }
        public string STATUT { get; set; }
        public string GENRE { get; set; }
        public string DATE_NAISSANCE { get; set; }
        public string ADRESSE { get; set; }
        public string PARENT { get; set; }
    }
}