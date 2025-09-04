@echo off
cd %~dp0
if not exist node_modules (
    npm install express axios yahoo-finance2
)
node server.js
pause
