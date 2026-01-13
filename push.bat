@echo off
REM ============================================
REM   Auto Push Script for pdf-editor-v17-4
REM   A placer dans: C:\Users\loria\OneDrive\Desktop\pdf-editor-17-4
REM ============================================

REM 1) Aller dans le dossier du script
cd /d "%~dp0"

echo Current directory:
cd
echo.

REM 1.5) Marquer ce repo comme “safe” pour Git (problème de ownership)
git config --global --add safe.directory C:/Users/loria/OneDrive/Desktop/pdf-editor-17-4

echo.
REM 2) Si pas encore repo Git, initialiser et mettre le remote
IF NOT EXIST ".git" (
    echo .git folder not found. Initializing new Git repository...
    git init
    git remote add origin https://github.com/louecyn/pdf-editor-17-4.git
) ELSE (
    echo .git folder found. Using existing Git repository.
)

echo.
REM 3) Config identité pour ce repo
git config user.name "Loue"
git config user.email "louecyn@users.noreply.github.com"

echo.
REM 4) Ajouter tous les fichiers
git add -A

echo.
REM 5) Commit si changements
git commit -m "Auto commit v16-12" || echo No changes to commit, skipping commit step.

echo.
REM 6) Forcer la branche main
git branch -M main

echo.
REM 7) Push vers GitHub
git push -u origin main

echo.
echo ============================================
echo          PUSH ATTEMPT FINISHED
echo  If you see errors above, copy them for GPT.
echo ============================================
pause
