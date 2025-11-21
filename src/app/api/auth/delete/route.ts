import { NextRequest, NextResponse } from 'next/server';
import { statements } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Delete user (CASCADE will delete user_data automatically)
    statements.deleteUser.run(payload.userId);

    return NextResponse.json({
      message: 'Account deleted successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
