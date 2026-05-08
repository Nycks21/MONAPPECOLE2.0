public void ProcessRequest(HttpContext context) {
    var file = context.Request.Files[0];
    var mappingJson = context.Request.Form["mapping"];
    var mapping = JsonConvert.DeserializeObject<Dictionary<string, string>>(mappingJson);
    
    List<string> errors = new List<string>();
    int successCount = 0;

    using (var reader = ExcelReaderFactory.CreateReader(file.InputStream)) {
        var data = reader.AsDataSet().Tables[0];
        
        for (int i = 1; i < data.Rows.Count; i++) { // Saute l'entête
            try {
                var row = data.Rows[i];
                string matricule = row[mapping["MATRICULE"]].ToString();
                string classe = row[mapping["CLASSE"]].ToString();
                
                // Validation : Vérifier si la classe existe dans votre BD
                if (!DbHelper.Exists("SELECT 1 FROM Classes WHERE NOM = @nom", classe)) {
                    errors.Add($"Ligne {i+1}: La classe '{classe}' n'existe pas dans le système.");
                    continue;
                }

                // Insertion...
                successCount++;
            } catch {
                errors.Add($"Ligne {i+1}: Format de donnée invalide.");
            }
        }
    }

    var response = new { 
        success = errors.Count == 0, 
        count = successCount, 
        errors = errors 
    };
    context.Response.Write(JsonConvert.SerializeObject(response));
}