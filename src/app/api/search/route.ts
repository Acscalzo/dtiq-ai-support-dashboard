import { NextRequest, NextResponse } from 'next/server';
import { SearchResult, SearchResponse, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';

// Import mock data from other API routes
// In production, this would come from a shared database service
const mockTickets = [
  {
    id: 'TKT-001',
    title: 'Unable to login to dashboard',
    description: 'User is experiencing login issues after password reset',
    status: 'open',
    priority: 'high',
    category: 'Authentication',
    customerName: 'John Doe',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    tags: ['login', 'password', 'urgent'],
  },
  {
    id: 'TKT-002',
    title: 'Feature request: Dark mode',
    description: 'Customer requesting dark mode support for better accessibility',
    status: 'in_progress',
    priority: 'medium',
    category: 'Feature Request',
    customerName: 'Jane Smith',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: ['feature', 'ui', 'accessibility'],
  },
  {
    id: 'TKT-003',
    title: 'Payment processing error',
    description: 'Transaction failed with error code 500 during checkout',
    status: 'resolved',
    priority: 'high',
    category: 'Billing',
    customerName: 'Bob Wilson',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    tags: ['payment', 'billing', 'error'],
  },
  {
    id: 'TKT-004',
    title: 'API documentation unclear',
    description: 'Need more examples for REST API authentication endpoints',
    status: 'open',
    priority: 'low',
    category: 'Documentation',
    customerName: 'Alice Brown',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    tags: ['documentation', 'api'],
  },
  {
    id: 'TKT-005',
    title: 'Slow dashboard loading',
    description: 'Dashboard takes over 10 seconds to load on mobile devices',
    status: 'in_progress',
    priority: 'medium',
    category: 'Performance',
    customerName: 'Charlie Davis',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    tags: ['performance', 'mobile', 'dashboard'],
  },
];

const mockDocs = [
  {
    id: 'DOC-001',
    title: 'Getting Started Guide',
    content: 'Complete guide to getting started with our platform...',
    category: 'Getting Started',
    tags: ['beginner', 'tutorial', 'setup'],
  },
  {
    id: 'DOC-002',
    title: 'API Authentication',
    content: 'Learn how to authenticate your API requests using OAuth 2.0...',
    category: 'API',
    tags: ['api', 'authentication', 'oauth'],
  },
  {
    id: 'DOC-003',
    title: 'Troubleshooting Login Issues',
    content: 'Common login problems and how to resolve them...',
    category: 'Troubleshooting',
    tags: ['login', 'troubleshooting', 'authentication'],
  },
  {
    id: 'DOC-004',
    title: 'Billing and Subscriptions',
    content: 'Manage your subscription, view invoices, and update payment methods...',
    category: 'Billing',
    tags: ['billing', 'subscription', 'payment'],
  },
  {
    id: 'DOC-005',
    title: 'Security Best Practices',
    content: 'Essential security practices to protect your account and data...',
    category: 'Security',
    tags: ['security', 'best-practices', 'privacy'],
  },
];

/**
 * GET /api/search?q=<query>
 * Searches across tickets and documentation (requires authentication)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<SearchResponse>>> {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can search
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Return empty results if no query
    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          tickets: [],
          documentation: [],
          totalResults: 0,
        },
      });
    }

    const searchLower = query.toLowerCase().trim();

    // Search tickets
    const ticketResults: SearchResult[] = mockTickets
      .filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          ticket.category.toLowerCase().includes(searchLower) ||
          ticket.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          ticket.customerName.toLowerCase().includes(searchLower)
      )
      .slice(0, 5) // Limit to 5 results
      .map((ticket) => ({
        type: 'ticket' as const,
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        tags: ticket.tags,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      }));

    // Search documentation
    const docResults: SearchResult[] = mockDocs
      .filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.content.toLowerCase().includes(searchLower) ||
          doc.category.toLowerCase().includes(searchLower) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, 5) // Limit to 5 results
      .map((doc) => ({
        type: 'documentation' as const,
        id: doc.id,
        title: doc.title,
        description: doc.content.substring(0, 100) + '...',
        category: doc.category,
        tags: doc.tags,
      }));

    const totalResults = ticketResults.length + docResults.length;

    return NextResponse.json({
      success: true,
      data: {
        tickets: ticketResults,
        documentation: docResults,
        totalResults,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error searching:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform search',
      },
      { status: 500 }
    );
  }
}
