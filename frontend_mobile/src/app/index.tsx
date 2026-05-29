// Por que: Importa o React e os hooks para ciclo de vida e gerenciamento de estado local.
import React, { useState, useEffect } from 'react';
// Por que: Componentes fundamentais do React Native para exibição gráfica, rolagem, toques e identificação de sistema.
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, useColorScheme, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
// Por que: Importa o roteador do Expo Router para navegação programática entre as abas.
import { router } from 'expo-router';
// Por que: Importa o gancho de acesso ao contexto global para obter informações do operador logado.
import { useAppContext } from './_layout';
// Por que: Importa o painel customizado com efeito translúcido de vidro (glassmorphism).
import CardGlass from '@/components/CardGlass';
// Por que: Importa o indicador LED de estado físico da rede orbital.
import StatusIndicator from '@/components/StatusIndicator';
// Por que: Importa as cores e espaçamentos padronizados do Design System do app.
import { Colors } from '@/constants/theme';

// Por que: Componente principal da tela Home/Dashboard (NCC - Network Control Center).
export default function DashboardScreen() {
  // Por que: Detecta se a preferência visual do sistema é o tema escuro ou claro.
  const scheme = useColorScheme();
  // Por que: Obtém o conjunto de cores correspondente ao tema ativo.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Acessa os dados do operador logado obtidos a partir das claims do token JWT.
  const { operator, logout } = useAppContext();

  // Por que: Estados locais para simular e gerenciar a execução do teste de velocidade (Speedtest).
  const [speedTestRunning, setSpeedTestRunning] = useState<boolean>(false);
  // Por que: Valor exibido da velocidade de download durante ou após o teste.
  const [downloadSpeed, setDownloadSpeed] = useState<number>(0.0);
  // Por que: Valor exibido da velocidade de upload durante ou após o teste.
  const [uploadSpeed, setUploadSpeed] = useState<number>(0.0);
  // Por que: Latência simulada ativa exibida no teste.
  const [latencyTest, setLatencyTest] = useState<number>(0);
  // Por que: Status descritivo da simulação do enlace físico.
  const [testPhase, setTestPhase] = useState<string>('Enlace pronto para testes');

  // Por que: Controla se o saldo das contas deve ficar visível ou oculto (característica do Nubank).
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Por que: Valores estáticos de saldos simulados representativos das duas bases operacionais (Terra e Lua).
  const balances = {
    // Por que: Saldo em Dólares Terrestres (USD) da conta SpaceX alocada em Houston.
    earth: '15.000.000,00',
    // Por que: Saldo em Créditos Lunares (LUN) da conta Shackleton alocada em Artemis.
    moon: '1.850.000,00',
  };

  // Por que: Função que simula o teste de velocidade espacial (Speedtest-like).
  const runConnectionTest = () => {
    // Por que: Impede a execução simultânea se já estiver rodando.
    if (speedTestRunning) return;
    // Por que: Ativa o estado de teste em andamento.
    setSpeedTestRunning(true);
    // Por que: Reseta velocidades anteriores.
    setDownloadSpeed(0);
    // Por que: Reseta upload.
    setUploadSpeed(0);
    // Por que: Define fase inicial de alinhamento físico das antenas.
    setTestPhase('Buscando alinhamento com antena Lunar Relay Satellite A...');
    // Por que: Primeiro temporizador simulando alinhamento de rádio (1 segundo).
    setTimeout(() => {
      // Por que: Avança fase para medição de latência física Terra-Lua.
      setTestPhase('Medindo tempo de propagação da luz (One-Way Light Time)...');
      // Por que: Aplica latência fixa física de 1280 milissegundos.
      setLatencyTest(1280);
      // Por que: Segundo temporizador para iniciar o teste de download (2 segundos).
      setTimeout(() => {
        // Por que: Atualiza a fase do teste para download ativo.
        setTestPhase('Simulando download de telemetria científica (Ka-Band)...');
        // Por que: Define velocidade simulada de download (10.2 Mbps).
        setDownloadSpeed(10.2);
        // Por que: Terceiro temporizador para iniciar o teste de upload (3 segundos).
        setTimeout(() => {
          // Por que: Atualiza fase do teste para upload ativo.
          setTestPhase('Simulando upload de lotes de transações financeiras...');
          // Por que: Define velocidade simulada de upload (4.8 Mbps).
          setUploadSpeed(4.8);
          // Por que: Quarto temporizador para conclusão do teste (4 segundos).
          setTimeout(() => {
            // Por que: Finaliza o estado de execução do teste de rede.
            setTestPhase('Enlace espacial testado com sucesso!');
            // Por que: Libera o botão para novos testes.
            setSpeedTestRunning(false);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    // Por que: SafeAreaView para posicionar o conteúdo abaixo da barra de status do aparelho.
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Por que: Área de rolagem vertical para comportar todos os cards informativos. */}
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: Platform.OS === 'web' ? 80 : 16 }]}>
        
        {/* Por que: Cabeçalho superior contendo informações do Operador e Nó de Rádio. */}
        <View style={styles.header}>
          {/* Por que: Linha horizontal agrupando título e botão de desconexão. */}
          <View style={styles.headerRow}>
            {/* Por que: Título principal da estação ativa. */}
            <View>
              {/* Por que: Nome da base espacial obtida nas propriedades de JWT do operador. */}
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                Estação: {operator?.nodeName || 'Central de Controle'}
              </Text>
              {/* Por que: Identificação do operador ativo no terminal. */}
              <Text style={[styles.operatorText, { color: colors.textSecondary }]}>
                Operador: {operator?.username || 'Carregando...'} ({operator?.role === 'ROLE_OPERATOR' ? 'Nível Militar' : 'Civil'})
              </Text>
            </View>
            {/* Por que: Botão discreto Apple-style para desconectar a sessão. */}
            <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.danger }]} onPress={logout}>
              {/* Por que: Texto vermelho de saída. */}
              <Text style={[styles.logoutButtonText, { color: colors.danger }]}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Por que: Seção de Saldos baseada no Nubank com opção de ocultar valores. */}
        <CardGlass style={styles.nubankCard}>
          {/* Por que: Linha contendo o título do saldo e o botão de visibilidade. */}
          <View style={styles.cardHeaderRow}>
            {/* Por que: Título do card financeiro. */}
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Saldos Operacionais</Text>
            {/* Por que: Botão interativo para exibir ou ocultar os valores na tela. */}
            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
              {/* Por que: Texto dinâmico mudando conforme o estado visível. */}
              <Text style={[styles.eyeButtonText, { color: colors.primary }]}>
                {showBalance ? 'Ocultar Saldo' : 'Mostrar Saldo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Por que: Exibição do Saldo Terrestre (USD). */}
          <View style={styles.balanceItem}>
            {/* Por que: Identificador da moeda e região. */}
            <Text style={[styles.currencyLabel, { color: colors.text }]}>Conta Terrestre (SpaceX - USD)</Text>
            {/* Por que: Valor do saldo se visível, senão barra cinza de privacidade. */}
            {showBalance ? (
              // Por que: Saldo formatado.
              <Text style={[styles.balanceValue, { color: colors.text }]}>
                $ {balances.earth}
              </Text>
            ) : (
              // Por que: Elemento visual de bloqueio de segurança.
              <View style={[styles.balancePlaceholder, { backgroundColor: colors.backgroundSelected }]} />
            )}
          </View>

          {/* Por que: Divisor estético sutil. */}
          <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />

          {/* Por que: Exibição do Saldo Lunar (LUN - Lunar Credits). */}
          <View style={styles.balanceItem}>
            {/* Por que: Identificador da moeda e nó associado. */}
            <Text style={[styles.currencyLabel, { color: colors.text }]}>Conta Lunar (Shackleton - LUN)</Text>
            {/* Por que: Valor do saldo se visível, senão barra de privacidade. */}
            {showBalance ? (
              // Por que: Saldo formatado em créditos lunares.
              <Text style={[styles.balanceValue, { color: colors.secondary }]}>
                LUN {balances.moon}
              </Text>
            ) : (
              // Por que: Elemento de bloqueio.
              <View style={[styles.balancePlaceholder, { backgroundColor: colors.backgroundSelected }]} />
            )}
          </View>
        </CardGlass>

        {/* Por que: Atalhos rápidos circulares baseados no layout do Nubank. */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ações Rápidas</Text>
        {/* Por que: Grade de botões horizontais roláveis para acesso às outras abas. */}
        <View style={styles.quickActionsGrid}>
          {/* Por que: Botão de atalho para enviar transação. */}
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/transaction')}>
            {/* Por que: Invólucro circular neon ciano. */}
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: colors.primary }]}>
              {/* Por que: Letra representativa do ícone. */}
              <Text style={[styles.actionIconText, { color: colors.primary }]}>⇄</Text>
            </View>
            {/* Por que: Rótulo curto de ação. */}
            <Text style={[styles.actionLabel, { color: colors.text }]}>Transferir</Text>
          </TouchableOpacity>

          {/* Por que: Botão de atalho para ver a fila de pacotes Store-and-Forward (Bundles). */}
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/bundles')}>
            {/* Por que: Invólucro circular neon roxo. */}
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.1)', borderColor: colors.secondary }]}>
              {/* Por que: Símbolo de fila. */}
              <Text style={[styles.actionIconText, { color: colors.secondary }]}>▤</Text>
            </View>
            {/* Por que: Rótulo curto. */}
            <Text style={[styles.actionLabel, { color: colors.text }]}>Fila DTN</Text>
          </TouchableOpacity>

          {/* Por que: Botão de atalho para a telemetria de rádio. */}
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/network')}>
            {/* Por que: Invólucro circular verde. */}
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: colors.success }]}>
              {/* Por que: Símbolo de antena. */}
              <Text style={[styles.actionIconText, { color: colors.success }]}>📡</Text>
            </View>
            {/* Por que: Rótulo curto. */}
            <Text style={[styles.actionLabel, { color: colors.text }]}>Rede</Text>
          </TouchableOpacity>

          {/* Por que: Botão de atalho para o console do operador. */}
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/settings')}>
            {/* Por que: Invólucro circular cinza. */}
            <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(176, 180, 186, 0.1)', borderColor: colors.textSecondary }]}>
              {/* Por que: Símbolo de console. */}
              <Text style={[styles.actionIconText, { color: colors.textSecondary }]}>⚙</Text>
            </View>
            {/* Por que: Rótulo. */}
            <Text style={[styles.actionLabel, { color: colors.text }]}>Console</Text>
          </TouchableOpacity>
        </View>

        {/* Por que: Seção de Monitoramento de Enlace baseada no Speedtest. */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Desempenho de Rádio (Speedtest)</Text>
        {/* Por que: Card com layout escuro de rádio e simulação ativa. */}
        <CardGlass style={styles.speedtestCard}>
          {/* Por que: Cabeçalho com indicador LED e velocidade instantânea. */}
          <View style={styles.speedtestHeader}>
            <View>
              {/* Por que: Título técnico do link. */}
              <Text style={[styles.speedtestTitle, { color: colors.text }]}>Enlace Terra-Lua (RF Ka-Band)</Text>
              {/* Por que: Descrição do status atual do teste. */}
              <Text style={[styles.speedtestStatusText, { color: colors.textSecondary }]}>{testPhase}</Text>
            </View>
            {/* Por que: LED dinâmico indicando se o teste de velocidade está rodando. */}
            <StatusIndicator status={speedTestRunning ? 'PENDING' : 'UP'} pulse={speedTestRunning} />
          </View>

          {/* Por que: Grade exibindo a telemetria do Speedtest. */}
          <View style={styles.telemetryGrid}>
            {/* Por que: Item de Velocidade de Download. */}
            <View style={[styles.telemetryItem, { borderColor: colors.backgroundSelected }]}>
              {/* Por que: Rótulo. */}
              <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Download</Text>
              {/* Por que: Velocidade medida. */}
              <Text style={[styles.telemetryValue, { color: colors.primary }]}>{downloadSpeed.toFixed(1)} Mbps</Text>
            </View>

            {/* Por que: Item de Velocidade de Upload. */}
            <View style={[styles.telemetryItem, { borderColor: colors.backgroundSelected }]}>
              {/* Por que: Rótulo. */}
              <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Upload</Text>
              {/* Por que: Velocidade medida. */}
              <Text style={[styles.telemetryValue, { color: colors.secondary }]}>{uploadSpeed.toFixed(1)} Mbps</Text>
            </View>

            {/* Por que: Item de Latência física (Ping RTT). */}
            <View style={[styles.telemetryItem, { borderColor: colors.backgroundSelected }]}>
              {/* Por que: Rótulo. */}
              <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Ping RTT</Text>
              {/* Por que: Latência medida em ms. */}
              <Text style={[styles.telemetryValue, { color: colors.success }]}>{latencyTest} ms</Text>
            </View>
          </View>

          {/* Por que: Alerta didático demonstrando o estado de blackout da rede orbital e Store-and-Forward. */}
          <View style={[styles.infoBox, { backgroundColor: 'rgba(6, 182, 212, 0.05)', borderColor: colors.primary }]}>
            {/* Por que: Título explicativo do comportamento DTN. */}
            <Text style={[styles.infoBoxTitle, { color: colors.primary }]}>Mecânica de Blackout & Persistência</Text>
            {/* Por que: Texto instruindo o usuário sobre blackouts e como os dados persistem no banco Oracle. */}
            <Text style={[styles.infoBoxBody, { color: colors.textSecondary }]}>
              Se houver perda de alinhamento orbital (Blackout), o gateway não rejeita a transação. O ecossistema armazena os dados localmente no nó remetente como um Bundle persistido no banco Oracle, liberando a navegação do usuário e liquidando os créditos na chegada da próxima janela.
            </Text>
          </View>

          {/* Por que: Botão para acionar o teste de velocidade espacial. */}
          <TouchableOpacity
            style={[
              styles.testButton,
              { backgroundColor: speedTestRunning ? colors.backgroundSelected : colors.primary }
            ]}
            onPress={runConnectionTest}
            disabled={speedTestRunning}
          >
            {/* Por que: Mostra spinner se estiver rodando, senão texto de chamada. */}
            {speedTestRunning ? (
              // Por que: Indicador de carregamento.
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              // Por que: Rótulo de gatilho do teste.
              <Text style={[styles.testButtonText, { color: '#ffffff' }]}>Iniciar Teste de Enlace</Text>
            )}
          </TouchableOpacity>
        </CardGlass>
      </ScrollView>
    </SafeAreaView>
  );
}

// Por que: Folha de estilos contendo o design da tela de dashboard integrada.
const styles = StyleSheet.create({
  // Por que: Preenche a tela e respeita áreas seguras de notch e barras.
  safeArea: {
    // Por que: Expande o elemento para ocupar todo o viewport disponível.
    flex: 1,
  },
  // Por que: Contêiner de rolagem com padding e margens apropriadas.
  scrollContainer: {
    // Por que: Preenchimento de 16 pixels nas bordas.
    padding: 16,
    // Por que: Espaçamento de segurança inferior para a barra de navegação móvel de 80.
    paddingBottom: 80,
    // Por que: Distanciamento de 16 pixels entre os cards principais.
    gap: 16,
  },
  // Por que: Cabeçalho superior contendo informações da base.
  header: {
    // Por que: Margem de base para distanciamento do card financeiro.
    marginBottom: 4,
  },
  // Por que: Alinhamento horizontal de título e saída.
  headerRow: {
    // Por que: Direcionamento horizontal dos filhos.
    flexDirection: 'row',
    // Por que: Distribui o espaço entre texto e botão.
    justifyContent: 'space-between',
    // Por que: Centraliza verticalmente.
    alignItems: 'center',
  },
  // Por que: Texto de saudação do painel.
  welcomeText: {
    // Por que: Fonte em destaque médio.
    fontSize: 18,
    // Por que: Peso de negrito robusto.
    fontWeight: 'bold',
  },
  // Por que: Telemetria textual do operador.
  operatorText: {
    // Por que: Fonte menor de 11.
    fontSize: 11,
    // Por que: Margem superior leve.
    marginTop: 2,
  },
  // Por que: Botão de saída.
  logoutButton: {
    // Por que: Preenchimento de texto interno.
    paddingHorizontal: 12,
    // Por que: Preenchimento vertical.
    paddingVertical: 6,
    // Por que: Cantos arredondados finos.
    borderRadius: 6,
    // Por que: Borda de 1.
    borderWidth: 1,
  },
  // Por que: Texto dentro do botão de logout.
  logoutButtonText: {
    // Por que: Fonte pequena de 11.
    fontSize: 11,
    // Por que: Peso de fonte negrito.
    fontWeight: 'bold',
  },
  // Por que: Card financeiro inspirado no Nubank.
  nubankCard: {
    // Por que: Padding interno lateral e vertical de 16.
    padding: 16,
    // Por que: Espaçamento entre os itens internos.
    gap: 14,
  },
  // Por que: Linha contendo label e botão de ocultar saldo.
  cardHeaderRow: {
    // Por que: Layout de linha horizontal.
    flexDirection: 'row',
    // Por que: Distribuição espacial.
    justifyContent: 'space-between',
    // Por que: Centralização.
    alignItems: 'center',
  },
  // Por que: Rótulo identificador do card.
  cardLabel: {
    // Por que: Fonte menor.
    fontSize: 10,
    // Por que: Peso negrito.
    fontWeight: 'bold',
    // Por que: Caixa alta estática.
    textTransform: 'uppercase',
  },
  // Por que: Botão de visibilidade de saldo.
  eyeButtonText: {
    // Por que: Fonte de 11.
    fontSize: 11,
    // Por que: Peso médio de design.
    fontWeight: 'bold',
  },
  // Por que: Elemento contendo uma das moedas.
  balanceItem: {
    // Por que: Distanciamento.
    gap: 4,
  },
  // Por que: Rótulo da moeda específica.
  currencyLabel: {
    // Por que: Fonte pequena de 11.
    fontSize: 11,
    // Por que: Peso médio.
    fontWeight: '500',
  },
  // Por que: Valor monetário da conta.
  balanceValue: {
    // Por que: Fonte grande de 22 pixels.
    fontSize: 22,
    // Por que: Peso negrito de alto destaque.
    fontWeight: 'bold',
  },
  // Por que: Elemento que substitui o valor do saldo ocultado.
  balancePlaceholder: {
    // Por que: Altura correspondente à fonte.
    height: 24,
    // Por que: Largura fixa de 140 pixels.
    width: 140,
    // Por que: Cantos arredondados de segurança.
    borderRadius: 4,
  },
  // Por que: Linha fina divisória de contas.
  divider: {
    // Por que: Altura de 1 pixel.
    height: 1,
    // Por que: Opacidade sutil.
    opacity: 0.3,
  },
  // Por que: Título de seções secundárias.
  sectionTitle: {
    // Por que: Fonte média de 14.
    fontSize: 14,
    // Por que: Peso de negrito pesado.
    fontWeight: '800',
    // Por que: Espaçamento de margem superior.
    marginTop: 8,
    // Por que: Caixa alta.
    textTransform: 'uppercase',
  },
  // Por que: Linha horizontal de atalhos rápidos circulares.
  quickActionsGrid: {
    // Por que: Layout de linha.
    flexDirection: 'row',
    // Por que: Distribui os botões uniformemente.
    justifyContent: 'space-between',
    // Por que: Padding vertical de 4.
    paddingVertical: 4,
  },
  // Por que: Invólucro de clique do atalho.
  actionButton: {
    // Por que: Alinhamento vertical centralizado.
    alignItems: 'center',
    // Por que: Distanciamento do ícone e rótulo.
    gap: 6,
  },
  // Por que: Círculo ao redor do símbolo.
  actionIconContainer: {
    // Por que: Diâmetro circular de 52 pixels.
    width: 52,
    // Por que: Altura circular.
    height: 52,
    // Por que: Borda circular perfeita.
    borderRadius: 26,
    // Por que: Borda de 1.
    borderWidth: 1,
    // Por que: Centraliza o símbolo.
    alignItems: 'center',
    // Por que: Justifica centralizado.
    justifyContent: 'center',
  },
  // Por que: Letra representativa do atalho.
  actionIconText: {
    // Por que: Fonte grande de 20 pixels.
    fontSize: 20,
    // Por que: Peso negrito.
    fontWeight: 'bold',
  },
  // Por que: Rótulo curto descritivo da ação rápida.
  actionLabel: {
    // Por que: Fonte pequena de 11.
    fontSize: 11,
    // Por que: Peso de design sênior.
    fontWeight: 'bold',
  },
  // Por que: Card do painel do teste de velocidade (Speedtest).
  speedtestCard: {
    // Por que: Preenchimento de 16 pixels.
    padding: 16,
    // Por que: Distanciamento vertical.
    gap: 14,
  },
  // Por que: Cabeçalho com indicador.
  speedtestHeader: {
    // Por que: Layout horizontal.
    flexDirection: 'row',
    // Por que: Distribuição espacial.
    justifyContent: 'space-between',
    // Por que: Centralização.
    alignItems: 'center',
  },
  // Por que: Título técnico do Speedtest.
  speedtestTitle: {
    // Por que: Fonte média de 14.
    fontSize: 14,
    // Por que: Peso negrito.
    fontWeight: 'bold',
  },
  // Por que: Rótulo descritivo do teste ativo.
  speedtestStatusText: {
    // Por que: Fonte de 10.
    fontSize: 10,
    // Por que: Margem superior.
    marginTop: 2,
  },
  // Por que: Grade de estatísticas do rádio.
  telemetryGrid: {
    // Por que: Layout horizontal.
    flexDirection: 'row',
    // Por que: Distanciamento lateral.
    gap: 8,
  },
  // Por que: Célula de estatística.
  telemetryItem: {
    // Por que: Divide igualmente o espaço da linha.
    flex: 1,
    // Por que: Preenchimento interno.
    padding: 10,
    // Por que: Cantos arredondados de 6.
    borderRadius: 6,
    // Por que: Borda de 1.
    borderWidth: 1,
    // Por que: Centraliza o texto.
    alignItems: 'center',
    // Por que: Fundo sutil do painel.
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  // Por que: Rótulo estatístico.
  telemetryLabel: {
    // Por que: Fonte de 8.
    fontSize: 8,
    // Por que: Negrito.
    fontWeight: 'bold',
    // Por que: Caixa alta.
    textTransform: 'uppercase',
  },
  // Por que: Valor estatístico.
  telemetryValue: {
    // Por que: Fonte de 13.
    fontSize: 13,
    // Por que: Peso de negrito robusto.
    fontWeight: 'bold',
    // Por que: Margem superior.
    marginTop: 4,
  },
  // Por que: Caixa com informações didáticas da física orbital.
  infoBox: {
    // Por que: Preenchimento de 12.
    padding: 12,
    // Por que: Cantos arredondados de 8.
    borderRadius: 8,
    // Por que: Borda fina.
    borderWidth: 1,
    // Por que: Distanciamento.
    gap: 4,
  },
  // Por que: Título do bloco.
  infoBoxTitle: {
    // Por que: Fonte de 12.
    fontSize: 12,
    // Por que: Peso negrito.
    fontWeight: 'bold',
  },
  // Por que: Texto técnico do bloco.
  infoBoxBody: {
    // Por que: Fonte de 10.
    fontSize: 10,
    // Por que: Altura de linha ajustada para melhor legibilidade.
    lineHeight: 14,
    // Por que: Alinhamento justificado.
    textAlign: 'justify',
  },
  // Por que: Botão de acionamento do teste.
  testButton: {
    // Por que: Altura fixa de 44.
    height: 44,
    // Por que: Cantos arredondados Apple-style.
    borderRadius: 8,
    // Por que: Centralização.
    alignItems: 'center',
    // Por que: Justificação vertical.
    justifyContent: 'center',
    // Por que: Margem superior leve.
    marginTop: 4,
  },
  // Por que: Texto do botão de teste.
  testButtonText: {
    // Por que: Fonte de 12.
    fontSize: 12,
    // Por que: Peso negrito de alto contraste.
    fontWeight: 'bold',
  },
});
