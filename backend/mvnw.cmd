@ECHO OFF
SETLOCAL
SET "WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar"
IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Maven Wrapper JAR is missing: %WRAPPER_JAR%
  EXIT /B 1
)
java -Dmaven.multiModuleProjectDirectory="%CD%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
EXIT /B %ERRORLEVEL%
