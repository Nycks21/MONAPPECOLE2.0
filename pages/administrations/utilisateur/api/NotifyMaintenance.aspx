<%@ Page Language="C#" ContentType="application/json" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System.Configuration" %>
<%@ Import Namespace="System.Data.SqlClient" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    try
    {
        string action = Request.QueryString["action"];
        
        if (action == "register")
        {
            // Enregistrer que l'utilisateur a reçu la notification
            string userId = Request.QueryString["userId"];
            if (!string.IsNullOrEmpty(userId))
            {
                Session["MaintenanceNotified"] = true;
                Session["MaintenanceTime"] = Request.QueryString["time"];
            }
            
            var result = new { success = true, message = "Notification enregistrée" };
            WriteJson(result);
        }
        else if (action == "broadcast")
        {
            // Envoyer la notification à tous les utilisateurs connectés
            string maintenanceTime = Request.QueryString["time"];
            BroadcastToAllUsers(maintenanceTime);
            
            var result = new { success = true, message = "Notification diffusée" };
            WriteJson(result);
        }
        else
        {
            var result = new { success = false, message = "Action non reconnue" };
            WriteJson(result);
        }
    }
    catch (Exception ex)
    {
        var result = new { success = false, message = ex.Message };
        WriteJson(result);
    }
}

private void BroadcastToAllUsers(string maintenanceTime)
{
    // Stocker l'information de maintenance en application state (accessible à tous les utilisateurs)
    Application.Lock();
    Application["MaintenanceMode"] = true;
    Application["MaintenanceTime"] = maintenanceTime;
    Application["MaintenanceStartTime"] = DateTime.Now.ToString();
    Application.Unlock();
    
    // Mettre à jour la session actuelle
    Session["MaintenanceNotified"] = true;
    Session["MaintenanceTime"] = maintenanceTime;
}

private void WriteJson(object obj)
{
    var serializer = new JavaScriptSerializer();
    Response.Write(serializer.Serialize(obj));
}
</script>