// Por que: Importa a instância configurada do Axios para realizar as requisições HTTP REST.
import { api } from './api';

// Por que: Interface contendo os parâmetros obrigatórios para solicitar uma nova transferência.
export interface TransactionRequestData {
  // Por que: ID numérico da conta de origem (débito).
  sourceAccountId: number;
  // Por que: ID numérico da conta de destino (crédito).
  destAccountId: number;
  // Por que: Valor decimal da transação monetária.
  amount: number;
  // Por que: Prioridade DTN para ordenação na fila (0 = Baixa, 1 = Média, 2 = Alta).
  priority: number;
}

// Por que: Estrutura de dados recebida do servidor correspondendo ao DTO Java da transação.
export interface TransactionResponseData {
  // Por que: ID único gerado no banco de dados.
  transactionId: number;
  // Por que: ID do bundle transportador associado à transação.
  bundleId: number;
  // Por que: ID do nó de origem.
  sourceNodeId: number;
  // Por que: ID da conta debitada.
  sourceAccountId: number;
  // Por que: ID da conta creditada.
  destAccountId: number;
  // Por que: Valor movimentado.
  amount: number;
  // Por que: Status de liquidação (PENDING, SETTLED, REJECTED).
  settlementStatus: string;
  // Por que: Carimbo de data/hora da transação.
  transactionTime: string;
}

// Por que: Representa a estrutura de dados encapsulada no modelo de resposta HATEOAS do Spring.
export interface HateoasEntity<T> {
  // Por que: Contém a carga útil do recurso (DTO).
  content: T;
  // Por que: Coleção de links de hipermídia adicionados pelo backend.
  links?: Array<{ rel: string; href: string }>;
}

// Por que: Estrutura da coleção HATEOAS retornada para listagens de recursos.
export interface HateoasCollection<T> {
  // Por que: Objeto contendo a lista de entidades envelopadas.
  _embedded?: {
    // Por que: Chave dinâmica baseada no nome do recurso.
    transactionResponseList?: Array<HateoasEntity<T>>;
    bundleResponseList?: Array<HateoasEntity<T>>;
  };
  // Por que: Links da própria coleção (como self, first, next).
  _links?: Record<string, { href: string }>;
}

// Por que: Classe de serviço englobando a comunicação com a API de Transações.
export const transactionService = {
  // Por que: Retorna todas as transações cadastradas no gateway remoto.
  getAll: async (): Promise<TransactionResponseData[]> => {
    // Por que: Faz a requisição GET para obter a lista de transações no gateway.
    const response = await api.get<any>('/api/transactions');
    // Por que: Verifica se há dados aninhados na estrutura HATEOAS _embedded.
    const embedded = response.data?._embedded || response.data;
    // Por que: Se for HATEOAS, extrai a lista de transações, mapeando e limpando o invólucro do content.
    if (embedded && embedded.transactionResponseList) {
      // Por que: Retorna a lista extraindo o campo 'content' de cada item.
      return embedded.transactionResponseList.map((item: any) => item.content || item);
    }
    // Por que: Fallback caso a resposta venha como lista simples ou em outro formato.
    if (Array.isArray(response.data)) {
      // Por que: Retorna o array diretamente.
      return response.data;
    }
    // Por que: Retorna um array vazio se nenhum dado for localizado.
    return [];
  },

  // Por que: Busca os dados detalhados de uma transação específica pelo ID.
  getById: async (id: number): Promise<TransactionResponseData> => {
    // Por que: Faz a chamada GET para o ID correspondente.
    const response = await api.get<any>(`/api/transactions/${id}`);
    // Por que: Retorna o conteúdo principal decodificado (tratando invólucro HATEOAS se existir).
    return response.data?.content || response.data;
  },

  // Por que: Envia uma nova solicitação de transação para processamento local ou enfileiramento espacial.
  create: async (data: TransactionRequestData): Promise<TransactionResponseData> => {
    // Por que: Envia a requisição HTTP POST com os dados de transferência.
    const response = await api.post<any>('/api/transactions', data);
    // Por que: Retorna o conteúdo principal da transação recém-criada.
    return response.data?.content || response.data;
  }
};
