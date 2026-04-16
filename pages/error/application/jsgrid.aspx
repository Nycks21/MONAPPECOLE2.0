<section class="content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <table class="table table-bordered text-center">
                    <tbody>
                        <tr>
                            <td>
                                <div class="card-footer text-left">
                                    <button type="button" class="btn btn-outline-primary mr-2"
                                        onclick="window.location.href='eleves.aspx';">
                                        <i class="fas fa-plus"></i> Ajouter
                                    </button>
                                    <button type="button" id="btnAnnuler" class="btn btn-outline-danger mr-2">
                                        <i class="fas fa-times"></i> Annuler
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>

<section class="content">
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="card card-primary card-outline">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-list"></i> Liste des élèves</h3>
                        <div class="card-tools">
                            <button type="button" class="btn btn-tool" data-card-widget="collapse" title="Collapse">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <table id="SaisieForm" class="table table-bordered text-center">
                            <thead>
                                <tr>
                                    <th>Matricule</th>
                                    <th>Nom</th>
                                    <th>Prénom</th>
                                    <th>Sexe</th>
                                    <th>Classe</th>
                                    <th>Contact</th>
                                    <th>Adresse</th>
                                    <th>#</th>
                                </tr>
                                <tr>
                                    <th><input type="text" class="form-control form-control-sm" /></th>
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