-- =====================================================
-- PARAMÈTRES GÉNÉRAUX : NIVEAUX & SALLES
-- Base : MONAPPECOLE2
-- =====================================================

USE MONAPPECOLE2;
GO

-- ─────────────────────────────────────────────────
-- TABLE NIVEAUX
-- ─────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NIVEAUX')
BEGIN
    CREATE TABLE NIVEAUX (
        ID         INT IDENTITY(1,1) PRIMARY KEY,
        NOM        NVARCHAR(50)  NOT NULL UNIQUE,
        ORDRE      INT           DEFAULT 0,          -- pour le tri (6ème=1, 5ème=2 ...)
        STATUT     BIT           NOT NULL DEFAULT 1, -- 1=actif 0=inactif
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
        ID         INT IDENTITY(1,1) PRIMARY KEY,
        NUMERO     NVARCHAR(50)  NOT NULL UNIQUE,    -- ex : "Salle 101"
        CAPACITE   INT           DEFAULT 30,
        STATUT     BIT           NOT NULL DEFAULT 1,
        CREATED_AT DATETIME      DEFAULT GETDATE()
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
