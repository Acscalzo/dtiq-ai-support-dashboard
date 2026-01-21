import { NextRequest, NextResponse } from 'next/server';
import { DocumentationArticle, CreateDocumentationRequest, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';

// Mock documentation data
const mockDocs: DocumentationArticle[] = [
  {
    id: 'DOC-001',
    title: 'Getting Started Guide',
    content: 'Complete guide to getting started with our platform...',
    category: 'Getting Started',
    tags: ['beginner', 'tutorial', 'setup'],
    viewCount: 1234,
    helpfulCount: 892,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Sarah Johnson',
  },
  {
    id: 'DOC-002',
    title: 'API Authentication',
    content: 'Learn how to authenticate your API requests using OAuth 2.0...',
    category: 'API',
    tags: ['api', 'authentication', 'oauth'],
    viewCount: 876,
    helpfulCount: 654,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Mike Chen',
  },
  {
    id: 'DOC-003',
    title: 'Troubleshooting Login Issues',
    content: 'Common login problems and how to resolve them...',
    category: 'Troubleshooting',
    tags: ['login', 'troubleshooting', 'authentication'],
    viewCount: 2341,
    helpfulCount: 1876,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Sarah Johnson',
  },
  {
    id: 'DOC-004',
    title: 'Billing and Subscriptions',
    content: 'Manage your subscription, view invoices, and update payment methods...',
    category: 'Billing',
    tags: ['billing', 'subscription', 'payment'],
    viewCount: 567,
    helpfulCount: 432,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Alice Brown',
  },
  {
    id: 'DOC-005',
    title: 'Security Best Practices',
    content: 'Essential security practices to protect your account and data...',
    category: 'Security',
    tags: ['security', 'best-practices', 'privacy'],
    viewCount: 1543,
    helpfulCount: 1234,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Mike Chen',
  },
];

/**
 * GET /api/documentation
 * Returns list of documentation articles (requires authentication)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<DocumentationArticle[]>>> {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can view documentation
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let filteredDocs = [...mockDocs];

    // Filter by category
    if (category) {
      filteredDocs = filteredDocs.filter((doc) => doc.category === category);
    }

    // Filter by search query
    if (search) {
      const searchLower = search.toLowerCase();
      filteredDocs = filteredDocs.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.content.toLowerCase().includes(searchLower) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredDocs,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching documentation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch documentation',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documentation
 * Creates a new documentation article (requires authentication)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<DocumentationArticle>>> {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can create documentation
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    const body: CreateDocumentationRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, content, category',
        },
        { status: 400 }
      );
    }

    // Create new documentation article
    const newDoc: DocumentationArticle = {
      id: `DOC-${String(mockDocs.length + 1).padStart(3, '0')}`,
      title: body.title,
      content: body.content,
      category: body.category,
      tags: body.tags || [],
      viewCount: 0,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'System',
    };

    // In a real implementation, save to database
    mockDocs.push(newDoc);

    return NextResponse.json(
      {
        success: true,
        data: newDoc,
        message: 'Documentation article created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error creating documentation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create documentation article',
      },
      { status: 500 }
    );
  }
}
