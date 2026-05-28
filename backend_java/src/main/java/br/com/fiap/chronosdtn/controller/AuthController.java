package br.com.fiap.chronosdtn.controller;

// Por que: Importa os DTOs de login e resposta de token.
import br.com.fiap.chronosdtn.dto.LoginRequest;
import br.com.fiap.chronosdtn.dto.TokenResponse;
// Por que: Importa o serviço de autenticação de operadores.
import br.com.fiap.chronosdtn.service.AuthService;
// Por que: Importa anotações de validação e Web do Spring MVC.
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Por que: RestController sinaliza que a classe responde chamadas REST em formato JSON.
@RestController
// Por que: Mapeia o prefixo padrão das rotas de autenticação.
@RequestMapping("/api/auth")
// Por que: Habilita CORS para permitir que qualquer cliente (inclusive React Native) chame este endpoint.
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class AuthController {

    // Por que: Dependência do serviço de login.
    private final AuthService authService;

    // Por que: Construtor injetado pelo Spring.
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Por que: Mapeia requisições HTTP POST para efetuar o login do operador.
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        // Por que: Executa a autenticação e gera o token JWT correspondente.
        TokenResponse response = authService.authenticate(request);
        // Por que: Retorna status HTTP 200 OK contendo o token no corpo.
        return ResponseEntity.ok(response);
    }
}
