// Por que: Importa o React e hooks essenciais de controle de estado.
import React, { useState } from 'react';
// Por que: Componentes fundamentais do React Native para layout, texto, campos de entrada, botões e alertas.
import { StyleSheet, Text, View, TextInput, TouchableOpacity, useColorScheme, Platform, ScrollView, Alert } from 'react-native';
// Por que: Importa o serviço de autenticação e comunicação com a API REST Java.
import { authService } from '@/services/authService';
// Por que: Importa o painel translúcido de design para efeito de vidro (glassmorphism).
import CardGlass from './CardGlass';
// Por que: Importa o botão espacial customizado com suporte a carregador.
import ButtonSpace from './ButtonSpace';
// Por que: Importa as configurações globais de cores e fontes do Design System.
import { Colors } from '@/constants/theme';

// Por que: Interface contendo o callback de sucesso chamado após autenticação válida.
interface AuthScreenProps {
  // Por que: Callback que envia o token JWT para o layout atualizar o estado.
  onSuccess: (token: string) => void;
}

// Por que: Componente principal de controle de acesso (Login/Cadastro) com estética Apple.
export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  // Por que: Detecta o tema ativo do dispositivo.
  const scheme = useColorScheme();
  // Por que: Obtém o dicionário de cores correto para o tema.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Alterna entre tela de 'login' e 'cadastro'.
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Por que: Estados locais para armazenamento dos valores de entrada do formulário.
  const [username, setUsername] = useState<string>('');
  // Por que: Senha inserida pelo usuário.
  const [password, setPassword] = useState<string>('');
  // Por que: Nome completo do operador (utilizado apenas no cadastro).
  const [fullName, setFullName] = useState<string>('');
  // Por que: Identificador do nó onde o operador está sediado (1 = Terra, 2 = Lua).
  const [nodeId, setNodeId] = useState<number>(1);

  // Por que: Estados auxiliares de controle de carregamento e mensagens de erro.
  const [loading, setLoading] = useState<boolean>(false);
  // Por que: Erro exibido na interface caso a chamada falhe.
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Por que: Função disparada ao submeter o formulário de Login.
  const handleLogin = async () => {
    // Por que: Reseta a mensagem de erro.
    setErrorMsg(null);
    // Por que: Impede campos em branco.
    if (!username.trim() || !password.trim()) {
      // Por que: Atualiza o estado de erro.
      setErrorMsg('Por favor, preencha todos os campos.');
      // Por que: Retorna preventivamente.
      return;
    }
    // Por que: Ativa o indicador visual de processamento da chamada.
    setLoading(true);
    // Por que: Bloco try/catch para capturar falhas de rede ou credenciais incorretas.
    try {
      // Por que: Dispara a requisição HTTP POST para a API Java.
      const res = await authService.login({
        // Por que: Passa o nome de usuário limpo de espaços.
        username: username.trim(),
        // Por que: Passa a senha literal.
        password: password,
      });
      // Por que: Dispara o callback informando o token de acesso recebido.
      onSuccess(res.token);
    } catch (err: any) {
      // Por que: Extrai a mensagem de erro da resposta.
      const detail = err.response?.data?.message || err.response?.data?.detail || 'Erro ao conectar. Verifique as credenciais ou o gateway.';
      // Por que: Apresenta o erro na tela.
      setErrorMsg(detail);
    } finally {
      // Por que: Desativa o carregamento.
      setLoading(false);
    }
  };

  // Por que: Função disparada ao submeter o formulário de Cadastro.
  const handleRegister = async () => {
    // Por que: Reseta a mensagem de erro.
    setErrorMsg(null);
    // Por que: Valida o preenchimento de todas as variáveis.
    if (!username.trim() || !password.trim() || !fullName.trim()) {
      // Por que: Atribui o erro de validação local.
      setErrorMsg('Preencha todos os dados cadastrais.');
      // Por que: Aborta execução.
      return;
    }
    // Por que: Valida tamanho mínimo do nome.
    if (fullName.trim().length < 3) {
      // Por que: Atribui o erro.
      setErrorMsg('O nome completo deve ter pelo menos 3 caracteres.');
      // Por que: Aborta.
      return;
    }
    // Por que: Valida tamanho mínimo da senha.
    if (password.length < 6) {
      // Por que: Atribui o erro.
      setErrorMsg('A senha precisa conter no mínimo 6 caracteres.');
      // Por que: Aborta.
      return;
    }
    // Por que: Ativa indicador de chamada assíncrona.
    setLoading(true);
    // Por que: Executa a gravação remota com tratamento de erros.
    try {
      // Por que: Consome o endpoint de registro do AuthService.
      await authService.register({
        // Por que: Passa o usuário.
        username: username.trim().toLowerCase(),
        // Por que: Passa a senha.
        password: password,
        // Por que: Passa o nome completo.
        fullName: fullName.trim(),
        // Por que: Passa a ID do nó orbital associado.
        nodeId: nodeId,
      });
      // Por que: Exibe diálogo de sucesso para o usuário.
      Alert.alert('Terminal Cadastrado', 'Operador registrado na rede com sucesso! Faça login para iniciar o canal de dados.');
      // Por que: Reseta o estado do formulário limpando a senha.
      setPassword('');
      // Por que: Retorna para o fluxo de Login para o usuário acessar.
      setMode('login');
    } catch (err: any) {
      // Por que: Captura a falha (ex: usuário duplicado).
      const detail = err.response?.data?.message || err.response?.data?.detail || 'Falha ao registrar operador. Verifique os dados ou a rede.';
      // Por que: Apresenta o erro na UI.
      setErrorMsg(detail);
    } finally {
      // Por que: Desativa o indicador visual.
      setLoading(false);
    }
  };

  return (
    // Por que: ScrollView para rolar formulários quando o teclado estiver visível.
    <ScrollView contentContainerStyle={styles.container}>
      {/* Por que: Contêiner de logo espacial e cabeçalho. */}
      <View style={styles.header}>
        {/* Por que: Detalhe neon circular sutil Apple-style no topo do aplicativo. */}
        <View style={[styles.glowBall, { backgroundColor: nodeId === 1 ? colors.primary : colors.secondary }]} />
        {/* Por que: Título conceitual do sistema financeiro. */}
        <Text style={[styles.title, { color: colors.text }]}>CHRONOS_DTN</Text>
        {/* Por que: Subtítulo identificando o roteamento interplanetário. */}
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Gateway de Pagamentos e Rede Tolerante a Falhas
        </Text>
      </View>

      {/* Por que: Bloco em vidro translúcido para comportar os formulários (glassmorphism). */}
      <CardGlass style={styles.card}>
        {/* Por que: Seletor de Abas superior estilizado (Apple Segment Switcher). */}
        <View style={styles.tabSelector}>
          {/* Por que: Botão da aba de Login. */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              mode === 'login' && { backgroundColor: colors.backgroundSelected, borderRadius: 8 }
            ]}
            onPress={() => {
              // Por que: Altera para login.
              setMode('login');
              // Por que: Limpa erro anterior.
              setErrorMsg(null);
            }}
          >
            {/* Por que: Texto da aba de login. */}
            <Text style={[styles.tabButtonText, { color: colors.text }]}>Entrar no Canal</Text>
          </TouchableOpacity>

          {/* Por que: Botão da aba de Registro. */}
          <TouchableOpacity
            style={[
              styles.tabButton,
              mode === 'register' && { backgroundColor: colors.backgroundSelected, borderRadius: 8 }
            ]}
            onPress={() => {
              // Por que: Altera para registro.
              setMode('register');
              // Por que: Limpa erros.
              setErrorMsg(null);
            }}
          >
            {/* Por que: Texto da aba de cadastro. */}
            <Text style={[styles.tabButtonText, { color: colors.text }]}>Registrar Terminal</Text>
          </TouchableOpacity>
        </View>

        {/* Por que: Renderiza dinamicamente o campo Nome Completo se o modo for de Cadastro. */}
        {mode === 'register' && (
          <View style={styles.inputContainer}>
            {/* Por que: Identificador do campo nome completo. */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nome Completo do Operador</Text>
            {/* Por que: Campo de texto para o nome real. */}
            <TextInput
              style={[styles.textInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: scheme === 'dark' ? '#0a0a0c' : '#f0f0f3' }]}
              placeholder="Ex: Maj. Alistair Cooper"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        )}

        {/* Por que: Campo padrão de Usuário comum aos dois fluxos. */}
        <View style={styles.inputContainer}>
          {/* Por que: Rótulo de login. */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Operador (Usuário)</Text>
          {/* Por que: Campo de texto de login. */}
          <TextInput
            style={[styles.textInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: scheme === 'dark' ? '#0a0a0c' : '#f0f0f3' }]}
            placeholder="Ex: operator"
            placeholderTextColor={colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Por que: Campo padrão de Senha comum a ambos. */}
        <View style={styles.inputContainer}>
          {/* Por que: Rótulo da senha. */}
          <Text style={[styles.inputLabel, { color: colors.text }]}>Senha de Acesso</Text>
          {/* Por que: Campo com máscara de segurança. */}
          <TextInput
            style={[styles.textInput, { color: colors.text, borderColor: colors.backgroundSelected, backgroundColor: scheme === 'dark' ? '#0a0a0c' : '#f0f0f3' }]}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
        </View>

        {/* Por que: Exibe seleção do nó de rede associado se estiver no cadastro. */}
        {mode === 'register' && (
          <View style={styles.inputContainer}>
            {/* Por que: Rótulo explicativo para o local de trabalho do operador. */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nó Operacional Base (Físico)</Text>
            {/* Por que: Grupo de botões horizontais estilizados. */}
            <View style={styles.nodeButtonGroup}>
              {/* Por que: Botão para selecionar a Terra (Node ID 1). */}
              <TouchableOpacity
                style={[
                  styles.nodeButton,
                  { borderColor: colors.primary },
                  nodeId === 1 && { backgroundColor: 'rgba(6, 182, 212, 0.2)', borderWidth: 2 }
                ]}
                onPress={() => setNodeId(1)}
              >
                {/* Por que: Texto descritivo do nó Terra. */}
                <Text style={[styles.nodeButtonText, { color: colors.text }]}>Terra (Houston)</Text>
              </TouchableOpacity>

              {/* Por que: Botão para selecionar a Lua (Node ID 2). */}
              <TouchableOpacity
                style={[
                  styles.nodeButton,
                  { borderColor: colors.secondary },
                  nodeId === 2 && { backgroundColor: 'rgba(139, 92, 246, 0.2)', borderWidth: 2 }
                ]}
                onPress={() => setNodeId(2)}
              >
                {/* Por que: Texto descritivo do nó Lua. */}
                <Text style={[styles.nodeButtonText, { color: colors.text }]}>Lua (Artemis)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Por que: Exibição condicional de erro na interface se definido. */}
        {errorMsg && (
          <Text style={[styles.errorText, { color: colors.danger }]}>{errorMsg}</Text>
        )}

        {/* Por que: Renderiza o botão correspondente ao fluxo de entrada ou gravação. */}
        {mode === 'login' ? (
          <ButtonSpace
            title="Conectar Canal"
            onPress={handleLogin}
            loading={loading}
          />
        ) : (
          <ButtonSpace
            title="Registrar Terminal"
            onPress={handleRegister}
            loading={loading}
            type="secondary"
          />
        )}
      </CardGlass>
    </ScrollView>
  );
}

// Por que: Estilos estruturais e visuais da tela de autenticação.
const styles = StyleSheet.create({
  // Por que: Estilo principal de layout com espaçamento e preenchimento de tela.
  container: {
    // Por que: Cresce para preencher a tela.
    flexGrow: 1,
    // Por que: Alinhamento vertical centralizado.
    justifyContent: 'center',
    // Por que: Preenchimento interno lateral de 20.
    padding: 20,
    // Por que: Fundo escuro profundo.
    backgroundColor: '#030712',
  },
  // Por que: Alinha a marca do sistema no meio.
  header: {
    // Por que: Alinhamento no centro horizontal.
    alignItems: 'center',
    // Por que: Espaçamento de margem inferior.
    marginBottom: 30,
    // Por que: Alinhamento relativo para a bola neon.
    position: 'relative',
  },
  // Por que: Bola de brilho estético espacial.
  glowBall: {
    // Por que: Largura física de 60.
    width: 60,
    // Por que: Altura de 60.
    height: 60,
    // Por que: Borda totalmente circular.
    borderRadius: 30,
    // Por que: Opacidade reduzida para brilho.
    opacity: 0.15,
    // Por que: Margem de distanciamento do título.
    marginBottom: 10,
  },
  // Por que: Título em destaque do ChronosDTN.
  title: {
    // Por que: Fonte grande de 28 pixels.
    fontSize: 28,
    // Por que: Peso de fonte extra negrito.
    fontWeight: '900',
    // Por que: Espaçamento entre letras.
    letterSpacing: 2,
  },
  // Por que: Texto de apoio de rede.
  subtitle: {
    // Por que: Fonte reduzida de 11.
    fontSize: 11,
    // Por que: Espaçamento de margem superior.
    marginTop: 6,
    // Por que: Centralizado.
    textAlign: 'center',
  },
  // Por que: Caixa de login.
  card: {
    // Por que: Padding interno de 20.
    padding: 20,
    // Por que: Distanciamento dos elementos filhos.
    gap: 16,
  },
  // Por que: Seletor horizontal de login/cadastro.
  tabSelector: {
    // Por que: Layout de linha.
    flexDirection: 'row',
    // Por que: Preenchimento de 4 pixels.
    padding: 4,
    // Por que: Fundo do switch sutil.
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    // Por que: Borda sutil de 8 pixels.
    borderRadius: 10,
    // Por que: Margem de base.
    marginBottom: 8,
  },
  // Por que: Botão do switch.
  tabButton: {
    // Por que: Divide igualmente o espaço.
    flex: 1,
    // Por que: Preenchimento vertical de 10.
    paddingVertical: 10,
    // Por que: Alinhamento.
    alignItems: 'center',
    // Por que: Justificação do conteúdo.
    justifyContent: 'center',
  },
  // Por que: Fonte do switch.
  tabButtonText: {
    // Por que: Fonte de 12.
    fontSize: 12,
    // Por que: Peso médio de design.
    fontWeight: 'bold',
  },
  // Por que: Invólucro de inputs.
  inputContainer: {
    // Por que: Distanciamento interno dos itens.
    gap: 6,
  },
  // Por que: Rótulo de input.
  inputLabel: {
    // Por que: Fonte de 10.
    fontSize: 10,
    // Por que: Peso negrito.
    fontWeight: 'bold',
    // Por que: Caixa alta.
    textTransform: 'uppercase',
  },
  // Por que: Caixa de entrada física.
  textInput: {
    // Por que: Altura fixa de 46.
    height: 46,
    // Por que: Borda fina.
    borderWidth: 1,
    // Por que: Cantos arredondados finos Apple-style.
    borderRadius: 8,
    // Por que: Padding interno lateral.
    paddingHorizontal: 12,
    // Por que: Fonte de 13.
    fontSize: 13,
  },
  // Por que: Grupo de botões para seleção de nó.
  nodeButtonGroup: {
    // Por que: Layout horizontal.
    flexDirection: 'row',
    // Por que: Distanciamento entre botões.
    gap: 10,
    // Por que: Margem no topo.
    marginTop: 4,
  },
  // Por que: Botão de nó individual.
  nodeButton: {
    // Por que: Divide espaço disponível.
    flex: 1,
    // Por que: Preenchimento vertical.
    paddingVertical: 12,
    // Por que: Cantos arredondados.
    borderRadius: 8,
    // Por que: Borda de 1.
    borderWidth: 1,
    // Por que: Centralização.
    alignItems: 'center',
  },
  // Por que: Rótulo de botão de nó.
  nodeButtonText: {
    // Por que: Fonte de 11.
    fontSize: 11,
    // Por que: Peso de design sênior.
    fontWeight: 'bold',
  },
  // Por que: Erro na interface.
  errorText: {
    // Por que: Fonte de 12.
    fontSize: 12,
    // Por que: Centralização de texto.
    textAlign: 'center',
    // Por que: Peso negrito.
    fontWeight: '600',
  },
});
