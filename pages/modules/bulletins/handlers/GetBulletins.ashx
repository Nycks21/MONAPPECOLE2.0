<%@ WebHandler Language="C#" Class="GetBulletins" %>

using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;
using System.IO;

public class GetBulletins : IHttpHandler, IRequiresSessionState
{
    private static readonly string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

    public void ProcessRequest(HttpContext context)
    {
        context.Response.ContentType = "application/json";
        context.Response.Charset = "utf-8";
        context.Response.Cache.SetNoStore();

        if (context.Session["authenticated"] == null || !(bool)context.Session["authenticated"])
        {
            context.Response.StatusCode = 401;
            context.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
            return;
        }

        try
        {
            if (context.Request.HttpMethod == "POST")
            {
                string jsonBody = new StreamReader(context.Request.InputStream).ReadToEnd();
                var serializer = new JavaScriptSerializer();
                var data = serializer.Deserialize<Dictionary<string, object>>(jsonBody);

                string classeId  = data.ContainsKey("classeId")  ? data["classeId"].ToString()  : null;
                string matiereId = data.ContainsKey("matiereId") ? data["matiereId"].ToString() : null;
                string periodeId = data.ContainsKey("periodeId") ? data["periodeId"].ToString() : null;

                if (string.IsNullOrEmpty(classeId) || string.IsNullOrEmpty(matiereId) || string.IsNullOrEmpty(periodeId))
                {
                    context.Response.Write("{\"success\":false,\"message\":\"Paramètres manquants\"}");
                    return;
                }

                GetBulletinsForSaisie(context, classeId, matiereId, periodeId);
                return;
            }

            if (context.Request.HttpMethod == "GET")
            {
                GetAllBulletins(context);
                return;
            }

            context.Response.Write("{\"success\":false,\"message\":\"Méthode non supportée\"}");
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 500;
            context.Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
        }
    }

    private void GetBulletinsForSaisie(HttpContext context, string classeId, string matiereId, string periodeId)
    {
        var eleves = new List<object>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            // Utilisation de CLASSE (INT) comme clé étrangère vers CLASSES
            string sql = @"
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY e.NOM) AS NUMERO,
                    e.MATRICULE,
                    e.NOM,
                    b.NOTE1,
                    b.NOTE2,
                    b.NOTE_PROJET,
                    ISNULL(b.APPRECIATION, '') AS APPRECIATION,
                    ISNULL(b.STATUT, 'Non saisi') AS STATUT,
                    b.ID AS NOTE_ID,
                    CONVERT(VARCHAR(10), b.DATE_EVAL1,        103) AS DATE_EVAL1,
                    CONVERT(VARCHAR(10), b.DATE_EVAL2,        103) AS DATE_EVAL2,
                    CONVERT(VARCHAR(10), b.DATE_EVAL_PROJET,  103) AS DATE_EVAL_PROJET
                FROM ELEVES e
                LEFT JOIN BULLETINS b ON e.MATRICULE = b.ELEVE_MATRICULE 
                    AND b.MATIERE_ID = @matiereId 
                    AND b.PERIODE    = @periodeId
                WHERE e.CLASSE = @classeId
                  AND e.STATUT = 'actif'
                ORDER BY e.NOM ASC";

            using (SqlCommand cmd = new SqlCommand(sql, conn))
            {
                // Convertir classeId en INT
                cmd.Parameters.AddWithValue("@classeId", Convert.ToInt32(classeId));
                cmd.Parameters.AddWithValue("@matiereId", new Guid(matiereId));
                cmd.Parameters.AddWithValue("@periodeId", periodeId);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        decimal? note1 = null;
                        if (!reader.IsDBNull(reader.GetOrdinal("NOTE1")))
                            note1 = Convert.ToDecimal(reader["NOTE1"]);
                        
                        decimal? note2 = null;
                        if (!reader.IsDBNull(reader.GetOrdinal("NOTE2")))
                            note2 = Convert.ToDecimal(reader["NOTE2"]);
                        
                        decimal? noteProjet = null;
                        if (!reader.IsDBNull(reader.GetOrdinal("NOTE_PROJET")))
                            noteProjet = Convert.ToDecimal(reader["NOTE_PROJET"]);
                        
                        string appreciation = "";
                        if (!reader.IsDBNull(reader.GetOrdinal("APPRECIATION")))
                            appreciation = reader["APPRECIATION"].ToString();
                        
                        string statut = "Non saisi";
                        if (!reader.IsDBNull(reader.GetOrdinal("STATUT")))
                            statut = reader["STATUT"].ToString();
                        
                        string noteId = null;
                        if (!reader.IsDBNull(reader.GetOrdinal("NOTE_ID")))
                            noteId = reader["NOTE_ID"].ToString();
                        
                        string dateEval1 = null;
                        if (!reader.IsDBNull(reader.GetOrdinal("DATE_EVAL1")))
                            dateEval1 = reader["DATE_EVAL1"].ToString();
                        
                        string dateEval2 = null;
                        if (!reader.IsDBNull(reader.GetOrdinal("DATE_EVAL2")))
                            dateEval2 = reader["DATE_EVAL2"].ToString();
                        
                        string dateEvalP = null;
                        if (!reader.IsDBNull(reader.GetOrdinal("DATE_EVAL_PROJET")))
                            dateEvalP = reader["DATE_EVAL_PROJET"].ToString();

                        eleves.Add(new
                        {
                            Numero = reader["NUMERO"],
                            EleveId = reader["MATRICULE"].ToString(),
                            Nom = reader["NOM"].ToString(),
                            Note1 = note1,
                            Note2 = note2,
                            NoteProjet = noteProjet,
                            Appreciation = appreciation,
                            Statut = statut,
                            NoteId = noteId,
                            DateEval1 = dateEval1,
                            DateEval2 = dateEval2,
                            DateEvalP = dateEvalP
                        });
                    }
                }
            }
        }

        var result = new { success = true, eleves = eleves };
        context.Response.Write(new JavaScriptSerializer().Serialize(result));
    }

    private void GetAllBulletins(HttpContext context)
    {
        var bulletins = new List<object>();

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            string sql = @"
                SELECT 
                    b.ID,
                    b.ELEVE_MATRICULE AS MATRICULE,
                    e.NOM AS ELEVE_NOM,
                    c.NOM AS CLASSE_NOM,
                    m.NOM AS MATIERE_NOM,
                    u.NOM AS ENSEIGNANT_NOM,
                    b.NOTE1,
                    b.NOTE2,
                    b.NOTE_PROJET,
                    b.PERIODE,
                    b.APPRECIATION AS COMMENTAIRE,
                    b.STATUT,
                    b.CREATED_AT
                FROM BULLETINS b
                INNER JOIN ELEVES e ON b.ELEVE_MATRICULE = e.MATRICULE
                INNER JOIN CLASSES c ON e.CLASSE = c.ID
                INNER JOIN MATIERES m ON b.MATIERE_ID = m.ID
                LEFT JOIN USERS u ON m.ENSEIGNANT = u.IDUSER
                ORDER BY b.CREATED_AT DESC";

            using (SqlCommand cmd = new SqlCommand(sql, conn))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                while (reader.Read())
                {
                    decimal? note1 = null;
                    if (!reader.IsDBNull(reader.GetOrdinal("NOTE1")))
                        note1 = Convert.ToDecimal(reader["NOTE1"]);
                    
                    decimal? note2 = null;
                    if (!reader.IsDBNull(reader.GetOrdinal("NOTE2")))
                        note2 = Convert.ToDecimal(reader["NOTE2"]);
                    
                    decimal? noteProjet = null;
                    if (!reader.IsDBNull(reader.GetOrdinal("NOTE_PROJET")))
                        noteProjet = Convert.ToDecimal(reader["NOTE_PROJET"]);
                    
                    decimal? moyenne = null;
                    int coefTotal = 0;
                    decimal somme = 0;
                    
                    if (note1.HasValue) { somme += note1.Value * 1; coefTotal += 1; }
                    if (note2.HasValue) { somme += note2.Value * 2; coefTotal += 2; }
                    if (noteProjet.HasValue) { somme += noteProjet.Value * 1; coefTotal += 1; }
                    
                    if (coefTotal > 0) moyenne = Math.Round(somme / coefTotal, 1);

                    string commentaire = "";
                    if (!reader.IsDBNull(reader.GetOrdinal("COMMENTAIRE")))
                        commentaire = reader["COMMENTAIRE"].ToString();
                    
                    string statut = "";
                    if (!reader.IsDBNull(reader.GetOrdinal("STATUT")))
                        statut = reader["STATUT"].ToString();
                    
                    string enseignantNom = "";
                    if (!reader.IsDBNull(reader.GetOrdinal("ENSEIGNANT_NOM")))
                        enseignantNom = reader["ENSEIGNANT_NOM"].ToString();

                    bulletins.Add(new
                    {
                        ID = reader["ID"].ToString(),
                        MATRICULE = reader["MATRICULE"].ToString(),
                        ELEVE_NOM = reader["ELEVE_NOM"].ToString(),
                        CLASSE_NOM = reader["CLASSE_NOM"].ToString(),
                        MATIERE_NOM = reader["MATIERE_NOM"].ToString(),
                        ENSEIGNANT_NOM = enseignantNom,
                        NOTE = moyenne.HasValue ? moyenne.Value : 0,
                        COEFFICIENT = 1,
                        PERIODE = reader["PERIODE"].ToString(),
                        COMMENTAIRE = commentaire,
                        STATUT = statut,
                        CREATED_AT = reader["CREATED_AT"] != DBNull.Value ? Convert.ToDateTime(reader["CREATED_AT"]).ToString("yyyy-MM-dd HH:mm:ss") : null
                    });
                }
            }
        }

        context.Response.Write(new JavaScriptSerializer().Serialize(new { success = true, data = bulletins }));
    }

    public bool IsReusable { get { return false; } }
}