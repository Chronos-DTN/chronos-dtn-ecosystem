// Por que: Importa a biblioteca do React para criar componentes funcionais e gerenciar efeitos secundários.
import React, { useEffect, useRef } from 'react';
// Por que: Importa componentes de View, Text, StyleSheet e APIs animadas nativas do React Native.
import { View, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
// Por que: Importa o esquema de cores globais do nosso Design System.
import { Colors } from '@/constants/theme';

// Por que: Propriedades aceitas pelo componente carregador de atraso espacial.
interface SpaceLoaderProps {
  // Por que: Mensagem opcional de auditoria operacional exibida na tela.
  message?: string;
}

// Por que: Componente funcional que exibe o overlay de atraso físico com ondas de rádio.
export default function SpaceLoader({ message = 'Propagando sinal de rádio espacial...' }: SpaceLoaderProps) {
  // Por que: Captura a preferência de aparência (tema escuro ou claro).
  const scheme = useColorScheme();
  // Por que: Obtém as cores do tema ativo do sistema.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Cria referências de valores animados para a onda 1 de propagação de sinal.
  const wave1 = useRef(new Animated.Value(0)).current;
  // Por que: Cria referências de valores animados para a onda 2 de propagação de sinal (atraso de fase).
  const wave2 = useRef(new Animated.Value(0)).current;

  // Por que: Configura e dispara o loop de animações de ondas ao renderizar o componente.
  useEffect(() => {
    // Por que: Helper para configurar o loop de expansão e atenuação de onda individual.
    const createAnimation = (value: Animated.Value, delay: number) => {
      // Por que: Cria um loop infinito para repetir a onda sequencialmente.
      return Animated.loop(
        // Por que: Executa a animação em ordem linear (atraso inicial seguido de expansão).
        Animated.sequence([
          // Por que: Atraso de disparo para alternar as ondas de rádio (desfase visual).
          Animated.delay(delay),
          // Por que: Executa a expansão e fade-out em paralelo.
          Animated.parallel([
            // Por que: Transiciona o valor de 0 a 1 em 1.5 segundos.
            Animated.timing(value, {
              toValue: 1,
              duration: 1500,
              // Por que: Habilita animação por GPU nativa para fluidez no dispositivo móvel.
              useNativeDriver: true,
            }),
          ]),
        ])
      );
    };

    // Por que: Instancia o loop da onda 1 (sem atraso).
    const anim1 = createAnimation(wave1, 0);
    // Por que: Instancia o loop da onda 2 (com atraso de 750ms de fase).
    const anim2 = createAnimation(wave2, 750);

    // Por que: Inicia a animação da onda 1.
    anim1.start();
    // Por que: Inicia a animação da onda 2.
    anim2.start();

    // Por que: Limpa os loops de animação quando o componente é destruído (desmontagem).
    return () => {
      // Por que: Para o loop 1.
      anim1.stop();
      // Por que: Para o loop 2.
      anim2.stop();
    };
  }, [wave1, wave2]);

  return (
    // Por que: Container absoluto que cobre toda a tela bloqueando cliques adicionais.
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Por que: Container do emissor de rádio e propagadores */}
      <View style={styles.centerNode}>
        {/* Por que: Renderiza a primeira onda de transmissão */}
        <Animated.View
          style={[
            // Por que: Estilo de onda de rádio.
            styles.wave,
            // Por que: Define a borda com a cor ciano primária.
            { borderColor: colors.primary },
            {
              // Por que: Diminui a opacidade à medida que a onda se expande (fade-out).
              opacity: wave1.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 0.4, 0],
              }),
              // Por que: Aumenta o tamanho geométrico da onda (escala física).
              transform: [
                {
                  scale: wave1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 3],
                  }),
                },
              ],
            },
          ]}
        />
        {/* Por que: Renderiza a segunda onda de transmissão (desfase roxo) */}
        <Animated.View
          style={[
            // Por que: Estilo de onda de rádio.
            styles.wave,
            // Por que: Borda roxa secundária para diferenciar as fases de modulação do sinal.
            { borderColor: colors.secondary },
            {
              // Por que: Atenuação da onda em função do tempo.
              opacity: wave2.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 0.4, 0],
              }),
              // Por que: Escala de expansão geométrica.
              transform: [
                {
                  scale: wave2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 3],
                  }),
                },
              ],
            },
          ]}
        />
        {/* Por que: Núcleo físico emissor (Antena) de rádio */}
        <View style={[styles.core, { backgroundColor: colors.primary }]} />
      </View>
      {/* Por que: Mensagem explicativa do estado operacional corrente */}
      <Text style={[styles.text, { color: colors.text }]}>{message}</Text>
      {/* Por que: Subtexto educativo lembrando as restrições físicas da física espacial */}
      <Text style={[styles.subtext, { color: colors.textSecondary }]}>
        Simulando atraso físico de rádio (~1.28s)
      </Text>
    </View>
  );
}

// Por que: Define as folhas de estilos estáticos do carregador aeroespacial.
const styles = StyleSheet.create({
  container: {
    // Por que: Cobre todo o espaço da tela pai de forma absoluta no design do painel espacial.
    ...StyleSheet.absoluteFill,
    // Por que: Centraliza verticalmente o carregador.
    justifyContent: 'center',
    // Por que: Centraliza horizontalmente o carregador.
    alignItems: 'center',
    // Por que: Z-Index altíssimo para garantir que fique por cima de cabeçalhos e tabs.
    zIndex: 9999,
  },
  centerNode: {
    // Por que: Caixa delimitadora da antena e suas ondas.
    width: 100,
    height: 100,
    // Por que: Centraliza as ondas empilhadas na antena.
    justifyContent: 'center',
    alignItems: 'center',
    // Por que: Afasta o texto do emissor para melhorar legibilidade.
    marginBottom: 24,
  },
  wave: {
    // Por que: Absoluto para que fiquem empilhadas umas sobre as outras.
    position: 'absolute',
    // Por que: Dimensões físicas da onda inicial.
    width: 60,
    height: 60,
    // Por que: Metade do tamanho para mantê-la esférica.
    borderRadius: 30,
    // Por que: Espessura do círculo de rádio.
    borderWidth: 2,
  },
  core: {
    // Por que: Tamanho do núcleo central (led emissor).
    width: 20,
    height: 20,
    // Por que: Metade do tamanho para torná-lo circular.
    borderRadius: 10,
    // Por que: Fica acima das ondas na pilha visual.
    zIndex: 2,
  },
  text: {
    // Por que: Fonte em tamanho padrão de cabeçalho pequeno.
    fontSize: 16,
    // Por que: Peso seminegrito para legibilidade de instrução.
    fontWeight: '600',
    // Por que: Centraliza o texto.
    textAlign: 'center',
    // Por que: Padding para evitar colisão lateral com a borda física da tela móvel.
    paddingHorizontal: 32,
    // Por que: Afasta o subtexto da mensagem principal.
    marginBottom: 8,
  },
  subtext: {
    // Por que: Tamanho reduzido para nota informativa/educativa.
    fontSize: 12,
    // Por que: Alinhamento central.
    textAlign: 'center',
  },
});
