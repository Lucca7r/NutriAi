// src/services/openaiService.ts

import OpenAI from "openai";
import { OPENAI_API_KEY } from "@env";
import { UserProfile } from "../context/AuthContext";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * @param userProfile - O perfil do usuário contendo respostas do formulário.
 */
function buildSystemMessage(userProfile: UserProfile | null): string {
  let systemMessage = `
Você é o NutriAI, um assistente virtual especializado em nutrição, dietas, receitas saudáveis e musculação, com foco principal em nutrição.
Sua comunicação deve ser amigável, motivadora e informativa.

REGRA GERAL: Responda **apenas** perguntas relacionadas a esses tópicos. Caso o usuário pergunte algo fora disso, recuse educadamente dizendo que só pode ajudar com saúde e bem-estar.
`;

  if (userProfile?.formResponses) {
    const profileContext = JSON.stringify(userProfile.formResponses, null, 2);

    systemMessage += `
--- CONTEXTO DO USUÁRIO ---
Essas são as informações do usuário. Use para personalizar TODAS as suas respostas.

${profileContext}

REGRA CRÍTICA: O usuário informou restrições alimentares. NUNCA sugira alimentos que incluam os itens listados em 'restricoesAlimentares'.
Ajuste as sugestões com base no 'objetivo' informado.
`;
  } else {
    systemMessage += `
AVISO: Não há dados personalizados do usuário. Forneça respostas genéricas e seguras. Sugira que ele preencha o formulário inicial.
`;
  }

  return systemMessage.trim();
}

export const sendMessageToAI = async (
  message: string,
  userProfile: UserProfile | null
): Promise<string> => {
  const systemContext = buildSystemMessage(userProfile);

  const prompt = `
${systemContext}

--- PERGUNTA DO USUÁRIO ---
${message}
`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini", //usa o modelo barato
      input: prompt,
    });

    return response.output_text ?? "Não consegui gerar uma resposta.";
  } catch (error) {
    console.error("Erro ao se comunicar com a OpenAI:", error);
    return "Desculpe, houve um erro ao processar sua solicitação. Tente novamente.";
  }
};
