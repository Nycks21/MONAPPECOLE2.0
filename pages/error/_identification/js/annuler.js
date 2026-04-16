$(document).ready(function() {
  $("#btnAnnuler").on("click", function() {
    $("#ContactsForm")[0].reset();
    activerBoutonsEdition(false);
    mode = null;
  });
});
