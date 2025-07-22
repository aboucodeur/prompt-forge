// tests/PromptBuilder.test.ts
import { PromptBuilder } from '../src/index';

describe('PromptBuilder', () => {
    it('should build a simple prompt with an argument', () => {
        const builder = new PromptBuilder('Hello, {{name}}!');
        const prompt = builder.addArgument('name', 'World').build();
        expect(prompt).toBe('Hello, World!');
    });

    it('should throw an error for unprovided placeholders', () => {
        const builder = new PromptBuilder('Hello, {{name}}!');
        // On s'attend à ce que l'appel à .build() lève une erreur
        expect(() => builder.build()).toThrow('Build failed: The following placeholders were not provided: {{name}}');
    });

    it('should add a structured section conditionally', () => {
        const builder = new PromptBuilder('Task: {{task}}{{critical_rules}}', true);
        builder.addArgument('', 'Summarize');
        builder.addSectionIf(true, 'critical_rules', 'Be concise.');

        const prompt = builder.build();
        expect(prompt).toContain('<critical_rules>');
        expect(prompt).toContain('Be concise.');
    });
});