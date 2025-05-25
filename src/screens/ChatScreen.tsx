import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { sendMessageToAI } from "../services/openaiService";



import styles from "../styles/ChatScreen.style";
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export const ChatScreen = () => {
  const colors = useThemeColors();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Chama a API e adiciona a resposta do bot
    try {
      const responseText = await sendMessageToAI(input);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_bot",
          text: responseText,
          sender: "bot",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_bot",
          text: "Erro ao obter resposta da IA.",
          sender: "bot",
        },
      ]);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        {
          alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
          backgroundColor:
            item.sender === "user" ? colors.iconBackground : colors.tabBar,
        },
      ]}
    >
      <Text style={{ color: colors.text }}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100} // ajuste conforme necessário para não sobrepor o tabBar
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chat}
      />
      <View style={[styles.inputWrapper]}>
        <TextInput
          placeholder="Digite sua dúvida..."
          placeholderTextColor={colors.iconInactive}
          style={[
            styles.inputInside,
            { color: colors.text, borderColor: colors.iconInactive },
          ]}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendInlineButton}>
          <Text style={{ color: "#fff" }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
