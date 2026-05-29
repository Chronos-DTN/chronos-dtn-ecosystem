// Por que: Importa a biblioteca do React para renderizar componentes funcionais.
import React from 'react';
// Por que: Importa componentes de View, StyleSheet e hooks de aparência nativos do React Native.
import { View, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
// Por que: Importa o esquema de cores unificado do nosso Design System.
import { Colors } from '@/constants/theme';

// Por que: Define a interface de propriedades aceitas pelo card glassmorphic.
interface CardGlassProps {
  // Por que: Elementos filhos que serão exibidos internamente no card.
  children: React.ReactNode;
  // Por que: Permite injetar estilos de posicionamento ou margens customizadas externamente.
  style?: ViewStyle;
}

// Por que: Componente funcional que renderiza o painel translúcido de visualização aeroespacial.
export default function CardGlass({ children, style }: CardGlassProps) {
  // Por que: Identifica o tema de cor ativo no dispositivo (Claro ou Escuro).
  const scheme = useColorScheme();
  // Por que: Obtém o dicionário de cores correspondente ao tema detectado.
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    // Por que: Aplica o estilo estrutural do card mesclado com as propriedades de cores dinâmicas e bordas translúcidas.
    <View 
      style={[
        // Por que: Estilo básico estrutural.
        styles.card, 
        // Por que: Define o fundo translúcido para criar o efeito vidro.
        { backgroundColor: colors.backgroundElement },
        // Por que: Define a borda quase imperceptível de realce luminoso.
        { borderColor: scheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)' },
        // Por que: Incorpora o estilo customizado passado por parâmetro.
        style
      ]}
    >
      {/* Por que: Renderiza os elementos internos do card */}
      {children}
    </View>
  );
}

// Por que: Cria a folha de estilos contendo as propriedades estáticas de layout e sombras do card.
const styles = StyleSheet.create({
  card: {
    // Por que: Arredonda os cantos para uma aparência de interface moderna.
    borderRadius: 16,
    // Por que: Habilita a borda física que simula a espessura do vidro.
    borderWidth: 1,
    // Por que: Adiciona espaçamento interno padrão para afastar os filhos da borda.
    padding: 16,
    // Por que: Cor da sombra projetada para criar sensação de flutuação tridimensional.
    shadowColor: '#000000',
    // Por que: Deslocamento da sombra para o quadrante inferior.
    shadowOffset: { width: 0, height: 4 },
    // Por que: Transparência da sombra no iOS.
    shadowOpacity: 0.15,
    // Por que: Raio de desfoque da sombra para deixá-la suave.
    shadowRadius: 12,
    // Por que: Habilita sombreamento (elevação) no sistema operacional Android.
    elevation: 4,
  },
});
