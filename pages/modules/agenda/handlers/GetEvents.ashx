<%@ WebHandler Language="C#" Class="GetEvents" %>
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Web;
using System.Web.Script.Serialization;
using System.Web.SessionState;

public class GetEvents : IHttpHandler, IRequiresSessionState
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Charset = "utf-8";

        try
        {
            // Vérification de la session
            if (ctx.Session == null || ctx.Session["authenticated"] == null || !(bool)ctx.Session["authenticated"])
            {
                ctx.Response.StatusCode = 401;
                ctx.Response.Write("{\"success\":false,\"message\":\"Non authentifié\"}");
                return;
            }

            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            
            if (string.IsNullOrEmpty(connStr))
            {
                ctx.Response.StatusCode = 500;
                ctx.Response.Write("{\"success\":false,\"message\":\"Chaîne de connexion non trouvée\"}");
                return;
            }

            var events = new List<Dictionary<string, object>>();

            using (var conn = new SqlConnection(connStr))
            {
                conn.Open();

                // Vérifier si la table existe
                string checkTableSql = @"
                    SELECT COUNT(*) 
                    FROM INFORMATION_SCHEMA.TABLES 
                    WHERE TABLE_NAME = 'AGENDA_EVENTS'";

                using (var checkCmd = new SqlCommand(checkTableSql, conn))
                {
                    int tableExists = (int)checkCmd.ExecuteScalar();
                    
                    if (tableExists == 0)
                    {
                        // Table non existante - retourner un tableau vide
                        var emptyResult = new Dictionary<string, object>();
                        emptyResult["success"] = true;
                        emptyResult["events"] = new List<object>();
                        ctx.Response.Write(new JavaScriptSerializer().Serialize(emptyResult));
                        return;
                    }
                }

                // Vérifier les colonnes
                string checkColumnsSql = @"
                    SELECT COLUMN_NAME 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_NAME = 'AGENDA_EVENTS'";

                var existingColumns = new List<string>();
                using (var cmd = new SqlCommand(checkColumnsSql, conn))
                using (var rdr = cmd.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        existingColumns.Add(rdr["COLUMN_NAME"].ToString().ToLower());
                    }
                }

                // Construire la requête avec les colonnes existantes
                var selectColumns = new List<string>();
                if (existingColumns.Contains("id")) selectColumns.Add("id");
                if (existingColumns.Contains("title")) selectColumns.Add("title");
                if (existingColumns.Contains("type")) selectColumns.Add("type");
                if (existingColumns.Contains("start_date")) selectColumns.Add("start_date AS start");
                if (existingColumns.Contains("end_date")) selectColumns.Add("end_date AS [end]");
                if (existingColumns.Contains("description")) selectColumns.Add("description");
                if (existingColumns.Contains("color")) selectColumns.Add("color");
                if (existingColumns.Contains("location")) selectColumns.Add("location");
                if (existingColumns.Contains("audience")) selectColumns.Add("audience");
                if (existingColumns.Contains("created_at")) selectColumns.Add("created_at");

                if (selectColumns.Count == 0)
                {
                    var emptyResult = new Dictionary<string, object>();
                    emptyResult["success"] = true;
                    emptyResult["events"] = new List<object>();
                    ctx.Response.Write(new JavaScriptSerializer().Serialize(emptyResult));
                    return;
                }

                string columns = string.Join(", ", selectColumns);
                string sql = "SELECT " + columns + " FROM AGENDA_EVENTS WHERE is_active = 1 OR is_active IS NULL ORDER BY start_date ASC";

                using (var cmd = new SqlCommand(sql, conn))
                using (var rdr = cmd.ExecuteReader())
                {
                    while (rdr.Read())
                    {
                        var e = new Dictionary<string, object>();
                        
                        try
                        {
                            if (existingColumns.Contains("id")) 
                            {
                                object idValue = rdr["id"];
                                e["id"] = (idValue != null && idValue != DBNull.Value) ? idValue.ToString() : Guid.NewGuid().ToString();
                            }
                            
                            if (existingColumns.Contains("title")) 
                            {
                                object titleValue = rdr["title"];
                                e["title"] = (titleValue != null && titleValue != DBNull.Value) ? titleValue.ToString() : "Sans titre";
                            }
                            
                            if (existingColumns.Contains("type")) 
                            {
                                object typeValue = rdr["type"];
                                e["type"] = (typeValue != null && typeValue != DBNull.Value) ? typeValue.ToString() : "autre";
                            }
                            
                            if (existingColumns.Contains("start"))
                            {
                                object startValue = rdr["start"];
                                if (startValue != null && startValue != DBNull.Value)
                                {
                                    e["start"] = ((DateTime)startValue).ToString("yyyy-MM-ddTHH:mm:ss");
                                }
                                else
                                {
                                    e["start"] = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss");
                                }
                            }
                            
                            if (existingColumns.Contains("end"))
                            {
                                object endValue = rdr["end"];
                                if (endValue != null && endValue != DBNull.Value)
                                {
                                    e["end"] = ((DateTime)endValue).ToString("yyyy-MM-ddTHH:mm:ss");
                                }
                                else
                                {
                                    e["end"] = null;
                                }
                            }
                            
                            if (existingColumns.Contains("description")) 
                            {
                                object descValue = rdr["description"];
                                e["description"] = (descValue != null && descValue != DBNull.Value) ? descValue.ToString() : "";
                            }
                            
                            if (existingColumns.Contains("color")) 
                            {
                                object colorValue = rdr["color"];
                                e["color"] = (colorValue != null && colorValue != DBNull.Value) ? colorValue.ToString() : "#1e3a2f";
                            }
                            
                            if (existingColumns.Contains("location")) 
                            {
                                object locValue = rdr["location"];
                                e["location"] = (locValue != null && locValue != DBNull.Value) ? locValue.ToString() : "";
                            }
                            
                            if (existingColumns.Contains("audience")) 
                            {
                                object audValue = rdr["audience"];
                                e["audience"] = (audValue != null && audValue != DBNull.Value) ? audValue.ToString() : "all";
                            }
                            
                            if (existingColumns.Contains("created_at")) 
                            {
                                object createdValue = rdr["created_at"];
                                if (createdValue != null && createdValue != DBNull.Value)
                                {
                                    e["created_at"] = ((DateTime)createdValue).ToString("yyyy-MM-dd HH:mm");
                                }
                                else
                                {
                                    e["created_at"] = "";
                                }
                            }
                            
                            events.Add(e);
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine("Erreur lecture événement: " + ex.Message);
                        }
                    }
                }
            }

            // ✅ Variable renommée pour éviter le conflit
            var finalResult = new Dictionary<string, object>();
            finalResult["success"] = true;
            finalResult["events"] = events;

            ctx.Response.Write(new JavaScriptSerializer().Serialize(finalResult));
        }
        catch (SqlException sqlEx)
        {
            ctx.Response.StatusCode = 500;
            string errorMsg = "{\"success\":false,\"message\":\"Erreur SQL: " + sqlEx.Message.Replace("\"", "'") + "\", \"errorCode\": " + sqlEx.Number + "}";
            ctx.Response.Write(errorMsg);
        }
        catch (Exception ex)
        {
            ctx.Response.StatusCode = 500;
            string safeMsg = ex.Message.Replace("\"", "'").Replace("\r", " ").Replace("\n", " ");
            ctx.Response.Write("{\"success\":false,\"message\":\"" + safeMsg + "\"}");
        }
    }

    public bool IsReusable { get { return false; } }
}