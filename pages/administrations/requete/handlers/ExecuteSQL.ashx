<%@ WebHandler Language="C#" Class="ExecuteSQL" %>

using System;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Generic;
using System.Web.Script.Serialization;

public class ExecuteSQL : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        context.Response.ContentType = "application/json";
        string sqlQuery = context.Request.Form["query"];

        if (string.IsNullOrEmpty(sqlQuery)) {
            SendResponse(context, false, "La requête SQL est vide.");
            return;
        }

        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr)) {
            try {
                SqlCommand cmd = new SqlCommand(sqlQuery, conn);
                conn.Open();

                if (sqlQuery.Trim().StartsWith("SELECT", StringComparison.OrdinalIgnoreCase)) {
                    SqlDataAdapter da = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    da.Fill(dt);

                    var rows = new List<Dictionary<string, object>>();
                    foreach (DataRow dr in dt.Rows) {
                        var row = new Dictionary<string, object>();
                        foreach (DataColumn col in dt.Columns) {
                            row.Add(col.ColumnName, dr[col]);
                        }
                        rows.Add(row);
                    }

                    JavaScriptSerializer serializer = new JavaScriptSerializer();
                    context.Response.Write(serializer.Serialize(new { 
                        success = true, 
                        type = "SELECT",
                        data = rows 
                    }));
                } 
                else {
                    int rowsAffected = cmd.ExecuteNonQuery();
                    // Correction ici : Utilisation de string.Format au lieu de $
                    string msg = string.Format("Commande exécutée avec succès. {0} ligne(s) modifiée(s).", rowsAffected);
                    SendResponse(context, true, msg);
                }
            }
            catch (SqlException ex) {
                SendResponse(context, false, "Erreur SQL : " + ex.Message);
            }
            catch (Exception ex) {
                SendResponse(context, false, "Erreur système : " + ex.Message);
            }
        }
    }

    private void SendResponse(HttpContext context, bool success, string message) {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        context.Response.Write(serializer.Serialize(new { 
            success = success, 
            message = message 
        }));
    }
 
    public bool IsReusable {
        get { return false; }
    }
}