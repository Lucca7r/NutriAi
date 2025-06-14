// src/screens/ChatScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext"; 
import { sendMessageToAI } from "../services/openaiService";

import styles from "../styles/ChatScreen.style";
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export const ChatScreen = () => {
  const colors = useThemeColors();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const sendMessage = async () => {
    // Impede o envio de múltiplas mensagens enquanto uma está sendo processada
    if (input.trim() === "" || loadingAI) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoadingAI(true);

    try {
      const responseText = await sendMessageToAI(input, profile);

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
    } finally {
      setLoadingAI(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        {
          alignSelf: item.sender === "user" ? "flex-end" : "flex-start",
          backgroundColor:
            item.sender === "user" ? colors.primary : colors.iconBackground,
        },
      ]}
    >
      <Text style={{ color: item.sender === "user" ? "#FFFFFF" : colors.text }}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chat}
      />
      <View style={[styles.inputWrapper, { borderColor: colors.text }]}>
        <TextInput
          placeholder="Digite sua dúvida..."
          placeholderTextColor={colors.iconInactive}
          style={[
            styles.inputInside,
            { color: colors.text, borderColor: colors.iconInactive },
          ]}
          value={input}
          onChangeText={setInput}
          editable={!loadingAI}
          keyboardAppearance={
            colors.background === "#1a1a1a" ? "dark" : "light"
          }
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={styles.sendInlineButton}
          disabled={loadingAI}
        >
          {loadingAI ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ color: "#fff" }}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
