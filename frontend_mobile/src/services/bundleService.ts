// Por que: Importa a instância do Axios para realizar chamadas HTTP REST ao gateway de pacotes.
import { api } from './api';

// Por que: Estrutura que mapeia as propriedades de um bundle DTN conforme o modelo de resposta da API Java.
export interface BundleResponseData {
  // Por que: ID do nó de origem da rede.
  sourceNodeId: number;
  // Por que: Sequencial local do bundle gerado no nó de origem.
  localSequenceId: number;
  // Por que: ID do nó de destino final do pacote.
  destNodeId: number;
  // Por que: Conteúdo bruto em string JSON (payload).
  payload: string;
  // Por que: Assinatura de hash SHA-256 para integridade do payload no espaço.
  hash: string;
  // Por que: Nível de prioridade DTN (0 = Baixa, 1 = Média, 2 = Alta).
  priority: number;
  // Por que: Status de trânsito (BUFFERED, IN_TRANSIT, DELIVERED, EXPIRED).
  transmissionStatus: string;
  // Por que: Carimbo de data/hora de criação do bundle.
  createdTime: string;
  // Por que: TTL espacial do pacote.
  expiryTime: string;
}

// Por que: Modelo de resposta retornado após o disparo de simulação de transmissão e conciliação.
export interface TransmissionResult {
  // Por que: Mensagem descritiva do resultado da simulação.
  message: string;
  // Por que: Quantidade de bundles que mudaram do buffer para entregues/em trânsito.
  bundlesTransmitted: number;
  // Por que: Carimbo de data/hora do processamento no servidor.
  timestamp: string;
}

// Por que: Classe de serviço englobando a comunicação com a API de Bundles.
export const bundleService = {
  // Por que: Obtém a listagem completa de todos os bundles que trafegaram ou estão na fila Store-and-Forward.
  getAll: async (): Promise<BundleResponseData[]> => {
    // Por que: Executa a requisição GET para listar os bundles do gateway.
    const response = await api.get<any>('/api/bundles');
    // Por que: Acessa o objeto de dados embutidos HATEOAS.
    const embedded = response.data?._embedded || response.data;
    // Por que: Se for HATEOAS, extrai a lista de bundles desfazendo o invólucro content de cada entidade.
    if (embedded && embedded.bundleResponseList) {
      // Por que: Retorna a lista processada.
      return embedded.bundleResponseList.map((item: any) => item.content || item);
    }
    // Por que: Se a API retornar um array simples de dados.
    if (Array.isArray(response.data)) {
      // Por que: Retorna o array diretamente.
      return response.data;
    }
    // Por que: Retorna um array vazio se não houver bundles cadastrados.
    return [];
  },

  // Por que: Recupera os dados de um bundle específico informando sua PK composta (origem + ID local).
  getById: async (sourceNodeId: number, localSequenceId: number): Promise<BundleResponseData> => {
    // Por que: Faz a chamada GET para o caminho composto.
    const response = await api.get<any>(`/api/bundles/${sourceNodeId}/${localSequenceId}`);
    // Por que: Retorna o conteúdo principal tratando hypermedia.
    return response.data?.content || response.data;
  },

  // Por que: Dispara a simulação de rádio orbital, forçando a transmissão de buffers pendentes e conciliação.
  transmit: async (): Promise<TransmissionResult> => {
    // Por que: Envia requisição HTTP POST vazia para o endpoint de transmissão.
    const response = await api.post<TransmissionResult>('/api/bundles/transmit');
    // Por que: Retorna os resultados com número de pacotes enviados e timestamp.
    return response.data;
  }
};
