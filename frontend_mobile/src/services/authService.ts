// Por que: Importa a instância configurada do Axios (api) e a função setAuthToken do serviço de API.
import { api, setAuthToken } from './api';

// Por que: Define a interface de dados de entrada para realizar o login do operador.
export interface LoginCredentials {
  // Por que: Nome identificador do operador de rádio/financeiro.
  username: string;
  // Por que: Senha de autenticação do operador.
  password: string;
}

// Por que: Define a estrutura da resposta retornada pela API com o token JWT.
export interface AuthResponse {
  // Por que: Cadeia de caracteres criptográfica do token JWT.
  token: string;
  // Por que: Tipo do token, usualmente "Bearer".
  type: string;
}

// Por que: Classe de serviço encapsulando as operações de autenticação.
export const authService = {
  // Por que: Função assíncrona que realiza o login na API e salva o token recebido.
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Por que: Dispara requisição HTTP POST para o endpoint correspondente na API Java.
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    // Por que: Captura a resposta deserializada contendo o token.
    const data = response.data;
    // Por que: Registra o token no cliente Axios para que as próximas chamadas injetem o cabeçalho Bearer.
    setAuthToken(data.token);
    // Por que: Retorna os dados para manipulação na interface do usuário (ex: salvar no estado do layout).
    return data;
  },

  // Por que: Função para limpar o estado de autenticação (logout).
  logout: async (): Promise<void> => {
    // Por que: Remove o token JWT cacheado na instância do Axios.
    setAuthToken(null);
  }
};
