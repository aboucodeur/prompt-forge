
export type StructuredSectionTag =
    | "system_constraints" | "message_formatting_info" | "artifact_info"
    | "critical_rules" | "examples" | "output_constraints" | "data_processing_rules";

export type OpenAIRole = "system" | "user" | "assistant";
export interface OpenAIMessage {
    role: OpenAIRole;
    content: string;
}

export interface DefaultValueSettings {
    xmlTag: string; // xml tag name in dynamic args
    sectionName: string;
    instructions: string;
}