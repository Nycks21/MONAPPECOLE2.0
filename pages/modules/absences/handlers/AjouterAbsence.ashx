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
        ctx.Response.Charset     = "utf-8";
        ctx.Response.Cache.SetNoStore();

        JavaScriptSerializer ser = new JavaScriptSerializer();

        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        if (ctx.Request.HttpMethod != "POST")
        {
            ctx.Response.StatusCode = 405;
            ctx.Response.Write("{\"success\":false,\"message\":\"Méthode non autorisée\"}");
            return;
        }

        try
        {
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var payload = ser.Deserialize<AbsencePayload>(body);
            if (payload == null) throw new ArgumentException("Données invalides.");

            if (string.IsNullOrWhiteSpace(payload.matricule))
                throw new ArgumentException("Le matricule est obligatoire.");
            if (string.IsNullOrWhiteSpace(payload.type))
                throw new ArgumentException("Le type est obligatoire.");
            if (string.IsNullOrWhiteSpace(payload.dateDebut))
                throw new ArgumentException("La date de début est obligatoire.");

            DateTime dateDebut;
            if (!DateTime.TryParse(payload.dateDebut, out dateDebut))
                throw new ArgumentException("Date de début invalide.");

            DateTime dateFin;
            if (!DateTime.TryParse(payload.dateFin, out dateFin))
                dateFin = dateDebut;

            decimal duree = 1;
            if (!string.IsNullOrWhiteSpace(payload.duree))
                decimal.TryParse(payload.duree, System.Globalization.NumberStyles.Any,
                                 System.Globalization.CultureInfo.InvariantCulture, out duree);

            bool justifie = payload.justifie;

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            // ── Récupérer NOM, CLASSE (ID) et ANNEE_ID depuis le matricule ──
            string nomEleve  = "";
            int    classeId  = 0;
            int    anneeId   = 0;

            using (var conn = new SqlConnection(connStr))
            using (var cmdE = new SqlCommand(
                "SELECT NOM, CLASSE, ANNEE_ID FROM ELEVES WHERE MATRICULE = @mat", conn))
            {
                cmdE.Parameters.AddWithValue("@mat", payload.matricule.Trim());
                conn.Open();
                var rdr = cmdE.ExecuteReader();
                if (rdr.Read())
                {
                    nomEleve = rdr["NOM"].ToString();
                    int.TryParse(rdr["CLASSE"].ToString(), out classeId);
                    int.TryParse(rdr["ANNEE_ID"].ToString(), out anneeId);
                }
                rdr.Close();
            }

            if (string.IsNullOrEmpty(nomEleve))
                throw new ArgumentException("Matricule introuvable dans la base.");

            // ── Insertion ──
            using (var conn = new SqlConnection(connStr))
            using (var cmd  = new SqlCommand(
                @"INSERT INTO ABSENCES
                    (MATRICULE, NOM, CLASSE, ANNEE_ID, TYPE,
                     DATE_DEBUT, DATE_FIN, DUREE, JUSTIF, COMMENTAIRES, CREATED_AT)
                  VALUES
                    (@matricule, @nom, @classe, @anneeId, @type,
                     @dateDebut, @dateFin, @duree, @justif, @commentaires, GETDATE())", conn))
            {
                cmd.Parameters.Add("@matricule",    System.Data.SqlDbType.NVarChar,  50).Value = payload.matricule.Trim();
                cmd.Parameters.Add("@nom",          System.Data.SqlDbType.NVarChar, 255).Value = nomEleve;
                cmd.Parameters.Add("@classe",       System.Data.SqlDbType.Int).Value            = (classeId > 0 ? (object)classeId : DBNull.Value);
                cmd.Parameters.Add("@anneeId",      System.Data.SqlDbType.Int).Value            = (anneeId  > 0 ? (object)anneeId  : DBNull.Value);
                cmd.Parameters.Add("@type",         System.Data.SqlDbType.NVarChar,  20).Value = payload.type.Trim().ToLower();
                cmd.Parameters.Add("@dateDebut",    System.Data.SqlDbType.DateTime).Value      = dateDebut;
                cmd.Parameters.Add("@dateFin",      System.Data.SqlDbType.DateTime).Value      = dateFin;
                cmd.Parameters.Add("@duree",        System.Data.SqlDbType.Decimal).Value       = duree;
                cmd.Parameters.Add("@justif",       System.Data.SqlDbType.Bit).Value           = justifie;
                cmd.Parameters.Add("@commentaires", System.Data.SqlDbType.NVarChar, 500).Value = (object)payload.motif?.Trim() ?? DBNull.Value;

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Absence enregistrée avec succès.\"}");
        }
        catch (ArgumentException ex)
        {
            ctx.Response.StatusCode = 400;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":" + ser.Serialize(ex.Message) + "}");
        }
    }

    public bool IsReusable { get { return false; } }

    private class AbsencePayload
    {
        public string matricule { get; set; }
        public string type      { get; set; }
        public string dateDebut { get; set; }
        public string dateFin   { get; set; }
        public string duree     { get; set; }
        public string motif     { get; set; }
        public bool   justifie  { get; set; }
    }
}
