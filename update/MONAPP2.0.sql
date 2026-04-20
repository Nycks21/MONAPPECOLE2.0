-- =====================================================
-- GESTION SCOLAIRE - BASE DE DONNÉES COMPLÈTE
-- =====================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'MONAPPECOLE2')
BEGIN
    CREATE DATABASE MONAPPECOLE2;
END
GO

USE MONAPPECOLE2;
GO

-- ─────────────────────────────────────────────────
-- TABLE NIVEAUX (Doit être créée avant CLASSES)
-- ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NIVEAUX')
BEGIN
    CREATE TABLE NIVEAUX (
        ID         UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NOM        NVARCHAR(50)  NOT NULL UNIQUE,
        ORDRE      INT           DEFAULT 0,
        STATUT     BIT           NOT NULL DEFAULT 1,
        CREATED_AT DATETIME      DEFAULT GETDATE()
    );
END
GO

-- ─────────────────────────────────────────────────
-- TABLE SALLES
-- ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SALLES')
BEGIN
    CREATE TABLE SALLES (
        ID         UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NUMERO     NVARCHAR(50)  NOT NULL UNIQUE,
        CAPACITE   INT           DEFAULT 30,
        STATUT     BIT           NOT NULL DEFAULT 1,
        CREATED_AT DATETIME      DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- TABLE ÉLÈVES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ELEVES')
BEGIN
    CREATE TABLE ELEVES (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        MATRICULE NVARCHAR(20) UNIQUE NOT NULL,
        NOM NVARCHAR(100) NOT NULL,
        CLASSE NVARCHAR(50) NOT NULL,
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
        UPDATED_AT DATETIME DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- TABLE CLASSES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CLASSES')
BEGIN
    CREATE TABLE CLASSES (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NOM NVARCHAR(50) UNIQUE NOT NULL,
        NIVEAU_ID UNIQUEIDENTIFIER NOT NULL, 
        EFFECTIF INT DEFAULT 0,
        TITULAIRE NVARCHAR(100),
        SALLE_ID UNIQUEIDENTIFIER NOT NULL,
        STATUT BIT NOT NULL DEFAULT 1,
        CREATED_AT DATETIME DEFAULT GETDATE(),

        CONSTRAINT FK_CLASSES_NIVEAU FOREIGN KEY (NIVEAU_ID) 
            REFERENCES NIVEAUX(ID),
        
        CONSTRAINT FK_CLASSES_SALLE FOREIGN KEY (SALLE_ID) 
            REFERENCES SALLES(ID)
    );
END
GO

-- =====================================================
-- TABLE MATIÈRES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MATIERES')
BEGIN
    CREATE TABLE MATIERES (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        NOM NVARCHAR(100) UNIQUE NOT NULL,
        ENSEIGNANT NVARCHAR(100) NOT NULL,
        COEFFICIENT DECIMAL(3,1) DEFAULT 1.0,
        HEURES_SEMAINE INT DEFAULT 3,
        NIVEAU NVARCHAR(50) DEFAULT 'Tous niveaux',
        CREATED_AT DATETIME DEFAULT GETDATE()
    );
END
GO

-- =====================================================
-- TABLE USERROLE
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'USERROLE')
BEGIN
    CREATE TABLE USERROLE (
        ROLEID INT PRIMARY KEY,
        ROLENAME VARCHAR(50) NOT NULL UNIQUE
    );
END
GO

-- =====================================================
-- TABLE USERS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'USERS')
BEGIN
    CREATE TABLE USERS (
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

        CONSTRAINT FK_USER_ROLE FOREIGN KEY (ROLEID) REFERENCES USERROLE(ROLEID)
    );
END
GO

-- =====================================================
-- TABLE BULLETINS
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BULLETINS')
BEGIN
    CREATE TABLE BULLETINS (
        ID INT IDENTITY(1,1) PRIMARY KEY,
        ELEVE_MATRICULE NVARCHAR(20) NOT NULL,
        MATIERE_NOM NVARCHAR(100) NOT NULL,
        ENSEIGNANT NVARCHAR(100) NOT NULL,
        NOTE DECIMAL(4,1) CHECK (NOTE BETWEEN 0 AND 20),
        COEFFICIENT DECIMAL(3,1) DEFAULT 1.0,
        PERIODE NVARCHAR(10)
            CHECK (PERIODE IN ('T1','T2','T3','Sem1','Sem2')),
        COMMENTAIRE NVARCHAR(MAX),
        CREATED_AT DATETIME DEFAULT GETDATE(),
        UPDATED_AT DATETIME DEFAULT GETDATE(),

        FOREIGN KEY (ELEVE_MATRICULE) REFERENCES ELEVES(MATRICULE) ON DELETE CASCADE,
        FOREIGN KEY (MATIERE_NOM) REFERENCES MATIERES(NOM) ON DELETE CASCADE,
        CONSTRAINT UQ_BULLETIN UNIQUE (ELEVE_MATRICULE, MATIERE_NOM, PERIODE)
    );
END
GO

-- ─────────────────────────────────────────────────
-- DONNÉES INITIALES — NIVEAUX
-- (cohérentes avec les données déjà insérées dans CLASSES)
-- ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM NIVEAUX)
BEGIN
    INSERT INTO NIVEAUX (NOM, ORDRE, STATUT) VALUES
    (N'6ème',      1, 1),
    (N'5ème',      2, 1),
    (N'4ème',      3, 1),
    (N'3ème',      4, 1),
    (N'2nde',      5, 1),
    (N'1ère',      6, 1),
    (N'Terminale', 7, 1);
END
GO

-- ─────────────────────────────────────────────────
-- DONNÉES INITIALES — SALLES
-- (cohérentes avec les données déjà insérées dans CLASSES)
-- ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM SALLES)
BEGIN
    INSERT INTO SALLES (NUMERO, CAPACITE, STATUT) VALUES
    (N'Salle 101', 35, 1),
    (N'Salle 102', 35, 1),
    (N'Salle 201', 35, 1),
    (N'Salle 202', 35, 1),
    (N'Salle 203', 35, 1),
    (N'Salle 301', 35, 1),
    (N'Salle 401', 40, 1),
    (N'Salle 402', 40, 1),
    (N'Salle 403', 40, 1),
    (N'Salle 404', 40, 1);
END
GO

-- Table pour stocker les logs d'erreurs
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ErrorLogs')
BEGIN
    CREATE TABLE ErrorLogs (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        LogDate DATETIME NOT NULL,
        Level VARCHAR(10) NOT NULL, -- ERROR, INFO, WARNING
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

-- Insertion des classes
IF NOT EXISTS (SELECT 1 FROM CLASSES)
BEGIN
    INSERT INTO CLASSES (NOM, NIVEAU, EFFECTIF, TITULAIRE, SALLE, STATUT) VALUES
    ('6ème A', '6ème', 32, 'Mme RABE', 'Salle 101', N'1'),
    ('6ème B', '6ème', 30, 'M. RAKOTO', 'Salle 102', N'1'),
    ('5ème A', '5ème', 28, 'Mme RAVELO', 'Salle 201', N'1'),
    ('5ème B', '5ème', 29, 'M. ANDRIA', 'Salle 202', N'1'),
    ('4ème A', '4ème', 27, 'Mme RALISON', 'Salle 203', N'1'),
    ('3ème A', '3ème', 25, 'M. RANDRIAN', 'Salle 301', N'1'),
    ('2nde A', '2nde', 35, 'Mme RABE', 'Salle 401', N'1'),
    ('1ère A', '1ère', 30, 'M. RAKOTO', 'Salle 402', N'1'),
    ('Tle C', 'Terminale', 28, 'Mme RAVELO', 'Salle 403', N'1'),
    ('Tle D', 'Terminale', 26, 'M. ANDRIA', 'Salle 404', N'1');
END

-- Insertion des matières
IF NOT EXISTS (SELECT 1 FROM MATIERES)
BEGIN
    INSERT INTO MATIERES (NOM, ENSEIGNANT, COEFFICIENT, HEURES_SEMAINE, NIVEAU) VALUES
    ('Mathématiques', 'M. RAKOTO', 5, 5, 'Tous niveaux'),
    ('Français', 'Mme RABE', 4, 4, 'Tous niveaux'),
    ('Anglais', 'M. ANDRIA', 3, 3, 'Tous niveaux'),
    ('Physique-Chimie', 'Mme RAVELO', 4, 4, 'Lycée'),
    ('SVT', 'M. RANDRIAN', 4, 3, 'Tous niveaux'),
    ('Histoire-Géo', 'Mme RALISON', 3, 3, 'Tous niveaux');
END

IF NOT EXISTS (SELECT 1 FROM USERROLE)
BEGIN
    INSERT INTO USERROLE (ROLEID, ROLENAME)VALUES
    (0, 'SuperAdmin'),
    (1, 'Admin'),
    (2, 'User'),
    (3, 'Professeur'),
    (4, 'Secrétaire'),
    (5, 'Comptable');
END

-- Insertion des utilisateurs
IF NOT EXISTS (SELECT 1 FROM USERS)
BEGIN
    INSERT INTO USERS (USERNAME, NOM, EMAIL, PWD, ROLEID, TELEPHONE, ACTIVE)
    VALUES
    (N'SuperAdmin', N'SuperAdmin', N'admin@ecole.com', N'0', 0, N'0321234500', N'1'),
    (N'RAKOTO', N'RAKOTO', N'prof.rakoto@ecole.com', N'1', 3, N'0321234501', N'1');
END

-- Insertion des élèves
IF NOT EXISTS (SELECT 1 FROM ELEVES)
BEGIN
    INSERT INTO ELEVES (MATRICULE, NOM, CLASSE, STATUT, EMAIL, TELEPHONE, DATE_NAISSANCE, GENRE, ADRESSE, PARENT, DATE_INSCRIPTION) VALUES
    ('2024001', 'Jean RAKOTO', '3ème A', 'actif', 'jean.rakoto@ecole.com', '0321234567', '2010-05-12', 'M', 'Antananarivo', 'M. RAKOTO', '2024-01-15'),
    ('2024002', 'Marie RABE', '5ème B', 'actif', 'marie.rabe@ecole.com', '0321234568', '2009-08-23', 'F', 'Antananarivo', 'Mme RABE', '2024-01-15'),
    ('2024003', 'Paul ANDRIA', '2nde A', 'actif', 'paul.andria@ecole.com', '0321234569', '2008-11-05', 'M', 'Antsirabe', 'M. ANDRIA', '2024-01-16'),
    ('2024004', 'Sophie RAVO', '4ème C', 'inactif', 'sophie.ravo@ecole.com', '0321234570', '2009-02-18', 'F', 'Fianarantsoa', 'Mme RAVO', '2024-01-14'),
    ('2024005', 'Luc RADO', '6ème B', 'actif', 'luc.rado@ecole.com', '0321234571', '2011-07-30', 'M', 'Toamasina', 'M. RADO', '2024-01-17');
END

-- Insertion des frais scolaires
IF NOT EXISTS (SELECT 1 FROM FRAIS_SCOLAIRES)
BEGIN
    INSERT INTO FRAIS_SCOLAIRES (ELEVE_MATRICULE, MONTANT_TOTAL, PAYE, DERNIER_PAIEMENT, STATUT) VALUES
    ('2024001', 250000, 150000, '2024-03-15', 'Partiel'),
    ('2024002', 250000, 250000, '2024-03-20', 'Payé'),
    ('2024003', 250000, 80000, '2024-02-10', 'En retard'),
    ('2024004', 250000, 200000, '2024-03-10', 'Partiel'),
    ('2024005', 250000, 250000, '2024-03-18', 'Payé');
END

-- Insertion des bulletins
IF NOT EXISTS (SELECT 1 FROM BULLETINS)
BEGIN
    INSERT INTO BULLETINS (ELEVE_MATRICULE, MATIERE_NOM, ENSEIGNANT, NOTE, COEFFICIENT, PERIODE) VALUES
    ('2024001', 'Mathématiques', 'M. RAKOTO', 15, 5, 'T1'),
    ('2024001', 'Français', 'Mme RABE', 14, 4, 'T1'),
    ('2024002', 'Mathématiques', 'M. RAKOTO', 17, 5, 'T1'),
    ('2024002', 'Français', 'Mme RABE', 16, 4, 'T1');
END

-- Insertion des absences
IF NOT EXISTS (SELECT 1 FROM CLASSES)
BEGIN
    INSERT INTO ABSENCES_RETARDS (ELEVE_MATRICULE, TYPE_ENUM, DATE_ABSENCE, DUREE, MOTIF, JUSTIFIE) VALUES
    ('2024001', 'absence', '2024-03-10', 1, 'Maladie', 'non'),
    ('2024001', 'retard', '2024-03-12', 0.5, 'Transport', 'non'),
    ('2024002', 'absence', '2024-03-05', 1, 'Rendez-vous médical', 'oui');
END