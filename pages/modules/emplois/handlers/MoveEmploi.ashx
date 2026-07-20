<%@ WebHandler Language="C#" Class="MoveEmploi" %>
using System;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class MoveEmploi : IHttpHandler, IRequiresSessionState
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

        string classe = ctx.Request.QueryString["classe"];
        string sourceDay = ctx.Request.QueryString["sourceDay"];
        string sourceHour = ctx.Request.QueryString["sourceHour"];
        string targetDay = ctx.Request.QueryString["targetDay"];
        string targetHour = ctx.Request.QueryString["targetHour"];
        string swapParam = ctx.Request.QueryString["swap"] ?? "false";
        bool swap = swapParam.ToLower() == "true";

        if (string.IsNullOrEmpty(classe) || string.IsNullOrEmpty(sourceDay) || string.IsNullOrEmpty(sourceHour) ||
            string.IsNullOrEmpty(targetDay) || string.IsNullOrEmpty(targetHour))
        {
            ctx.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants\"}");
            return;
        }

        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        try
        {
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                if (swap)
                {
                    // Échange : récupérer les deux enregistrements
                    var source = GetCell(conn, classe, sourceDay, sourceHour);
                    var target = GetCell(conn, classe, targetDay, targetHour);

                    // Mettre à jour : source <- target et target <- source
                    UpdateCell(conn, classe, sourceDay, sourceHour, target);
                    UpdateCell(conn, classe, targetDay, targetHour, source);
                }
                else
                {
                    // Déplacement simple : supprimer la cible (si elle existe) puis déplacer la source
                    // On supprime d'abord l'éventuel enregistrement cible
                    DeleteCell(conn, classe, targetDay, targetHour);
                    // Puis on déplace la source vers la cible
                    MoveCell(conn, classe, sourceDay, sourceHour, targetDay, targetHour);
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

    private dynamic GetCell(SqlConnection conn, string classe, string jour, string heureDebut)
    {
        string sql = "SELECT HEURE_FIN, MATIERE_ID, PROFESSEUR, SALLE, COULEUR, TYPE, URL, DESCRIPTION FROM EMPLOI_TEMPS WHERE CLASSE_ID = @classe AND JOUR = @jour AND HEURE_DEBUT = @heureDebut";
        using (var cmd = new SqlCommand(sql, conn))
        {
            cmd.Parameters.AddWithValue("@classe", classe);
            cmd.Parameters.AddWithValue("@jour", jour);
            cmd.Parameters.AddWithValue("@heureDebut", heureDebut);
            using (var rdr = cmd.ExecuteReader())
            {
                if (rdr.Read())
                {
                    return new
                    {
                        heureFin = rdr["HEURE_FIN"] == DBNull.Value ? null : rdr["HEURE_FIN"].ToString(),
                        matiere = rdr["MATIERE_ID"].ToString(),
                        prof = rdr["PROFESSEUR"] == DBNull.Value ? "" : rdr["PROFESSEUR"].ToString(),
                        salle = rdr["SALLE"] == DBNull.Value ? "" : rdr["SALLE"].ToString(),
                        couleur = rdr["COULEUR"] == DBNull.Value ? "#007bff" : rdr["COULEUR"].ToString(),
                        type = rdr["TYPE"] == DBNull.Value ? "cours" : rdr["TYPE"].ToString(),
                        url = rdr["URL"] == DBNull.Value ? "" : rdr["URL"].ToString(),
                        description = rdr["DESCRIPTION"] == DBNull.Value ? "" : rdr["DESCRIPTION"].ToString()
                    };
                }
                else
                {
                    return null;
                }
            }
        }
    }

    private void UpdateCell(SqlConnection conn, string classe, string jour, string heureDebut, dynamic cell)
    {
        if (cell == null)
        {
            // Si la cellule source est nulle, on supprime simplement la cible
            DeleteCell(conn, classe, jour, heureDebut);
            return;
        }

        string sql = @"
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
        using (var cmd = new SqlCommand(sql, conn))
        {
            cmd.Parameters.AddWithValue("@heureFin", (object)cell.heureFin ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@matiere", cell.matiere);
            cmd.Parameters.AddWithValue("@prof", (object)cell.prof ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@salle", (object)cell.salle ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@couleur", (object)cell.couleur ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@type", (object)cell.type ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@url", (object)cell.url ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@description", (object)cell.description ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@classe", classe);
            cmd.Parameters.AddWithValue("@jour", jour);
            cmd.Parameters.AddWithValue("@heureDebut", heureDebut);
            cmd.ExecuteNonQuery();
        }
    }

    private void DeleteCell(SqlConnection conn, string classe, string jour, string heureDebut)
    {
        string sql = "DELETE FROM EMPLOI_TEMPS WHERE CLASSE_ID = @classe AND JOUR = @jour AND HEURE_DEBUT = @heureDebut";
        using (var cmd = new SqlCommand(sql, conn))
        {
            cmd.Parameters.AddWithValue("@classe", classe);
            cmd.Parameters.AddWithValue("@jour", jour);
            cmd.Parameters.AddWithValue("@heureDebut", heureDebut);
            cmd.ExecuteNonQuery();
        }
    }

    private void MoveCell(SqlConnection conn, string classe, string sourceJour, string sourceHeure, string targetJour, string targetHeure)
    {
        // Récupérer la source
        var source = GetCell(conn, classe, sourceJour, sourceHeure);
        if (source == null) return;

        // Supprimer la source
        DeleteCell(conn, classe, sourceJour, sourceHeure);

        // Insérer dans la cible
        string sql = @"
            INSERT INTO EMPLOI_TEMPS (CLASSE_ID, JOUR, HEURE_DEBUT, HEURE_FIN, MATIERE_ID, PROFESSEUR, SALLE, COULEUR, TYPE, URL, DESCRIPTION, CREATED_AT)
            VALUES (@classe, @jour, @heureDebut, @heureFin, @matiere, @prof, @salle, @couleur, @type, @url, @description, GETDATE())";
        using (var cmd = new SqlCommand(sql, conn))
        {
            cmd.Parameters.AddWithValue("@classe", classe);
            cmd.Parameters.AddWithValue("@jour", targetJour);
            cmd.Parameters.AddWithValue("@heureDebut", targetHeure);
            cmd.Parameters.AddWithValue("@heureFin", (object)source.heureFin ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@matiere", source.matiere);
            cmd.Parameters.AddWithValue("@prof", (object)source.prof ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@salle", (object)source.salle ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@couleur", (object)source.couleur ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@type", (object)source.type ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@url", (object)source.url ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@description", (object)source.description ?? DBNull.Value);
            cmd.ExecuteNonQuery();
        }
    }

    public bool IsReusable { get { return false; } }
}