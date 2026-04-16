<section class="content">

  <div class="container-fluid">
    <form id="Form1" runat="server" class="form-horizontal">
      <div class="row">
        <div class="col-md-12">
          <table class="table table-bordered text-center">
            <tbody>
              <tr>
                <td>
                  <div class="card-footer text-left">
                    <button type="button" id="btnAjouter" class="btn btn-outline-primary"><i
                        class="fas fa-user-plus"></i> Ajouter </button>
                    <button type="submit" id="btnValider" class="btn btn-outline-primary m-2"><i
                        class="fas fa-check"></i>
                      Enregistrer </button>
                    <button type="button" id="btnAnnuler" class="btn btn-outline-danger mr-2"><i class="fas fa-ban"></i>
                      Annuler </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-6">
          <div class="card card-primary card-outline">
            <div class="card-header">
              <h3 class="card-title">
                <i class="fas fa-edit"></i> Saisie
              </h3>
              <div class="card-tools">
                <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                  <i class="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div class="card-body pad table-responsive">
              <div class="form-group row">
                <label for="matiere" class="col-sm-4 col-form-label">Matière</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" id="matiere" runat="server" required />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>

</section>

<section class="content">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-list"></i> Liste des matières</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <table id="ListTable" class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Matieres</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Scripts -->
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
<script src="js/matiereload.js"></script>
<script src="../../dist/js/sweetalert2@11.js"></script>
<script src="js/matieredelete.js"></script>
<script src="../../dist/js/sweetalert.js"></script>
<script src="js/matiereajouter.js"></script>
<script src="../mode.js"></script>
<script src="../../dist/js/devReload.js"></script>

<div id="toastContainer"></div>