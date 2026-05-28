package br.com.fiap.chronosdtn;

// Por que: Importa a classe de boot principal do Spring para rodar o contêiner
import org.springframework.boot.SpringApplication;
// Por que: Importa a anotação que habilita autoconfiguração, escaneamento de componentes e configurações
import org.springframework.boot.autoconfigure.SpringBootApplication;
// Por que: Importa CommandLineRunner para executar código de carga na inicialização
import org.springframework.boot.CommandLineRunner;
// Por que: Importa a anotação Bean para registro de componentes gerenciados pelo Spring IOC.
import org.springframework.context.annotation.Bean;
// Por que: Importa as entidades de modelo para criação do mock de inicialização.
import br.com.fiap.chronosdtn.model.*;
// Por que: Importa os repositórios JPA para inserção física dos dados de teste.
import br.com.fiap.chronosdtn.repository.*;
// Por que: Importa BigDecimal para definir saldos iniciais de forma precisa.
import java.math.BigDecimal;
// Por que: Importa LocalDateTime para definir datas de janelas de rádio.
import java.time.LocalDateTime;

// Por que: Anotação que declara esta classe como o ponto de entrada e bootstrap do Spring Boot.
@SpringBootApplication
public class ChronosDtnApplication {

    // Por que: Método principal Java que inicia a máquina virtual (JVM) e o Spring Context.
    public static void main(String[] args) {
        // Por que: Executa a inicialização do Spring Boot passando os argumentos da JVM.
        SpringApplication.run(ChronosDtnApplication.class, args);
    }

    // Por que: CommandLineRunner é executado assim que o contexto do Spring é totalmente carregado.
    @Bean
    public CommandLineRunner seedDatabase(NodeRepository nodeRepository,
                                         AccountRepository accountRepository,
                                         LinkRepository linkRepository) {
        return args -> {
            // Por que: Cadastra o Nó 1 (Estação Terrestre de Houston) para simular o gateway da Terra.
            Node houstonNode = new Node(1L, "Houston Ground Station", "Terra - EUA", "ACTIVE");
            nodeRepository.save(houstonNode);

            // Por que: Cadastra o Nó 2 (Base Artemis Alpha) para simular o gateway da Lua.
            Node artemisNode = new Node(2L, "Artemis Base Alpha", "Lua - Polo Sul", "ACTIVE");
            nodeRepository.save(artemisNode);

            // Por que: Cadastra a conta financeira corporativa associada ao nó da Terra.
            Account earthAccount = new Account(101L, houstonNode, "Houston Ground Station Account", new BigDecimal("500000.00"), "USD");
            accountRepository.save(earthAccount);

            // Por que: Cadastra a conta financeira corporativa associada ao nó da Lua (Moeda Lunar: LUN).
            Account moonAccount = new Account(201L, artemisNode, "Shackleton Mining Corp Account", new BigDecimal("150000.00"), "LUN");
            accountRepository.save(moonAccount);

            // Por que: Cadastra a conta alternativa na Lua para permitir transferências locais lunares síncronas.
            Account moonAccount2 = new Account(202L, artemisNode, "Lunar Habitat Utilities Account", new BigDecimal("25000.00"), "LUN");
            accountRepository.save(moonAccount2);

            // Por que: Cadastra um link orbital de rádio ativo (UP) entre Terra e Lua para permitir transmissão imediata em testes.
            Link activeLink = new Link(
                    1L,
                    houstonNode,
                    artemisNode,
                    LocalDateTime.now().minusHours(1), // Por que: Janela de contato iniciou há 1 hora.
                    LocalDateTime.now().plusHours(11), // Por que: Janela se estende por mais 11 horas.
                    1024.0, // Por que: Banda de 1024 Kbps.
                    1.280, // Por que: Tempo de propagação real da luz entre Terra e Lua (~1.28s).
                    "UP" // Por que: Status ativo.
            );
            linkRepository.save(activeLink);
        };
    }
}
