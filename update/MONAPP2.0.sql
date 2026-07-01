-- =====================================================
-- GESTION SCOLAIRE - BASE DE DONNÉES COMPLÈTE
-- =====================================================

IF NOT EXISTS (SELECT *
FROM sys.databases
WHERE name = 'MONAPPECOLE2')
BEGIN
    CREATE DATABASE MONAPPECOLE2;
END
GO

USE MONAPPECOLE2;
GO

-- =====================================================
-- TABLE USERROLE
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'USERROLE')
BEGIN
    CREATE TABLE USERROLE
    (
        ROLEID INT PRIMARY KEY,
        ROLENAME VARCHAR(50) NOT NULL UNIQUE
    );
END
GO

-- =====================================================
-- TABLE USERS
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'USERS')
BEGIN
    CREATE TABLE USERS
    (
        IDUSER INT IDENTITY(1,1) PRIMARY KEY,
        USERNAME NVARCHAR(100) NOT NULL UNIQUE,
        NOM NVARCHAR(100) NOT NULL,
        EMAIL NVARCHAR(100) UNIQUE NOT NULL,
        PWD NVARCHAR(255) NOT NULL,
        ROLEID INT NOT NULL,
        TELEPHONE NVARCHAR(20),
        ACTIVE BIT NOT NULL DEFAULT 1,
        DERNIERE_CONNEXION DATETIME,
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME DEFAULT GETDATE(),
        SESSION_TOKEN NVARCHAR(100),
        LAST_LOGIN DATETIME DEFAULT GETDATE(),
        LAST_PC NVARCHAR(100),
        MENU_PERMISSIONS NVARCHAR(MAX) NULL,
        BLOCKED_UNTIL DATETIME NULL;
        -- Nouvelle colonne pour les permissions

        CONSTRAINT FK_USER_ROLE FOREIGN KEY (ROLEID) REFERENCES USERROLE(ROLEID)
    );
END
GO

-- =====================================================
-- TABLE MENUS
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'MENUS')
BEGIN
    CREATE TABLE MENUS
    (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        CODE NVARCHAR(50) NOT NULL UNIQUE,
        NOM NVARCHAR(100) NOT NULL,
        PARENT_ID INT NULL,
        ICONE NVARCHAR(50) NULL,
        URL NVARCHAR(200) NULL,
        ORDRE INT DEFAULT 0,
        ACTIF BIT DEFAULT 1,
        CREATED_AT DATETIME DEFAULT GETDATE(),

        CONSTRAINT FK_MENUS_PARENT FOREIGN KEY (PARENT_ID) REFERENCES MENUS(ID)
    );
END
GO

-- Insertion des menus par défaut
IF NOT EXISTS (SELECT 1
FROM MENUS)
BEGIN
    INSERT INTO MENUS
        (CODE, NOM, URL, ICONE, ORDRE, PARENT_ID)
    VALUES
        -- Menu principal
        ('dashboard', 'Dashboard', '/pages/accueil/dashboards/index.aspx', 'fas fa-chalkboard', 1, NULL),

        -- Modules
        ('modules', 'Modules', NULL, 'fas fa-cubes', 2, NULL),
        ('eleves', 'Liste des élèves', '/pages/modules/eleves/eleves.aspx', 'fas fa-users', 1, (SELECT ID
            FROM MENUS
            WHERE CODE = 'modules')),
        ('absences', 'Retards & Absences', '/pages/modules/absences/absences.aspx', 'fas fa-calendar-times', 2, (SELECT ID
            FROM MENUS
            WHERE CODE = 'modules')),
        ('frais', 'Frais scolaires', '/pages/modules/frais/frais.aspx', 'fas fa-money-bill-wave', 3, (SELECT ID
            FROM MENUS
            WHERE CODE = 'modules')),
        ('bulletins', 'Bulletins', '/pages/modules/bulletins/bulletins.aspx', 'fas fa-file-alt', 4, (SELECT ID
            FROM MENUS
            WHERE CODE = 'modules')),

        -- Paramètres
        ('parametres', 'Paramètres', NULL, 'fas fa-sliders-h', 3, NULL),
        ('niveaux', 'Niveaux', '/pages/parametres/niveaux/niveaux.aspx', 'fas fa-layer-group', 1, (SELECT ID
            FROM MENUS
            WHERE CODE = 'parametres')),
        ('salles', 'Salles', '/pages/parametres/salles/salles.aspx', 'fas fa-door-open', 2, (SELECT ID
            FROM MENUS
            WHERE CODE = 'parametres')),
        ('classes', 'Classes', '/pages/parametres/classes/classes.aspx', 'fas fa-folder', 3, (SELECT ID
            FROM MENUS
            WHERE CODE = 'parametres')),
        ('matieres', 'Matières', '/pages/parametres/matieres/matieres.aspx', 'fas fa-book', 4, (SELECT ID
            FROM MENUS
            WHERE CODE = 'parametres')),

        -- Administrations
        ('administrations', 'Administrations', NULL, 'fas fa-university', 4, NULL),
        ('utilitaires', 'Utilitaires', '/pages/administrations/utilitaires/utilitaires.aspx', 'fas fa-cogs', 1, (SELECT ID
            FROM MENUS
            WHERE CODE = 'administrations')),
        ('annee', 'Années', '/pages/administrations/annee/annee.aspx', 'fas fa-calendar-alt', 2, (SELECT ID
            FROM MENUS
            WHERE CODE = 'administrations')),
        ('utilisateur', 'Utilisateurs', '/pages/administrations/utilisateur/utilisateur.aspx', 'fas fa-user-shield', 3, (SELECT ID
            FROM MENUS
            WHERE CODE = 'administrations')),
        ('requetes', 'Requêtes SQL', '/pages/administrations/requete/requetes.aspx', 'fas fa-database', 4, (SELECT ID
            FROM MENUS
            WHERE CODE = 'administrations'));
END
GO

-- =====================================================
-- TABLE RANNEE
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'RANNEE')
BEGIN
    CREATE TABLE [dbo].[RANNEE]
    (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        ANNEE NVARCHAR(9) NOT NULL,
        -- ex: "1"
        DATE_DEBUT DATE NOT NULL,
        DATE_FIN DATE NOT NULL,
        CLOTURE BIT NOT NULL DEFAULT 0,
        DATE_CLOTURE DATETIME NULL,
        CREATED_AT DATETIME NOT NULL DEFAULT GETDATE(),
    );
END
GO

-- =====================================================
-- TABLE NIVEAUX
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'NIVEAUX')
BEGIN
    CREATE TABLE NIVEAUX
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NOM NVARCHAR(50) NOT NULL UNIQUE,
        ORDRE INT DEFAULT 0,
        STATUT BIT NOT NULL DEFAULT 1,
        CREATED_AT DATETIME DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- TABLE SALLES
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'SALLES')
BEGIN
    CREATE TABLE SALLES
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NUMERO NVARCHAR(50) NOT NULL UNIQUE,
        CAPACITE INT DEFAULT 30,
        STATUT BIT NOT NULL DEFAULT 1,
        CREATED_AT DATETIME DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- TABLE CLASSES
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'CLASSES')
BEGIN
    CREATE TABLE CLASSES
    (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        NOM NVARCHAR(50) UNIQUE NOT NULL,

        -- Clés Étrangères en UNIQUEIDENTIFIER (GUID)
        NIVEAU_ID UNIQUEIDENTIFIER NOT NULL,
        SALLE_ID UNIQUEIDENTIFIER NOT NULL,

        -- Relation avec l'enseignant titulaire (INT selon votre table USERROLE)
        TITULAIRE_ID INT NOT NULL,

        EFFECTIF INT DEFAULT 0,
        STATUT BIT NOT NULL DEFAULT 1,
        -- 1 pour Actif, 0 pour Inactif
        CREATED_AT DATETIME DEFAULT GETDATE(),

        -- Définition des contraintes de clés étrangères
        CONSTRAINT FK_CLASSES_NIVEAU FOREIGN KEY (NIVEAU_ID) 
            REFERENCES NIVEAUX(ID),

        CONSTRAINT FK_CLASSES_SALLE FOREIGN KEY (SALLE_ID) 
            REFERENCES SALLES(ID),

        CONSTRAINT FK_CLASSES_USERS FOREIGN KEY (TITULAIRE_ID) 
            REFERENCES USERS(IDUSER)
    );
END
GO

-- =====================================================
-- TABLE MATIÈRES
-- =====================================================
-- Vérifier si la table MATIERES n'existe pas
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'MATIERES')
BEGIN
    CREATE TABLE MATIERES
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NOM NVARCHAR(100) NOT NULL,
        ENSEIGNANT INT NOT NULL,
        COEFFICIENT DECIMAL(3,1) DEFAULT 1.0,
        HEURES_SEMAINE INT DEFAULT 3,
        CLASSE_ID INT NOT NULL,
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME NULL,

        CONSTRAINT FK_MATIERES_CLASSES FOREIGN KEY (CLASSE_ID) 
            REFERENCES CLASSES(ID),

        CONSTRAINT FK_MATIERES_USERS FOREIGN KEY (ENSEIGNANT) 
            REFERENCES USERS(IDUSER),

        -- Contrainte d'unicité: une matière ne peut être enseignée qu'une fois par classe et enseignant
        CONSTRAINT UQ_MATIERE_CLASSE_ENSEIGNANT UNIQUE (NOM, CLASSE_ID, ENSEIGNANT)
    );
END
GO

-- =====================================================
-- TABLE COEFFICIENT
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'BULLETINS_COEFFS')
BEGIN
    CREATE TABLE BULLETINS_COEFFS
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MATIERE_ID UNIQUEIDENTIFIER NOT NULL,
        CLASSE_ID INT NOT NULL,
        PERIODE NVARCHAR(10) NOT NULL,
        COEFF1 INT NOT NULL DEFAULT 1,
        COEFF2 INT NOT NULL DEFAULT 1,
        COEFF_PROJET INT NOT NULL DEFAULT 2,
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME DEFAULT GETDATE(),

        CONSTRAINT FK_COEFFS_MATIERE FOREIGN KEY (MATIERE_ID) REFERENCES MATIERES(ID),
        CONSTRAINT FK_COEFFS_CLASSE FOREIGN KEY (CLASSE_ID) REFERENCES CLASSES(ID),
        CONSTRAINT UQ_COEFFS_MATIERE_CLASSE_PERIODE UNIQUE (MATIERE_ID, CLASSE_ID, PERIODE)
    );
END
GO

-- =====================================================
-- TABLE BULLETINS
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'BULLETINS')
BEGIN
    CREATE TABLE BULLETINS
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ELEVE_MATRICULE NVARCHAR(20) NOT NULL,
        MATIERE_ID UNIQUEIDENTIFIER NOT NULL,
        
        NOTE1 DECIMAL(5,2) NULL,
        NOTE2 DECIMAL(5,2) NULL,
        NOTE_PROJET DECIMAL(5,2) NULL,
        TOTAL_NOTE DECIMAL(10,2) NULL,

        APPRECIATION NVARCHAR(500) NULL,
        PERIODE NVARCHAR(10) NOT NULL,
        STATUT NVARCHAR(20) DEFAULT 'Non saisi',

        DATE_EVAL1 DATE NULL,
        DATE_EVAL2 DATE NULL,
        DATE_EVAL_PROJET DATE NULL,

        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME DEFAULT GETDATE(),

        CONSTRAINT CHK_NOTE1 CHECK (NOTE1 BETWEEN 0 AND 20),
        CONSTRAINT CHK_NOTE2 CHECK (NOTE2 BETWEEN 0 AND 20),
        CONSTRAINT CHK_NOTE_PROJET CHECK (NOTE_PROJET BETWEEN 0 AND 20),
        CONSTRAINT CHK_PERIODE CHECK (PERIODE IN ('T1','T2','T3','Sem1','Sem2')),
        CONSTRAINT CHK_STATUT CHECK (STATUT IN ('Non saisi', 'En cours', 'Enregistré', 'Validé')),

        CONSTRAINT FK_BULLETINS_ELEVES FOREIGN KEY (ELEVE_MATRICULE) REFERENCES ELEVES(MATRICULE) ON DELETE CASCADE,
        CONSTRAINT FK_BULLETINS_MATIERES FOREIGN KEY (MATIERE_ID) REFERENCES MATIERES(ID) ON DELETE CASCADE,
        CONSTRAINT UQ_BULLETIN UNIQUE (ELEVE_MATRICULE, MATIERE_ID, PERIODE)
    );
END
GO

-- =====================================================
-- TABLE ÉLÈVES
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'ELEVES')
BEGIN
    CREATE TABLE ELEVES
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        MATRICULE NVARCHAR(20) UNIQUE NOT NULL,
        ANNEE_ID INT NOT NULL,
        NOM NVARCHAR(100) NOT NULL,
        CLASSE INT NOT NULL,
        STATUT NVARCHAR(20) DEFAULT 'actif'
            CHECK (STATUT IN ('actif','inactif','suspendu')),
        EMAIL NVARCHAR(100),
        TELEPHONE NVARCHAR(20),
        DATE_NAISSANCE DATE,
        GENRE NCHAR(1) DEFAULT 'M' CHECK (GENRE IN ('M','F')),
        ADRESSE NVARCHAR(MAX),
        PARENT NVARCHAR(100),

        DATE_INSCRIPTION DATE DEFAULT GETDATE(),
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME DEFAULT GETDATE(),

        -- Clé étrangère vers la table CLASSES
        CONSTRAINT FK_ELEVES_CLASSES FOREIGN KEY (CLASSE) 
            REFERENCES CLASSES(ID),

        -- CORRECTION ICI : Le nom de la colonne doit correspondre (ANNEE_ID)
        CONSTRAINT FK_ELEVES_RANNEE FOREIGN KEY (ANNEE_ID) 
            REFERENCES RANNEE(ID)
    );
END
GO

-- =====================================================
-- TABLE ABSENCES
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'ABSENCES')
BEGIN
    CREATE TABLE ABSENCES
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ANNEE_ID INT NOT NULL,
        MATRICULE NVARCHAR(20) NOT NULL,
        NOM NVARCHAR(200) NOT NULL,
        CLASSE INT NOT NULL,
        DATE_DEBUT DATE NOT NULL,
        DATE_FIN DATE NOT NULL,
        MOTIF NVARCHAR(500) NULL,
        JUSTIFIE BIT DEFAULT 0,
        JUSTIFICATION NVARCHAR(500) NULL,
        PIECE_JOINTE NVARCHAR(200) NULL,
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME NULL,

        -- Clés étrangères
        CONSTRAINT FK_ABSENCES_RANNEE FOREIGN KEY (ANNEE_ID) 
        REFERENCES RANNEE(ID) ON DELETE CASCADE,
        CONSTRAINT FK_ABSENCES_ELEVES_MATRICULE FOREIGN KEY (MATRICULE) 
        REFERENCES ELEVES(MATRICULE) ON DELETE CASCADE,
        CONSTRAINT FK_ABSENCES_CLASSES FOREIGN KEY (CLASSE) 
        REFERENCES CLASSES(ID) ON DELETE CASCADE
    );
END
GO

-- =====================================================
-- TABLE RETARDS
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'RETARDS')
BEGIN
    CREATE TABLE RETARDS
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ANNEE_ID INT NOT NULL,
        MATRICULE NVARCHAR(20) NOT NULL,
        NOM NVARCHAR(200) NOT NULL,
        CLASSE INT NOT NULL,
        DATE_RETARD DATE NOT NULL,
        HEURE_ARRIVEE TIME NOT NULL,
        HEURE_PREVUE TIME NOT NULL,
        DUREE INT NOT NULL,
        -- durée en minutes
        MOTIF NVARCHAR(500) NULL,
        JUSTIFIE BIT DEFAULT 0,
        JUSTIFICATION NVARCHAR(500) NULL,
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME NULL,

        -- Clés étrangères
        CONSTRAINT FK_RETARDS_RANNEE FOREIGN KEY (ANNEE_ID) 
        REFERENCES RANNEE(ID) ON DELETE CASCADE,
        CONSTRAINT FK_RETARDS_ELEVES_MATRICULE FOREIGN KEY (MATRICULE) 
        REFERENCES ELEVES(MATRICULE) ON DELETE CASCADE,
        CONSTRAINT FK_RETARDS_CLASSES FOREIGN KEY (CLASSE) 
        REFERENCES CLASSES(ID) ON DELETE CASCADE
    );
END
GO

-- =====================================================
-- TABLE TARIFS_ECOLAGE
-- Gère les tarifs d'écolage par classe et par année scolaire
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'TARIFS_ECOLAGE')
BEGIN
    CREATE TABLE TARIFS_ECOLAGE
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ANNEE_ID INT NOT NULL,
        CLASSE_ID INT NOT NULL,
        MONTANT DECIMAL(18, 2) NOT NULL DEFAULT 0,
        DESCRIPTION NVARCHAR(200) NULL,
        STATUT BIT DEFAULT 1,
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME DEFAULT GETDATE(),

        -- Clés étrangères
        CONSTRAINT FK_TARIFS_ECOLAGE_RANNEE FOREIGN KEY (ANNEE_ID) 
            REFERENCES RANNEE(ID) ON DELETE CASCADE,
        CONSTRAINT FK_TARIFS_ECOLAGE_CLASSES FOREIGN KEY (CLASSE_ID) 
            REFERENCES CLASSES(ID) ON DELETE CASCADE,

        -- Contrainte d'unicité: un seul tarif par année et par classe
        CONSTRAINT UQ_TARIFS_ECOLAGE_ANNEE_CLASSE UNIQUE (ANNEE_ID, CLASSE_ID)
    );
END
GO

-- =====================================================
-- TABLE FRAIS
-- =====================================================

IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'FRAIS')
BEGIN
    CREATE TABLE FRAIS
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        ANNEE_ID INT NOT NULL,
        TARIF_ID UNIQUEIDENTIFIER NULL,
        MATRICULE NVARCHAR(20) NOT NULL,
        NOM NVARCHAR(100) NOT NULL,
        CLASSE INT NOT NULL,

        -- Valeurs numériques avec virgule (Precision 18, échelle 2)
        TOTAL DECIMAL(18, 2) NULL DEFAULT 0,
        PAYE DECIMAL(18, 2) NULL DEFAULT 0,

        -- Colonne calculée pour le RESTE
        RESTE AS (ISNULL(TOTAL, 0) - ISNULL(PAYE, 0)),

        MODEPAIE NVARCHAR(20) NOT NULL DEFAULT 'Especes',
        REFERENCE NVARCHAR(100) NULL,
        COMMENTAIRE NVARCHAR(MAX) NULL,

        -- Colonne calculée pour la PROGRESSION (Évite la division par zéro)
        PROGRESSION AS (
        CASE 
            WHEN ISNULL(TOTAL, 0) = 0 THEN 0 
            ELSE (ISNULL(PAYE, 0) / ISNULL(TOTAL, 0)) * 100 
        END
    ),

        -- Colonne calculée pour le STATUT
        STATUT AS (
        CASE 
            WHEN ISNULL(PAYE, 0) = 0 THEN 'Non payé'
            WHEN ISNULL(PAYE, 0) >= ISNULL(TOTAL, 0) THEN 'Terminé'
            ELSE 'En cours'
        END
    ),

        DERNIER_PAIEMENT DATETIME NULL,
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME DEFAULT GETDATE(),

        -- Clés étrangères
        CONSTRAINT FK_FRAIS_RANNEE FOREIGN KEY (ANNEE_ID) 
        REFERENCES RANNEE(ID) ON DELETE CASCADE,

        CONSTRAINT FK_FRAIS_ELEVES_MATRICULE FOREIGN KEY (MATRICULE) 
        REFERENCES ELEVES(MATRICULE) ON DELETE CASCADE,

        CONSTRAINT FK_FRAIS_CLASSES FOREIGN KEY (CLASSE) 
        REFERENCES CLASSES(ID) ON DELETE CASCADE,
        CONSTRAINT CHK_FRAIS_MODEPAIE 
        CHECK (MODEPAIE IN ('Especes', 'Cheques', 'Virement', 'MobileMoney'))
    );
END
GO

-- =====================================================
-- TABLE HISTORIQUE_PAIEMENTS
-- Stocke chaque transaction de paiement individuellement
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.tables
WHERE name = 'HISTORIQUE_PAIEMENTS')
BEGIN
    CREATE TABLE HISTORIQUE_PAIEMENTS
    (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        FRAIS_ID UNIQUEIDENTIFIER NOT NULL,
        MATRICULE NVARCHAR(20) NOT NULL,
        NOM NVARCHAR(100) NOT NULL,
        CLASSE INT NOT NULL,
        ANNEE_ID INT NOT NULL,

        -- Détails du paiement
        MOIS NVARCHAR(20) NULL,
        ANNEE NVARCHAR(10) NULL,
        MONTANT DECIMAL(18, 2) NOT NULL,
        DATE_PAIEMENT DATETIME NOT NULL,
        MODE_PAIEMENT NVARCHAR(20) NOT NULL,
        REFERENCE NVARCHAR(100) NULL,
        COMMENTAIRE NVARCHAR(MAX) NULL,

        -- Informations sur l'utilisateur qui a enregistré le paiement
        USER_ID INT NULL,
        USERNAME NVARCHAR(100) NULL,

        -- État avant paiement
        ANCIEN_TOTAL DECIMAL(18, 2) NULL,
        ANCIEN_PAYE DECIMAL(18, 2) NULL,
        ANCIEN_RESTE DECIMAL(18, 2) NULL,

        -- État après paiement
        NOUVEAU_TOTAL DECIMAL(18, 2) NULL,
        NOUVEAU_PAYE DECIMAL(18, 2) NULL,
        NOUVEAU_RESTE DECIMAL(18, 2) NULL,

        CREATED_AT DATETIME DEFAULT GETDATE(),

        -- Clés étrangères
        CONSTRAINT FK_HISTORIQUE_FRAIS FOREIGN KEY (FRAIS_ID) 
            REFERENCES FRAIS(ID),
        CONSTRAINT FK_HISTORIQUE_ELEVES_MATRICULE FOREIGN KEY (MATRICULE) 
            REFERENCES ELEVES(MATRICULE),
        CONSTRAINT FK_HISTORIQUE_CLASSES FOREIGN KEY (CLASSE) 
            REFERENCES CLASSES(ID),
        CONSTRAINT FK_HISTORIQUE_RANNEE FOREIGN KEY (ANNEE_ID) 
            REFERENCES RANNEE(ID),
        CONSTRAINT CHK_HISTORIQUE_MODE_PAIEMENT 
            CHECK (MODE_PAIEMENT IN ('Especes', 'Cheque', 'Virement', 'MobileMoney'))
    );
END
GO

-- =====================================================
-- Table pour stocker les logs d'erreurs
-- =====================================================
IF NOT EXISTS (SELECT *
FROM sys.databases
WHERE name = 'ErrorLogs')
BEGIN
    CREATE TABLE ErrorLogs
    (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        LogDate DATETIME NOT NULL,
        Level VARCHAR(10) NOT NULL,
        -- ERROR, INFO, WARNING
        Source NVARCHAR(200) NULL,
        Message NVARCHAR(MAX) NULL,
        Exception NVARCHAR(MAX) NULL,
        UserIP VARCHAR(50) NULL,
        UserName NVARCHAR(100) NULL,
        Url NVARCHAR(500) NULL,
        CreatedAt DATETIME DEFAULT GETDATE()
    );
END

-- =====================================================
-- INSERTION DES DONNÉES INITIALES
-- =====================================================

-- Insertion des ANNEE
IF NOT EXISTS (SELECT 1
FROM RANNEE)
BEGIN
    INSERT INTO RANNEE
        (ANNEE, DATE_DEBUT, DATE_FIN, CLOTURE)
    VALUES
        ('1', '2025-09-01', '2026-06-30', 0);
END

-- Insertion des USERROLE
IF NOT EXISTS (SELECT 1
FROM USERROLE)
BEGIN
    INSERT INTO USERROLE
        (ROLEID, ROLENAME)
    VALUES
        (0, 'SuperAdmin'),
        (1, 'Admin'),
        (2, 'User'),
        (3, 'Professeur'),
        (4, 'Secrétaire'),
        (5, 'Comptable');
END

-- Insertion des utilisateurs
IF NOT EXISTS (SELECT 1
FROM USERS)
BEGIN
    INSERT INTO USERS
        (USERNAME, NOM, EMAIL, PWD, ROLEID, TELEPHONE, ACTIVE)
    VALUES
        (N'SuperAdmin', N'SuperAdmin', N'admin@ecole.com', N'0', 0, N'0321234500', N'1')
    ,
END

-- Insertion des données exemples
IF NOT EXISTS (SELECT 1
FROM ELEVES)
BEGIN
    INSERT INTO [dbo].[ELEVES]
        (MATRICULE, ANNEE_ID, NOM, CLASSE, STATUT, EMAIL, TELEPHONE, DATE_NAISSANCE, GENRE, ADRESSE, PARENT)
    VALUES
        ('MAT-2024-001', '1', 'RAKOTO Jean', '2', 'actif', 'jean.rakoto@email.com', '0340011122', '2012-05-15', 'M', 'Lot IV G 12 Antananarivo', 'Rakoto Senior'),
        ('MAT-2024-002', '1', 'RANDRIA Alice', '2', 'actif', 'alice.rand@email.com', '0320033344', '2013-02-20', 'F', 'Cité des 67ha', 'Mme Randria'),
        ('MAT-2024-003', '1', 'ANDRY Solo', '2', 'suspendu', 'solo.andry@email.com', '0334455566', '2006-11-10', 'M', 'Analamahitsy P.78', 'Andry Père'),
        ('MAT-2024-004', '1', 'PEREIRA Maria', '2', 'actif', 'maria.p@email.com', '0345566677', '2007-01-05', 'F', 'Ambohibao Sud', 'Pereira Manuel'),
        ('MAT-2024-005', '1', 'RASOA Marie', '2', 'actif', 'marie.rasoa@email.com', '0341122233', '2011-03-12', 'F', 'Sabotsy Namehana', 'Rasoa Pierre'),
        ('MAT-2024-006', '1', 'MANITRA Tahina', '2', 'actif', 'tahina.m@email.com', '0324455566', '2010-07-25', 'M', 'Ivato Aéroport', 'Manitra David'),
        ('MAT-2024-007', '1', 'RAVELO Fano', '2', 'inactif', 'fano.r@email.com', '0337788899', '2012-12-01', 'M', 'Tanjombato', 'Ravelo Jean'),
        ('MAT-2024-008', '1', 'SITRAKA Noella', '2', 'actif', 'noella.s@email.com', '0348899900', '2013-05-30', 'F', 'Itaosy', 'Mme Sitraka'),
        ('MAT-2024-009', '1', 'HARINAIVO Luc', '2', 'suspendu', 'luc.h@email.com', '0321112233', '2008-09-14', 'M', 'Ambohipo', 'Harinaivo Paul'),
        ('MAT-2024-010', '1', 'ANDRIANINA Mamy', '2', 'actif', 'mamy.a@email.com', '0332223344', '2009-10-10', 'M', 'Besarety', 'Andrianina Eric'),
        ('MAT-2024-011', '1', 'ZAFY Louise', '2', 'actif', 'louise.z@email.com', '0343334455', '2014-01-20', 'F', 'Ampefiloha', 'Zafy Marc'),
        ('MAT-2024-012', '1', 'TOJO Kely', '2', 'actif', 'tojo.k@email.com', '0325556677', '2012-04-18', 'M', 'Anosizato', 'Mme Tojo'),
        ('MAT-2024-013', '1', 'MIALISOA Fitia', '2', 'actif', 'fitia.m@email.com', '0336667788', '2011-11-22', 'F', 'Manjakaray', 'Mialisoa Robert'),
        ('MAT-2024-014', '1', 'NIRINA Bakoly', '2', 'inactif', 'bakoly.n@email.com', '0347778899', '2010-06-05', 'F', 'Ambanidia', 'Nirina Simon'),
        ('MAT-2024-015', '1', 'TSIRY Arnaud', '2', 'actif', 'arnaud.t@email.com', '0329990011', '2009-08-12', 'M', 'Ambohidratrimo', 'Tsiry Gerard'),
        ('MAT-2024-016', '1', 'VONY Clara', '2', 'suspendu', 'clara.v@email.com', '0330001122', '2007-03-25', 'F', 'Alasora', 'Vony Jacques'),
        ('MAT-2024-017', '1', 'MAMY Henri', '2', 'actif', 'henri.m@email.com', '0342224466', '2012-05-02', 'M', 'Isoraka', 'Mme Henriette'),
        ('MAT-2024-018', '1', 'LALAO Martine', '2', 'actif', 'martine.l@email.com', '0323335577', '2013-07-14', 'F', 'Andravoahangy', 'Lalao Francois'),
        ('MAT-2024-019', '1', 'HASINA Ranto', '2', 'actif', 'ranto.h@email.com', '0334446688', '2008-02-28', 'M', 'Analamahitsy', 'Hasina Alain'),
        ('MAT-2024-020', '1', 'SOA Volana', '2', 'actif', 'volana.s@email.com', '0345557799', '2011-09-09', 'F', 'Ambohibao Sud', 'Soa Thomas'),
        ('MAT-2024-021', '1', 'DIMBY Herisoa', '2', 'inactif', 'dimby.h@email.com', '0326668800', '2010-01-15', 'M', 'Ambohimanarina', 'Dimby Jean-Noel'),
        ('MAT-2024-022', '1', 'FANJA Dina', '2', 'actif', 'dina.f@email.com', '0337779911', '2012-10-31', 'F', '67ha Nord', 'Fanja Pascal'),
        ('MAT-2024-023', '1', 'RAOUL Julien', '2', 'actif', 'julien.r@email.com', '0348880022', '2013-04-12', 'M', 'Mahamasina', 'Mme Raoul'),
        ('MAT-2024-024', '1', 'KOLOINA Sarah', '2', 'actif', 'sarah.k@email.com', '0321113355', '2009-05-20', 'F', 'Ankadifotsy', 'Koloina Felix');
END

-- Insérer des données de frais pour les élèves existants (si nécessaire)
INSERT INTO FRAIS
    (ANNEE_ID, MATRICULE, NOM, CLASSE, TOTAL, PAYE)
SELECT
    (SELECT TOP 1
        ID
    FROM RANNEE
    WHERE CLOTURE = 0),
    MATRICULE,
    NOM,
    CLASSE,
    500000.00, -- Montant total des frais
    0.00
-- Montant déjà payé
FROM ELEVES
WHERE NOT EXISTS (SELECT 1
FROM FRAIS
WHERE FRAIS.MATRICULE = ELEVES.MATRICULE)

-- =====================================================
-- INSERTION SIMPLE POUR BULLETINS
-- =====================================================
-- Version plus courte avec les 10 premiers élèves
INSERT INTO BULLETINS
    (ANNEE_ID, MATRICULE, NOM, CLASSE, MATIERE_ID, NOTE, PERIODE, COMMENTAIRE)
VALUES
    (1, 'MAT-2024-001', 'RAKOTO Jean', 2, '4F387ADE-E00E-4220-9B91-E3DFF8E579CC', 15.5, 'T1', 'Bon travail'),
    (1, 'MAT-2024-002', 'RANDRIA Alice', 2, '4F387ADE-E00E-4220-9B91-E3DFF8E579CC', 17.5, 'T1', 'Excellente'),
    (1, 'MAT-2024-004', 'PEREIRA Maria', 2, '4F387ADE-E00E-4220-9B91-E3DFF8E579CC', 14.0, 'T1', 'Bon travail');

CREATE VIEW VW_BULLETINS
AS
    SELECT
        b.ID,
        b.ANNEE_ID,
        r.ANNEE AS ANNEE_TEXTE,
        b.MATRICULE,
        b.NOM,
        b.CLASSE,
        c.NOM AS CLASSE_NOM,
        b.MATIERE_ID,
        m.NOM AS MATIERE_NOM,
        m.ENSEIGNANT,
        u.NOM AS ENSEIGNANT_NOM,
        m.COEFFICIENT,
        b.NOTE,
        (b.NOTE * m.COEFFICIENT) AS NOTE_PONDEREE,
        b.PERIODE,
        b.COMMENTAIRE,
        b.CREATED_AT,
        b.UPDATED_AT
    FROM BULLETINS b
        LEFT JOIN RANNEE r ON b.ANNEE_ID = r.ID
        LEFT JOIN CLASSES c ON b.CLASSE = c.ID
        LEFT JOIN MATIERES m ON b.MATIERE_ID = m.ID
        LEFT JOIN USERS u ON m.ENSEIGNANT = u.IDUSER
GO