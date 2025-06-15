// src/utils/nutritionCalculator.ts

// Fatores de atividade física (TDEE - Gasto Energético Diário Total)
const activityFactors = {
  'Sedentário (sem exercícios regulares)': 1.2,
  'Levemente ativo (1–2x por semana)': 1.375,
  'Moderadamente ativo (3–4x por semana)': 1.55,
  'Muito ativo (5+ vezes por semana)': 1.725,
  'Atleta': 1.9,
};

// Ajuste de calorias com base no objetivo
const goalFactors = {
  'Emagrecimento': -500, // Déficit de 500 kcal
  'Ganho de massa muscular': 300, // Superávit de 300 kcal
  'Manutenção de peso': 0,
  'Reeducação alimentar': -250, // Leve déficit para começar
  'Melhorar performance esportiva': 200, // Leve superávit
};

export function calculateDailyCalories(formResponses: Record<string, any>): number {
  const { peso, altura, idade, genero, nivelAtividade, objetivo } = formResponses;

  if (!peso || !altura || !idade || !genero || !nivelAtividade || !objetivo) {
    return 2000; // Retorna um valor padrão se faltarem dados
  }

  // Fórmula de Mifflin-St Jeor para Taxa Metabólica Basal (TMB)
  let tmb = (10 * peso) + (6.25 * altura) - (5 * idade);
  if (genero === 'Masculino') {
    tmb += 5;
  } else if (genero === 'Feminino') {
    tmb -= 161;
  }

  // Calcula o Gasto Energético Diário Total (TDEE)
  const activityFactor = activityFactors[nivelAtividade] || 1.55;
  const tdee = tmb * activityFactor;

  // Ajusta com base no objetivo do usuário
  const goalAdjustment = goalFactors[objetivo] || 0;
  const finalCalories = Math.round(tdee + goalAdjustment);

  return finalCalories;
}