@echo off
REM Generate real screenshots using Playwright (Windows).
REM Requirements: Node.js installed.

cd /d %~dp0\..
call npm i -D playwright
call npx playwright install chromium
node tools\screenshot-playwright.mjs

echo.
echo Done. Check the "screenshots" folder.
pause
