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
        ctx.Response.Charset = "utf-8";
        
        try
        {
            if (ctx.Session == null || ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
            {
                ctx.Response.StatusCode = 401;
                ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }
            
            string body;
            using (var reader = new StreamReader(ctx.Request.InputStream))
                body = reader.ReadToEnd();
            
            // Débogage : afficher le body reçu
            System.Diagnostics.Debug.WriteLine("Body reçu: " + body);
            
            var ser = new JavaScriptSerializer();
            var data = ser.Deserialize<dynamic>(body);
            
            // Vérifier que toutes les clés existent (sans opérateur ?.)
            if (!data.ContainsKey("matricule") || string.IsNullOrEmpty(data["matricule"] != null ? data["matricule"].ToString() : ""))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Matricule manquant\"}");
                return;
            }
            
            if (!data.ContainsKey("nom") || string.IsNullOrEmpty(data["nom"] != null ? data["nom"].ToString() : ""))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Nom manquant\"}");
                return;
            }
            
            if (!data.ContainsKey("classe") || string.IsNullOrEmpty(data["classe"] != null ? data["classe"].ToString() : ""))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Classe manquante\"}");
                return;
            }
            
            if (!data.ContainsKey("dateDebut") || string.IsNullOrEmpty(data["dateDebut"] != null ? data["dateDebut"].ToString() : ""))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Date de début manquante\"}");
                return;
            }
            
            if (!data.ContainsKey("dateFin") || string.IsNullOrEmpty(data["dateFin"] != null ? data["dateFin"].ToString() : ""))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Date de fin manquante\"}");
                return;
            }
            
            string matricule = data["matricule"].ToString();
            string nom = data["nom"].ToString();
            string classeNom = data["classe"].ToString();
            
            // Parsing des dates
            DateTime dateDebut;
            DateTime dateFin;
            
            if (!DateTime.TryParse(data["dateDebut"].ToString(), out dateDebut))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Format de date de début invalide: " + data["dateDebut"].ToString() + "\"}");
                return;
            }
            
            if (!DateTime.TryParse(data["dateFin"].ToString(), out dateFin))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Format de date de fin invalide: " + data["dateFin"].ToString() + "\"}");
                return;
            }
            
            string motif = "";
            if (data.ContainsKey("motif") && data["motif"] != null)
            {
                motif = data["motif"].ToString();
            }
            
            bool justifie = false;
            if (data.ContainsKey("justifie") && data["justifie"] != null)
            {
                justifie = Convert.ToBoolean(data["justifie"]);
            }
            
            string justification = "";
            if (data.ContainsKey("justification") && data["justification"] != null)
            {
                justification = data["justification"].ToString();
            }
            
            // Récupérer la chaîne de connexion
            string connStr = "";
            if (ConfigurationManager.ConnectionStrings["MaConnexion"] != null)
            {
                connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            }
            
            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion non trouvée\"}");
                return;
            }
            
            int anneeId = GetCurrentAnneeId(connStr);
            int classeId = GetClasseIdByName(connStr, classeNom);
            
            // Débogage (sans interpolation)
            System.Diagnostics.Debug.WriteLine("Insertion: matricule=" + matricule + ", nom=" + nom + ", classeId=" + classeId + ", dateDebut=" + dateDebut.ToString() + ", dateFin=" + dateFin.ToString());
            
            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();
                
                // Vérifier que l'élève existe
                string checkEleveSql = "SELECT COUNT(*) FROM ELEVES WHERE MATRICULE = @matricule";
                using (var checkCmd = new SqlCommand(checkEleveSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@matricule", matricule);
                    int count = (int)checkCmd.ExecuteScalar();
                    if (count == 0)
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Élève non trouvé avec le matricule: " + matricule + "\"}");
                        return;
                    }
                }
                
                // Vérifier que l'année existe
                string checkAnneeSql = "SELECT COUNT(*) FROM RANNEE WHERE ID = @anneeId";
                using (var checkCmd = new SqlCommand(checkAnneeSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@anneeId", anneeId);
                    int count = (int)checkCmd.ExecuteScalar();
                    if (count == 0)
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Année non trouvée: " + anneeId + "\"}");
                        return;
                    }
                }
                
                // Vérifier que la classe existe
                string checkClasseSql = "SELECT COUNT(*) FROM CLASSES WHERE ID = @classeId";
                using (var checkCmd = new SqlCommand(checkClasseSql, conn))
                {
                    checkCmd.Parameters.AddWithValue("@classeId", classeId);
                    int count = (int)checkCmd.ExecuteScalar();
                    if (count == 0)
                    {
                        ctx.Response.Write("{\"success\":false,\"message\":\"Classe non trouvée: " + classeId + " (nom: " + classeNom + ")\"}");
                        return;
                    }
                }
                
                string insertSql = @"
                    INSERT INTO ABSENCES (ID, ANNEE_ID, MATRICULE, NOM, CLASSE, DATE_DEBUT, DATE_FIN, MOTIF, JUSTIFIE, JUSTIFICATION, CREATED_AT)
                    VALUES (NEWID(), @anneeId, @matricule, @nom, @classeId, @dateDebut, @dateFin, @motif, @justifie, @justification, GETDATE())";
                
                using (var cmd = new SqlCommand(insertSql, conn))
                {
                    cmd.Parameters.AddWithValue("@anneeId", anneeId);
                    cmd.Parameters.AddWithValue("@matricule", matricule);
                    cmd.Parameters.AddWithValue("@nom", nom);
                    cmd.Parameters.AddWithValue("@classeId", classeId);
                    cmd.Parameters.AddWithValue("@dateDebut", dateDebut);
                    cmd.Parameters.AddWithValue("@dateFin", dateFin);
                    
                    if (string.IsNullOrEmpty(motif))
                        cmd.Parameters.AddWithValue("@motif", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("@motif", motif);
                    
                    cmd.Parameters.AddWithValue("@justifie", justifie ? 1 : 0);
                    
                    if (string.IsNullOrEmpty(justification))
                        cmd.Parameters.AddWithValue("@justification", DBNull.Value);
                    else
                        cmd.Parameters.AddWithValue("@justification", justification);
                    
                    int rowsAffected = cmd.ExecuteNonQuery();
                    System.Diagnostics.Debug.WriteLine("Lignes insérées: " + rowsAffected);
                }
            }
            
            ctx.Response.Write("{\"success\":true,\"message\":\"Absence enregistrée avec succès\"}");
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string errorMsg = ex.Message.Replace("\"", "\\\"").Replace("\r", "").Replace("\n", " ");
            System.Diagnostics.Debug.WriteLine("Erreur: " + errorMsg);
            System.Diagnostics.Debug.WriteLine("StackTrace: " + ex.StackTrace);
            ctx.Response.Write("{\"success\":false,\"message\":\"" + errorMsg + "\"}");
        }
    }
    
    private int GetCurrentAnneeId(string connStr)
    {
        using (var conn = new SqlConnection(connStr))
        using (var cmd = new SqlCommand("SELECT TOP 1 ID FROM RANNEE WHERE CLOTURE = 0 ORDER BY DATE_DEBUT DESC", conn))
        {
            conn.Open();
            object result = cmd.ExecuteScalar();
            return result != null ? Convert.ToInt32(result) : 1;
        }
    }
    
    private int GetClasseIdByName(string connStr, string className)
    {
        if (string.IsNullOrEmpty(className))
        {
            System.Diagnostics.Debug.WriteLine("className est null ou vide, retourne 1");
            return 1;
        }
        
        using (var conn = new SqlConnection(connStr))
        using (var cmd = new SqlCommand("SELECT TOP 1 ID FROM CLASSES WHERE NOM = @nom", conn))
        {
            cmd.Parameters.AddWithValue("@nom", className);
            conn.Open();
            object result = cmd.ExecuteScalar();
            if (result == null)
            {
                System.Diagnostics.Debug.WriteLine("Classe '" + className + "' non trouvée, retourne 1");
                return 1;
            }
            return Convert.ToInt32(result);
        }
    }
    
    public bool IsReusable { get { return false; } }
}