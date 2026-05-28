using System;

namespace ChronosDtnNetApi.Models;

// Por que: Define a entidade de log de auditoria operacional para janelas de sincronismo e retransmissões.
public class SyncLog
{
    // Por que: Identificador único primário do log de sincronismo.
    public long Id { get; set; }

    // Por que: Referência estrangeira do link orbital de rádio correspondente.
    public long LinkId { get; set; }

    // Por que: Instância de navegação do link mapeado.
    public Link? Link { get; set; }

    // Por que: Instante exato de conclusão do ciclo de sincronização.
    public DateTime SyncTime { get; set; }

    // Por que: Quantidade de bundles que trafegaram com sucesso.
    public int BundlesSent { get; set; }

    // Por que: Quantidade de falhas físicas de rádio simuladas.
    public int Errors { get; set; }

    // Por que: Status do ciclo de sincronização (SUCCESS, PARTIAL, FAILED).
    public string Status { get; set; } = string.Empty;
}
