# ============================================================
# Snowman Enterprise App — Multi-stage Dockerfile
# Registry : DockerHub  (no ACR needed)
# JDK      : 8  (matches maven:3.6.3-jdk-8 in compose stack)
# ============================================================

# ── Stage 1 · Build ─────────────────────────────────────────
FROM maven:3.6.3-jdk-8 AS builder

WORKDIR /app

# Cache dependency layer — re-runs only when pom.xml changes
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B -q \
 && echo "Built JAR:" \
 && ls -lh target/*.jar

# ── Stage 2 · Runtime (slim JRE 8 alpine) ───────────────────
FROM openjdk:8-jre-alpine

WORKDIR /app

# Non-root user
RUN addgroup -S snowman && adduser -S snowman -G snowman

COPY --from=builder /app/target/*.jar app.jar
RUN chown snowman:snowman app.jar

USER snowman

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENV JAVA_OPTS="-Xms256m -Xmx768m -XX:+UseG1GC"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
