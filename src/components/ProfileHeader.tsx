import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../context/ThemeContext';

import styles from '../styles/ProfileHeader.style';

export default function ProfileHeader() {
  const colors = useThemeColors();

  return (
    <View style={styles.avatarContainer}>
      <Image
        source={{ uri: 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcSaQi2Zc9IYvTUy4j1rKPSdqm1u3DMNuW9Pq83Eim60Ahu8xs5auyY-Fne8SRP_0A7CMPL5W_jOIkMruY4' }}
        style={[styles.avatar, { borderColor: colors.icon }]}
      />
      <Text style={[styles.userName, { color: colors.text }]}>Lucas James</Text>
    </View>
  );
}


