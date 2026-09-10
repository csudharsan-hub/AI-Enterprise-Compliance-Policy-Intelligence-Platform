@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-23
set PATH=%JAVA_HOME%\bin;%PATH%
echo Starting ComplianceAI Spring Boot Server...
"C:\Program Files\Java\jdk-23\bin\java.exe" -jar target\platform-1.0.0.jar
