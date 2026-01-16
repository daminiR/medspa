/**
 * POST /api/patient/profile/photo
 * Upload profile photo
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Get user
    const user = await db.users.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'User not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, 'No file provided'),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        apiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid file type. Allowed types: JPEG, PNG, WebP'
        ),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, 'File size exceeds 5MB limit'),
        { status: 400, headers: corsHeaders() }
      );
    }

    // In production, upload to cloud storage (S3, Cloudinary, etc.)
    // For now, we'll simulate the upload and return a mock URL

    // Generate a unique filename
    const timestamp = Date.now();
    const extension = file.type.split('/')[1];
    const filename = `avatar-${user.id}-${timestamp}.${extension}`;

    // Mock URL (in production, this would be the actual uploaded URL)
    const avatarUrl = `https://storage.luxemedspa.com/avatars/${filename}`;

    // Update user's avatar URL
    await db.users.update(user.id, {
      avatarUrl,
    });

    return NextResponse.json(
      apiSuccess({
        message: 'Profile photo uploaded successfully',
        avatarUrl,
        filename,
        size: file.size,
        type: file.type,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Upload profile photo error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while uploading photo.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Get user
    const user = await db.users.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'User not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // In production, also delete from cloud storage

    // Remove avatar URL
    await db.users.update(user.id, {
      avatarUrl: undefined,
    });

    return NextResponse.json(
      apiSuccess({
        message: 'Profile photo removed successfully',
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Delete profile photo error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while removing photo.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
