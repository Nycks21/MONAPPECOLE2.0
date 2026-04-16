<!-- Main content -->
<section class="content">
  <div class="container-fluid">
    <div class="row">
      <!-- petite carte -->
      <div class="col-lg-3 col-6">
        <div class="small-box bg-white-green">
          <div class="inner">
            <h3>
              <%= userCount %>
            </h3>
            <p>Utilisateurs enregistrés actif</p>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-white-bleu">
          <div class="inner">
            <h3>
              <%= userCountNa %>
            </h3>
            <p>Utilisateurs enregistrés non actif</p>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-6">
        <div class="small-box bg-white-yellow">
          <div class="inner">
            <h3>
              <%= userCountTo %>
            </h3>
            <p>Total utilisateurs enregistrés</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="content">
  <form id="ContactsForm" class="form-horizontal">
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-12">
          <table class="table table-bordered text-center">
            <tbody>
              <tr>
                <td>
                  <div class="card-footer text-left">
                    <button type="button" id="btnAjouter" class="btn btn-outline-primary mr-2"><i
                        class="fas fa-user-plus"></i> Ajouter </button>
                    <button type="submit" id="btnValider" class="btn btn-outline-primary mr-2"><i
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
                <i class="fas fa-edit"></i> Création
              </h3>
              <div class="card-tools">
                <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                  <i class="fas fa-minus"></i>
                </button>
              </div>
            </div>
            <div class="card-body pad table-responsive">
              <div class="form-group row">
                <label for="Username" class="col-sm-4 col-form-label">Nom d'utilisateur</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" id="Username" required />
                </div>
              </div>
              <div class="form-group row">
                <label for="Nom" class="col-sm-4 col-form-label">Nom</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" id="Nom" required />
                </div>
              </div>
              <div class="form-group row">
                <label for="Prenom" class="col-sm-4 col-form-label">Prénom</label>
                <div class="col-sm-8">
                  <input type="text" class="form-control" id="Prenom" required />
                </div>
              </div>
              <div class="form-group row">
                <label for="Email" class="col-sm-4 col-form-label">Email</label>
                <div class="col-sm-8">
                  <input type="email" class="form-control" id="Email" required />
                </div>
              </div>
              <hr />
              <div class="form-group row">
                <!-- Colonne vide (équivalent label à gauche) -->
                <div class="col-sm-4"></div>
                <!-- Info + barre alignées à droite -->
                <div class="col-sm-8">
                  <small id="passwordInfo" class="form-text text-danger">
                    Le mot de passe doit contenir au moins 8 caractères.
                  </small>
                  <!-- Barre de sécurité -->
                  <div style="height:6px; background:#e0e0e0; border-radius:4px; margin-top:4px; margin-bottom:8px;">
                    <div id="passwordStrengthBar"
                      style="height:100%; width:0%; background:red; border-radius:4px; transition:width 0.3s;">
                    </div>
                  </div>
                </div>
                <!-- Label -->
                <label for="Password" class="col-sm-4 col-form-label">Mot de passe</label>
                <!-- Input -->
                <div class="col-sm-8">
                  <input type="password" class="form-control" id="Password" required />
                </div>
              </div>

              <div class="form-group row">
                <label for="ConfirmPassword" class="col-sm-4 col-form-label">Confirmer mot de passe</label>
                <div class="col-sm-8">
                  <input type="password" class="form-control" id="ConfirmPassword" required />
                </div>
              </div>
              <div id="passwordHint" style="font-size: 0.85em; color: #6c757d; display:none;">
                Laissez les champs mot de passe vides si vous ne voulez pas mettre à jour le mot de passe.
              </div>
              <div class="form-group row">
                <label for="RoleId" class="col-sm-4 col-form-label">Rôle</label>
                <div class="col-sm-8">
                  <select class="form-control" id="RoleId" required>
                    <option value="" disabled selected></option>
                    <option value="1">Admin</option>
                    <option value="2">User</option>
                  </select>
                </div>
              </div>

              <div class="form-group row">
                <label for="Active" class="col-sm-4 col-form-label">Active</label>
                <div class="col-sm-8">
                  <input type="checkbox" class="form-control" id="Active">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>
</section>

<section class="content">
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline">
          <div class="card-header">
            <h3 class="card-title"><i class="fas fa-list"></i> Liste des Utilisateurs</h3>
            <div class="card-tools">
              <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                <i class="fas fa-minus"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <table id="contactsTable" class="table table-bordered text-center">
              <thead>
                <tr>
                  <th>Nom d'utilisateur</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Action</th>
                </tr>
                <tr>
                  <th><input type="text" class="form-control form-control-sm" /></th>
                  <th><input type="text" class="form-control form-control-sm" /></th>
                  <th><input type="text" class="form-control form-control-sm" /></th>
                  <th><input type="text" class="form-control form-control-sm" /></th>
                  <th><input type="text" class="form-control form-control-sm" /></th>
                  <th><input type="text" class="form-control form-control-sm" /></th>
                  <th></th>
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
<script src="../../dist/js/sweetalert2@11.js"></script>
<script src="../../dist/js/sweetalert.js"></script>
<script src="../mode.js"></script>
<script src="../../dist/js/devReload.js"></script>
<script src="js/users.js"></script>

<div id="toastContainer"></div>