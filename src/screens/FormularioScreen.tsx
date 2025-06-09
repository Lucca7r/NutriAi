import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import { useThemeColors } from "../context/ThemeContext";
import { createFormularioStyles } from "../styles/FormularioScreen.style";

const secoes = [
  {
    id: "infoPessoal",
    titulo: "Informações Pessoais",
    perguntas: [
      { chave: "nome", label: "Nome completo", tipo: "texto" },
      { chave: "idade", label: "Idade", tipo: "numero" },
      {
        chave: "genero",
        label: "Gênero",
        tipo: "radio",
        opcoes: ["Masculino", "Feminino", "Prefiro não informar"],
      },
      { chave: "altura", label: "Altura (em cm)", tipo: "numero" },
      { chave: "peso", label: "Peso (em kg)", tipo: "numero" },
      { chave: "telefone", label: "Telefone (opcional)", tipo: "texto" },
    ],
  },
  {
    id: "objetivosEstiloVida",
    titulo: "Objetivos e Estilo de Vida",
    perguntas: [
      {
        chave: "objetivo",
        label: "Objetivo principal com o app",
        tipo: "radio",
        opcoes: [
          "Emagrecimento",
          "Ganho de massa muscular",
          "Reeducação alimentar",
          "Melhorar performance esportiva",
          "Manutenção de peso",
          "Outros",
        ],
      },
      {
        chave: "nivelAtividade",
        label: "Nível de atividade física",
        tipo: "radio",
        opcoes: [
          "Sedentário (sem exercícios regulares)",
          "Levemente ativo (1–2x por semana)",
          "Moderadamente ativo (3–4x por semana)",
          "Muito ativo (5+ vezes por semana)",
          "Atleta",
        ],
      },
      {
        chave: "estiloAlimentar",
        label: "Estilo alimentar preferido",
        tipo: "radio",
        opcoes: [
          "Tradicional brasileira",
          "Low Carb",
          "Cetogênica (Keto)",
          "Vegetariana",
          "Vegana",
          "Mediterrânea",
          "Outro",
        ],
      },
    ],
  },
  {
    id: "habitosAlimentares",
    titulo: "Hábitos Alimentares",
    perguntas: [
      {
        chave: "refeicoesPorDia",
        label: "Quantas refeições você costuma fazer por dia?",
        tipo: "radio",
        opcoes: ["2", "3", "4", "5 ou mais"],
      },
      {
        chave: "refeicoesFora",
        label: "Você costuma fazer refeições fora de casa?",
        tipo: "radio",
        opcoes: ["Sim, frequentemente", "Às vezes", "Raramente", "Nunca"],
      },
      {
        chave: "tempoPreparo",
        label: "Tempo disponível para preparar refeições",
        tipo: "radio",
        opcoes: [
          "Menos de 15 minutos",
          "De 15 a 30 minutos",
          "De 30 a 60 minutos",
          "Mais de 1 hora",
        ],
      },
      {
        chave: "interesseReceitas",
        label: "Tem interesse em receitas caseiras?",
        tipo: "radio",
        opcoes: ["Sim", "Não"],
      },
    ],
  },
  {
    id: "preferenciasRestricoes",
    titulo: "Preferências e Restrições Alimentares",
    perguntas: [
      {
        chave: "restricoesAlimentares",
        label: "Você possui alguma dessas restrições/alergias?",
        tipo: "checkbox",
        opcoes: [
          "Lactose",
          "Glúten",
          "Oleaginosas (nozes, castanhas, amêndoas...)",
          "Frutos do mar",
          "Outras",
          "Nenhuma",
        ],
      },
      {
        chave: "preferenciasAlimentares",
        label: "Marque os alimentos que você gosta ou prefere incluir em sua dieta:",
        tipo: "checkbox",
        opcoes: [
          "Frutas",
          "Legumes e verduras",
          "Carnes brancas",
          "Carnes vermelhas",
          "Ovos",
          "Grãos e cereais integrais",
          "Laticínios",
          "Doces",
          "Fast-food",
          "Outros",
        ],
      },
    ],
  },
  {
    id: "personalizacaoApp",
    titulo: "Personalização do App",
    perguntas: [
      {
        chave: "acompanhamentoIA",
        label: "Você gostaria de receber recomendações automáticas com base em IA?",
        tipo: "radio",
        opcoes: [
          "Sim, totalmente automático",
          "Sim, com validação de um nutricionista",
          "Prefiro montar meu próprio plano",
          "Ainda não sei",
        ],
      },
      {
        chave: "horarioLembretes",
        label: "Horários preferidos para receber lembretes e dicas",
        tipo: "radio",
        opcoes: ["Manhã", "Tarde", "Noite", "Não quero receber notificações"],
      },
    ],
  },
  {
    id: "temasInteresse",
    titulo: "Temas de Interesse",
    perguntas: [
      {
        chave: "temas",
        label: "Quais temas são do seu interesse?",
        tipo: "checkbox",
        opcoes: [
          "Receitas práticas",
          "Dicas de alimentação saudável",
          "Planejamento de refeições",
          "Dietas específicas",
          "Desempenho físico/esportivo",
          "Outros",
        ],
      },
    ],
  },
];



const FormularioScreen = () => {
  const colors = useThemeColors();
  const styles = createFormularioStyles(colors);

  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});

  const handleResposta = (chave: string, valor: string | string[]) => {
    setRespostas((prev) => ({ ...prev, [chave]: valor }));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.logoContainer}>
            <Ionicons name="leaf" size={32} color={"#C8C9D2"} />
            <Text style={styles.logoText}>NutriAI</Text>
          </View>

          <ProgressSteps
            completedStepIconColor={"#D9D9D9"}
            completedProgressBarColor={"#D9D9D9"}
            activeStepIconBorderColor={"#D9D9D9"}
            activeLabelColor={"#D9D9D9"}
            progressBarColor={"#53545D"}
            disabledStepIconColor={"#53545D"}
            activeStepNumColor={"#D9D9D9"}
            completedCheckColor={"#000000"}
            topOffset={10}
            marginBottom={4}
          >
            {secoes.map((secao, index) => (
              <ProgressStep
                key={secao.id}
                onSubmit={
                  index === secoes.length - 1
                    ? () => console.log("Finalizado", respostas)
                    : undefined
                }
                buttonNextText="Próximo"
                buttonPreviousText="Voltar"
                buttonFinishText="Finalizar"
                buttonNextTextColor="#000"
                buttonFinishTextColor="#000"
                buttonFillColor="#D9D9D9"
                buttonBorderColor="#D9D9D9"
                buttonPreviousTextColor="#D9D9D9"
              >
                <ScrollView
                  contentContainerStyle={{ paddingBottom: 24 }}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.sectionTitle}>{secao.titulo}</Text>

                  {secao.perguntas.map((pergunta) => {
                    if (
                      pergunta.tipo === "texto" ||
                      pergunta.tipo === "numero"
                    ) {
                      return (
                        <View key={pergunta.chave} style={styles.inputGroup}>
                          <Text style={styles.label}>{pergunta.label}</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Digite aqui"
                            placeholderTextColor={styles.inputPlaceholder.color}
                            keyboardType={
                              pergunta.tipo === "numero" ? "numeric" : "default"
                            }
                            value={respostas[pergunta.chave] || ""}
                            onChangeText={(text) =>
                              handleResposta(pergunta.chave, text)
                            }
                          />
                        </View>
                      );
                    } else if (pergunta.tipo === "radio" && pergunta.opcoes) {
                      return (
                        <View key={pergunta.chave} style={styles.inputGroup}>
                          <Text style={styles.label}>
                            {pergunta.label ?? ""}
                          </Text>
                          {pergunta.opcoes.map((opcao) => (
                            <TouchableOpacity
                              key={opcao}
                              style={styles.radioOption}
                              onPress={() =>
                                handleResposta(pergunta.chave, opcao)
                              }
                            >
                              <Ionicons
                                name={
                                  respostas[pergunta.chave] === opcao
                                    ? "radio-button-on"
                                    : "radio-button-off"
                                }
                                size={20}
                                color={colors.activeIcon}
                              />
                              <Text style={styles.radioLabel}>{opcao}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      );
                    } else if (
                      pergunta.tipo === "checkbox" &&
                      pergunta.opcoes
                    ) {
                      const respostasAtuais = respostas[pergunta.chave] || [];

                      const toggleOpcao = (opcao: string) => {
                        const novaResposta = respostasAtuais.includes(opcao)
                          ? respostasAtuais.filter(
                              (item: string) => item !== opcao
                            )
                          : [...respostasAtuais, opcao];

                        handleResposta(pergunta.chave, novaResposta);
                      };

                      return (
                        <View key={pergunta.chave} style={styles.inputGroup}>
                          <Text style={styles.label}>
                            {pergunta.label ?? ""}
                          </Text>
                          {pergunta.opcoes.map((opcao) => (
                            <TouchableOpacity
                              key={opcao}
                              style={styles.checkboxOption}
                              onPress={() => toggleOpcao(opcao)}
                            >
                              <Ionicons
                                name={
                                  respostasAtuais.includes(opcao)
                                    ? "checkbox"
                                    : "square-outline"
                                }
                                size={20}
                                color={colors.activeIcon}
                              />
                              <Text style={styles.checkboxLabel}>{opcao}</Text>
                            </TouchableOpacity>
                          ))}

                          {respostasAtuais.includes("Outros") && (
                            <TextInput
                              style={styles.input}
                              placeholder="Especifique..."
                              placeholderTextColor={
                                styles.inputPlaceholder.color
                              }
                              value={respostas["outrosPreferencias"] || ""}
                              onChangeText={(text) =>
                                handleResposta("outrosPreferencias", text)
                              }
                            />
                          )}
                        </View>
                      );
                    }
                    return null;
                  })}
                </ScrollView>
              </ProgressStep>
            ))}
          </ProgressSteps>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default FormularioScreen;
