export interface ThemeColors {
  background: string;
  text: string;
  tabBar: string;
  icon: string;
  iconInactive: string;
  iconBackground: string;
  activeIcon: string;
  primary?: string; // adicione se for usar cor principal
  textSecondary?: string; // adicione se usar texto secundário
}

export const lightTheme: ThemeColors = {
  background: '#f2f2f2',
  text: '#000000',
  tabBar: '#f2f2f2',
  icon: '#000000',
  iconInactive: '#999999',
  iconBackground: '#e0e0e0',
  activeIcon: '#ffffff',
  primary: '#3C9A5B',
  textSecondary: '#555555',
};

export const darkTheme: ThemeColors = {
  background: '#1a1a1a',
  text: '#ffffff',
  tabBar: '#2c2c2e',
  icon: '#ffffff',
  iconInactive: '#888888',
  iconBackground: '#41424A',
  activeIcon: '#000000',
  primary: '#3C9A5B',
  textSecondary: '#cccccc',
};
