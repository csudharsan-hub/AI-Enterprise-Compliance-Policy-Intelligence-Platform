# ── Stage 1: Build ───────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy maven wrapper and pom first for dependency caching
COPY backend/pom.xml .
COPY backend/.mvn .mvn
COPY backend/mvnw .
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B || mvn dependency:go-offline -B

# Copy source and build
COPY backend/src ./src
RUN mvn clean install -DskipTests -B

# ── Stage 2: Run ─────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/platform-1.0.0.jar app.jar

EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]
