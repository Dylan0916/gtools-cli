import { google } from 'googleapis';
import type { docs_v1 } from 'googleapis';
import type { AuthClient } from '../../auth';

const docs = google.docs('v1');

export async function getDocument(
  auth: AuthClient,
  documentId: string
): Promise<docs_v1.Schema$Document> {
  const res = await docs.documents.get({ auth, documentId });
  return res.data;
}
