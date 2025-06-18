import OpenAI from "openai";
import { OPENAI_API_KEY } from "@env";
import { UserProfile } from "../context/AuthContext";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Estima as calorias de uma refeição baseada na sua descrição.
 * @param mealDescription A descrição da comida (ex: "2 ovos mexidos e uma banana").
 * @returns Uma promessa com o número estimado de calorias.
 */

export const estimateCaloriesFromText = async (
  mealDescription: string
): Promise<number> => {
  const prompt = `
    Analise a seguinte descrição de uma refeição e retorne apenas o número total de calorias estimadas.
    Sua resposta deve conter SOMENTE o número, sem texto adicional, sem "kcal" ou "calorias".
    Exemplo: se a estimativa for 350, sua resposta deve ser exatamente "350".
    Se a descrição não parecer uma comida ou for muito vaga, retorne "0".

    Descrição da refeição: "${mealDescription}"
  `;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini", // Continua usando o modelo econômico
      input: prompt,
    });

    const resultText = response.output_text?.trim() ?? "0";
    const calories = parseInt(resultText, 10);

    if (isNaN(calories)) {
      console.error("A IA não retornou um número válido:", resultText);
      return 0;
    }

    return calories;
  } catch (error) {
    console.error("Erro ao estimar calorias:", error);
    return 0;
  }
};

function buildSystemMessageRecipe(userProfile: UserProfile | null): string {
  return `
Você é um assistente especializado em receitas. Responda apenas com o conteúdo da receita de forma clara, direta e sem saudações, mensagens extras ou explicações.

Formato da resposta:
- Nome da receita
- Ingredientes
- Modo de preparo

Se a receita for para uma refeição específica, inclua o tempo de preparo e as calorias estimadas.

Se o pedido não for relacionado a uma receita de comida ou bebida, responda apenas com:
"Por favor, peça somente receitas". Também não responda nada que não seja receita mais o tipo dela, não responda se o usuário digitar só um ingrediente ou uma frase vaga como "faça uma receita saudável".
Seja bem restritivo a sómente responder receitas. e sem pre devolva o erro "Por favor, peça somente receitas".

Preferências do usuário (se fornecidas):
${userProfile?.formResponses || 'Nenhuma restrição alimentar informada.'}
`;
}

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

export const sendMessageToRecipeAI = async (
  message: string,
  userProfile: UserProfile | null
): Promise<string> => {
  const systemContext = buildSystemMessageRecipe(userProfile);

  const prompt = `${systemContext}
--- PERGUNTA DO USUÁRIO ---
${message}

--- FIM DA PERGUNTA ---
`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini", // usa o modelo econômico
      input: prompt,
    });

    return response.output_text ?? "Não consegui gerar uma receita.";
  } catch (error) {
    console.error("Erro ao se comunicar com a OpenAI:", error);
    return "Desculpe, houve um erro ao processar sua solicitação. Tente novamente.";
  }
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
      model: "gpt-4o-mini", //usa o modelo barato
      input: prompt,
    });

    return response.output_text ?? "Não consegui gerar uma resposta.";
  } catch (error) {
    console.error("Erro ao se comunicar com a OpenAI:", error);
    return "Desculpe, houve um erro ao processar sua solicitação. Tente novamente.";
  }
};

/**
 * Gera 5 dicas personalizadas para o usuário com base em seu perfil.
 * @param userProfile O perfil do usuário com as respostas do formulário.
 * @returns Uma promessa com um array de strings contendo as dicas.
 */
export const generatePersonalizedTips = async (
  userProfile: UserProfile | null
): Promise<string[]> => {
  if (!userProfile?.formResponses) {
    return [
      // Retorna dicas genéricas se não houver perfil
      "Beba pelo menos 2 litros de água por dia.",
      "Preencha o formulário inicial para receber dicas personalizadas!",
      "Uma boa noite de sono é fundamental para seus resultados.",
    ];
  }

  // O prompt instrui a IA a focar nos dados e retornar um formato específico (JSON)
  const prompt = `
    Baseado no perfil de usuário abaixo, gere 2 dicas curtas, úteis e motivadoras sobre nutrição e bem-estar.
    As dicas devem ser diretamente relacionadas ao "objetivo" principal do usuário.
    Se o usuário tem restrições, uma das dicas pode ser sobre como lidar com essa restrição.

    Perfil do usuário:
    ${JSON.stringify(userProfile.formResponses)}

    Sua resposta DEVE ser um array JSON contendo 2 strings, e nada mais.
    Exemplo de resposta: ["Sua dica 1 aqui.", "Sua dica 2 aqui."]
  `;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    const responseText = response.output_text ?? "[]";
    
    const tipsArray = JSON.parse(responseText);

    
    if (
      Array.isArray(tipsArray) &&
      tipsArray.every((item) => typeof item === "string")
    ) {
      return tipsArray;
    }
    throw new Error("A IA não retornou um array de strings válido.");
  } catch (error) {
    console.error("Erro ao gerar dicas:", error);
    
    return ["Tente consumir mais frutas e vegetais no seu dia a dia."];
  }
};
