# Use Maven image to build the application
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy your project files
COPY . .

# Make sure the Maven wrapper is executable
RUN chmod +x mvnw

# Build the application without tests
RUN ./mvnw clean package -DskipTests

# -------------------------------
# Second stage: run the jar
# -------------------------------
FROM eclipse-temurin:17
WORKDIR /app

# Copy jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (don't change this unless you've changed the app's port)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
