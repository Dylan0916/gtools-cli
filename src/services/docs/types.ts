export interface DocDocument {
  documentId: string;
  title: string;
  content: string; // extracted plain text
}

export type DocsCommandResult =
  | { document: DocDocument };
