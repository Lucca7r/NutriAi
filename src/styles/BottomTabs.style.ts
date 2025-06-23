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
    backgroundColor: "#5A5B63",
    borderRadius: 50,
    padding: 18,
    
  },
  activeIcon: {
    backgroundColor: "#F5F5F5",
  },
});
