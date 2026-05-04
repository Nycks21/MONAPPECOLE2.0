<%@ WebHandler Language="C#" Class="GetAbsence" %>

using System;
using System.Web;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web.Script.Serialization;
using System.Configuration;

public class GetAbsence : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        List<object> list = new List<object>();
        string connString = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        try {
            using (SqlConnection conn = new SqlConnection(connString)) {
                // Correction : On utilise 'AS' pour forcer les noms attendus par le JSON
                // On s'assure que la jointure se fait sur A.CLASSE (l'ID stocké dans Absences)
                string sql = @"SELECT A.*, 
                                     C.NOM AS CLASSE_NOM, 
                                     R.ANNEE AS ANNEE_TEXTE 
                              FROM ABSENCES A
                              LEFT JOIN CLASSES C ON A.CLASSE = C.ID
                              LEFT JOIN RANNEE R ON A.ANNEE_ID = R.ID
                              ORDER BY A.DATE_DEBUT DESC";
                
                SqlCommand cmd = new SqlCommand(sql, conn);
                conn.Open();
                SqlDataReader rdr = cmd.ExecuteReader();

                while (rdr.Read()) {
                    list.Add(new {
                        ID = rdr["ID"].ToString(),
                        ANNEE_TEXTE = rdr["ANNEE_TEXTE"].ToString(),
                        MATRICULE = rdr["MATRICULE"].ToString(),
                        NOM = rdr["NOM"].ToString(),
                        CLASSE_NOM = rdr["CLASSE_NOM"].ToString(),
                        TYPE = rdr["TYPE"].ToString(),
                        DATE_DEBUT = Convert.ToDateTime(rdr["DATE_DEBUT"]).ToString("dd/MM/yyyy HH:mm"),
                        DATE_FIN = Convert.ToDateTime(rdr["DATE_FIN"]).ToString("dd/MM/yyyy HH:mm"),
                        DUREE = rdr["DUREE"].ToString(),
                        JUSTIF = rdr["JUSTIF"] != DBNull.Value && Convert.ToBoolean(rdr["JUSTIF"]),
                        COMMENTAIRES = rdr["COMMENTAIRES"].ToString()
                    });
                }
            }
            context.Response.Write(new JavaScriptSerializer().Serialize(new { success = true, data = list }));
        }
        catch (Exception ex) {
            // Renvoie l'erreur précise au format JSON pour le débogage
            context.Response.Write(new JavaScriptSerializer().Serialize(new { success = false, message = ex.Message }));
        }
    }

    public bool IsReusable { get { return false; } }
}