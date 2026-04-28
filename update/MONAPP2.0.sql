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
-- TABLE ANNEE
-- ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RANNEE')
BEGIN
    CREATE TABLE [dbo].[RANNEE] (
        ID           INT           IDENTITY(1,1) PRIMARY KEY,
        ANNEE        NVARCHAR(9)   NOT NULL,        -- ex: "1"
        DATE_DEBUT   DATE          NOT NULL,
        DATE_FIN     DATE          NOT NULL,
        CLOTURE      BIT           NOT NULL DEFAULT 0,
        DATE_CLOTURE DATETIME      NULL,
        CREATED_AT   DATETIME      NOT NULL DEFAULT GETDATE(),
    );
END
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
        
        -- On utilise 'ID_ANNEE' pour être explicite, ou on garde 'ANNEE' 
        -- mais il faut être cohérent avec la contrainte plus bas.
        ANNEE_ID INT NOT NULL, 
        
        MATRICULE NVARCHAR(20) UNIQUE NOT NULL,
        NOM NVARCHAR(100) NOT NULL,
        CLASSE UNIQUEIDENTIFIER NOT NULL,
        
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
-- TABLE CLASSES
-- =====================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CLASSES')
BEGIN
    CREATE TABLE CLASSES (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NOM NVARCHAR(50) UNIQUE NOT NULL,
        
        -- Clés Étrangères en UNIQUEIDENTIFIER (GUID)
        NIVEAU_ID UNIQUEIDENTIFIER NOT NULL, 
        SALLE_ID UNIQUEIDENTIFIER NOT NULL,
        
        -- Relation avec l'enseignant titulaire (INT selon votre table USERROLE)
        TITULAIRE_ID INT NOT NULL,
        
        EFFECTIF INT DEFAULT 0,
        STATUT BIT NOT NULL DEFAULT 1, -- 1 pour Actif, 0 pour Inactif
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
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MATIERES')
BEGIN
    CREATE TABLE MATIERES (
        ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        NOM NVARCHAR(100) UNIQUE NOT NULL,
        ENSEIGNANT INT NOT NULL,
        COEFFICIENT DECIMAL(3,1) DEFAULT 1.0,
        HEURES_SEMAINE INT DEFAULT 3,
        NIVEAU UNIQUEIDENTIFIER NOT NULL, -- Correction : Ajout du 'NULL' manquant
        CREATED_AT DATETIME DEFAULT GETDATE(), -- Correction : Ajout d'une virgule ici

        CONSTRAINT FK_MATIERES_NIVEAU FOREIGN KEY (NIVEAU) 
            REFERENCES NIVEAUX(ID),

        CONSTRAINT FK_MATIERES_USERS FOREIGN KEY (ENSEIGNANT) 
            REFERENCES USERS(IDUSER) -- Vérifié : IDUSER est bien la clé primaire 
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

-- Insertion des ANNEE
IF NOT EXISTS (SELECT 1 FROM RANNEE)
BEGIN
    INSERT INTO RANNEE (ANNEE, DATE_DEBUT, DATE_FIN, CLOTURE)
    VALUES ('1', '2025-09-01', '2026-06-30', 0);
END

-- Insertion des USERROLE
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
END

-- Insertion des données exemples
IF NOT EXISTS (SELECT 1 FROM ELEVES)
BEGIN
INSERT INTO [dbo].[ELEVES] 
    (MATRICULE, ANNEE_ID, NOM, CLASSE, STATUT, EMAIL, TELEPHONE, DATE_NAISSANCE, GENRE, ADRESSE, PARENT)
VALUES 
    ('MAT-2024-001', '1', 'RAKOTO Jean', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'jean.rakoto@email.com', '0340011122', '2012-05-15', 'M', 'Lot IV G 12 Antananarivo', 'Rakoto Senior'),
    ('MAT-2024-002', '1', 'RANDRIA Alice', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'alice.rand@email.com', '0320033344', '2013-02-20', 'F', 'Cité des 67ha', 'Mme Randria'),
    ('MAT-2024-003', '1', 'ANDRY Solo', 'EE49A440-A695-4233-B42E-65FF13284634', 'suspendu', 'solo.andry@email.com', '0334455566', '2006-11-10', 'M', 'Analamahitsy P.78', 'Andry Père'),
    ('MAT-2024-004', '1', 'PEREIRA Maria', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'maria.p@email.com', '0345566677', '2007-01-05', 'F', 'Ambohibao Sud', 'Pereira Manuel'),
    ('MAT-2024-005', '1', 'RASOA Marie', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'marie.rasoa@email.com', '0341122233', '2011-03-12', 'F', 'Sabotsy Namehana', 'Rasoa Pierre'),
    ('MAT-2024-006', '1', 'MANITRA Tahina', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'tahina.m@email.com', '0324455566', '2010-07-25', 'M', 'Ivato Aéroport', 'Manitra David'),
    ('MAT-2024-007', '1', 'RAVELO Fano', 'EE49A440-A695-4233-B42E-65FF13284634', 'inactif', 'fano.r@email.com', '0337788899', '2012-12-01', 'M', 'Tanjombato', 'Ravelo Jean'),
    ('MAT-2024-008', '1', 'SITRAKA Noella', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'noella.s@email.com', '0348899900', '2013-05-30', 'F', 'Itaosy', 'Mme Sitraka'),
    ('MAT-2024-009', '1', 'HARINAIVO Luc', 'EE49A440-A695-4233-B42E-65FF13284634', 'suspendu', 'luc.h@email.com', '0321112233', '2008-09-14', 'M', 'Ambohipo', 'Harinaivo Paul'),
    ('MAT-2024-010', '1', 'ANDRIANINA Mamy', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'mamy.a@email.com', '0332223344', '2009-10-10', 'M', 'Besarety', 'Andrianina Eric'),
    ('MAT-2024-011', '1', 'ZAFY Louise', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'louise.z@email.com', '0343334455', '2014-01-20', 'F', 'Ampefiloha', 'Zafy Marc'),
    ('MAT-2024-012', '1', 'TOJO Kely', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'tojo.k@email.com', '0325556677', '2012-04-18', 'M', 'Anosizato', 'Mme Tojo'),
    ('MAT-2024-013', '1', 'MIALISOA Fitia', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'fitia.m@email.com', '0336667788', '2011-11-22', 'F', 'Manjakaray', 'Mialisoa Robert'),
    ('MAT-2024-014', '1', 'NIRINA Bakoly', 'EE49A440-A695-4233-B42E-65FF13284634', 'inactif', 'bakoly.n@email.com', '0347778899', '2010-06-05', 'F', 'Ambanidia', 'Nirina Simon'),
    ('MAT-2024-015', '1', 'TSIRY Arnaud', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'arnaud.t@email.com', '0329990011', '2009-08-12', 'M', 'Ambohidratrimo', 'Tsiry Gerard'),
    ('MAT-2024-016', '1', 'VONY Clara', 'EE49A440-A695-4233-B42E-65FF13284634', 'suspendu', 'clara.v@email.com', '0330001122', '2007-03-25', 'F', 'Alasora', 'Vony Jacques'),
    ('MAT-2024-017', '1', 'MAMY Henri', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'henri.m@email.com', '0342224466', '2012-05-02', 'M', 'Isoraka', 'Mme Henriette'),
    ('MAT-2024-018', '1', 'LALAO Martine', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'martine.l@email.com', '0323335577', '2013-07-14', 'F', 'Andravoahangy', 'Lalao Francois'),
    ('MAT-2024-019', '1', 'HASINA Ranto', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'ranto.h@email.com', '0334446688', '2008-02-28', 'M', 'Analamahitsy', 'Hasina Alain'),
    ('MAT-2024-020', '1', 'SOA Volana', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'volana.s@email.com', '0345557799', '2011-09-09', 'F', 'Ambohibao Sud', 'Soa Thomas'),
    ('MAT-2024-021', '1', 'DIMBY Herisoa', 'EE49A440-A695-4233-B42E-65FF13284634', 'inactif', 'dimby.h@email.com', '0326668800', '2010-01-15', 'M', 'Ambohimanarina', 'Dimby Jean-Noel'),
    ('MAT-2024-022', '1', 'FANJA Dina', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'dina.f@email.com', '0337779911', '2012-10-31', 'F', '67ha Nord', 'Fanja Pascal'),
    ('MAT-2024-023', '1', 'RAOUL Julien', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'julien.r@email.com', '0348880022', '2013-04-12', 'M', 'Mahamasina', 'Mme Raoul'),
    ('MAT-2024-024', '1', 'KOLOINA Sarah', 'EE49A440-A695-4233-B42E-65FF13284634', 'actif', 'sarah.k@email.com', '0321113355', '2009-05-20', 'F', 'Ankadifotsy', 'Koloina Felix');
END

-- Vérification
SELECT * FROM ELEVES;