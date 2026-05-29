# 📱 ChronosDTN - Console Móvel de Controle de Rede (NCC App)

[![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactnative.dev)
[![Expo Router](https://img.shields.io/badge/Expo-Router_v3+-black?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

> **Módulo de Apresentação e Controle do Operador do Network Control Center (NCC).**  
> Interface móvel responsiva projetada sob a estética *Deep Space* para gerenciamento e auditoria de tráfego financeiro interplanetário.

---

## 🚀 1. Visão Geral

O aplicativo móvel **ChronosDTN** fornece aos engenheiros e operadores de rede uma interface em tempo real para monitorar os enlaces de rádio orbitais, acompanhar a fila Store-and-Forward de Bundles no roteador e disparar transações de créditos interestelares (LUN / USD).

### Recursos Chave
1.  **Dashboard Espacial**: Visão rápida dos saldos locais (Terra vs. Lua) e status operacional de nós de rede.
2.  **Fila DTN**: Lista os pacotes (Bundles) em buffer, sua prioridade (Low, Medium, High) e integridade (Hash SHA-256).
3.  **Roteamento Manual**: Interface gráfica para emitir comandos de abertura de link e disparar simulação de sincronização.
4.  **Simulação de Latência Espacial**: O aplicativo conta com uma chave nas configurações que ativa um atraso artificial de 1,28 segundos nas requisições HTTP (One-way rádio da Lua) com carregadores pulsantes (`SpaceLoader`) para emular a realidade física espacial.

---

## 🎨 2. Design System Aeroespacial (Deep Space UI)

O design visual foi concebido para evocar telas de instrumentação de naves e estações espaciais, mantendo alta legibilidade e contraste sob condições de baixa luminosidade:

*   **Paleta de Cores**:
    *   `Background`: Escuro profundo (`#030712`).
    *   `Neon Cyan`: Destaques de controle e links ativos (`#06b6d4`).
    *   `Neon Violet`: Destaques funcionais e botões primários (`#8b5cf6`).
    *   `LED Status Color`: Verde (`#22c55e`) para ativo/entregue, Vermelho (`#ef4444`) para inativo, e Azul (`#3b82f6`) para agendado.
*   **Efeito Glassmorphism**: Utilização de fundos translúcidos (`rgba(255, 255, 255, 0.08)`) com bordas finas neon para criar camadas visuais de informação.
*   **Animações de Pulsar**: Status de links orbitais piscando de forma cíclica para indicar batimentos cardíacos do sinal (heartbeat).

---

## 📁 3. Organização de Diretórios

O app utiliza a estrutura moderna do **Expo Router** baseada em arquivos (file-based routing):

```
frontend_mobile/
├── app/                           # Rotas baseadas em diretórios e arquivos
│   ├── _layout.tsx                # Gerenciador de estado de autenticação e layout raiz
│   ├── index.tsx                  # Tela de Login (Autenticação do operador via JWT)
│   └── (tabs)/                    # Rotas autenticadas agrupadas em abas (Tabs)
│       ├── dashboard.tsx          # Visão consolidada de nós e saldos de contas
│       ├── bundles.tsx            # Visualização da fila Store-and-Forward local
│       ├── transaction.tsx        # Formulário de transferência de créditos com prioridade
│       ├── network.tsx            # Contact Plan (Janelas de contato e latência do link)
│       └── settings.tsx           # Console de simulação de transmissão rádio
├── components/                    # Componentes modulares e reutilizáveis
│   ├── StatusIndicator.tsx        # Indicador visual LED do status do link
│   ├── SpaceLoader.tsx            # Overlay animado de latência espacial
│   └── animated-icon.web.tsx      # Elementos animados específicos para plataforma web
├── constants/                     # Configurações globais de estilo e temas
│   └── theme.ts                   # Token de cores e estilos globais
└── services/                      # Camada de consumo de endpoints
    └── api.ts                     # Cliente Axios com interceptores de Token e Simulação de Latência
```

---

## ⚙️ 4. Configuração e Execução

### 📋 4.1. Pré-requisitos
*   **Node.js** instalado.
*   **API Java** rodando ativamente na porta `8080` (conforme instruções do README raiz).

### 🏃 4.2. Inicialização

1.  Acesse a pasta do frontend móvel:
    ```bash
    cd frontend_mobile
    ```
2.  Instale todas as dependências locais:
    ```bash
    npm install
    ```
3.  Inicie o emulador na plataforma Web (recomendado para a banca):
    ```bash
    npm run web
    ```
    *Isso abrirá automaticamente a aba de desenvolvimento do Expo no seu navegador padrão (`http://localhost:8081`).*

---

## 🛡️ 5. Validação de Tipagem e Qualidade de Código

Para garantir que o aplicativo não sofra erros de quebra de tipos em tempo de execução, a tipagem foi codificada de forma estrita.

Para executar a validação estática de tipos do compilador do TypeScript, rode:
```bash
npx tsc --noEmit
```

Se o compilador retornar código de saída `0` (sem erros), o código está perfeitamente seguro e limpo de imperfeições estáticas de tipagem.

---

> [!IMPORTANT]
> **Dica de Teste**:
> 1. Logue com o usuário padrão `operator` e a senha `space_dtn_2026`.
> 2. Acesse a aba **Configurações** (Settings) e ative a opção **"Simulate Space Latency"**.
> 3. Ao enviar uma transação na aba **Transferir**, você verá o `SpaceLoader` pulsando por 1,28 segundos na tela, simulando o tempo de rádio lunar antes de persistir o bundle no banco de dados.
