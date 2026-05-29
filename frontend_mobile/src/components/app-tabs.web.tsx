import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme, View, StyleSheet } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    // Por que: Componente de Abas do Expo Router que controla a pilha de telas.
    <Tabs>
      {/* Por que: Slot interno que renderiza o conteúdo da página ativa. */}
      <TabSlot style={{ height: '100%' }} />
      {/* Por que: Contêiner de lista que agrupa os botões de seleção de abas. */}
      <TabList asChild>
        {/* Por que: Menu customizado horizontal com cantos circulares Apple-style. */}
        <CustomTabList>
          {/* Por que: Gatilho que aponta para a rota index (Home/Dashboard). */}
          <TabTrigger name="index" href="/" asChild>
            {/* Por que: Botão de clique estilizado para a Home. */}
            <TabButton>Painel</TabButton>
          </TabTrigger>
          {/* Por que: Gatilho que aponta para a rota de transferências. */}
          <TabTrigger name="transaction" href="/transaction" asChild>
            {/* Por que: Botão de clique estilizado para a transferência de fundos. */}
            <TabButton>Transferir</TabButton>
          </TabTrigger>
          {/* Por que: Gatilho que aponta para a rota de fila DTN. */}
          <TabTrigger name="bundles" href="/bundles" asChild>
            {/* Por que: Botão de clique estilizado para o buffer local. */}
            <TabButton>Fila DTN</TabButton>
          </TabTrigger>
          {/* Por que: Gatilho que aponta para a rota de rede. */}
          <TabTrigger name="network" href="/network" asChild>
            {/* Por que: Botão de clique estilizado para telemetria de rádio. */}
            <TabButton>Rede</TabButton>
          </TabTrigger>
          {/* Por que: Gatilho que aponta para a rota de console e parametrização. */}
          <TabTrigger name="settings" href="/settings" asChild>
            {/* Por que: Botão de clique estilizado para as configurações. */}
            <TabButton>Console</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.tabButtonView}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="backgroundElement" style={styles.innerContainer}>
        {/* Por que: Texto identificador do painel operacional do gateway espacial. */}
        <ThemedText type="smallBold" style={styles.brandText}>
          ChronosDTN NCC
        </ThemedText>

        {props.children}

        <ExternalLink href="https://docs.expo.dev" asChild>
          <Pressable style={styles.externalPressable}>
            <ThemedText type="link">Docs</ThemedText>
            <SymbolView
              tintColor={colors.text}
              name={{ ios: 'arrow.up.right.square', web: 'link' }}
              size={12}
            />
          </Pressable>
        </ExternalLink>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  externalPressable: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginLeft: Spacing.three,
  },
});
