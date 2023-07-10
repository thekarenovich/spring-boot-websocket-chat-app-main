FROM amazoncorretto:17
LABEL version="1.0"
LABEL description="Dockerfile for run chat-app"
ENV JAVA_HOME=/usr/lib/jvm/java-17-amazon-corretto
ENV PATH=$JAVA_HOME/bin:$PATH
EXPOSE 8080
WORKDIR /app
COPY target/chat-1.jar .
CMD ["java", "-jar", "chat-1.jar"]
# Для получения chat-1.jar в target выполните mvn clean package
# Команды clean и package есть в Maven в IntelliJ IDEA)
# Убедитесь, что верссии java, которым скомпилировали jar файл и указали в Dockerfile индетичны
