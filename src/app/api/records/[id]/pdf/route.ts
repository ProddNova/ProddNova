import { NextResponse } from 'next/server';
import { findRecordById } from '@/lib/server/mongodb-data-api';
import { getSession } from '@/lib/server/session';

const escapePdf = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const createSimplePdf = (title: string, lines: string[]) => {
  const maxLines = 36;
  const printable = [title, ...lines].slice(0, maxLines).map((line) => line.slice(0, 95));

  const streamLines = ['BT', '/F1 12 Tf', '50 780 Td'];
  printable.forEach((line, index) => {
    if (index > 0) {
      streamLines.push('0 -18 Td');
    }
    streamLines.push(`(${escapePdf(line)}) Tj`);
  });
  streamLines.push('ET');

  const streamContent = streamLines.join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(streamContent, 'utf8')} >> stream\n${streamContent}\nendstream endobj`
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${obj}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
};

export async function GET(_: Request, context: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const record = await findRecordById(context.params.id, session.sub);
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const lines = [
      `Type: ${record.type}`,
      `Created: ${new Date(record.createdAt).toLocaleString('it-IT', { timeZone: 'UTC' })} UTC`,
      'Payload:',
      ...JSON.stringify(record.payload, null, 2).split('\n')
    ];

    const pdfBuffer = createSimplePdf(`Urbex Report - ${record.title}`, lines);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${record.title.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Cannot create PDF' }, { status: 500 });
  }
}
