<h1 align="center">Documentação do Projeto - Nutri Ai</h1>
<br>
<br>

# 🔹 Nutri Ai: <br>

<br>
<p>
Aplicativo de apoio nutricional, onde o usuário pode registrar sua dieta atual (caso tenha acompanhamento profissional) ou receber orientações básicas de nutrição com base em perguntas guiadas. O app também oferece um chat com inteligência artificial (GPT API) para sugerir trocas de refeições e receitas fitness personalizadas.<br></p>


politicas de provacidade: https://lucca7r.github.io/nutriai-politica/
<br>

# 📁 Estrutura de Pastas

<strong> NutriAi/</strong><br>
│<br>
├── <strong>App.tsx  </strong>                   # Ponto de entrada da aplicação<br>
├── <strong>package.json </strong>               # Informações e dependências do projeto<br>
├── <strong>tsconfig.json </strong>              # Configuração do TypeScript<br>
├── <strong>.gitignore   </strong>               # Arquivos ignorados no controle de versão<br>
│<br>
└── <strong>src/ </strong>                    # Código-fonte principal do app<br>
    ├── <strong>screens/ </strong>               # Telas principais da aplicação<br>
    │   └── <strong>HomeScreen.tsx</strong>      # Tela inicial (Home)<br>
    ├── <strong>components/  </strong>           # Componentes reutilizáveis<br>
    ├── <strong>services/ </strong>              # Requisições HTTP, APIs, etc.<br>
    ├── <strong>context/  </strong>              # Estados globais usando Context API<br>
    ├── <strong>utils/    </strong>              # Funções auxiliares<br>
    ├── <strong>data/     </strong>              # Dados mockados ou estáticos<br>
    ├── <strong>styles/    </strong>          # Estilos globais e temas<br>
    └── <strong>navigation/   </strong>          # Configuração de navegação<br>
<br>
    
# 🧠 Tecnologias utilizadas
<strong>- Tecnologia</strong> |	Função<br></strong>
<strong>React Native</strong>	| Framework para desenvolvimento mobile multiplataforma<br>
<strong>Expo	Ambiente</strong> | simplificado para desenvolvimento React Native<br>
<strong>TypeScript</strong>	| Superset de JavaScript com tipagem estática<br>
<strong>*VS Code</strong>	| Editor de código<br>
<strong>Node.js</strong>	| Runtime JS utilizado pelo Expo<br>
<strong>Git/GitHub</strong>	| Versionamento de código<br><br>

# 🔧 Funcionalidade atual

- Tela inicial (HomeScreen.tsx) implementada, com visualização básica.
- App configurado para exibir a HomeScreen diretamente via App.tsx.
- Estrutura de projeto modular criada, com separação por responsabilidade.
- Git inicializado e conectado ao repositório remoto do GitHub:
  - Usuário GitHub: lucca7r
  - Repositório remoto: https://github.com/lucca7r/NutriAi.git<br><br>

# ⚙️ Ambiente de Execução
O projeto é executado com Expo Go no celular ou emulador.

Inicialização do app via terminal com:
npx expo start
<br><br>

# 📝 Observações
- A navegação entre telas ainda será implementada (React Navigation).
- A integração com a API do GPT (para chat nutricional) será feita na fase posterior.
- Todo o projeto está em TypeScript para garantir tipagem e escalabilidade.
