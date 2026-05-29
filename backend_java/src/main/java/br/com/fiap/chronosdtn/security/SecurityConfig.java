package br.com.fiap.chronosdtn.security;

// Por que: Importa as anotações do Spring Security para configuração web e injeção do filtro.
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// Por que: Permite definir as regras de compartilhamento de recursos de origens cruzadas (CORS).
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Por que: Injeta o filtro JWT personalizado que intercepta tokens.
    private final JwtAuthFilter jwtAuthFilter;

    // Por que: Construtor injetado pelo Spring.
    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // Por que: Bean que gerencia a cadeia de filtros de segurança web (Filter Chain).
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Por que: Desativa proteção CSRF, pois nossa autenticação é stateless via JWT (sem cookies).
            .csrf(AbstractHttpConfigurer::disable)
            // Por que: Configura as permissões de acesso às rotas (Endpoints).
            .authorizeHttpRequests(auth -> auth
                // Por que: Permite acesso público ao endpoint de login e cadastro.
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                // Por que: Libera a documentação interativa Swagger/OpenAPI e console do H2.
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/h2-console/**").permitAll()
                // Por que: Exige autenticação de operador para todas as rotas operacionais do ecossistema financeiro.
                .anyRequest().authenticated()
            )
            // Por que: Desativa o armazenamento de sessão no servidor Tomcat (stateless).
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // Por que: Permite abrir o console H2 em frames sem bloqueio de segurança do navegador.
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            // Por que: Injeta o filtro JWT customizado antes do processador padrão de login do Spring.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Por que: Define o codificador BCrypt para senhas para garantir que senhas não fiquem em texto limpo.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Por que: Expõe o gerenciador de autenticação para validar credenciais.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // Por que: Configura CORS habilitando a integração fluida com o app móvel React Native (Expo) e APIs auxiliares.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Por que: Permite conexões de qualquer origem para facilitar testes interplanetários locais.
        configuration.setAllowedOrigins(Collections.singletonList("*"));
        // Por que: Libera os principais métodos HTTP de APIs REST.
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Por que: Libera cabeçalhos padrão e de autorização.
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Por que: Aplica esta política a todos os endpoints da API.
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
