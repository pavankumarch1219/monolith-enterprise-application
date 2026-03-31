# ============================================================
# Snowman Enterprise App - Multi-Stage Dockerfile
# Stage 1: Build (Maven + Java 7)
# Stage 2: Run (slim JRE)
# ============================================================

# --- BUILD STAGE ---
FROM maven:3.6.3-jdk-8 AS builder

WORKDIR /app

# Copy pom first for layer caching of dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src
COPY run.sh .

# Build Uber JAR (skip tests for Docker build; tests run in CI)
RUN mvn clean package -DskipTests -B

# --- RUN STAGE ---
FROM openjdk:8-jre-slim

LABEL maintainer="devops-team"
LABEL app="snowman-enterprise"
LABEL version="1.0"

WORKDIR /app

# Create non-root user for security
RUN groupadd -r snowman && useradd -r -g snowman snowman

# Copy built artifact from builder
COPY --from=builder /app/target/Snowman.jar ./Snowman.jar

# Change ownership
RUN chown -R snowman:snowman /app
USER snowman

# Default port (Embedded Jetty)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["java", "-Xms256m", "-Xmx1024m", "-jar", "Snowman.jar"]
