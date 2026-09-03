import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-');
    const fileName = `${timestamp}-${originalName}`;
    const path = join(process.cwd(), 'public', 'uploads', fileName);

    await writeFile(path, buffer);
    const url = `/uploads/${fileName}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ success: false, message: 'Erro no upload' }, { status: 500 });
  }
}
