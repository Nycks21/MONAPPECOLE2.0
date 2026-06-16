<%@ Page Language="C#" ContentType="application/json" ResponseEncoding="utf-8" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    try
    {
        bool isMaintenanceActive = false;
        string message = "";
        string maintenanceTime = "";
        
        if (Application["MaintenanceActive"] != null && (bool)Application["MaintenanceActive"])
        {
            // Ne pas montrer aux SuperAdmin
            int userRole = Session["USERROLE"] != null ? Convert.ToInt32(Session["USERROLE"]) : -1;
            if (userRole != 0)
            {
                isMaintenanceActive = true;
                message = Application["MaintenanceMessage"] as string ?? "⚠️ Maintenance programmée";
                maintenanceTime = Application["MaintenanceTime"] as string ?? "";
            }
        }
        
        Response.Write("{\"success\":true,\"isMaintenanceActive\":" + isMaintenanceActive.ToString().ToLower() + ",\"message\":\"" + message.Replace("\"", "\\\"") + "\",\"maintenanceTime\":\"" + maintenanceTime + "\"}");
    }
    catch (Exception ex)
    {
        Response.Write("{\"success\":false,\"message\":\"" + ex.Message.Replace("\"", "'") + "\"}");
    }
}
</script>