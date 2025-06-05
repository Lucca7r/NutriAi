import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  chat: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  message: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: '80%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 45,
    marginHorizontal: 16,
    marginBottom: 116
  },
  inputInside: {
    flex: 1,
    fontSize: 16,
  },
  sendInlineButton: {
    marginLeft: 8,
    backgroundColor: '#3C9A5B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 25,
  },
});
