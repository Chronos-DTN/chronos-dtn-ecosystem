// Por que: Importa o React, hooks de estado e de efeitos.
import React, { useState, useEffect } from 'react';
// Por que: Importa componentes de interface, layouts de rolagem e feedbacks do React Native.
import { StyleSheet, Text, View, ScrollView, RefreshControl, useColorScheme, SafeAreaView, Platform } from 'react-native';
// Por que: Importa o gancho de contexto para monitorar a URL ativa da API do gateway.
import { useAppContext } from './_layout';
// Por que: Importa o serviço de integração de bundles e a tipagem de dados.
import { bundleService, BundleResponseData } from '@/services/bundleService';
// Por que: Importa componentes de exibição de painéis, leds e carregadores.
import CardGlass from '@/components/CardGlass';
import StatusIndicator from '@/components/StatusIndicator';
import SpaceLoader from '@/components/SpaceLoader';
// Por que: Importa as cores do Design System.
import { Colors } from '@/constants/theme';

// Por que: Tela que exibe a fila de pacotes Store-and-Forward (Bundles DTN) do roteador espacial.
export default function BundlesScreen() {
  // Por que: Detecta o tema ativo no dispositivo móvel.
  const scheme = useColorScheme();
  // Por que: Carrega o dicionário correspondente ao tema.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Importa a URL base do gateway ativa para recarregar fila caso mude.
  const { gatewayUrl } = useAppContext();

  // Por que: Estados para armazenar a lista física de bundles, carregamento e gestos de arrastar.
  const [bundles, setBundles] = useState<BundleResponseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Por que: Consulta os bundles no roteador espacial remoto.
  const loadBundles = async () => {
    try {
      // Por que: Chama a API REST de bundles.
      const data = await bundleService.getAll();
      // Por que: Grava a lista retornada no estado.
      setBundles(data);
    } catch (error) {
      // Por que: Loga o aviso caso o servidor remoto esteja desligado.
      console.warn('Erro ao carregar bundles da fila:', error);
    } finally {
      // Por que: Desliga os estados de carregamento.
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Por que: Inicializa os dados na montagem ou na alteração do IP do gateway.
  useEffect(() => {
    loadBundles();
  }, [gatewayUrl]);

  // Por que: Executa a atualização quando puxado para baixo.
  const onRefresh = () => {
    setRefreshing(true);
    loadBundles();
  };

  // Por que: Helper determinando o nome do nó físico baseado em seu identificador numérico.
  const getNodeName = (nodeId: number) => {
    // Por que: Nó 1 refere-se à Terra. Nó 2 refere-se à Lua.
    return nodeId === 1 ? 'Houston (Terra)' : nodeId === 2 ? 'Artemis (Lua)' : `Nó Desconhecido [${nodeId}]`;
  };

  // Por que: Helper para formatar o nível de prioridade espacial do bundle.
  const getPriorityLabel = (priority: number) => {
    // Por que: Chaveia a string de exibição.
    switch (priority) {
      case 2: return 'CRÍTICA (High)';
      case 1: return 'MÉDIA (Medium)';
      default: return 'BAIXA (Low)';
    }
  };

  // Por que: Helper determinando a cor de destaque da tag de prioridade.
  const getPriorityColor = (priority: number) => {
    // Por que: Alta prioridade = Roxo. Média = Ciano. Baixa = Cinza.
    return priority === 2 ? colors.secondary : priority === 1 ? colors.primary : colors.textSecondary;
  };

  // Por que: Tenta decodificar o payload JSON bruto para apresentar as informações financeiras de forma clara.
  const renderParsedPayload = (rawPayload: string) => {
    try {
      // Por que: Executa o parse JSON da string.
      const obj = JSON.parse(rawPayload);
      return (
        <View style={styles.payloadDetails}>
          {/* Por que: Exibe a conta debitada */}
          <Text style={[styles.payloadText, { color: colors.text }]}>
            Débito: <Text style={styles.boldText}>Conta {obj.sourceAccountId}</Text>
          </Text>
          {/* Por que: Exibe a conta creditada */}
          <Text style={[styles.payloadText, { color: colors.text }]}>
            Crédito: <Text style={styles.boldText}>Conta {obj.destAccountId}</Text>
          </Text>
          {/* Por que: Exibe o valor movimentado */}
          <Text style={[styles.payloadText, { color: colors.text }]}>
            Valor: <Text style={[styles.boldText, { color: colors.primary }]}>${obj.amount}</Text>
          </Text>
        </View>
      );
    } catch {
      // Por que: Fallback se a string não for JSON válido (renderiza o texto puro).
      return <Text style={[styles.payloadRaw, { color: colors.textSecondary }]}>{rawPayload}</Text>;
    }
  };

  // Por que: Exibe carregador com animação de antenas se estiver baixando os dados pela primeira vez.
  if (loading) {
    return <SpaceLoader message="Consultando filas do Bundle Protocol (RFC 5050)..." />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContainer, { paddingTop: Platform.OS === 'web' ? 80 : 16 }]}
        refreshControl={
          // Por que: Habilita puxar para atualizar a fila de bundles.
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Por que: Título da tela com estatísticas rápidas */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Buffer Store-and-Forward</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Exibindo {bundles.length} pacotes do Bundle Protocol em buffer local
          </Text>
        </View>

        {/* Por que: Se a fila estiver totalmente vazia, exibe card informativo de buffer limpo */}
        {bundles.length === 0 ? (
          <CardGlass style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.text }]}>Nenhum bundle na fila do gateway.</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Novas transações para nós remotos aparecerão aqui aguardando janelas de rádio.
            </Text>
          </CardGlass>
        ) : (
          // Por que: Itera sobre a lista de bundles exibindo cada um em um card com estilo de vidro
          bundles.map((bundle, index) => (
            <CardGlass key={`${bundle.sourceNodeId}-${bundle.localSequenceId}-${index}`} style={styles.bundleCard}>
              
              {/* Por que: Cabeçalho do bundle com ID composto e LED de status de trânsito */}
              <View style={styles.bundleHeader}>
                <View>
                  <Text style={[styles.bundleIdText, { color: colors.text }]}>
                    Bundle ID: <Text style={{ color: colors.primary }}>{bundle.sourceNodeId}-{bundle.localSequenceId}</Text>
                  </Text>
                  <Text style={[styles.routeText, { color: colors.textSecondary }]}>
                    De: {getNodeName(bundle.sourceNodeId)} → Para: {getNodeName(bundle.destNodeId)}
                  </Text>
                </View>
                {/* Por que: Exibe o indicador LED no status correspondente do bundle */}
                <StatusIndicator status={bundle.transmissionStatus as any} pulse={bundle.transmissionStatus === 'BUFFERED'} />
              </View>

              {/* Por que: Informações da Fila e Prioridade */}
              <View style={styles.metaRow}>
                <View style={styles.metaCol}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Status de Rede</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>{bundle.transmissionStatus}</Text>
                </View>
                <View style={styles.metaCol}>
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Prioridade DTN</Text>
                  <Text style={[styles.metaValue, { color: getPriorityColor(bundle.priority) }]}>
                    {getPriorityLabel(bundle.priority)}
                  </Text>
                </View>
              </View>

              {/* Por que: Exibição dos dados do payload e transações associadas */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Payload Financeiro (Dados)</Text>
              {renderParsedPayload(bundle.payload)}

              {/* Por que: Assinatura de hash SHA-256 para integridade no espaço profundo */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Assinatura Hash (SHA-256)</Text>
              <View style={[styles.hashContainer, { backgroundColor: scheme === 'dark' ? '#0f172a' : '#f3f4f6' }]}>
                <Text style={[styles.hashText, { color: colors.secondary }]} numberOfLines={1}>
                  {bundle.hash}
                </Text>
              </View>

              {/* Por que: Informações operacionais de TTL espacial */}
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  Registrado: {new Date(bundle.createdTime).toLocaleString('pt-BR')}
                </Text>
                <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                  Expira: {new Date(bundle.expiryTime).toLocaleString('pt-BR')}
                </Text>
              </View>

            </CardGlass>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Por que: Cria a folha de estilos estrutural dos bundles.
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
  bundleCard: {
    padding: 16,
    gap: 12,
  },
  bundleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 10,
  },
  bundleIdText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeText: {
    fontSize: 11,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  payloadDetails: {
    padding: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#06b6d4',
    gap: 4,
  },
  payloadText: {
    fontSize: 12,
  },
  boldText: {
    fontWeight: 'bold',
  },
  payloadRaw: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  hashContainer: {
    padding: 8,
    borderRadius: 6,
  },
  hashText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
    marginTop: 4,
  },
  timeText: {
    fontSize: 9,
  },
});
