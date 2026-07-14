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

        var ser = new JavaScriptSerializer();

        // Vérification d'authentification
        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        // Récupérer l'ID de l'utilisateur connecté
        int userId = 0;
        if (ctx.Session["IDUSER"] != null)
        {
            userId = Convert.ToInt32(ctx.Session["IDUSER"]);
        }

        try
        {
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();

            var payload = ser.Deserialize<ElevePayload>(body);
            if (payload == null)
                throw new ArgumentException("Données invalides.");

            // Validations
            if (string.IsNullOrWhiteSpace(payload.NOM))
                throw new ArgumentException("Le nom est obligatoire.");
            if (string.IsNullOrWhiteSpace(payload.MATRICULE))
                throw new ArgumentException("Le matricule est obligatoire.");

            int anneeId;
            if (payload.ANNEE_ID == null || !int.TryParse(payload.ANNEE_ID.ToString(), out anneeId))
                throw new ArgumentException("L'année scolaire est invalide.");

            int classeId;
            if (payload.CLASSE == null || !int.TryParse(payload.CLASSE.ToString(), out classeId))
                throw new ArgumentException("La classe sélectionnée est invalide.");

            // Date de naissance obligatoire
            if (string.IsNullOrEmpty(payload.DATE_NAISSANCE))
                throw new ArgumentException("La date de naissance est obligatoire.");

            DateTime dateNaiss;
            if (!DateTime.TryParse(payload.DATE_NAISSANCE, out dateNaiss))
                throw new ArgumentException("La date de naissance est invalide.");

            // Adresse obligatoire
            if (string.IsNullOrWhiteSpace(payload.ADRESSE))
                throw new ArgumentException("L'adresse est obligatoire.");

            // Parent obligatoire
            if (string.IsNullOrWhiteSpace(payload.PARENT))
                throw new ArgumentException("Le parent/tuteur est obligatoire.");

            string connStr = "";
            if (ConfigurationManager.ConnectionStrings["MaConnexion"] != null)
                connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            if (string.IsNullOrEmpty(connStr))
                throw new Exception("Chaîne de connexion non trouvée.");

            using (var conn = new SqlConnection(connStr))
            using (var cmd = new SqlCommand(
                @"INSERT INTO [dbo].[ELEVES] 
                  (ANNEE_ID, MATRICULE, NOM, CLASSE, EMAIL, TELEPHONE, STATUT, GENRE, DATE_NAISSANCE, ADRESSE, PARENT, CREATED_AT, CREATED_BY, UPDATED_AT, UPDATED_BY) 
                  VALUES (@anneeId, @matricule, @nom, @classe, @email, @tel, @statut, @genre, @dateNaiss, @adresse, @parent, GETDATE(), @createdBy, NULL, NULL)", conn))
            {
                cmd.Parameters.AddWithValue("@anneeId", anneeId);
                cmd.Parameters.AddWithValue("@matricule", payload.MATRICULE.Trim());
                cmd.Parameters.AddWithValue("@nom", payload.NOM.Trim());
                cmd.Parameters.AddWithValue("@classe", classeId);

                string email = payload.EMAIL != null ? payload.EMAIL.Trim() : null;
                cmd.Parameters.AddWithValue("@email", (object)email ?? DBNull.Value);

                string telephone = payload.TELEPHONE != null ? payload.TELEPHONE.Trim() : null;
                cmd.Parameters.AddWithValue("@tel", (object)telephone ?? DBNull.Value);

                string statut = string.IsNullOrEmpty(payload.STATUT) ? "actif" : payload.STATUT.Trim().ToLower();
                cmd.Parameters.AddWithValue("@statut", statut);

                string genre = string.IsNullOrEmpty(payload.GENRE) ? "M" : payload.GENRE.Trim().ToUpper().Substring(0, 1);
                cmd.Parameters.AddWithValue("@genre", genre);

                cmd.Parameters.AddWithValue("@dateNaiss", dateNaiss);
                cmd.Parameters.AddWithValue("@adresse", payload.ADRESSE.Trim());
                cmd.Parameters.AddWithValue("@parent", payload.PARENT.Trim());

                // Traçabilité
                cmd.Parameters.AddWithValue("@createdBy", userId);
                // CREATED_AT = GETDATE() est dans la requête, UPDATED_AT et UPDATED_BY sont NULL

                conn.Open();
                cmd.ExecuteNonQuery();
            }

            ctx.Response.Write("{\"success\":true,\"message\":\"Élève ajouté avec succès.\"}");
        }
        catch (ArgumentException argEx)
        {
            ctx.Response.StatusCode = 400;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + argEx.Message + "\"}");
        }
        catch (SqlException sqlEx)
        {
            ctx.Response.StatusCode = 500;
            if (sqlEx.Number == 2627)
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Ce matricule existe déjà. Veuillez en choisir un autre.\"}");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("❌ Erreur SQL: " + sqlEx.Message);
                ctx.Response.Write("{\"success\":false,\"message\":\"Erreur lors de l'insertion en base de données.\"}");
            }
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            System.Diagnostics.Debug.WriteLine("❌ Erreur générale: " + ex.Message);
            ctx.Response.Write("{\"success\":false,\"message\":\"Une erreur interne est survenue. Consultez les logs.\"}");
        }
    }

    public bool IsReusable
    {
        get { return false; }
    }

    private class ElevePayload
    {
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