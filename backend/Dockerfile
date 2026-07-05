# ── Stage 1: Build ───────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean install -DskipTests -B

# ── Stage 2: Run ─────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the built jar from stage 1
COPY --from=build /app/target/platform-1.0.0.jar app.jar

# Render sets PORT automatically
EXPOSE 5000

ENTRYPOINT ["java", "-jar", "app.jar"]
