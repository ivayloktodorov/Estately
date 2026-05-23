import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAttachmentForUser } from '@/lib/messages/service';

interface AttachmentRouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: AttachmentRouteProps) {
  const user = await requireAuth();
  const { id } = await params;
  const attachmentId = Number(id);

  if (!Number.isInteger(attachmentId) || attachmentId <= 0) {
    return NextResponse.json(
      { status: 'error', error: { code: 'INVALID_ATTACHMENT', message: 'Invalid attachment.' } },
      { status: 400 },
    );
  }

  const attachment = await getAttachmentForUser(attachmentId, user.id, user.role === 'admin');

  if (!attachment) {
    return NextResponse.json(
      { status: 'error', error: { code: 'NOT_FOUND', message: 'Attachment not found.' } },
      { status: 404 },
    );
  }

  return NextResponse.redirect(attachment.fileUrl);
}
