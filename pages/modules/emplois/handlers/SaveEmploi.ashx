<%@ WebHandler Language="C#" Class="SaveEmploi" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;
using System.IO;

public class SaveEmploi : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";

        // Vérification de l'authentification
        if (ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
        {
            ctx.Response.StatusCode = 401;
            ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        // Lire le corps de la requête
        string json = new StreamReader(ctx.Request.InputStream).ReadToEnd();
        if (string.IsNullOrEmpty(json))
        {
            ctx.Response.Write("{\"success\":false,\"message\":\"Données JSON manquantes\"}");
            return;
        }

        try
        {
            var serializer = new JavaScriptSerializer();
            var data = serializer.Deserialize<dynamic>(json);

            // Récupération des champs
            string classe = data["classe"];
            string jour = data["jour"];
            string heureDebut = data["heureDebut"];
            string heureFin = data["heureFin"] ?? heureDebut;
            string matiere = data["matiere"];
            string prof = data["prof"] ?? "";
            string salle = data["salle"] ?? "";
            string couleur = data["couleur"] ?? "#007bff";
            string type = data["type"] ?? "cours";
            string url = data["url"] ?? "";
            string description = data["description"] ?? "";

            // Validation basique
            if (string.IsNullOrEmpty(classe) || string.IsNullOrEmpty(jour) || string.IsNullOrEmpty(heureDebut) || string.IsNullOrEmpty(matiere))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Champs obligatoires manquants\"}");
                return;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                // Vérifier si l'enregistrement existe déjà
                string checkSql = "SELECT COUNT(*) FROM EMPLOI_TEMPS WHERE CLASSE_ID = @classe AND JOUR = @jour AND HEURE_DEBUT = @heureDebut";
                using (var checkCmd = new SqlCommand(checkSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@classe", classe);
                    checkCmd.Parameters.AddWithValue("@jour", jour);
                    checkCmd.Parameters.AddWithValue("@heureDebut", heureDebut);
                    int count = (int)checkCmd.ExecuteScalar();

                    if (count > 0)
                    {
                        // UPDATE
                        string updateSql = @"
                            UPDATE EMPLOI_TEMPS SET
                                HEURE_FIN = @heureFin,
                                MATIERE_ID = @matiere,
                                PROFESSEUR = @prof,
                                SALLE = @salle,
                                COULEUR = @couleur,
                                TYPE = @type,
                                URL = @url,
                                DESCRIPTION = @description,
                                UPDATED_AT = GETDATE()
                            WHERE CLASSE_ID = @classe AND JOUR = @jour AND HEURE_DEBUT = @heureDebut";
                        using (var cmd = new SqlCommand(updateSql, conn))
                        {
                            cmd.Parameters.AddWithValue("@heureFin", heureFin);
                            cmd.Parameters.AddWithValue("@matiere", matiere);
                            cmd.Parameters.AddWithValue("@prof", (object)prof ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@salle", (object)salle ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@couleur", (object)couleur ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@type", (object)type ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@url", (object)url ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@description", (object)description ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@classe", classe);
                            cmd.Parameters.AddWithValue("@jour", jour);
                            cmd.Parameters.AddWithValue("@heureDebut", heureDebut);
                            cmd.ExecuteNonQuery();
                        }
                    }
                    else
                    {
                        // INSERT
                        string insertSql = @"
                            INSERT INTO EMPLOI_TEMPS (CLASSE_ID, JOUR, HEURE_DEBUT, HEURE_FIN, MATIERE_ID, PROFESSEUR, SALLE, COULEUR, TYPE, URL, DESCRIPTION, CREATED_AT)
                            VALUES (@classe, @jour, @heureDebut, @heureFin, @matiere, @prof, @salle, @couleur, @type, @url, @description, GETDATE())";
                        using (var cmd = new SqlCommand(insertSql, conn))
                        {
                            cmd.Parameters.AddWithValue("@classe", classe);
                            cmd.Parameters.AddWithValue("@jour", jour);
                            cmd.Parameters.AddWithValue("@heureDebut", heureDebut);
                            cmd.Parameters.AddWithValue("@heureFin", heureFin);
                            cmd.Parameters.AddWithValue("@matiere", matiere);
                            cmd.Parameters.AddWithValue("@prof", (object)prof ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@salle", (object)salle ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@couleur", (object)couleur ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@type", (object)type ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@url", (object)url ?? DBNull.Value);
                            cmd.Parameters.AddWithValue("@description", (object)description ?? DBNull.Value);
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }

            ctx.Response.Write("{\"success\":true}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            ctx.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "\\\"") + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}