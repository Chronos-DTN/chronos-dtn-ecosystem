// Por que: Importa a biblioteca do React para criar componentes funcionais.
import React, { useEffect, useRef } from 'react';
// Por que: Importa componentes e APIs de animação nativos do React Native.
import { View, StyleSheet, Animated } from 'react-native';

// Por que: Define a interface de entrada para o indicador de status espacial.
interface StatusIndicatorProps {
  // Por que: Status operacionais possíveis de transações, nós de rede ou links de rádio, incluindo canais agendados.
  status: 'ACTIVE' | 'UP' | 'BUFFERED' | 'PENDING' | 'DOWN' | 'INACTIVE' | 'EXPIRED' | 'DELIVERED' | 'SCHEDULED';
  // Por que: Se verdadeiro, ativa o efeito pulsante para simular enlace de rádio oscilando.
  pulse?: boolean;
}

// Por que: Componente funcional que desenha um led indicador com animação de pulso.
export default function StatusIndicator({ status, pulse = true }: StatusIndicatorProps) {
  // Por que: Cria uma referência persistente para a opacidade animada, iniciando em 0.4.
  const animatedValue = useRef(new Animated.Value(0.4)).current;

  // Por que: Monitora alterações em 'pulse' para disparar ou pausar a animação.
  useEffect(() => {
    // Por que: Se estiver configurado para pulsar, inicia a animação em loop.
    if (pulse) {
      // Por que: Cria um loop contínuo contendo uma sequência de ida e volta da opacidade.
      Animated.loop(
        // Por que: Executa a sequência cronometrada das animações.
        Animated.sequence([
          // Por que: Transiciona a opacidade de 0.4 para 1.0 em 1 segundo.
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          // Por que: Retorna a opacidade de 1.0 para 0.4 em 1 segundo.
          Animated.timing(animatedValue, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      // Por que: Inicializa formalmente a execução da animação.
      ).start();
    } else {
      // Por que: Se não for pulsante, mantém o indicador estático com brilho máximo (1).
      animatedValue.setValue(1);
    }
  }, [pulse, animatedValue]);

  // Por que: Helper de mapeamento de status para suas cores funcionais do Design System.
  const getStatusColor = () => {
    // Por que: Avalia qual cor de led acender baseado no status.
    switch (status) {
      // Por que: Verde para estados funcionais ou concluídos sem pendência.
      case 'ACTIVE':
      case 'UP':
      case 'DELIVERED':
        return '#10b981';
      // Por que: Amarelo para pacotes retidos ou transações esperando transmissão.
      case 'BUFFERED':
      case 'PENDING':
        return '#f59e0b';
      // Por que: Vermelho para falhas graves, descarte ou canais desligados.
      case 'DOWN':
      case 'INACTIVE':
      case 'EXPIRED':
        return '#ef4444';
      // Por que: Azul para enlaces programados e janelas de contato agendadas no cronograma.
      case 'SCHEDULED':
        return '#3b82f6';
      // Por que: Cinza genérico para qualquer outro estado desconhecido.
      default:
        return '#9ca3af';
    }
  };

  return (
    // Por que: Container centralizador do LED.
    <View style={styles.container}>
      {/* Por que: Renderiza o anel externo pulsante de brilho (glow) */}
      <Animated.View
        style={[
          // Por que: Estilo estrutural do glow.
          styles.glowDot,
          {
            // Por que: Aplica a cor mapeada.
            backgroundColor: getStatusColor(),
            // Por que: Vincula a opacidade à variável animada de loop.
            opacity: animatedValue,
            // Por que: Cria o efeito de expansão geométrica em conjunto com a opacidade.
            transform: [
              {
                // Por que: Interpola o valor de opacidade em escala física (de 1x para 1.5x o tamanho).
                scale: animatedValue.interpolate({
                  inputRange: [0.4, 1],
                  outputRange: [1, 1.5],
                }),
              },
            ],
          },
        ]}
      />
      {/* Por que: Renderiza o ponto fixo interno que representa o LED físico */}
      <View style={[styles.solidDot, { backgroundColor: getStatusColor() }]} />
    </View>
  );
}

// Por que: Define a folha de estilos estrutural dos LEDs.
const styles = StyleSheet.create({
  container: {
    // Por que: Tamanho do quadrado delimitador de toque.
    width: 16,
    // Por que: Garante alinhamento centralizado dos elementos internos empilhados.
    height: 16,
    // Por que: Centraliza horizontalmente.
    justifyContent: 'center',
    // Por que: Centraliza verticalmente.
    alignItems: 'center',
    // Por que: Habilita empilhamento absoluto dos círculos glow e solid.
    position: 'relative',
  },
  glowDot: {
    // Por que: Tamanho inicial do círculo externo.
    width: 12,
    // Por que: Altura inicial do círculo externo.
    height: 12,
    // Por que: Metade do tamanho para torná-lo um círculo perfeito.
    borderRadius: 6,
    // Por que: Fixa o anel no centro sob o ponto sólido.
    position: 'absolute',
  },
  solidDot: {
    // Por que: Tamanho do ponto sólido central.
    width: 8,
    // Por que: Altura do ponto sólido central.
    height: 8,
    // Por que: Metade para torná-lo um círculo perfeito.
    borderRadius: 4,
    // Por que: Z-Index garante que ele fique no topo do anel de expansão.
    zIndex: 1,
  },
});
