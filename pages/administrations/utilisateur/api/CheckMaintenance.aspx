<%@ Page Language="C#" ContentType="application/json" ResponseEncoding="utf-8" %>
<%@ Import Namespace="System.Collections.Generic" %>
<%@ Import Namespace="System.Web.Script.Serialization" %>

<script runat="server">
protected void Page_Load(object sender, EventArgs e)
{
    Response.ContentType = "application/json";
    Response.ContentEncoding = new System.Text.UTF8Encoding(false);
    
    bool isMaintenance = false;
    string maintenanceTime = "";
    
    if (Application["MaintenanceMode"] != null && (bool)Application["MaintenanceMode"])
    {
        int? userRole = Session["USERROLE"] as int?;
        // SuperAdmin ne voit pas la maintenance
        if (userRole == null || userRole.Value != 0)
        {
            isMaintenance = true;
            maintenanceTime = Application["MaintenanceTime"] as string ?? "";
        }
    }
    
    var result = new Dictionary<string, object>();
    result["success"] = true;
    result["isMaintenance"] = isMaintenance;
    result["maintenanceTime"] = maintenanceTime;
    
    var serializer = new JavaScriptSerializer();
    Response.Write(serializer.Serialize(result));
}
</script>