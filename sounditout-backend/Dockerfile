FROM eclipse-temurin:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the jar
CMD ["java", "-jar", "target/*.jar"]
