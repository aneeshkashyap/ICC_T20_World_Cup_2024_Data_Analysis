@echo off
echo ================================================
echo   ICC T20 Dashboard - Git Commit and Push
echo ================================================
echo.

REM Try the main path first (no parentheses copy)
if exist "c:\Users\Mirunalini_Anushree\Downloads\ICC_T20_World_Cup_2024_Data_Analysis-main (2)\ICC_T20_World_Cup_2024_Data_Analysis\.git" (
    cd /d "c:\Users\Mirunalini_Anushree\Downloads\ICC_T20_World_Cup_2024_Data_Analysis-main (2)\ICC_T20_World_Cup_2024_Data_Analysis"
) else (
    cd /d "c:\Users\Mirunalini_Anushree\Downloads\ICC_T20_World_Cup_2024_Data_Analysis-main\ICC_T20_World_Cup_2024_Data_Analysis"
)

echo Current directory: %CD%
echo.
echo === GIT REMOTE ===
git remote -v
echo.
echo === GIT STATUS ===
git status
echo.
echo === ADDING ALL CHANGES ===
git add -A
echo.
echo === COMMITTING ===
git commit -m "feat: premium dashboard upgrade - glow effects, animated transitions, rich insight text with stats, ambient orbs, enhanced compare UI"
echo.
echo === PUSHING TO GITHUB (main branch) ===
git push origin main
echo.
echo ================================================
echo   DONE! Check output above for success.
echo   Your 10K badge contribution has been pushed!
echo ================================================
pause
