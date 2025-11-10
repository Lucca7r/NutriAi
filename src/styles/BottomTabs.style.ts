// src/styles/BottomTabs.style.ts

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  tabBar: {
    backgroundColor: "#41424A",
    height: 85,
    marginHorizontal: "6%",
    borderRadius: 50,
    position: "absolute",
    bottom: 45,
    borderTopWidth: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  iconWrapper: {
    width: 60,  
    height: 60, 
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',

    
    backgroundColor: "#5A5B63",
  },

  activeIcon: {
    backgroundColor: "#F5F5F5",
  },
});