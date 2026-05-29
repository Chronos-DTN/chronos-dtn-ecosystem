// Por que: Importa o Axios para realizar requisições HTTP para a API REST de gateway.
import axios from 'axios';
// Por que: Importa o componente Platform do react-native para detectar se o ambiente de execução é web, simulador ou físico.
import { Platform } from 'react-native';

// Por que: Define a chave de armazenamento local simplificada para persistir o JWT.
export const AUTH_TOKEN_KEY = 'chronos_jwt_token';
// Por que: Define a chave de armazenamento para o endereço IP do gateway.
export const GATEWAY_URL_KEY = 'chronos_gateway_url';
// Por que: Define a chave de armazenamento para habilitar/desabilitar a simulação de latência espacial.
export const SIMULATE_LATENCY_KEY = 'chronos_simulate_latency';

// Por que: Endereço IP padrão do gateway de desenvolvimento Java local.
// No Android Emulator, 10.0.2.2 aponta para o localhost do host. No iOS e Web, usa-se localhost.
const DEFAULT_GATEWAY_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

// Por que: Variáveis locais em memória para cache rápido de configuração durante a execução.
let cachedToken: string | null = null;
let cachedGatewayUrl: string = DEFAULT_GATEWAY_URL;
let cachedSimulateLatency: boolean = true;

// Por que: Instancia o cliente Axios configurando timeouts e headers padrão para o tráfego JSON.
export const api = axios.create({
  baseURL: cachedGatewayUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Por que: Define a função para atualizar dinamicamente a URL base do gateway nas requisições.
export const updateGatewayUrl = (url: string) => {
  // Por que: Atualiza a variável local de cache.
  cachedGatewayUrl = url;
  // Por que: Modifica a propriedade baseURL da instância do Axios ativa.
  api.defaults.baseURL = url;
};

// Por que: Define a função para salvar ou limpar o token JWT na memória do cliente.
export const setAuthToken = (token: string | null) => {
  // Por que: Cacheia o token localmente para anexar nos interceptores.
  cachedToken = token;
};

// Por que: Define a função para ativar ou desativar o atraso físico de rádio espacial (~1.28s).
export const setSimulateLatency = (simulate: boolean) => {
  // Por que: Cacheia a configuração na memória do cliente.
  cachedSimulateLatency = simulate;
};

// Por que: Recupera as configurações ativas para exibição ou auditoria nas telas de rede.
export const getApiConfig = () => {
  return {
    gatewayUrl: cachedGatewayUrl,
    simulateLatency: cachedSimulateLatency,
    token: cachedToken,
  };
};

// Por que: Registra um interceptor de requisição para injetar o cabeçalho Authorization Bearer JWT.
api.interceptors.request.use(
  (config) => {
    // Por que: Se houver um token JWT cacheado, injeta-o na requisição de saída.
    if (cachedToken) {
      // Por que: Atribui a propriedade Authorization no formato padrão OAuth2/JWT.
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    // Por que: Retorna a configuração modificada.
    return config;
  },
  (error) => {
    // Por que: Propaga o erro caso a preparação da requisição falhe.
    return Promise.reject(error);
  }
);

// Por que: Registra um interceptor de resposta para simular o atraso eletromagnético da distância Terra-Lua (~1.28s).
api.interceptors.response.use(
  async (response) => {
    // Por que: Se a simulação de latência estiver ativa, introduz um atraso artificial.
    if (cachedSimulateLatency) {
      // Por que: Aguarda 1280 milissegundos para emular o tempo real de propagação do sinal.
      await new Promise((resolve) => setTimeout(resolve, 1280));
    }
    // Por que: Retorna a resposta original.
    return response;
  },
  async (error) => {
    // Por que: Se a simulação estiver ativa e houver erro de rede, também simula o atraso de propagação do erro.
    if (cachedSimulateLatency) {
      // Por que: Aguarda os mesmos 1280 milissegundos da física de rádio.
      await new Promise((resolve) => setTimeout(resolve, 1280));
    }
    // Por que: Propaga o erro para ser tratado pela camada de serviço ou interface gráfica.
    return Promise.reject(error);
  }
);
