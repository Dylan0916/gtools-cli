import { getDocument } from '@/services/docs/client';
import { extractPlainText } from '@/services/docs/extractText';
import type { AuthClient } from '@/auth';
import type { CommandResult } from '@/types';

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
