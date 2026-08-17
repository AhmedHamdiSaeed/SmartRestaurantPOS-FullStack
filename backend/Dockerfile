FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /workspace
COPY . .
ARG MODULE
RUN chmod +x mvnw && ./mvnw -pl ${MODULE} -am package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
ARG MODULE
COPY --from=build /workspace/${MODULE}/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
