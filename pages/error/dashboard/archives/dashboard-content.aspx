<%-- dashboard-content.aspx Contenu pur du dashboard — uniquement les sections. Ce fichier est lu par dashboard.aspx.cs (GetDashboardSectionHtml) et injecté dans #pageContent. Il n'est jamais servi directement.--%>
<section class="content">
    <div class="container-fluid">

        <!-- ── LIGNE KPI ─────────────────────────────── -->
        <div class="row kpi-row">
            <div class="col-lg-3 col-md-6">
                <div class="kpi-card" id="kpiEleves">
                    <div class="kpi-accent" style="background:var(--primary)"></div>
                    <div class="kpi-label">Total élèves</div>
                    <div class="kpi-val" id="valEleves">—</div>
                    <div class="kpi-sub">
                        <span class="pill pill-up" id="pillEleves">+0</span>
                        <span>depuis la rentrée</span>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="kpi-card" id="kpiClasses">
                    <div class="kpi-accent" style="background:var(--success)"></div>
                    <div class="kpi-label">Classes actives</div>
                    <div class="kpi-val" id="valClasses">—</div>
                    <div class="kpi-sub">
                        <span class="pill pill-neu" id="pillClasses">Moy. — élèves</span>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="kpi-card" id="kpiPresence">
                    <div class="kpi-accent" style="background:var(--warning)"></div>
                    <div class="kpi-label">Taux de présence</div>
                    <div class="kpi-val"><span id="valPresence">—</span><span class="kpi-unit">%</span></div>
                    <div class="kpi-sub">
                        <span class="pill pill-up" id="pillPresence">+0%</span>
                        <span>ce mois</span>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 col-md-6">
                <div class="kpi-card" id="kpiImpayes">
                    <div class="kpi-accent" style="background:var(--danger)"></div>
                    <div class="kpi-label">Frais impayés</div>
                    <div class="kpi-val" id="valImpayes">—</div>
                    <div class="kpi-sub">
                        <span class="pill pill-dn" id="pillImpayes">0</span>
                        <span>vs mois dernier</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── PRÉSENCES + RÉPARTITION ───────────────── -->
        <div class="row mt-1">
            <div class="col-lg-8">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title">
                            <span class="dot-terra"></span>
                            Présences — 7 derniers jours
                        </span>
                        <span class="dash-card-meta" id="lblMoisPresence"></span>
                    </div>
                    <div class="dash-card-body">
                        <div class="chart-legend mb-2">
                            <span class="leg-item"><span class="leg-sq" style="background:var(--forest)"></span>Présents</span>
                            <span class="leg-item"><span class="leg-sq" style="background:var(--terra)"></span>Absents</span>
                        </div>
                        <div style="position:relative;height:200px;">
                            <canvas id="chartPresence"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><span class="dot-terra"></span>Répartition par niveau</span>
                    </div>
                    <div class="dash-card-body">
                        <div class="donut-wrap">
                            <canvas id="chartDonut" width="130" height="130"></canvas>
                            <div class="donut-legend" id="donutLegend"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── RÉUSSITE + FRAIS + INDICATEURS ───────── -->
        <div class="row mt-1">
            <div class="col-lg-4">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><span class="dot-terra"></span>Taux de réussite par classe</span>
                    </div>
                    <div class="dash-card-body" id="reussiteContainer"></div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><span class="dot-terra"></span>Frais scolaires mensuels</span>
                    </div>
                    <div class="dash-card-body">
                        <div class="chart-legend mb-2">
                            <span class="leg-item"><span class="leg-sq" style="background:var(--forest-light)"></span>Payé</span>
                            <span class="leg-item"><span class="leg-sq" style="background:#f0d4c8"></span>Impayé</span>
                        </div>
                        <div style="position:relative;height:180px;">
                            <canvas id="chartFrais"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><span class="dot-terra"></span>Indicateurs clés</span>
                    </div>
                    <div class="dash-card-body">
                        <div class="gauge-row" id="gaugeContainer"></div>
                        <div class="divider-line mt-3 mb-3"></div>
                        <div class="prog-item">
                            <div class="prog-head">
                                <span class="prog-name">Garçons</span>
                                <span class="prog-pct" id="pctGarcons">—%</span>
                            </div>
                            <div class="prog-track">
                                <div class="prog-fill" id="fillGarcons" style="background:var(--forest)"></div>
                            </div>
                        </div>
                        <div class="prog-item">
                            <div class="prog-head">
                                <span class="prog-name">Filles</span>
                                <span class="prog-pct" id="pctFilles">—%</span>
                            </div>
                            <div class="prog-track">
                                <div class="prog-fill" id="fillFilles" style="background:var(--terra)"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── ABSENCES + ACTIVITÉ ───────────────────── -->
        <div class="row mt-1">
            <div class="col-lg-6">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><span class="dot-terra"></span>Élèves — absences fréquentes</span>
                        <span class="dash-card-meta">Ce mois</span>
                    </div>
                    <div class="dash-card-body p-0">
                        <table class="dash-table" id="tableAbsences">
                            <thead>
                                <tr>
                                    <th>Élève</th>
                                    <th>Classe</th>
                                    <th>Absences</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody id="tbodyAbsences">
                                <tr><td colspan="4" class="text-center p-3">Chargement...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><span class="dot-terra"></span>Activité récente</span>
                    </div>
                    <div class="dash-card-body" id="activityFeed"></div>
                </div>
            </div>
        </div>

        <!-- ── AGENDA ────────────────────────────────── -->
        <div class="row mt-1">
            <div class="col-12">
                <div class="dash-card">
                    <div class="dash-card-head">
                        <span class="dash-card-title"><span class="dot-terra"></span>Agenda scolaire</span>
                        <div class="cal-legend">
                            <span class="leg-item"><span class="leg-sq" style="background:var(--forest)"></span>Aujourd'hui</span>
                            <span class="leg-item"><span class="leg-sq" style="background:var(--terra)"></span>Événement</span>
                        </div>
                    </div>
                    <div class="dash-card-body">
                        <div id="calendarGrid" class="mini-cal"></div>
                        <div class="event-list mt-3" id="eventList"></div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</section>
