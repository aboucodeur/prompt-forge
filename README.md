# Prompt Forge

![npm](https://img.shields.io/npm/v/@abouta/prompt-forge)
![license](https://img.shields.io/npm/l/@abouta/prompt-forge)
![size](https://img.shields.io/bundlephobia/minzip/@abouta/prompt-forge)

<div align="center" style="margin-bottom: 20px;">
    <img src="./logo.png" alt="PF-LOGO" width="30%" />
</div>

A lightweight, zero-dependency library for building robust and maintainable LLM prompts in TypeScript.

## Why Prompt Forge?

Managing complex prompts as simple strings is messy and error-prone. Heavy frameworks like LangChain are powerful but can be overkill. **Prompt Forge** gives you the power of structured, dynamic prompts without the overhead.

- ✅ **Zero Dependencies:** Tiny and fast.
- ✅ **Type-Safe:** Full TypeScript support.
- ✅ **Robust:** Validates prompts to prevent errors.
- ✅ **Maintainable:** Separates logic, structure, and data.

## Gestion des versions

Ce projet utilise [standard-version](https://github.com/conventional-changelog/standard-version) pour la gestion automatique des versions et la génération des notes de version.

### Commandes disponibles

- `pnpm run release` : Crée une nouvelle version en fonction des commits (détermine automatiquement le type de version)
- `pnpm run release:patch` : Crée une version de correctif (0.0.x)
- `pnpm run release:minor` : Crée une version mineure (0.x.0)
- `pnpm run release:major` : Crée une version majeure (x.0.0)
- `pnpm run release:first` : Crée la première version du projet

### Convention de commits

Pour une gestion optimale des versions, suivez ces conventions de commit :

- `feat:` Nouvelle fonctionnalité (incrémente la version mineure)
- `fix:` Correction de bug (incrémente la version de correctif)
- `docs:` Mise à jour de la documentation
- `style:` Changements de formatage (espace, point-virgule, etc.)
- `refactor:` Refactorisation du code sans changement de fonctionnalité
- `perf:` Amélioration des performances
- `test:` Ajout ou modification de tests
- `chore:` Mise à jour des tâches de construction, configuration, etc.

Exemple :

```bash
git commit -m "feat: ajout d'une nouvelle méthode de construction de prompt"
```

## Installation

```bash
npm install @abouta/prompt-forge
```

## Usage

```typescript
import { PromptBuilder } from "@abouta/prompt-forge";

const prompt = new PromptBuilder(`
    Your are a helpful assistant and you role is to answer the user query.
    --
    user query : {{user_query}}
`);

// add section easly : is support prompt structuration
prompt.addSection("system_constraints",
`
    - Your response must be in markdown format.
    - Don't add any additional information.
    - Be concise and clear.
`
);

prompt.addArgument("user_query", "What is next js ?");

// add examples easly
prompt.addExamples([
    {
        query: "Who is creator of prompt-forge?",
        response: "The creator of prompt-forge is Softia."
    },
    {
        query: "What is next js ?",
        response: "Next.js is a React framework for building server-rendered and statically generated web applications."
    }
]);

const promptString = prompt.build();
console.log(promptString);

// output :

// Your are a helpful assistant and you role is to answer the user query.
// --
// user query : What is next js ?

// <system_constraints>
//     - Your response must be in markdown format.
//     - Don't add any additional information.
//     - Be concise and clear.
// </system_constraints>

// <examples>
//     <query>Who is creator of prompt-forge?</query>
//     <response>The creator of prompt-forge is Softia.</response>
//     <query>What is next js ?</query>
//     <response>Next.js is a React framework for building server-rendered and statically generated web applications.</response>
// </examples>

```
