import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      {/* Por que: Disparador da aba index correspondente a Home/Dashboard Geral. */}
      <NativeTabs.Trigger name="index">
        {/* Por que: Texto descritivo exibido sob o ícone da aba. */}
        <NativeTabs.Trigger.Label>Painel</NativeTabs.Trigger.Label>
        {/* Por que: Ícone de casa representando a central operacional. */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Por que: Disparador da aba de envio de créditos e transações. */}
      <NativeTabs.Trigger name="transaction">
        {/* Por que: Rótulo da funcionalidade de transferência. */}
        <NativeTabs.Trigger.Label>Transferir</NativeTabs.Trigger.Label>
        {/* Por que: Ícone indicando fluxo monetário. */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/transaction.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Por que: Disparador da aba de fila e buffer Store-and-Forward (Bundles). */}
      <NativeTabs.Trigger name="bundles">
        {/* Por que: Rótulo para visualização dos pacotes em buffer. */}
        <NativeTabs.Trigger.Label>Fila DTN</NativeTabs.Trigger.Label>
        {/* Por que: Ícone representando caixas ou dados enfileirados. */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/bundles.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Por que: Disparador da aba de monitoramento da rede de rádio espacial. */}
      <NativeTabs.Trigger name="network">
        {/* Por que: Rótulo da tela de status físico do enlace de rádio. */}
        <NativeTabs.Trigger.Label>Rede</NativeTabs.Trigger.Label>
        {/* Por que: Ícone de transmissão de sinal e antenas. */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/network.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      {/* Por que: Disparador da aba de controle e console administrativo. */}
      <NativeTabs.Trigger name="settings">
        {/* Por que: Rótulo do console operacional. */}
        <NativeTabs.Trigger.Label>Console</NativeTabs.Trigger.Label>
        {/* Por que: Ícone de engrenagem para parametrização. */}
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/settings.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
