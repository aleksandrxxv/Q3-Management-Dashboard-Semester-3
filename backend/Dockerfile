# ---------- Build stage ----------
FROM gradle:8.7-jdk21 AS build
WORKDIR /app

# Copy Gradle files and source
COPY . .

# Build the application without running tests
RUN gradle clean build -x test

# ---------- Run stage ----------
FROM openjdk:21-jdk-slim
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose backend port
EXPOSE 8080

# Run the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
