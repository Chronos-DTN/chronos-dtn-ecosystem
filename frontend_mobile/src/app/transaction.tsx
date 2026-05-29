// Por que: Importa o React e os hooks para controle de estados locais de formulário.
import React, { useState } from 'react';
// Por que: Componentes fundamentais para estrutura, inserção de texto, estilos e feedbacks do React Native.
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, useColorScheme, SafeAreaView, Platform, Alert } from 'react-native';
// Por que: Importa o hook de contexto para recarregar ou auditar a rede ativa.
import { useAppContext } from './_layout';
// Por que: Importa o serviço de transações e a tipagem de entrada da API.
import { transactionService } from '@/services/transactionService';
// Por que: Importa componentes personalizados de design.
import CardGlass from '@/components/CardGlass';
import ButtonSpace from '@/components/ButtonSpace';
import StatusIndicator from '@/components/StatusIndicator';
// Por que: Importa as cores do Design System.
import { Colors } from '@/constants/theme';

// Por que: Representa a estrutura de dados de uma conta pré-configurada para seleção rápida.
interface AccountOption {
  id: number;
  holder: string;
  currency: string;
  nodeId: number; // 1 = Terra, 2 = Lua
  nodeName: string;
}

// Por que: Tela de Transferência Financeira e roteamento de crédito interplanetário.
export default function TransactionScreen() {
  // Por que: Identifica a preferência de aparência (Modo Claro ou Escuro).
  const scheme = useColorScheme();
  // Por que: Obtém o dicionário correspondente ao tema.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Importa o estado de simulação de latência de rede.
  const { simulateLatency } = useAppContext();

  // Por que: Lista de contas disponíveis baseadas na semente oficial (semente do banco de dados).
  const accountOptions: AccountOption[] = [
    { id: 101, holder: 'Houston Station Account (Terra)', currency: 'USD', nodeId: 1, nodeName: 'Terra' },
    { id: 201, holder: 'Shackleton Mining Account (Lua)', currency: 'LUN', nodeId: 2, nodeName: 'Lua' },
    { id: 202, holder: 'Habitat Utilities Account (Lua)', currency: 'LUN', nodeId: 2, nodeName: 'Lua' },
  ];

  // Por que: Estados do formulário de entrada.
  const [sourceAccount, setSourceAccount] = useState<AccountOption>(accountOptions[0]);
  const [destAccount, setDestAccount] = useState<AccountOption>(accountOptions[1]);
  const [amount, setAmount] = useState<string>('');
  const [priority, setPriority] = useState<number>(1); // Padrão: Média (1)

  // Por que: Estados auxiliares de processamento e feedbacks.
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Por que: Verifica se a transferência cruza nós diferentes (Terra -> Lua ou vice-versa).
  const isCrossNode = sourceAccount.nodeId !== destAccount.nodeId;

  // Por que: Executa o envio da transação ao gateway REST.
  const handleTransfer = async () => {
    // Por que: Reseta os estados de feedback antes de disparar.
    setErrorMessage(null);
    setSuccessMessage(null);

    // Por que: Converte o valor de amount em float para validação.
    const numericAmount = parseFloat(amount);
    // Por que: Impede o envio se o valor for inválido ou menor/igual a zero.
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Digite um valor de transferência válido e superior a zero.');
      return;
    }

    // Por que: Impede transferência para a mesma conta.
    if (sourceAccount.id === destAccount.id) {
      setErrorMessage('As contas de origem e destino não podem ser idênticas.');
      return;
    }

    // Por que: Ativa o loader no botão bloqueando cliques duplicados.
    setLoading(true);

    try {
      // Por que: Chama o serviço assíncrono que realiza o POST HTTP na API Spring Boot.
      const response = await transactionService.create({
        sourceAccountId: sourceAccount.id,
        destAccountId: destAccount.id,
        amount: numericAmount,
        priority: priority,
      });

      // Por que: Limpa o input de valor em caso de sucesso.
      setAmount('');
      
      // Por que: Constrói mensagem de sucesso informando se foi liquidado ou enfileirado no buffer.
      const msg = isCrossNode
        ? `Transação gravada! Criado Bundle ID: ${response.sourceNodeId}-${response.bundleId}. O pacote foi colocado no buffer Store-and-Forward aguardando a próxima janela de contato orbital.`
        : `Transação liquidada localmente com sucesso! Saldo creditado imediatamente no nó. ID da Transação: ${response.transactionId}`;

      setSuccessMessage(msg);
      
      // Por que: Exibe alerta nativo se for em dispositivo móvel físico.
      if (Platform.OS !== 'web') {
        Alert.alert('Consola do Gateway', msg);
      }
    } catch (err: any) {
      // Por que: Trata erros de saldo insuficiente ou erros internos informados pela API.
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || 'Falha ao despachar a transação. Verifique a conectividade ou saldo da conta.';
      setErrorMessage(errorMsg);
    } finally {
      // Por que: Desativa loaders.
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: Platform.OS === 'web' ? 80 : 16 }]}>
        
        {/* Por que: Header operacional */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Despachar Créditos</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Inicie roteamento de valores sob regras de rede tolerante a atrasos (DTN)
          </Text>
        </View>

        {/* Por que: Formulário principal encapsulado em vidro */}
        <CardGlass style={styles.formCard}>
          
          {/* Por que: Seleção da conta debitada */}
          <Text style={[styles.label, { color: colors.text }]}>Conta de Origem (Débito)</Text>
          <View style={styles.selectorContainer}>
            {accountOptions.map(option => (
              <TouchableOpacity
                key={`src-${option.id}`}
                style={[
                  styles.optionButton,
                  { borderColor: colors.primary },
                  sourceAccount.id === option.id && { backgroundColor: 'rgba(6, 182, 212, 0.2)', borderWidth: 2 }
                ]}
                onPress={() => setSourceAccount(option)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option.holder}</Text>
                <Text style={[styles.optionSubText, { color: colors.textSecondary }]}>
                  ID: {option.id} • Moeda: {option.currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Por que: Seleção da conta creditada */}
          <Text style={[styles.label, { color: colors.text }]}>Conta de Destino (Crédito)</Text>
          <View style={styles.selectorContainer}>
            {accountOptions.map(option => (
              <TouchableOpacity
                key={`dest-${option.id}`}
                style={[
                  styles.optionButton,
                  { borderColor: colors.secondary },
                  destAccount.id === option.id && { backgroundColor: 'rgba(139, 92, 246, 0.2)', borderWidth: 2 }
                ]}
                onPress={() => setDestAccount(option)}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>{option.holder}</Text>
                <Text style={[styles.optionSubText, { color: colors.textSecondary }]}>
                  ID: {option.id} • Moeda: {option.currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Por que: Campo numérico de valor */}
          <Text style={[styles.label, { color: colors.text }]}>Valor da Transferência</Text>
          <TextInput
            style={[
              styles.textInput,
              { color: colors.text, borderColor: colors.primary, backgroundColor: scheme === 'dark' ? '#0f172a' : '#f3f4f6' }
            ]}
            placeholder="Ex: 5000.00"
            placeholderTextColor={colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          {/* Por que: Seleção de prioridade do pacote DTN */}
          <Text style={[styles.label, { color: colors.text }]}>Prioridade de Trânsito DTN</Text>
          <View style={styles.priorityContainer}>
            {[
              { level: 0, name: 'Baixa (Low)' },
              { level: 1, name: 'Média (Medium)' },
              { level: 2, name: 'Alta (High)' },
            ].map(p => (
              <TouchableOpacity
                key={`prio-${p.level}`}
                style={[
                  styles.priorityButton,
                  { borderColor: colors.textSecondary },
                  priority === p.level && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => setPriority(p.level)}
              >
                <Text style={[styles.priorityText, { color: colors.text }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Por que: Alerta didático em tempo real sobre a física da transmissão */}
          <View style={[styles.alertBox, { backgroundColor: isCrossNode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)' }]}>
            <View style={styles.alertHeader}>
              <StatusIndicator status={isCrossNode ? 'BUFFERED' : 'ACTIVE'} pulse={isCrossNode} />
              <Text style={[styles.alertTitle, { color: isCrossNode ? colors.warning : colors.success }]}>
                {isCrossNode ? 'Roteamento com Atraso (Cross-Node)' : 'Liquidação Instantânea (Local-Node)'}
              </Text>
            </View>
            <Text style={[styles.alertBody, { color: colors.text }]}>
              {isCrossNode
                ? `Esta transação trafega de ${sourceAccount.nodeName} para ${destAccount.nodeName}. O gateway armazenará o payload em um bundle e o enviará via rádio espacial de rádio na próxima janela operacional, sujeita a latência de ~1.28s.`
                : 'Esta transação é liquida localmente no mesmo nó espacial. Não há necessidade de roteamento orbital, e o saldo é alterado instantaneamente.'}
            </Text>
          </View>

          {/* Por que: Exibição de feedbacks visuais */}
          {errorMessage && <Text style={[styles.errorText, { color: colors.danger }]}>{errorMessage}</Text>}
          {successMessage && <Text style={[styles.successText, { color: colors.success }]}>{successMessage}</Text>}

          {/* Por que: Dispara a transferência chamando a API do Axios com o loader */}
          <ButtonSpace
            title="Autorizar e Enviar Bundle"
            onPress={handleTransfer}
            loading={loading}
            style={styles.submitButton}
          />
        </CardGlass>
      </ScrollView>
    </SafeAreaView>
  );
}

// Por que: Folha de estilos para o formulário financeiro espacial.
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
  formCard: {
    padding: 16,
    gap: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  selectorContainer: {
    gap: 8,
  },
  optionButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  optionSubText: {
    fontSize: 10,
    marginTop: 2,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  alertBox: {
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 6,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  alertBody: {
    fontSize: 11,
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  successText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 10,
  },
});
