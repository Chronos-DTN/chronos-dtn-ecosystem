namespace ChronosDtnNetApi.Models;

// Por que: Define a entidade de nó de rede, representando estações espaciais ou terrestres que roteiam o sinal.
public class Node
{
    // Por que: Identificador único primário do nó de comunicação (ex: 1 para Houston, 2 para Artemis).
    public long Id { get; set; }

    // Por que: Nome amigável de identificação da estação espacial/base (ex: "Houston Ground Station").
    public string Name { get; set; } = string.Empty;

    // Por que: Localização física astronômica ou geográfica do nó (ex: "Lua - Polo Sul").
    public string Location { get; set; } = string.Empty;

    // Por que: Status operacional de atividade do roteador (ACTIVE, INACTIVE, DEGRADED).
    public string Status { get; set; } = string.Empty;
}
