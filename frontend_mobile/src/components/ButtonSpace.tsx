// Por que: Importa a biblioteca do React para criar componentes funcionais.
import React from 'react';
// Por que: Importa componentes e utilitários nativos para interatividade, textos, estilos e animações do React Native.
import { TouchableOpacity, Text, StyleSheet, useColorScheme, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
// Por que: Importa o esquema de cores globais do nosso Design System.
import { Colors } from '@/constants/theme';

// Por que: Define as propriedades de entrada para o botão aeroespacial.
interface ButtonSpaceProps {
  // Por que: Texto que será renderizado dentro do botão.
  title: string;
  // Por que: Callback disparado ao clicar no botão.
  onPress: () => void;
  // Por que: Exibe um indicador de processamento se estiver aguardando resposta da API.
  loading?: boolean;
  // Por que: Desabilita interações físicas se as condições não forem atendidas (ex: formulário incompleto).
  disabled?: boolean;
  // Por que: Permite customizar margens ou largura do container externo.
  style?: ViewStyle;
  // Por que: Permite customizar tamanho, peso e alinhamento do texto interno.
  textStyle?: TextStyle;
  // Por que: Variantes estéticas operacionais (Transação normal, Criptografia, Cancelamento).
  type?: 'primary' | 'secondary' | 'danger';
}

// Por que: Componente funcional do botão customizado com feedbacks visuais e táteis.
export default function ButtonSpace({ title, onPress, loading, disabled, style, textStyle, type = 'primary' }: ButtonSpaceProps) {
  // Por que: Captura a preferência de aparência (tema escuro ou claro).
  const scheme = useColorScheme();
  // Por que: Obtém as cores correspondentes do tema atual.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Por que: Helper determinando a cor de fundo dinamicamente baseada no tipo e estado.
  const getBackgroundColor = () => {
    // Por que: Se desativado, adota uma cor opaca e neutra.
    if (disabled) return scheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#e5e7eb';
    // Por que: Chaveia a cor baseada no tipo do botão.
    switch (type) {
      // Por que: Azul neon para ações principais do gateway.
      case 'primary': return colors.primary;
      // Por que: Roxo neon para ações secundárias ou de transmissão.
      case 'secondary': return colors.secondary;
      // Por que: Vermelho neon para rejeitar ou limpar filas.
      case 'danger': return colors.danger;
    }
  };

  // Por que: Helper determinando a cor do texto/ícone baseado no estado.
  const getTextColor = () => {
    // Por que: Se desativado, reduz a opacidade do texto para denotar inatividade.
    if (disabled) return scheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#9ca3af';
    // Por que: Caso contrário, texto em destaque branco puro para legibilidade máxima.
    return '#ffffff';
  };

  return (
    // Por que: TouchableOpacity provê o feedback de opacidade instantâneo ao toque (tátil).
    <TouchableOpacity
      // Por que: Vincula a ação de clique do botão.
      onPress={onPress}
      // Por que: Trava cliques adicionais se estiver carregando ou desabilitado.
      disabled={disabled || loading}
      // Por que: Define a opacidade de feedback do clique (80%).
      activeOpacity={0.8}
      // Por que: Une os estilos estáticos com a cor de fundo calculada dinamicamente.
      style={[styles.button, { backgroundColor: getBackgroundColor() }, style]}
    >
      {/* Por que: Se em carregamento, exibe loader giratório nativo */}
      {loading ? (
        // Por que: Exibe o ActivityIndicator giratório branco.
        <ActivityIndicator color="#ffffff" />
      ) : (
        // Por que: Caso contrário, exibe o texto operacional com estilo dinâmico de cor.
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// Por que: Cria os estilos estáticos de layout e tipografia do botão.
const styles = StyleSheet.create({
  button: {
    // Por que: Altura confortável padrão para cliques móveis (dedos).
    height: 52,
    // Por que: Cantos arredondados suavizados alinhados com o design geral.
    borderRadius: 12,
    // Por que: Alinha o texto ou loader perfeitamente no centro vertical.
    justifyContent: 'center',
    // Por que: Alinha o texto ou loader perfeitamente no centro horizontal.
    alignItems: 'center',
    // Por que: Organiza os elementos internos (como se adicionássemos ícone futuramente).
    flexDirection: 'row',
  },
  text: {
    // Por que: Tamanho de fonte padrão legível.
    fontSize: 16,
    // Por que: Negrito para dar destaque visual e profissional à ação.
    fontWeight: 'bold',
  },
});
