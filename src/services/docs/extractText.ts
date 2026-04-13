import type { docs_v1 } from 'googleapis';

/**
 * Extracts plain text from a Google Docs structured document.
 * Handles paragraphs, tables, and nested content.
 */
export function extractPlainText(document: docs_v1.Schema$Document): string {
  const content = document.body?.content ?? [];
  return content
    .map(extractStructuralElement)
    .join('');
}

function extractStructuralElement(element: docs_v1.Schema$StructuralElement): string {
  if (element.paragraph) {
    return extractParagraph(element.paragraph);
  }
  if (element.table) {
    return extractTable(element.table);
  }
  // sectionBreak, tableOfContents — skip
  return '';
}

function extractParagraph(paragraph: docs_v1.Schema$Paragraph): string {
  return (paragraph.elements ?? [])
    .map((el) => el.textRun?.content ?? '')
    .join('');
}

function extractTable(table: docs_v1.Schema$Table): string {
  return (table.tableRows ?? [])
    .map((row) =>
      (row.tableCells ?? [])
        .map((cell) =>
          (cell.content ?? [])
            .map(extractStructuralElement)
            .join('')
        )
        .join('\t')
    )
    .join('\n');
}
