@echo off
set "src=C:\Program Files\Microsoft SQL Server\MSSQL14.SQLECOLE\MSSQL\Backup"
set "dest=E:\ONYX\LOGS\PROJET\MONAPPECOLE2.0\backup"

:: /MIR : Miroir (garde la destination identique a la source)
:: /R:3 : Reessaie 3 fois en cas d'echec
:: /W:5 : Attend 5 secondes entre chaque essai
:: /LOG+:backup_log.txt : Enregistre l'historique dans un fichier texte
robocopy "%src%" "%dest%" /MIR /R:3 /W:5 /LOG+:"E:\ONYX\LOGS\PROJET\MONAPPECOLE2.0\backup\logs\backup_history.txt" /NP