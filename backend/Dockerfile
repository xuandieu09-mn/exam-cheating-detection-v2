# Multi-stage build for Spring Boot (Java 17)
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn -q -e -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
ENV TZ=UTC
WORKDIR /app
COPY --from=builder /app/target/exam-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-Duser.timezone=UTC","-jar","/app/app.jar"]
