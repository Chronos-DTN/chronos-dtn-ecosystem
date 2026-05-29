import React, { createContext, useContext, useState, useEffect } from 'react';
// Por que: Importa componentes de temas e roteador padrão do Expo.
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
// Por que: Importa utilitário de leitura do esquema de cores do aparelho (Light/Dark).
import { useColorScheme } from 'react-native';

// Por que: Importa o componente animado de Splash e o utilitário de navegação Web/Native.
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
// Por que: Importa a instância configurada do Axios para atualizar a URL base de chamadas.
import { api, setAuthToken } from '@/services/api';

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

  // Por que: Inicializa o baseURL do Axios na montagem do layout.
  useEffect(() => {
    api.defaults.baseURL = gatewayUrl;
  }, []);

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
