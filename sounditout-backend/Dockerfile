FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY . .

# Give Maven wrapper permission to run
RUN chmod +x mvnw

# Build the application
RUN ./mvnw clean package -DskipTests

# Run the jar
CMD ["java", "-jar", "target/*.jar"]
