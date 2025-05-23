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

  const sendMessage = () => {
    if (input.trim() === "") return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);

    // Aqui você pode chamar a API do Chat GPT e depois setar a resposta:
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "_bot",
          text: "Essa é uma resposta automática da IA.",
          sender: "bot",
        },
      ]);
    }, 1000);

    setInput("");
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
      style={{ flex: 1 }}
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
