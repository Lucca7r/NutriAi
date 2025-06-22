import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../context/ThemeContext';

import styles from '../styles/ProfileHeader.style';
import { useAuth } from '../context/AuthContext';
import { createGeralStyles } from '../styles/Geral.style';


export default function ProfileHeader() {
  const colors = useThemeColors();
  const styles = createGeralStyles(colors);
  const { profile } = useAuth();



  return (
    <View style={styles.avatarContainer}>
      <Image
        source={{ uri: 'https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcSaQi2Zc9IYvTUy4j1rKPSdqm1u3DMNuW9Pq83Eim60Ahu8xs5auyY-Fne8SRP_0A7CMPL5W_jOIkMruY4' }}
        style={styles.avatar}
      />
      <Text style={styles.userName}>{profile ? profile.name : "carregando ... "}

      </Text>
    </View>
  );
}


