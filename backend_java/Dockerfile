# Por que: Estágio 1 - Build. Compila o projeto utilizando uma imagem Maven oficial rodando sobre Alpine para leveza.
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

# Por que: Define o diretório de trabalho padrão dentro da máquina de construção do container.
WORKDIR /app

# Por que: Copia apenas o arquivo de declaração de dependências do Maven (pom.xml) para otimizar o cache de camadas do Docker.
COPY pom.xml .

# Por que: Faz o download offline de todas as dependências declaradas no pom.xml, acelerando builds futuros se o pom.xml não for alterado.
RUN mvn dependency:go-offline -B

# Por que: Copia o código-fonte da aplicação Java para o diretório de construção (/app/src).
COPY src ./src

# Por que: Compila e empacota a aplicação Spring Boot gerando o executável final (.jar), ignorando os testes unitários para maior agilidade no build.
RUN mvn clean package -DskipTests

# Por que: Estágio 2 - Runtime. Utiliza uma imagem JRE leve baseada em Alpine para minimizar a superfície de ataque e o tamanho da imagem de produção.
FROM eclipse-temurin:17-jre-alpine

# Por que: Define o diretório onde a aplicação ficará instalada na imagem de produção.
WORKDIR /app

# Por que: Cria um grupo Linux chamado dtngroup com ID 10001 para atender às políticas de conformidade do CIS Docker.
RUN addgroup -g 10001 dtngroup && \
    # Por que: Cria um usuário de sistema dtnuser associado ao grupo criado, sem shell de login por segurança.
    adduser -u 10001 -G dtngroup -h /app -s /sbin/nologin -D dtnuser

# Por que: Copia o arquivo .jar compilado no estágio anterior para a pasta da aplicação de produção.
COPY --from=builder /app/target/*.jar app.jar

# Por que: Transfere a posse física de todos os arquivos da pasta /app para o usuário e grupo criados para segurança de execução.
RUN chown -R dtnuser:dtngroup /app

# Por que: Modifica o usuário ativo para o dtnuser não-root, mitigando escalonamentos de privilégio indesejados.
USER dtnuser

# Por que: Expõe a porta 8080 que é a porta interna configurada no Spring Boot para responder requisições REST HTTP.
EXPOSE 8080

# Por que: Define as variáveis e parâmetros de otimização de execução do Garbage Collector (G1GC) e limites de RAM para a Java Virtual Machine (JVM).
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:ActiveProcessorCount=2 -Djava.security.egd=file:/dev/./urandom"

# Por que: Configura o ponto de entrada seguro executando o jar compilado por meio do interpretador Java com as opções otimizadas.
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
