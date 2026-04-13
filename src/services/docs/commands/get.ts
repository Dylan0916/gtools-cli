import { getDocument } from '../client';
import { extractPlainText } from '../extractText';
import type { AuthClient } from '../../../auth';
import type { CommandResult } from '../../../types';

export async function runGetDoc(
  auth: AuthClient,
  documentId: string,
): Promise<CommandResult> {
  const doc = await getDocument(auth, documentId);
  const content = extractPlainText(doc);

  return {
    document: {
      documentId: doc.documentId!,
      title: doc.title!,
      content,
    },
  };
}
