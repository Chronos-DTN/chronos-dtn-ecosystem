// Por que: Importa o React e os hooks de gerenciamento de estado e efeitos.
import React, { useState } from 'react';
// Por que: Componentes nativos para layout, textos, entradas, cliques e estilização.
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, useColorScheme, SafeAreaView, Platform, Switch, Alert } from 'react-native';
// Por que: Importa o gancho de contexto para alterar e ler configurações globais da API.
import { useAppContext } from './_layout';
// Por que: Importa o serviço de gerenciamento de pacotes (bundles) para acionar transmissões orbitais.
import { bundleService, TransmissionResult } from '@/services/bundleService';
// Por que: Importa componentes de design.
import CardGlass from '@/components/CardGlass';
import ButtonSpace from '@/components/ButtonSpace';
import StatusIndicator from '@/components/StatusIndicator';
import SpaceLoader from '@/components/SpaceLoader';
// Por que: Importa cores e espaçamentos do Design System.
import { Colors } from '@/constants/theme';

// Por que: Tela de Configurações e Console de Operador do Roteador ChronosDTN.
export default function SettingsScreen() {
  // Por que: Detecta o tema de cores ativo.
  const scheme = useColorScheme();
  // Por que: Carrega o dicionário correspondente ao tema de cores.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Importa estados e mutadores do contexto global de Layout.
  const { gatewayUrl, setGatewayUrl, simulateLatency, setSimulateLatency, logout } = useAppContext();

  // Por que: Estados locais para formulários de configuração rápida.
  const [editingUrl, setEditingUrl] = useState<string>(gatewayUrl);
  const [transmitLoading, setTransmitLoading] = useState<boolean>(false);
  const [transmitResult, setTransmitResult] = useState<TransmissionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Por que: Grava e aplica o novo IP/URL de gateway configurado.
  const handleSaveConfig = () => {
    // Por que: Valida se o endereço digitado não está vazio.
    if (editingUrl.trim() === '') {
      Alert.alert('Console de Operação', 'O endereço do gateway não pode ser vazio.');
      return;
    }
    // Por que: Atualiza a URL no contexto global, reconfigurando a instância do Axios.
    setGatewayUrl(editingUrl.trim());
    // Por que: Exibe confirmação visual ao operador.
    Alert.alert('Console de Operação', 'Configuração de gateway atualizada com sucesso.');
  };

  // Por que: Dispara a simulação de rádio orbital via API REST do gateway Java.
  const handleTriggerTransmission = async () => {
    // Por que: Limpa estados de resultados anteriores e ativa carregador com atraso espacial.
    setErrorMessage(null);
    setTransmitResult(null);
    setTransmitLoading(true);

    try {
      // Por que: Executa o POST REST que consome a fila do banco de dados e sincroniza contas.
      const result = await bundleService.transmit();
      // Por que: Salva o resultado retornado no estado.
      setTransmitResult(result);
      // Por que: Alerta o usuário do sucesso da transmissão interplanetária.
      const alertMsg = `Transmissão concluída!\nBundles enviados: ${result.bundlesTransmitted}\nTransações liquidadas na chegada.`;
      if (Platform.OS !== 'web') {
        Alert.alert('Transmissão Espacial', alertMsg);
      }
    } catch (err: any) {
      // Por que: Trata erros de conexão de gateway.
      const errDetail = err.response?.data?.detail || err.response?.data?.message || 'Falha ao acionar transmissão no gateway.';
      setErrorMessage(errDetail);
    } finally {
      // Por que: Desativa loaders.
      setTransmitLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Por que: Exibe o carregador de atraso espacial de rádio se a simulação estiver em andamento */}
      {transmitLoading && (
        <SpaceLoader message="Transmitindo pacotes de dados pela antena de RF Terra-Lua..." />
      )}

      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: Platform.OS === 'web' ? 80 : 16 }]}>
        
        {/* Por que: Header operacional */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Console do Operador</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Painel de administração física e controle do gateway ChronosDTN
          </Text>
        </View>

        {/* Por que: Card de simulação e controle orbital */}
        <CardGlass style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Simulador de Link Orbital</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Dispara manualmente as janelas de contato. O roteador vai varrer a fila de pacotes, codificar as transações pendentes e liquidá-las no nó de destino.
          </Text>

          {/* Por que: Exibe resultados da última transmissão executada */}
          {transmitResult && (
            <View style={[styles.resultBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: colors.success }]}>
              <Text style={[styles.resultTitle, { color: colors.success }]}>Sucesso de Transmissão</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>
                {transmitResult.message}
              </Text>
              <Text style={[styles.resultText, { color: colors.primary, fontWeight: 'bold' }]}>
                Pacotes despachados: {transmitResult.bundlesTransmitted}
              </Text>
            </View>
          )}

          {/* Por que: Exibe erros se a chamada falhar */}
          {errorMessage && (
            <View style={[styles.resultBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: colors.danger }]}>
              <Text style={[styles.resultTitle, { color: colors.danger }]}>Erro de Enlace</Text>
              <Text style={[styles.resultText, { color: colors.text }]}>{errorMessage}</Text>
            </View>
          )}

          {/* Por que: Botão roxo/secondary neon para transmitir */}
          <ButtonSpace
            title="Disparar Transmissão Orbital"
            onPress={handleTriggerTransmission}
            type="secondary"
          />
        </CardGlass>

        {/* Por que: Card de configurações de rede da API */}
        <CardGlass style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Configurações de Rede</Text>

          {/* Por que: Configuração de IP/Endpoint do gateway remoto */}
          <Text style={[styles.label, { color: colors.text }]}>Endereço do Gateway API (Base URL)</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.textInput,
                { color: colors.text, borderColor: colors.primary, backgroundColor: scheme === 'dark' ? '#0f172a' : '#f3f4f6' }
              ]}
              placeholder="Ex: http://localhost:8080"
              placeholderTextColor={colors.textSecondary}
              value={editingUrl}
              onChangeText={setEditingUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveConfig}>
              <Text style={styles.saveButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>

          {/* Por que: Toggle para habilitar/desabilitar latência espacial no Axios */}
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Simular Latência de Rádio (~1.28s)</Text>
              <Text style={[styles.switchDesc, { color: colors.textSecondary }]}>
                Introduz atrasos eletromagnéticos reais nas chamadas de rede.
              </Text>
            </View>
            <Switch
              value={simulateLatency}
              onValueChange={setSimulateLatency}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor={simulateLatency ? colors.secondary : '#f4f3f4'}
            />
          </View>
        </CardGlass>

        {/* Por que: Card de auditoria de conformidade */}
        <CardGlass style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Sessão do Operador</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Desconecta a chave JWT deste terminal. Um novo operador precisará assinar as credenciais.
          </Text>

          {/* Por que: Botão vermelho para efetuar o logout da aplicação */}
          <ButtonSpace
            title="Encerrar Sessão (Logout)"
            onPress={logout}
            type="danger"
          />
        </CardGlass>

      </ScrollView>
    </SafeAreaView>
  );
}

// Por que: Folha de estilos para o painel de configurações.
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
  card: {
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  resultBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  resultText: {
    fontSize: 11,
    lineHeight: 15,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  saveButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    marginTop: 4,
  },
  switchTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  switchDesc: {
    fontSize: 10,
    marginTop: 2,
  },
});
