import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  tabBar: {
    backgroundColor: "#41424A",
    height: 85,
    marginHorizontal: "7.5%",
    borderRadius: 50,
    position: "absolute",
    bottom: 25,
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
    backgroundColor: "#fff",
  },
});
