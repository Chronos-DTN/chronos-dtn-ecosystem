package br.com.fiap.chronosdtn.service;

// Por que: Importa o record de requisição de login.
import br.com.fiap.chronosdtn.dto.LoginRequest;
// Por que: Importa o DTO de solicitação de cadastro de novo operador.
import br.com.fiap.chronosdtn.dto.RegisterRequest;
// Por que: Importa o record de resposta contendo o token.
import br.com.fiap.chronosdtn.dto.TokenResponse;
// Por que: Importa a entidade Operator para manipulação de banco de dados.
import br.com.fiap.chronosdtn.model.Operator;
// Por que: Importa a entidade Node para associar operadores a bases.
import br.com.fiap.chronosdtn.model.Node;
// Por que: Importa exceção personalizada para quando recursos não existirem no banco.
import br.com.fiap.chronosdtn.exception.ResourceNotFoundException;
// Por que: Importa o repositório de operadores para checagem e inserção.
import br.com.fiap.chronosdtn.repository.OperatorRepository;
// Por que: Importa o repositório de nós para associar a estação correta.
import br.com.fiap.chronosdtn.repository.NodeRepository;
// Por que: Importa o serviço JWT de assinatura.
import br.com.fiap.chronosdtn.security.JwtService;
// Por que: Importa exceção padrão do Spring para acessos inválidos.
import org.springframework.security.authentication.BadCredentialsException;
// Por que: Importa exceção padrão do Java para erros de validação de estado.
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    // Por que: Repositório para acessar a persistência dos operadores.
    private final OperatorRepository operatorRepository;
    // Por que: Repositório para acessar os nós espaciais existentes.
    private final NodeRepository nodeRepository;
    // Por que: Serviço utilitário que gera a assinatura do JWT.
    private final JwtService jwtService;
    // Por que: Utilizado para codificar senhas de forma segura.
    private final PasswordEncoder passwordEncoder;

    // Por que: Construtor injetado pelo Spring Core.
    public AuthService(OperatorRepository operatorRepository, 
                       NodeRepository nodeRepository,
                       JwtService jwtService, 
                       PasswordEncoder passwordEncoder) {
        this.operatorRepository = operatorRepository;
        this.nodeRepository = nodeRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // Por que: Valida as credenciais do operador contra o banco de dados e gera o token assinado.
    public TokenResponse authenticate(LoginRequest request) {
        
        // Por que: Busca o operador no banco pelo nome de usuário.
        Operator operator = operatorRepository.findByUsername(request.username())
            // Por que: Lança BadCredentialsException se o usuário não for encontrado por segurança.
            .orElseThrow(() -> new BadCredentialsException("Usuário ou senha inválidos para o painel operacional."));

        // Por que: Compara a senha informada com o hash BCrypt salvo na base.
        if (passwordEncoder.matches(request.password(), operator.getPassword())) {
            
            // Por que: Cria um mapa para anexar claims extras personalizadas no payload do token.
            Map<String, Object> claims = new HashMap<>();
            
            // Por que: Adiciona o ID do nó associado ao operador.
            claims.put("node_id", operator.getNode() != null ? operator.getNode().getId() : 1L);
            // Por que: Adiciona o nome do nó operacional para exibição na UI.
            claims.put("node_name", operator.getNode() != null ? operator.getNode().getName() : "Central Gateway");
            // Por que: Concede a role operacional padrão.
            claims.put("role", "ROLE_OPERATOR");

            // Por que: Solicita ao serviço a geração do token assinado digitalmente.
            String token = jwtService.generateToken(operator.getUsername(), claims);
            
            // Por que: Retorna o token envelopado no record imutável padrão.
            return new TokenResponse(token, "Bearer");
        } else {
            // Por que: Lança erro de credenciais se a senha informada não corresponder ao hash.
            throw new BadCredentialsException("Usuário ou senha inválidos para o painel operacional.");
        }
    }

    // Por que: Cadastra um novo operador no banco de dados com senha criptografada.
    @Transactional
    public void register(RegisterRequest request) {
        // Por que: Verifica se o nome de usuário já está em uso para evitar duplicidades.
        if (operatorRepository.findByUsername(request.username()).isPresent()) {
            // Por que: Lança exceção de argumento inválido caso o usuário exista.
            throw new IllegalArgumentException("Nome de usuário já está cadastrado.");
        }

        // Por que: Busca o nó associado informado no formulário de cadastro.
        Node node = nodeRepository.findById(request.nodeId())
            // Por que: Lança erro 404 se o nó espacial informado for inválido.
            .orElseThrow(() -> new ResourceNotFoundException("Nó operacional não encontrado com ID: " + request.nodeId()));

        // Por que: Instancia um novo objeto Operator.
        Operator operator = new Operator();
        // Por que: Define o nome de usuário.
        operator.setUsername(request.username());
        // Por que: Codifica a senha do operador usando BCrypt antes de persistir no banco.
        operator.setPassword(passwordEncoder.encode(request.password()));
        // Por que: Define o nome completo do operador.
        operator.setFullName(request.fullName());
        // Por que: Vincula o operador à sua respectiva estação espacial.
        operator.setNode(node);

        // Por que: Persiste o novo operador de forma permanente no banco de dados.
        operatorRepository.save(operator);
    }
}
