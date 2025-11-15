const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { OpenAI } = require("openai");

// --- ADIÇÕES PARA A FUNÇÃO DE EXCLUSÃO ---
const admin = require("firebase-admin");
//const { onUserDeleted } = require("firebase-functions/v2/auth");
const { user } = require("firebase-functions/v2/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

// Inicializa o Admin SDK (necessário para a função de exclusão)
admin.initializeApp();
const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");

function buildSystemMessageRecipe(userProfile) {
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
${userProfile?.formResponses || "Nenhuma restrição alimentar informada."}
`;
}

function buildSystemMessage(userProfile) {
  let systemMessage = `
Você é o NutriX Pro AI, um assistente virtual especializado em nutrição, dietas, receitas saudáveis e musculação, com foco principal em nutrição.
Sua comunicação deve ser amigável, motivadora e informativa.
Uma de suas principais funções é fornecer estimativas de calorias para alimentos e refeições descritas pelo usuário. Ao fazer isso, sempre deixe claro que é um valor aproximado.

REGRA GERAL: Responda **apenas** perguntas relacionadas a esses tópicos. Caso o usuário pergunte algo fora disso, recuse educadamente dizendo que só pode ajudar com saúde, bem-estar e Nutrição.
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

// ===================================================================
// ==  cuidado ou muda galera CLOUD FUNCTIONS (4 no total) ==
// ===================================================================

const getOpenAIInstance = () => {
  return new OpenAI({
    apiKey: OPENAI_API_KEY.value(),
  });
};


//chat principal famila 
exports.sendMessageToAI = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }

  const { userProfile, message, history = [] } = request.data;

  const systemContext = buildSystemMessage(userProfile);
  const historyText = history
    .map((msg) => `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.content}`)
    .join("\n");

    const prompt = `
    ${systemContext}
    ${history.length > 0 ? "--- HISTÓRICO DA CONVERSA ---\n" + historyText + "\n--- FIM DO HISTÓRICO ---" : ""}
    --- PERGUNTA DO USUÁRIO ---
    ${message}
  `;

  try {
    const openai = getOpenAIInstance();
    logger.info("Enviando requisição (Chat Principal V5) para a OpenAI...");
    

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
    });

    return { response: response.output_text ?? "Não consegui gerar uma resposta." };

  } catch (error) {
    logger.error("Erro no Chat Principal:", error);
    throw new HttpsError("internal", "Erro ao processar a requisição de IA.", error);
  }
});

//fim do chat principal famila


//chat receitas

exports.sendMessageToRecipeAI = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }

  const { userProfile, message } = request.data;
  const systemContext = buildSystemMessageRecipe(userProfile);

  const prompt = `${systemContext}
--- PERGUNTA DO USUÁRIO ---
${message}
--- FIM DA PERGUNTA ---
`;

  try {
    const openai = getOpenAIInstance();
    logger.info("Enviando requisição (Receitas V5) para a OpenAI...");

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });

    return { response: response.output_text ?? "Não consegui gerar uma receita." };

  } catch (error) {
    logger.error("Erro no Chat de Receitas:", error);
    throw new HttpsError("internal", "Erro ao processar a requisição de IA.", error);
  }
});


//fim do chat receitas

//colorias
exports.estimateCaloriesFromText = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }

  const { mealDescription } = request.data;
  const prompt = `
    Analise a seguinte descrição de uma refeição e retorne apenas o número total de calorias estimadas.
    Sua resposta deve conter SOMENTE o número, sem texto adicional, sem "kcal" ou "calorias".
    Exemplo: se a estimativa for 350, sua resposta deve ser exatamente "350".
    Se a descrição não parecer uma comida ou for muito vaga, retorne "0".
    Descrição da refeição: "${mealDescription}"
  `;

  try {
    const openai = getOpenAIInstance();
    logger.info("Enviando requisição (Calorias V5) para a OpenAI...");

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });
    
    const resultText = response.output_text?.trim() ?? "0";
    const calories = parseInt(resultText, 10);

    if (isNaN(calories)) {
      logger.error("A IA (Calorias) não retornou um número válido:", resultText);
      return { calories: 0 };
    }

    return { calories: calories };

  } catch (error) {
    logger.error("Erro ao estimar calorias:", error);
    throw new HttpsError("internal", "Erro ao processar a requisição de IA.", error);
  }
});


//fim calorias

//digas
exports.generatePersonalizedTips = onCall({ secrets: [OPENAI_API_KEY] }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }

  const { userProfile } = request.data;
  if (!userProfile?.formResponses) {
    return {
      tips: [
        "Beba pelo menos 2 litros de água por dia.",
        "Preencha o formulário inicial para receber dicas personalizadas!",
        "Uma boa noite de sono é fundamental para seus resultados.",
      ]
    };
  }

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
    const openai = getOpenAIInstance();
    logger.info("Enviando requisição (Dicas V5) para a OpenAI...");

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });
    
    const responseText = response.output_text ?? "[]";
    const tipsArray = JSON.parse(responseText);

    if (Array.isArray(tipsArray) && tipsArray.every((item) => typeof item === "string")) {
      return { tips: tipsArray };
    }
    throw new Error("A IA não retornou um array de strings válido.");

  } catch (error) {
    logger.error("Erro ao gerar dicas:", error);
    return { tips: ["Tente consumir mais frutas e vegetais no seu dia a dia."] };
  }
});
//fim digas



exports.onUserDeleted = user().onDelete(async (event) => {
  const user = event.data;
  const uid = user.uid;
  const db = getFirestore();
  const storage = getStorage();
  const bucket = storage.bucket(); // Pega o bucket de armazenamento padrão

  logger.info(`Iniciando limpeza de dados para o usuário deletado: ${uid}`);

  const batch = db.batch();

  // 1. Deletar documento 'formResponses'
  const formRef = db.collection("formResponses").doc(uid);
  batch.delete(formRef);

  // 2. Deletar 'chats' do usuário
  const chatsQuery = db.collection("chats").where("userId", "==", uid);
  const chatsSnapshot = await chatsQuery.get();
  chatsSnapshot.forEach((doc) => {
    logger.info(`Deletando chat: ${doc.id}`);
    batch.delete(doc.ref);
  });

  // 3. Deletar 'folders' E SUAS SUBCOLEÇÕES 'recipes' (Exclusão Recursiva)
  const foldersQuery = db.collection("folders").where("userId", "==", uid);
  const foldersSnapshot = await foldersQuery.get();
  
  for (const folderDoc of foldersSnapshot.docs) {
    logger.info(`Iniciando exclusão da pasta: ${folderDoc.id}`);
    
    // Deleta as receitas dentro da pasta
    const recipesQuery = folderDoc.ref.collection("recipes");
    const recipesSnapshot = await recipesQuery.get();
    recipesSnapshot.forEach((recipeDoc) => {
      logger.info(`...deletando receita ${recipeDoc.id} da pasta ${folderDoc.id}`);
      batch.delete(recipeDoc.ref);
    });
    
    // Deleta a pasta principal
    batch.delete(folderDoc.ref);
  }

  // 4. Executa todas as exclusões do Firestore no batch
  try {
    await batch.commit();
    logger.info(`Dados do Firestore para ${uid} limpos com sucesso.`);
  } catch (e) {
    logger.error("Erro ao commitar batch de exclusão do Firestore:", e);
  }

  // 5. Deletar arquivos do Storage (fora do batch do Firestore)
  const prefix = `profile_images/${uid}/`;
  try {
    // Deleta todos os arquivos nessa pasta
    await bucket.deleteFiles({ prefix: prefix });
    logger.info(`Arquivos do Storage em ${prefix} deletados.`);
  } catch (e) {
    logger.error("Erro ao deletar arquivos do Storage:", e);
  }

  logger.info(`Limpeza concluída para o usuário: ${uid}`);
});