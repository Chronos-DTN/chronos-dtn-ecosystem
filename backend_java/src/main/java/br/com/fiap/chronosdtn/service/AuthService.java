package br.com.fiap.chronosdtn.service;

// Por que: Importa o record de requisição de login.
import br.com.fiap.chronosdtn.dto.LoginRequest;
// Por que: Importa o record de resposta contendo o token.
import br.com.fiap.chronosdtn.dto.TokenResponse;
// Por que: Importa o serviço JWT de assinatura.
import br.com.fiap.chronosdtn.security.JwtService;
// Por que: Importa exceção padrão do Spring para acessos inválidos.
import org.springframework.security.authentication.BadCredentialsException;
// Por que: Importa classe auxiliar para codificação segura.
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    // Por que: Serviço utilitário que gera a assinatura do JWT.
    private final JwtService jwtService;
    // Por que: Utilizado para codificar senhas caso fossem armazenadas dinamicamente.
    private final PasswordEncoder passwordEncoder;

    // Por que: Construtor injetado.
    public AuthService(JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // Por que: Valida as credenciais do operador e gera o token assinado.
    public TokenResponse authenticate(LoginRequest request) {
        
        // Por que: Simula uma checagem de usuário e senha do operador de controle da estação (Houston/Artemis).
        if ("operator".equals(request.username()) && "space_dtn_2026".equals(request.password())) {
            
            // Por que: Cria um mapa para anexar claims extras personalizadas no payload do token.
            Map<String, Object> claims = new HashMap<>();
            // Por que: Indica que este operador está na estação Houston (ID 1).
            claims.put("node_id", 1L);
            claims.put("node_name", "Houston Deep Space Station");
            claims.put("role", "ROLE_OPERATOR");

            // Por que: Solicita ao serviço a geração do token assinado digitalmente.
            String token = jwtService.generateToken(request.username(), claims);
            
            // Por que: Retorna o token envelopado no record imutável padrão.
            return new TokenResponse(token, "Bearer");
        } else {
            // Por que: Lança erro de credenciais em caso de dados inválidos no login.
            throw new BadCredentialsException("Usuário ou senha inválidos para o painel operacional.");
        }
    }
}
