import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { statements } from '@/lib/db';

// Get user data
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type');

    if (dataType) {
      // Get specific data type
      const data = statements.getUserData.get(user.userId, dataType) as {
        data: string;
        last_synced: string;
      } | undefined;

      if (!data) {
        return NextResponse.json(
          { error: 'Data not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        dataType,
        data: JSON.parse(data.data),
        lastSynced: data.last_synced
      });
    } else {
      // Get all data
      const allData = statements.getAllUserData.all(user.userId) as Array<{
        data_type: string;
        data: string;
        last_synced: string;
      }>;

      const result = allData.reduce((acc, item) => {
        acc[item.data_type] = {
          data: JSON.parse(item.data),
          lastSynced: item.last_synced
        };
        return acc;
      }, {} as Record<string, { data: unknown; lastSynced: string }>);

      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Get data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Save user data
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dataType, data } = body;

    if (!dataType || !data) {
      return NextResponse.json(
        { error: 'dataType and data are required' },
        { status: 400 }
      );
    }

    // Validate dataType
    const validTypes = ['routine', 'gamification', 'usage', 'pet'];
    if (!validTypes.includes(dataType)) {
      return NextResponse.json(
        { error: 'Invalid dataType. Must be: routine, gamification, usage, or pet' },
        { status: 400 }
      );
    }

    // Save data
    statements.saveUserData.run(
      user.userId,
      dataType,
      JSON.stringify(data)
    );

    return NextResponse.json({
      success: true,
      message: 'Data saved successfully'
    });

  } catch (error) {
    console.error('Save data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user data
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get('type');

    if (!dataType) {
      return NextResponse.json(
        { error: 'dataType is required' },
        { status: 400 }
      );
    }

    statements.deleteUserData.run(user.userId, dataType);

    return NextResponse.json({
      success: true,
      message: 'Data deleted successfully'
    });

  } catch (error) {
    console.error('Delete data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
