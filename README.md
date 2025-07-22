# Prompt Forge

![npm](https://img.shields.io/npm/v/@votre-nom-npm/prompt-forge)
![license](https://img.shields.io/npm/l/@votre-nom-npm/prompt-forge)
![size](https://img.shields.io/bundlephobia/minzip/@votre-nom-npm/prompt-forge)

A lightweight, zero-dependency library for building robust and maintainable LLM prompts in TypeScript.

## Why Prompt Forge?

Managing complex prompts as simple strings is messy and error-prone. Heavy frameworks like LangChain are powerful but can be overkill. **Prompt Forge** gives you the power of structured, dynamic prompts without the overhead.

- ✅ **Zero Dependencies:** Tiny and fast.
- ✅ **Type-Safe:** Full TypeScript support.
- ✅ **Robust:** Validates prompts to prevent errors.
- ✅ **Maintainable:** Separates logic, structure, and data.

## Installation

```bash
npm install @softia/prompt-forge
```

## Usage

```typescript
import { PromptBuilder } from "@softia/prompt-forge";

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
