package br.com.fiap.chronosdtn.model;

// Por que: Importa as anotações Jakarta Persistence para mapeamento objeto-relacional (ORM).
import jakarta.persistence.*;
// Por que: Importa anotações Lombok para evitar boilerplate de getters, setters e construtores.
import lombok.*;

// Por que: Declara que esta classe é uma entidade gerenciada pelo JPA (JPA Entity).
@Entity
// Por que: Associa esta entidade à tabela correspondente do banco físico relacional.
@Table(name = "TB_CHRONOS_NODE")
// Por que: Lombok - Gera métodos getter para todos os campos automaticamente.
@Getter
// Por que: Lombok - Gera métodos setter para todos os campos automaticamente.
@Setter
// Por que: Lombok - Cria construtor contendo todos os argumentos.
@AllArgsConstructor
// Por que: Lombok - Cria construtor sem argumentos exigido pelo JPA em tempo de execução.
@NoArgsConstructor
public class Node {

    // Por que: Declara que o campo ID_NODE é a chave primária da entidade.
    @Id
    // Por que: Nome da coluna física na tabela TB_CHRONOS_NODE.
    @Column(name = "ID_NODE")
    private Long id;

    // Por que: Nome do nó espacial (ex: Houston Station), não nulo, com limite de 50 caracteres.
    @Column(name = "NM_NODE", nullable = false, length = 50, unique = true)
    private String name;

    // Por que: Localização orbital ou física terrestre/lunar do nó de rede.
    @Column(name = "DS_LOCATION", nullable = false, length = 50)
    private String location;

    // Por que: Status operacional ativo do nó.
    @Column(name = "ST_NODE", nullable = false, length = 20)
    private String status;
}
