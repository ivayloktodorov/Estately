import { NextRequest, NextResponse } from 'next/server';
import { uploadR2Image } from '@/services/storage/r2';

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { status: 'error', error: { code: 'R2_UPLOAD_FAILED', message } },
    { status },
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image');

  if (!(file instanceof File)) {
    return errorResponse('Please upload a single image file.', 400);
  }

  try {
    const result = await uploadR2Image(file);

    return NextResponse.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image.';
    return errorResponse(message, 400);
  }
}
