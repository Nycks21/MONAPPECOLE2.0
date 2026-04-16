<%@ Page Language="C#" AutoEventWireup="true" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Collections.Generic" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.Clear();
    Response.ContentType = "application/json";

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();

            // On récupère IDCLASSE en plus de LABEL
            string query = "SELECT IDCLASSE, LABEL FROM CLASSES ORDER BY LABEL ASC";

            using (SqlCommand cmd = new SqlCommand(query, conn))
            using (SqlDataReader reader = cmd.ExecuteReader())
            {
                var classes = new List<Dictionary<string, string>>();

                while (reader.Read())
                {
                    classes.Add(new Dictionary<string, string>
                    {
                        { "IDCLASSE", reader["IDCLASSE"].ToString() },
                        { "LABEL", reader["LABEL"] != null ? reader["LABEL"].ToString() : "" }
                    });

                }

                var result = classes; // On renvoie directement la liste sans enveloppe "success/data"

                string json = new JavaScriptSerializer().Serialize(result);
                Response.Write(json);
            }
        }
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        Response.ContentType = "application/json";

        string safeMessage = ex.Message.Replace("\"", "'").Replace("\r", "").Replace("\n", " ");
        var errorObj = new { success = false, error = safeMessage };
        string errorJson = new JavaScriptSerializer().Serialize(errorObj);

        Response.Write(errorJson);
    }
    finally
    {
        Response.End();
    }
}
</script>
