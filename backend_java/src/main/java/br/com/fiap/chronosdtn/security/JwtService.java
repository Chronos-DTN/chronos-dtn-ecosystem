package br.com.fiap.chronosdtn.security;

// Por que: Importa as bibliotecas JJWT para geração e validação de tokens seguros.
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
// Por que: Importa a anotação para ler variáveis do arquivo application.yml.
import org.springframework.beans.factory.annotation.Value;
// Por que: Componente gerenciado de serviço pelo Spring.
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Service
public class JwtService {

    // Por que: Carrega a chave secreta do application.yml.
    @Value("${chronos.security.jwt.secret}")
    private String secretKey;

    // Por que: Carrega o tempo de expiração configurado do token JWT.
    @Value("${chronos.security.jwt.expiration}")
    private long jwtExpiration;

    // Por que: Extrai o username (subject) do payload do token JWT.
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Por que: Extrai uma claim genérica do token aplicando um resolvedor.
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Por que: Gera o token JWT para o operador autenticado.
    public String generateToken(String username, Map<String, Object> extraClaims) {
        return buildToken(extraClaims, username, jwtExpiration);
    }

    // Por que: Constrói a estrutura do JWT assinando digitalmente usando HMAC-SHA256.
    private String buildToken(Map<String, Object> extraClaims, String username, long expiration) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                // Por que: Define a data de validade com base no TTL configurado.
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                // Por que: Assina o token com a chave criptográfica simétrica.
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Por que: Verifica se o token JWT pertence ao operador e se não expirou.
    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username)) && !isTokenExpired(token);
    }

    // Por que: Checa se o token expirou no tempo espacial atual.
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Por que: Extrai o instante de expiração gravado no token.
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Por que: Decodifica e extrai todas as claims contidas no corpo do JWT.
    private Claims extractAllClaims(String token) {
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Por que: Decodifica a chave secreta base64 e gera um objeto Key seguro para o algoritmo HMAC.
    private Key getSignInKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
