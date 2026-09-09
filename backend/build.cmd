@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-23
set PATH=%JAVA_HOME%\bin;E:\apache-maven-3.9.16-bin\apache-maven-3.9.16\bin;%PATH%
echo Building Spring Boot application...
call mvn clean package -DskipTests
echo Build finished with exit code: %ERRORLEVEL%
