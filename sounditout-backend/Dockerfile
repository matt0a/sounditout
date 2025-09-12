# -------------------------------
# Stage 1: Build with Maven cache
# -------------------------------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app

# 1) Copy only files needed to resolve deps first (better layer caching)
COPY pom.xml ./
COPY .mvn/ .mvn/
COPY mvnw ./

# Warm the dependency cache (no sources yet)
RUN chmod +x mvnw && ./mvnw -q -DskipTests dependency:go-offline

# 2) Now copy the sources and build
COPY src/ src/
COPY src/main/resources/ src/main/resources/
RUN ./mvnw -q clean package -DskipTests

# -------------------------------
# Stage 2: Runtime image (JRE 17)
# -------------------------------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Create non-root user
RUN addgroup --system app && adduser --system --ingroup app app
USER app:app

# Copy fat jar from builder
COPY --from=build /app/target/*.jar /app/app.jar

# (Optional) Expose default port for local runs. Render will set $PORT.
EXPOSE 8080

# Default Spring profile (prod) and JVM flags tuned for containers
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -Dfile.encoding=UTF-8"

# If you enabled Actuator, you can uncomment this healthcheck:
# HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
#   CMD wget -qO- http://127.0.0.1:${PORT:-8080}/actuator/health | grep -q '\"status\":\"UP\"' || exit 1

# Use $PORT if present (Render), otherwise 8080 locally
ENTRYPOINT [ "sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar" ]
