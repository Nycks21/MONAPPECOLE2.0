<%@ Page Language="C#" AutoEventWireup="true" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";

    try
    {
        string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
        using (SqlConnection conn = new SqlConnection(connStr))
        {
            conn.Open();
            string query = "SELECT TransactionId, Libelle, DateTransaction, Reference, Telephone, Montant, LotId FROM Transactions WHERE OperatorId ='1' ORDER BY DateTransaction DESC";
            using (SqlCommand cmd = new SqlCommand(query, conn))
            {
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    var transactions = new System.Collections.Generic.List<object>();
                    while (reader.Read())
                    {
                        transactions.Add(new
                        {
                            TransactionId = reader["TransactionId"],
                            LotId = reader["LotId"].ToString(),
                            Libelle = reader["Libelle"].ToString(),
                            DateTransaction = reader["DateTransaction"].ToString(),
                            Reference = reader["Reference"].ToString(),
                            Telephone = reader["Telephone"].ToString(),
                            Montant = reader["Montant"].ToString()
                        });
                    }
                    JavaScriptSerializer js = new JavaScriptSerializer();
                    Response.Write(js.Serialize(transactions));
                }
            }
        }
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        Response.Write("{\"status\":\"error\",\"message\":\""+ ex.Message.Replace("\"", "'") + "\"}");
    }
    finally
    {
        Response.End();
    }
}
</script>
