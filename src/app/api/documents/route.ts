import { NextRequest, NextResponse } from 'next/server';

// Environment variables for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Helper function to get token from request
function getTokenFromRequest(request: NextRequest): string | undefined {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  
  // Fall back to cookies
  return request.cookies.get('token')?.value;
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Construct query string
    let queryString = `page=${page}&limit=${limit}`;
    if (status) queryString += `&status=${status}`;
    if (type) queryString += `&type=${type}`;
    if (department) queryString += `&department=${department}`;

    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/api/documents?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Error fetching documents' }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in documents API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data from request
    const formData = await request.formData();
    
    // Forward request to backend API with the file
    const response = await fetch(`${API_BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData, // Forward the form data as is
    });

    if (!response.ok) {
      // First check the content type to handle HTML errors
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          return NextResponse.json(
            { error: errorData.error || 'Error creating document' }, 
            { status: response.status }
          );
        } catch (parseError) {
          // If JSON parsing fails, fall back to text
          const errorText = await response.text();
          return NextResponse.json(
            { error: 'Error creating document' }, 
            { status: response.status }
          );
        }
      } else {
        // For non-JSON responses (like HTML error pages)
        return NextResponse.json(
          { error: 'Google Cloud Storage permission denied. Please check storage permissions.' }, 
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in documents POST API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 