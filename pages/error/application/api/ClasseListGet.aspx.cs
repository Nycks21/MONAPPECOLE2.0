using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Web.Script.Serialization;
using System.Web;

public partial class ClasseListGet : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        Response.ContentType = "application/json";

        try
        {
            string connStr = System.Configuration.ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

            var list = new List<object>();

            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();
                using (SqlCommand cmd = new SqlCommand("SELECT IDCLASSE, LABEL FROM CLASSES", conn))
                {
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            list.Add(new
                            {
                                IDCLASSE = reader.GetInt32(reader.GetOrdinal("IDCLASSE")),
                                LABEL = reader.IsDBNull(reader.GetOrdinal("LABEL")) ? null : reader.GetString(reader.GetOrdinal("LABEL"))
                            });
                        }
                    }
                }
            }

            var serializer = new JavaScriptSerializer();
            string json = serializer.Serialize(list);
            Response.Write(json);
        }
        catch (Exception ex)
        {
            Response.StatusCode = 500;
            Response.Write("{\"error\":\"" + HttpUtility.JavaScriptStringEncode(ex.Message) + "\"}");
        }
        finally
        {
            Response.End();
        }
    }
}
