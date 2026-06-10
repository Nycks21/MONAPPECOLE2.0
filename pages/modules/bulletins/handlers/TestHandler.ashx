<%@ WebHandler Language="C#" Class="TestHandler" %>
using System;
using System.Web;

public class TestHandler : IHttpHandler
{
    public void ProcessRequest(HttpContext ctx)
    {
        ctx.Response.ContentType = "application/json";
        ctx.Response.Write("{\"success\":true,\"message\":\"Handler fonctionne!\"}");
    }
    
    public bool IsReusable { get { return false; } }
}