// Por que: Importa o React e hooks de estado.
import React, { useState, useEffect } from 'react';
// Por que: Componentes fundamentais do React Native para layout flexível, textos, rolagem e estilização.
import { StyleSheet, Text, View, ScrollView, useColorScheme, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
// Por que: Importa componentes de vidro translúcido e indicadores LED do projeto.
import CardGlass from '@/components/CardGlass';
import StatusIndicator from '@/components/StatusIndicator';
import { Colors } from '@/constants/theme';

// Por que: Interface que representa a modelagem conceitual de uma janela de contato orbital (enlace).
interface ContactWindow {
  id: number;
  sourceNode: string;
  destNode: string;
  start: string;
  end: string;
  bandwidth: string;
  status: 'UP' | 'DOWN' | 'SCHEDULED';
  frequency: string;
}

// Por que: Tela de Rede Orbital para monitorar o status dos enlaces e janelas de contato no espaço.
export default function NetworkScreen() {
  // Por que: Detecta se a preferência do dispositivo é tema claro ou escuro.
  const scheme = useColorScheme();
  // Por que: Carrega o dicionário correspondente ao tema de cores.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Estados locais para simular dados operacionais de telemetria física.
  const [signalStrength, setSignalStrength] = useState<number>(88); // Força em %
  const [linkErrors, setLinkErrors] = useState<number>(2); // Erros por segundo (CRC/FEC)
  const [activeFrequency, setActiveFrequency] = useState<string>('Ka-Band (32.2 GHz)');

  // Por que: Lista de contatos programados e status físico de alinhamento orbital Terra-Lua.
  const [contactWindows] = useState<ContactWindow[]>([
    // Por que: Nó transmissor Houston Station conectado com Artemis Base ativamente em Ka-Band.
    { id: 1, sourceNode: 'Houston Station', destNode: 'Artemis Base', start: '17:00 (Hoje)', end: '05:00 (Amanhã)', bandwidth: '1024 Kbps', status: 'UP', frequency: 'Ka-Band (32.2 GHz)' },
    // Por que: Nó transmissor Madrid Deep Space programado para conectar com Artemis Base na portadora X-Band.
    { id: 2, sourceNode: 'Madrid Deep Space', destNode: 'Artemis Base', start: '05:00 (Amanhã)', end: '17:00 (Amanhã)', bandwidth: '2048 Kbps', status: 'SCHEDULED', frequency: 'X-Band (8.4 GHz)' },
    // Por que: Enlace ativo entre Goldstone Complex e Lunar Gateway Orbiter em S-Band.
    { id: 3, sourceNode: 'Goldstone Complex', destNode: 'Lunar Gateway Orbiter', start: '22:00 (Hoje)', end: '04:00 (Amanhã)', bandwidth: '512 Kbps', status: 'UP', frequency: 'S-Band (2.2 GHz)' },
    // Por que: Enlace programado de laser óptico entre Canberra Deep Space e Artemis Base.
    { id: 4, sourceNode: 'Canberra Deep Space', destNode: 'Artemis Base', start: '12:00 (Amanhã)', end: '20:00 (Amanhã)', bandwidth: '1024 Kbps', status: 'SCHEDULED', frequency: 'Laser Optical' },
  ]);

  // Por que: Cria um efeito para simular pequenas flutuações físicas do sinal espacial de rádio.
  useEffect(() => {
    // Por que: Dispara um intervalo a cada 3 segundos.
    const interval = setInterval(() => {
      // Por que: Varia a força de sinal aleatoriamente entre 85% e 95%.
      setSignalStrength(prev => Math.min(100, Math.max(70, prev + (Math.random() > 0.5 ? 1 : -1))));
      // Por que: Varia erros de bit aleatoriamente entre 0 e 5.
      setLinkErrors(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 3000);

    // Por que: Limpa o temporizador na desmontagem do componente para evitar vazamento de memória.
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: Platform.OS === 'web' ? 80 : 16 }]}>
        
        {/* Por que: Header operacional */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Enlaces de Rádio</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Monitoramento de propagação física de RF no espaço profundo
          </Text>
        </View>

        {/* Por que: Card consolidando o status físico atual de recepção */}
        <CardGlass style={styles.telemetryCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Telemetria Física do Enlace</Text>

          {/* Por que: Métricas físicas do canal de rádio */}
          <View style={styles.telemetryGrid}>
            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Sinal (SNR)</Text>
              <Text style={[styles.telemetryValue, { color: colors.primary }]}>{signalStrength}%</Text>
              <Text style={[styles.telemetrySub, { color: colors.textSecondary }]}>Nível de Recepção</Text>
            </View>

            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Erros Bit (CRC)</Text>
              <Text style={[styles.telemetryValue, { color: colors.danger }]}>{linkErrors} bps</Text>
              <Text style={[styles.telemetrySub, { color: colors.textSecondary }]}>Quadros Descartados</Text>
            </View>

            <View style={styles.telemetryItem}>
              <Text style={[styles.telemetryLabel, { color: colors.textSecondary }]}>Frequência</Text>
              <Text style={[styles.telemetryValue, { color: colors.secondary, fontSize: 13 }]}>{activeFrequency}</Text>
              <Text style={[styles.telemetrySub, { color: colors.textSecondary }]}>Banda de Portadora</Text>
            </View>
          </View>

          {/* Por que: Explicação física e matemática da latência de propagação */}
          <View style={[styles.latencyExplanation, { borderColor: colors.primary }]}>
            <Text style={[styles.latencyTitle, { color: colors.text }]}>Propagação Eletromagnética (Física)</Text>
            <Text style={[styles.latencyBody, { color: colors.textSecondary }]}>
              A velocidade da luz no vácuo é de 299.792 km/s. Com a distância Terra-Lua de 384.400 km, o tempo de ida (One-Way Light Time) é de ~1.28s.
              O tempo de ida e volta (Round Trip Time) é de ~2.56s. Protocolos tradicionais (como TCP/IP) falham pois exigem confirmação instantânea de pacotes.
              O ChronosDTN usa o Bundle Protocol para armazenar pacotes localmente (Store-and-Forward) até que um enlace seja estabelecido.
            </Text>
          </View>
        </CardGlass>

        {/* Por que: Lista de contatos programados orbitais */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Janelas de Contatos Programados</Text>
        
        {contactWindows.map(window => (
          <CardGlass key={window.id} style={styles.windowCard}>
            <View style={styles.windowHeader}>
              <View>
                {/* Por que: Renderiza a rota direcionada exibindo o nó de origem e destino final. */}
                <Text style={[styles.windowNodes, { color: colors.text }]}>
                  {window.sourceNode} ⇄ {window.destNode}
                </Text>
                <Text style={[styles.windowSchedule, { color: colors.textSecondary }]}>
                  Início: {window.start} • Fim: {window.end}
                </Text>
              </View>
              {/* Por que: LED de status correspondente à janela */}
              <StatusIndicator status={window.status} pulse={window.status === 'UP'} />
            </View>

            <View style={styles.windowFooter}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Largura de Banda: <Text style={[styles.boldText, { color: colors.primary }]}>{window.bandwidth}</Text>
              </Text>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Modulação: <Text style={[styles.boldText, { color: colors.secondary }]}>{window.frequency}</Text>
              </Text>
            </View>
          </CardGlass>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

// Por que: Folha de estilos para a interface de rede.
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
  telemetryCard: {
    padding: 16,
    gap: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  telemetryGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  telemetryItem: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  telemetryLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  telemetryValue: {
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  telemetrySub: {
    fontSize: 8,
    textAlign: 'center',
  },
  latencyExplanation: {
    borderLeftWidth: 3,
    paddingLeft: 12,
    gap: 6,
    marginTop: 4,
  },
  latencyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  latencyBody: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  windowCard: {
    padding: 16,
    gap: 12,
  },
  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  windowNodes: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  windowSchedule: {
    fontSize: 11,
    marginTop: 2,
  },
  windowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
