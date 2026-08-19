@echo off
setlocal
set MAVEN_DIR=%~dp0.mvn\apache-maven-3.9.6
set MAVEN_ZIP=%~dp0.mvn\apache-maven-3.9.6-bin.zip
set MAVEN_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip

if not exist "%MAVEN_DIR%\bin\mvn.cmd" (
    echo [SmartPOS] Preparing Maven build tools...
    powershell -Command "if (-not (Test-Path '%MAVEN_ZIP%')) { (New-Object Net.WebClient).DownloadFile('%MAVEN_URL%', '%MAVEN_ZIP%') }; Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%~dp0.mvn' -Force"
)

"%MAVEN_DIR%\bin\mvn.cmd" %*
endlocal
