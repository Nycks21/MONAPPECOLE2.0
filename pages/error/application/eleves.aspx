<section class="content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12"> <!-- ⚠️ UN SEUL formulaire WebForms -->
                <form id="SaisieForm" class="form-horizontal" runat="server" method="post"
                    enctype="multipart/form-data">
                    <div class="row">
                        <div class="col-md-12">
                            <table class="table table-bordered text-center">
                                <tbody>
                                    <tr>
                                        <td>
                                            <div class="card-footer text-left"> <button type="submit" id="btnValider"
                                                    class="btn btn-outline-primary"> <i class="fas fa-check"></i>
                                                    Enregistrer </button>
                                                <button type="button" id="btnAnnuler"
                                                    class="btn btn-outline-danger mr-2"> <i class="fas fa-ban"></i>
                                                    Annuler </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div> <!-- Première colonne -->
                        <div class="col-md-12">
                            <div class="card card-primary card-outline">
                                <div class="card-header">
                                    <h3 class="card-title"> <i class="fas fa-edit"></i> Saisie </h3>
                                    <div class="card-tools"> <button type="button" class="btn btn-tool"
                                            data-card-widget="collapse" title="Collapse"> <i class="fas fa-minus"></i>
                                        </button> <button type="button" class="btn btn-tool" data-card-widget="remove"
                                            title="Remove"> <i class="fas fa-times"></i> </button>
                                    </div>
                                </div>
                                <div class="card-body"> <!-- 👇 ROW OBLIGATOIRE -->
                                    <div class="row">
                                        <div class="col-md-8">
                                            <div class="card-body pad table-responsive">
                                                <table class="table table-bordered text-center">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="libelle"
                                                                        class="col-sm-4 col-form-label text-left">Matricule</label>
                                                                    <div class="col-sm-8"> <input type="text"
                                                                            id="Matricule" name="Matricule"
                                                                            class="form-control" required /> </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="libelle"
                                                                        class="col-sm-4 col-form-label text-left">Nom</label>
                                                                    <div class="col-sm-8"> <input type="text" id="Nom"
                                                                            name="Nom" class="form-control" required />
                                                                    </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="libelle"
                                                                        class="col-sm-4 col-form-label text-left">Prénom</label>
                                                                    <div class="col-sm-8"> <input type="text"
                                                                            id="Prenom" name="Prenom"
                                                                            class="form-control" required /> </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="datetransaction"
                                                                        class="col-sm-4 col-form-label text-left">Date
                                                                        de naissance</label>
                                                                    <div class="col-sm-8"> <input type="date"
                                                                            id="Birthday" name="Birthday"
                                                                            class="form-control" required /> </div>
                                                                </div>
                                                                <div class="form-group row"> <label for="Sexe"
                                                                        class="col-sm-4 col-form-label text-left">Sexe</label>
                                                                    <div class="col-sm-8"> <select
                                                                            class="form-control custom-select"
                                                                            name="Sexe" id="Sexe">
                                                                            <option value="" disabled selected></option>
                                                                            <option value="Garçon">
                                                                                Garçon</option>
                                                                            <option value="Fille">Fille
                                                                            </option>
                                                                        </select> </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="ddlTypeOperation"
                                                                        class="col-sm-4 col-form-label text-left">Classe</label>
                                                                    <div class="col-sm-8"> <select id="ddlTypeClasse"
                                                                            name="ddlTypeClasse"
                                                                            class="form-control custom-select" required>
                                                                            <!-- Options à remplir dynamiquement -->
                                                                        </select> </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="libelle"
                                                                        class="col-sm-4 col-form-label text-left">Nom
                                                                        du père</label>
                                                                    <div class="col-sm-8"> <input type="text" id="NPere"
                                                                            name="NPere" class="form-control"
                                                                            required /> </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="libelle"
                                                                        class="col-sm-4 col-form-label text-left">Nom
                                                                        de la mère</label>
                                                                    <div class="col-sm-8"> <input type="text" id="NMere"
                                                                            name="NMere" class="form-control"
                                                                            required /> </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="Contact"
                                                                        class="col-sm-4 col-form-label text-left">Numéro
                                                                        téléphone</label>
                                                                    <div class="col-sm-8"> <input type="text"
                                                                            id="Contact" name="Contact"
                                                                            class="form-control" required /> </div>
                                                                </div>
                                                                <div class="form-group row align-items-center">
                                                                    <label for="reference"
                                                                        class="col-sm-4 col-form-label text-left">Adresse</label>
                                                                    <div class="col-sm-8"> <input type="text"
                                                                            id="Adresse" name="Adresse"
                                                                            class="form-control" required /> </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="card-body pad table-responsive">
                                                <table class="table table-bordered text-center">
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <div class="form-group text-center">
                                                                    <label for="image">Choisir une image
                                                                        (portrait seulement) :</label>
                                                                    <input type="file" id="ImageFile" name="ImageFile"
                                                                        class="mb-2" accept="image/*" />
                                                                    <!-- CADRE FIXE -->
                                                                    <div class="image-frame123"> <img id="preview"
                                                                            alt="Aperçu image"> </div>
                                                                    <div id="error-msg"
                                                                        style="color:red; margin-top: 5px;">
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form> <!-- ✔ FORMULAIRE FERMÉ CORRECTEMENT -->
            </div>
        </div>
    </div>
</section> <!-- Control Sidebar -->

<script src="js/classe.js"></script>
<script src="../../plugins/jquery/jquery.min.js"></script>
<script src="../../plugins/bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="../../plugins/datatables/jquery.dataTables.min.js"></script>
<script src="../../plugins/datatables-bs4/js/dataTables.bootstrap4.min.js"></script>
<script src="../../plugins/datatables-responsive/js/dataTables.responsive.min.js"></script>
<script src="../../plugins/datatables-responsive/js/responsive.bootstrap4.min.js"></script>
<script src="../../plugins/datatables-buttons/js/dataTables.buttons.min.js"></script>
<script src="../../plugins/datatables-buttons/js/buttons.bootstrap4.min.js"></script>
<script src="../../plugins/jszip/jszip.min.js"></script>
<script src="../../plugins/pdfmake/pdfmake.min.js"></script>
<script src="../../plugins/pdfmake/vfs_fonts.js"></script>
<script src="../../plugins/datatables-buttons/js/buttons.html5.min.js"></script>
<script src="../../plugins/datatables-buttons/js/buttons.print.min.js"></script>
<script src="../../plugins/datatables-buttons/js/buttons.colVis.min.js"></script>
<script src="../../dist/js/adminlte.min.js"></script>
<script src="../../dist/js/jquery.inputmask.min.js"></script>
<script src="js/listeclasse.js"></script>
<script src="js/ajouter.js"></script>
<script src="../../plugins/sweetalert2/sweetalert2.all.js"></script>
<script src="../../dist/js/sweetalert.js"></script>
<script src="../mode.js"></script>
<script src="js/img.js"></script>
<script src="../../dist/js/devReload.js"></script>
<div id="spinnerOverlay">
    <div class="spinner"></div>
</div>
