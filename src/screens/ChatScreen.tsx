// src/screens/ChatScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useThemeColors } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { sendMessageToAI } from "../services/openaiService";
import { FIREBASE_DB } from "../services/firebaseConfig";
import firebase from "firebase/compat/app";
import styles from "../styles/ChatScreen.style";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatScreen = () => {
  const colors = useThemeColors();
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Buscar chats do usuário logado
  const fetchUserChats = async () => {
    if (!user) return;

    
  const snapshot = await FIREBASE_DB.collection("chats")
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get();

    const userChats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));


    setChats(userChats);
  };

  // Iniciar um novo chat
  const startNewChat = async () => {
    const newChatRef = await FIREBASE_DB.collection("chats").add({
      userId: user?.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      messages: [],
    });

    setCurrentChatId(newChatRef.id);
    setMessages([]);
    setTimeout(() => {
    fetchUserChats();
  }, 1000);
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (input.trim() === "" || loadingAI || !currentChatId) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoadingAI(true);

    try {
      const responseText = await sendMessageToAI(input, profile);
      const aiMsg: Message = { role: "assistant", content: responseText };

      await FIREBASE_DB.collection("chats").doc(currentChatId).update({
        messages: firebase.firestore.FieldValue.arrayUnion(userMsg, aiMsg),
      });

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao obter resposta da IA." },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  // Abrir chat antigo
  const openChat = async (chatId: string) => {
    const doc = await FIREBASE_DB.collection("chats").doc(chatId).get();
    if (doc.exists) {
      const data = doc.data();
      setMessages(data?.messages || []);
      setCurrentChatId(chatId);
    }
  };

  useEffect(() => {
    fetchUserChats();
  }, [user]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        {
          alignSelf: item.role === "user" ? "flex-end" : "flex-start",
          backgroundColor:
            item.role === "user" ? colors.primary : colors.iconBackground,
        },
      ]}
    >
      <Text style={{ color: colors.text }}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      {/* Lista de chats anteriores */}
  <View style={{ maxHeight: 100, paddingVertical: 10 }}>
  <FlatList
    horizontal
    data={chats}
    keyExtractor={(item) => item.id}
    renderItem={({ item, index }) => (
      <TouchableOpacity
        onPress={() => openChat(item.id)}
        style={{
          padding: 10,
          marginHorizontal: 6,
          backgroundColor:
            currentChatId === item.id ? colors.primary : colors.iconBackground,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.iconInactive,
          minWidth: 100,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: "bold", fontSize: 12 }}>
          {`Chat ${index + 1}`}
        </Text>
      </TouchableOpacity>
    )}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: 10 }}
  />
</View>

      {/* Lista de mensagens */}
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chat}
      />

      {/* Botão de novo chat */}
      <TouchableOpacity
        onPress={startNewChat}
        style={{
          backgroundColor: colors.primary,
          padding: 12,
          marginHorizontal: 20,
          marginBottom: 10,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Novo Chat</Text>
      </TouchableOpacity>

      {/* Input + botão de envio */}
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
    </SafeAreaView>
  );
};
