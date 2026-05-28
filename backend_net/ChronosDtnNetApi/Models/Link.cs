using System;

namespace ChronosDtnNetApi.Models;

// Por que: Define a janela de contato físico (link de rádio) entre duas estações no espaço.
public class Link
{
    // Por que: Chave primária do registro do enlace de comunicação.
    public long Id { get; set; }

    // Por que: Referência estrangeira do nó de origem da transmissão.
    public long SourceNodeId { get; set; }

    // Por que: Objeto do nó emissor (carregamento por navegação ORM).
    public Node? SourceNode { get; set; }

    // Por que: Referência estrangeira do nó destinatário da transmissão.
    public long DestNodeId { get; set; }

    // Por que: Objeto do nó receptor (carregamento por navegação ORM).
    public Node? DestNode { get; set; }

    // Por que: Instante de início em que a janela orbital permite contato direto de rádio.
    public DateTime StartTime { get; set; }

    // Por que: Instante final de fechamento da janela de visibilidade orbital.
    public DateTime EndTime { get; set; }

    // Por que: Largura de banda em Kbps suportada pelo link (ex: 1024.0 Kbps).
    public double BandwidthKbps { get; set; }

    // Por que: Latência fixa da velocidade da luz para a distância (ex: ~1.28s Terra-Lua).
    public double LatencySeconds { get; set; }

    // Por que: Status em tempo real do enlace de rádio (UP, DOWN, SCHEDULED).
    public string Status { get; set; } = string.Empty;
}
