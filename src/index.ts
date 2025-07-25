import * as fs from 'fs'; // Pour l'utilisation en environnement Node.js
import { stripIndents } from './stripIndent';
import { DefaultValueSettings, OpenAIMessage, StructuredSectionTag } from './types/index.types';


/**
 * Build structured prompts as code
 */
export class PromptBuilder {
    private basePrompt: string;  // provide by user 
    private isStructured: boolean;
    private dynamicArgs: Record<string, string> = {};
    private sections: Partial<Record<StructuredSectionTag, string>> = {};
    private defaults: string[] = [];
    private defaultValueSettings: DefaultValueSettings;

    constructor(basePrompt: string, isStructured = false) {
        this.basePrompt = basePrompt;
        this.isStructured = isStructured;

        this.defaultValueSettings = {
            xmlTag: "dvao", // defaults_values_and_overrides
            sectionName: "default_values_and_overrides",
            instructions: stripIndents`
        - The user's input is the primary source of truth and ALWAYS overrides the default values listed below.
        - Use these default values ONLY IF the corresponding information is MISSING from the user's text prompt.
      `
        };

        if (this.isStructured) {
            this.basePrompt += stripIndents`
        {{system_constraints}}
        {{message_formatting_info}}
        {{artifact_info}}
        {{critical_rules}}
        {{examples}}
      `;
        }
    }

    // --- CONFIGURATION ---

    /**
     * Charge le prompt de base depuis un fichier. (Node.js)
     */
    public static fromFile(filePath: string, isStructured = false): PromptBuilder {
        try {
            const basePrompt = fs.readFileSync(filePath, 'utf-8');
            return new PromptBuilder(basePrompt, isStructured);
        } catch (error: any) {
            throw new Error(`Failed to read prompt from file: ${filePath}. Error: ${error}`);
        }
    }

    /**
     * Ajoute un seul argument dynamique qui sera injecté dans le prompt.
     * @param key Le nom du placeholder (ex: "user_query").
     * @param value La valeur à injecter.
     */
    public addArgument(key: string, value: string): this {
        this.dynamicArgs[key] = value;
        return this;
    }

    /**
     * Ajoute un bloc d'arguments dynamiques. Remplace les arguments existants avec les mêmes clés.
     */
    public withArguments(args: Record<string, string>): this {
        this.dynamicArgs = { ...this.dynamicArgs, ...args };
        return this;
    }

    /**
     * Ajoute une section structurée (enveloppée dans des balises XML).
     */
    public addSection(tag: StructuredSectionTag, content: string): this {
        this.sections[tag] = (this.sections[tag] ?? '') + content;
        return this;
    }

    /**
     * Ajoute une section structurée uniquement si la condition est vraie.
     */
    public addSectionIf(condition: unknown, tag: StructuredSectionTag, content: string): this {
        if (condition) {
            this.addSection(tag, content);
        }
        return this;
    }

    /**
     * Ajoute une liste d'exemples formatés au prompt.
     */
    public addExamples(examples: Array<{ query: string; response: string }>): this {
        const examplesContent = examples.map(ex => stripIndents`
      <example>
        <user_query>${ex.query}</user_query>
        <assistant_response>${ex.response}</assistant_response>
      </example>
    `).join('\n\n');

        this.addSection("examples", examplesContent);
        return this;
    }

    /**
     * Ajoute une valeur par défaut.
     */
    public addDefault(value: string): this {
        if (value) this.defaults.push(value);
        return this;
    }

    /**
     * Ajoute une valeur par défaut si la condition est vraie.
     */
    public addDefaultIf(condition: unknown, value: string): this {
        if (condition) this.addDefault(value);
        return this;
    }

    // --- CONSTRUCTION & EXPORTATION ---

    /**
     * Construit la chaîne de caractères finale du prompt.
     * @throws {Error} si des placeholders ne sont pas remplis.
     */
    public build(): string {
        let finalPrompt = this.basePrompt;

        this.injectDefaultsSection();

        // const allArgs = { ...this.dynamicArgs, ...this.sections };

        // for dynamic args
        for (const [key, value] of Object.entries(this.dynamicArgs)) {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            finalPrompt = finalPrompt.replace(placeholder, value ? stripIndents`${value}` : '');
        }

        // for sections
        for (const [key, value] of Object.entries(this.sections)) {
            const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            finalPrompt = finalPrompt.replace(placeholder, value ? stripIndents`<${key}>${value}</${key}>` : '');
        }

        // Remplace les placeholders restants des sections structurées qui sont optionnelles
        finalPrompt = finalPrompt.replace(/\{\{(system_constraints|message_formatting_info|artifact_info|critical_rules|examples)\}\}/g, "");

        // Validation finale
        const remainingPlaceholders = finalPrompt.match(/\{\{(\w+)\}\}/g);
        if (remainingPlaceholders) {
            throw new Error(`Build failed: The following placeholders were not provided: ${remainingPlaceholders.join(', ')}`);
        }

        return finalPrompt.trim();
    }

    /**
     * Formate la sortie pour l'API OpenAI (ou compatible).
     * @param userQueryKey La clé de l'argument contenant le message de l'utilisateur (ex: "user_query").
     */
    public buildForLLM(userQueryKey = 'user_query'): OpenAIMessage[] {
        const userMessage = this.dynamicArgs[userQueryKey];
        if (!userMessage) throw new Error(`Cannot build for LLM: argument with key "${userQueryKey}" was not provided.`);

        // Tmp, remove user query from args
        const systemArgs = { ...this.dynamicArgs };
        delete systemArgs[userQueryKey];

        const tempBuilder = new PromptBuilder(this.basePrompt, this.isStructured)
            .withArguments(systemArgs)
            .addDefaults(this.defaults) // Helper à créer pour simplifier

        const systemPrompt = tempBuilder.build();

        return [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ];
    }

    /**
     * Provides a basic estimation of tokens in the final prompt.
     * Note: This is a simple estimation based on word count and may not be accurate.
     * For more accurate token counting, consider using a dedicated tokenizer library.
     */
    public estimateTokens(): number {
        const finalPrompt = this.build();
        // Rough estimation: 1 token ≈ 4 characters for English text
        // This is a simple fallback, not as accurate as a proper tokenizer
        return Math.ceil(finalPrompt.length / 4);
    }

    private injectDefaultsSection(): void {
        if (this.defaults.length === 0) {
            this.dynamicArgs[this.defaultValueSettings.xmlTag] = "";
            return;
        }

        const { sectionName, instructions, xmlTag } = this.defaultValueSettings;
        const defaultBlock = stripIndents`
      <${sectionName}>
        ${instructions}
        ${this.defaults.join('\n')}
      </${sectionName}>
    `;

        this.dynamicArgs[xmlTag] = defaultBlock;
    }

    // Méthode utilitaire pour simplifier la recopie
    private addDefaults(defaults: string[]): this {
        this.defaults.push(...defaults);
        return this;
    }
}