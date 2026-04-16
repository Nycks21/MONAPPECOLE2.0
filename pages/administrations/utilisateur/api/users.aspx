<%@ Page Language="C#" ResponseEncoding="utf-8" EnableSessionState="True" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Collections.Generic" %>

<script runat="server">
private string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;

protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.Clear();

    try
    {
        if (Request.HttpMethod == "POST")
        {
            string userCrea = "SYSTEM";
            if (Session != null && Session["username"] != null)
            {
                userCrea = Session["username"].ToString();
            }

            string jsonString = new System.IO.StreamReader(Request.InputStream).ReadToEnd();
            var data = new JavaScriptSerializer()
                .Deserialize<Dictionary<string, string>>(jsonString);

            using (SqlConnection conn = new SqlConnection(connStr))
            {
                conn.Open();

                                // CORRECTION: Gérer correctement la valeur ACTIVE

                int activeValue = 0; // Valeur par défaut

                // Vérifier le type de la valeur reçue pour ACTIVE
                if (data.ContainsKey("ACTIVE"))
                {
                    object activeObj = data["ACTIVE"];
                    if (activeObj is bool)
                    {
                        activeValue = (bool)activeObj ? 1 : 0;
                    }
                    else if (activeObj is int)
                    {
                        activeValue = (int)activeObj;
                    }
                    else if (activeObj is string)
                    {
                        string activeStr = activeObj.ToString().ToLower();
                        activeValue = (activeStr == "true" || activeStr == "1" || activeStr == "actif") ? 1 : 0;
                    }
                    else if (activeObj != null)
                    {
                        activeValue = Convert.ToInt32(activeObj);
                    }
                }

                using (SqlCommand cmd = new SqlCommand(
                    @"INSERT INTO USERS (USERNAME, NOM, PWD, EMAIL, ROLEID, TELEPHONE, ACTIVE)
                      VALUES (@USERNAME, @NOM, @PWD, @EMAIL, @ROLEID, @TELEPHONE, @ACTIVE)", conn))
                {
                    cmd.Parameters.AddWithValue("@USERNAME", data["USERNAME"]);
                    cmd.Parameters.AddWithValue("@NOM", data["NOM"]);
                    cmd.Parameters.AddWithValue("@PWD", data["PWD"]);
                    cmd.Parameters.AddWithValue("@EMAIL", data["EMAIL"]);
                    cmd.Parameters.AddWithValue("@ROLEID", Convert.ToInt32(data["ROLEID"]));
                    cmd.Parameters.AddWithValue("@TELEPHONE", data["TELEPHONE"]);
                    cmd.Parameters.AddWithValue("@ACTIVE", data["ACTIVE"]);

                    int rows = cmd.ExecuteNonQuery();

                    Response.Write(new JavaScriptSerializer().Serialize(new
                    {
                        success = rows > 0,
                        message = "Utilisateur ajouté avec succès"
                    }));
                }
            }
        }
        else
        {
            Response.StatusCode = 405;
            Response.Write(new JavaScriptSerializer().Serialize(new
            {
                success = false,
                message = "Méthode HTTP non supportée"
            }));
        }
    }
    catch (Exception ex)
    {
        Response.StatusCode = 500;
        Response.Write(new JavaScriptSerializer().Serialize(new
        {
            success = false,
            message = ex.Message
        }));
    }
}
</script>
