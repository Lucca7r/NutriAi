import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@env';

console.log('🔑 OPENAI_API_KEY:', OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, 
});

export const sendMessageToAI = async (message: string): Promise<string> => {
  try {
    const response = await openai.responses.create({
      model: 'gpt-4.1-mini',   //teste modelos nao turbos
      input: message,
    });

    return response.output_text;
  } catch (error) {
    console.error('Erro ao se comunicar com a OpenAI:', error);
    return 'Desculpe, houve um erro ao gerar a resposta.';
  }
};
