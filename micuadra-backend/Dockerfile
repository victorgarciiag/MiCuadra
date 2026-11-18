# syntax=docker/dockerfile:1
# ---- Etapa 1: compilar con Maven ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Descarga dependencias en una capa aparte (y en caché) para no repetirlo en cada build
RUN --mount=type=cache,target=/root/.m2 mvn -q dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q package -DskipTests

# ---- Etapa 2: solo el JRE + el jar ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
# Los límites de memoria llegan por JAVA_TOOL_OPTIONS (ver .env)
ENTRYPOINT ["java", "-jar", "app.jar"]
