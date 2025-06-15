const activityFactors = {
  "Sedentário (sem exercícios regulares)": 1.2,
  "Levemente ativo (1–2x por semana)": 1.375,
  "Moderadamente ativo (3–4x por semana)": 1.55,
  "Muito ativo (5+ vezes por semana)": 1.725,
  Atleta: 1.9,
};

const goalFactors = {
  Emagrecimento: -500,
  "Ganho de massa muscular": 300,
  "Manutenção de peso": 0,
  "Reeducação alimentar": -250,
  "Melhorar performance esportiva": 200,
};

type ActivityLevel = keyof typeof activityFactors;
type Goal = keyof typeof goalFactors;

export function calculateDailyCalories(
  formResponses: Record<string, any>
): number {
  const { peso, altura, idade, genero, nivelAtividade, objetivo } =
    formResponses;

  if (!peso || !altura || !idade || !genero || !nivelAtividade || !objetivo) {
    return 2000; // Retorna um valor padrão se faltarem dados
  }

  //Mifflin-St Jeor Metabólica Basal (TMB)
  let tmb = 10 * peso + 6.25 * altura - 5 * idade;
  if (genero === "Masculino") {
    tmb += 5;
  } else if (genero === "Feminino") {
    tmb -= 161;
  }

  const userActivityLevel = nivelAtividade as ActivityLevel;
  const userGoal = objetivo as Goal;

  const activityFactor = activityFactors[userActivityLevel] || 1.55;
  const goalAdjustment = goalFactors[userGoal] || 0;

  const tdee = tmb * activityFactor;
  const finalCalories = Math.round(tdee + goalAdjustment);

  return finalCalories;
}
