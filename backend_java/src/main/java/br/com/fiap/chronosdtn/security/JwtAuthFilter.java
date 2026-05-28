package br.com.fiap.chronosdtn.security;

// Por que: Importa as classes do Spring Security para autenticação e registro no contexto.
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// Por que: Componente de injeção de dependência.
import org.springframework.stereotype.Component;
// Por que: Estende a classe abstrata para garantir a execução única do filtro por requisição HTTP.
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    // Por que: Injeta o serviço utilitário para manipulação dos tokens JWT.
    private final JwtService jwtService;

    // Por que: Construtor injetado pelo Spring.
    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // Por que: Método de filtragem de requisições que captura e valida a autorização.
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        
        // Por que: Obtém o valor do cabeçalho HTTP Authorization.
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // Por que: Se o cabeçalho estiver ausente ou não iniciar com Bearer, ignora o filtro e passa para o próximo.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Por que: Extrai o token removendo o prefixo "Bearer " (7 caracteres).
        jwt = authHeader.substring(7);
        
        try {
            // Por que: Extrai o username gravado no subject do token.
            username = jwtService.extractUsername(jwt);

            // Por que: Verifica se o operador já não está previamente autenticado nesta requisição.
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                // Por que: Valida o token JWT.
                if (jwtService.isTokenValid(jwt, username)) {
                    
                    // Por que: Configura uma permissão (Role) estática de OPERATOR contida nas claims assinadas.
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_OPERATOR");
                    
                    // Por que: Cria o objeto de autenticação que o Spring Security utiliza.
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.singletonList(authority)
                    );
                    
                    // Por que: Vincula os detalhes de rede da requisição HTTP (IP, sessão) à autenticação.
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    // Por que: Registra a autenticação validada no contexto do Spring, autorizando o acesso às rotas restritas.
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Por que: Se o token for inválido, vencido ou adulterado, a requisição segue sem autenticação e será rejeitada na controller.
            logger.warn("Falha de autenticação rádio no filtro JWT: " + e.getMessage());
        }

        // Por que: Passa a requisição adiante na cadeia de filtros de segurança do servlet.
        filterChain.doFilter(request, response);
    }
}
