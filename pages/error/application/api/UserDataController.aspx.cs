using System;
using System.Configuration;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

public class UserDataController : ApiController
{
    [HttpPost]
    [Route("api/userdata/upload")]
    public async Task<IHttpActionResult> Upload()
    {
        if (!Request.Content.IsMimeMultipartContent())
            return BadRequest("Mauvais type de contenu");

        var provider = new MultipartMemoryStreamProvider();
        await Request.Content.ReadAsMultipartAsync(provider);

        // Récupérer les champs texte (Nom, Prenom)
        var nom = provider.Contents.FirstOrDefault(c => c.Headers.ContentDisposition.Name.Trim('\"') == "Nom")?.ReadAsStringAsync().Result;
        var prenom = provider.Contents.FirstOrDefault(c => c.Headers.ContentDisposition.Name.Trim('\"') == "Prenom")?.ReadAsStringAsync().Result;

        if (string.IsNullOrWhiteSpace(nom) || string.IsNullOrWhiteSpace(prenom))
            return BadRequest("Nom et Prénom sont obligatoires.");

        // Récupérer le fichier image
        var fileContent = provider.Contents.FirstOrDefault(c => c.Headers.ContentDisposition.Name.Trim('\"') == "Image");

        if (fileContent == null)
            return BadRequest("Image manquante.");

        var filename = fileContent.Headers.ContentDisposition.FileName.Trim('\"');
        var ext = Path.GetExtension(filename).ToLower();
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };

        if (!allowedExtensions.Contains(ext))
            return BadRequest("Format de fichier non supporté.");

        var buffer = await fileContent.ReadAsByteArrayAsync();

        try
        {
            // Enregistrer le fichier dans le dossier _img
            var folderPath = System.Web.Hosting.HostingEnvironment.MapPath("~/_img");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var newFileName = $"{Path.GetFileNameWithoutExtension(filename)}_{DateTime.Now.Ticks}{ext}";
            var fullPath = Path.Combine(folderPath, newFileName);

            File.WriteAllBytes(fullPath, buffer);

            // Enregistrer en base
            string connStr = ConfigurationManager.ConnectionStrings["MaConnexion"].ConnectionString;
            using (var conn = new SqlConnection(connStr))
            {
                string query = "INSERT INTO UsersData (Nom, Prenom, ImagePath) VALUES (@Nom, @Prenom, @ImagePath)";
                using (var cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Nom", nom.Trim());
                    cmd.Parameters.AddWithValue("@Prenom", prenom.Trim());
                    cmd.Parameters.AddWithValue("@ImagePath", "_img/" + newFileName);

                    conn.Open();
                    cmd.ExecuteNonQuery();
                }
            }

            return Ok("Données enregistrées avec succès !");
        }
        catch (Exception ex)
        {
            return InternalServerError(ex);
        }
    }
}
