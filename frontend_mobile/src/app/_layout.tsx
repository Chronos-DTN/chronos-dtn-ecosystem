import React, { createContext, useContext, useState, useEffect } from 'react';
// Por que: Importa componentes de temas e roteador padrão do Expo.
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
// Por que: Importa utilitário de leitura do esquema de cores do aparelho (Light/Dark) e componente de Alerta nativo.
import { useColorScheme, Alert } from 'react-native';

// Por que: Importa o componente animado de Splash e o utilitário de navegação Web/Native.
import { AnimatedSplashOverlay } from '@/components/animated-icon';
// Por que: Importa o componente que define as abas de navegação principal.
import AppTabs from '@/components/app-tabs';
// Por que: Importa a tela de autenticação unificada Apple-style.
import AuthScreen from '@/components/AuthScreen';
// Por que: Importa a instância configurada do Axios para atualizar a URL base de chamadas.
import { api, setAuthToken } from '@/services/api';

// Por que: Mapeamento de caracteres regulamentares Base64 para decodificação universal.
const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Por que: Função de decodificação Base64 em JS puro compatível com React Native e navegadores.
function base64Decode(input: string): string {
  // Por que: Remove caracteres de padding '=' do final da string.
  const str = input.replace(/=+$/, '');
  // Por que: Variável de saída para a string decodificada.
  let output = '';
  // Por que: Validação do tamanho do bloco codificado.
  if (str.length % 4 === 1) return '';
  // Por que: Varredura bit-a-bit dos caracteres codificados.
  for (
    let bc = 0, bs = 0, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6)))) : 0
  ) {
    // Por que: Encontra a posição do caractere no alfabeto Base64.
    buffer = b64chars.indexOf(buffer);
  }
  // Por que: Retorna a string descriptografada.
  return output;
}

// Por que: Função auxiliar que destrincha o payload de claims de um token JWT.
function decodeJwt(token: string): any {
  try {
    // Por que: Split no token usando ponto para extrair [Header, Payload, Signature].
    const parts = token.split('.');
    // Por que: Se não houver 3 partes, o token está malformado.
    if (parts.length !== 3) return null;
    // Por que: O payload é a segunda parte (índice 1).
    const payload = parts[1];
    // Por que: Converte caracteres base64url para base64 padrão.
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Por que: Preenche com padding '=' se necessário.
    while (base64.length % 4) {
      base64 += '=';
    }
    // Por que: Decodifica a string base64.
    const jsonStr = base64Decode(base64);
    // Por que: Transforma em objeto Javascript.
    return JSON.parse(jsonStr);
  } catch (e) {
    // Por que: Exibe erro se o parse falhar.
    console.error('Erro de decodificação JWT:', e);
    // Por que: Retorna nulo.
    return null;
  }
}

// Por que: Define a interface do Operator obtido a partir do Token.
export interface OperatorInfo {
  username: string;
  nodeId: number;
  nodeName: string;
  role: string;
}

// Por que: Interface com todas as propriedades de estado que o contexto compartilhará.
export interface AppContextType {
  gatewayUrl: string;
  setGatewayUrl: (url: string) => void;
  simulateLatency: boolean;
  setSimulateLatency: (val: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  operator: OperatorInfo | null;
  setOperator: (op: OperatorInfo | null) => void;
  logout: () => void;
}

// Por que: Cria o contexto React que servirá de barramento de dados globais para as telas.
const AppContext = createContext<AppContextType | undefined>(undefined);

// Por que: Hook customizado para facilitar o acesso ao contexto por qualquer tela.
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de um AppContextProvider');
  }
  return context;
}

// Por que: Componente de Layout raiz que envolve o aplicativo e provê o estado global.
export default function TabLayout() {
  // Por que: Detecta se o dispositivo está em modo claro ou escuro.
  const colorScheme = useColorScheme();

  // Por que: Estado para armazenar a URL da API, inicializando com o localhost padrão do Docker.
  const [gatewayUrl, setGatewayUrlState] = useState<string>('http://localhost:8080');
  // Por que: Estado para ligar/desligar simulação de latência de 1.28s do rádio-link.
  const [simulateLatency, setSimulateLatency] = useState<boolean>(false);
  // Por que: Controla se o operador já realizou login com sucesso.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Por que: Cache em memória do token JWT recebido no login.
  const [token, setTokenState] = useState<string | null>(null);
  // Por que: Dados decodificados do operador logado.
  const [operator, setOperator] = useState<OperatorInfo | null>(null);

  // Por que: Atualiza a URL base da API na instância do Axios sempre que a URL for editada.
  const setGatewayUrl = (url: string) => {
    setGatewayUrlState(url);
    api.defaults.baseURL = url;
  };

  // Por que: Atualiza o token na memória local e injeta o cabeçalho Bearer correspondente no Axios.
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    setAuthToken(newToken);
    if (!newToken) {
      setIsAuthenticated(false);
      setOperator(null);
    }
  };

  // Por que: Limpa todas as variáveis de sessão (efetua logout).
  const logout = () => {
    setToken(null);
  };

  // Por que: Trata o sucesso da autenticação decodificando as claims do token JWT.
  const handleAuthSuccess = (newToken: string) => {
    // Por que: Grava o token no estado local e nos headers Axios.
    setToken(newToken);
    // Por que: Converte o payload de base64 para dados legíveis.
    const decoded = decodeJwt(newToken);
    if (decoded) {
      // Por que: Popula as propriedades do operador logado.
      setOperator({
        username: decoded.sub || '',
        nodeId: Number(decoded.node_id) || 1,
        nodeName: decoded.node_name || 'Central Gateway',
        role: decoded.role || 'ROLE_OPERATOR',
      });
      // Por que: Modifica o estado para liberar o acesso às telas do app.
      setIsAuthenticated(true);
    } else {
      // Por que: Alerta em caso de token inválido.
      Alert.alert('Erro operacional', 'Falha ao decodificar a credencial de segurança.');
    }
  };

  // Por que: Inicializa o baseURL do Axios na montagem do layout.
  useEffect(() => {
    api.defaults.baseURL = gatewayUrl;
  }, []);

  // Por que: Se o usuário não estiver autenticado, exibe a tela de login/cadastro bloqueando o restante.
  if (!isAuthenticated) {
    return (
      <AppContext.Provider
        value={{
          gatewayUrl,
          setGatewayUrl,
          simulateLatency,
          setSimulateLatency,
          isAuthenticated,
          setIsAuthenticated,
          token,
          setToken,
          operator,
          setOperator,
          logout,
        }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <AuthScreen onSuccess={handleAuthSuccess} />
        </ThemeProvider>
      </AppContext.Provider>
    );
  }

  return (
    // Por que: Provê as propriedades do contexto para toda a árvore de navegação abaixo.
    <AppContext.Provider
      value={{
        gatewayUrl,
        setGatewayUrl,
        simulateLatency,
        setSimulateLatency,
        isAuthenticated,
        setIsAuthenticated,
        token,
        setToken,
        operator,
        setOperator,
        logout,
      }}
    >
      {/* Por que: Aplica o tema padrão do Expo Router (Dark/Light). */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* Por que: Exibe overlay gráfico pulsante do splash screen espacial. */}
        <AnimatedSplashOverlay />
        {/* Por que: Roteador de abas que define as páginas visíveis. */}
        <AppTabs />
      </ThemeProvider>
    </AppContext.Provider>
  );
}
