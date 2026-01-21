import { NextRequest, NextResponse } from 'next/server';
import { Ticket, CreateTicketRequest, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';

// Mock data
const mockTickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Unable to login to dashboard',
    description: 'User is experiencing login issues after password reset',
    status: 'open',
    priority: 'high',
    category: 'Authentication',
    customerId: 'CUST-123',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    assignedTo: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    tags: ['login', 'password', 'urgent'],
    aiSuggestion: 'Suggest password reset verification check',
    sentiment: 'negative',
  },
  {
    id: 'TKT-002',
    title: 'Feature request: Dark mode',
    description: 'Customer requesting dark mode support for better accessibility',
    status: 'in_progress',
    priority: 'medium',
    category: 'Feature Request',
    customerId: 'CUST-456',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    assignedTo: 'Mike Chen',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    tags: ['feature', 'ui', 'accessibility'],
    sentiment: 'positive',
  },
  {
    id: 'TKT-003',
    title: 'Payment processing error',
    description: 'Transaction failed with error code 500 during checkout',
    status: 'resolved',
    priority: 'high',
    category: 'Billing',
    customerId: 'CUST-789',
    customerName: 'Bob Wilson',
    customerEmail: 'bob.wilson@example.com',
    assignedTo: 'Sarah Johnson',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    tags: ['payment', 'billing', 'error'],
    aiSuggestion: 'Payment gateway issue resolved',
    sentiment: 'neutral',
  },
  {
    id: 'TKT-004',
    title: 'API documentation unclear',
    description: 'Need more examples for REST API authentication endpoints',
    status: 'open',
    priority: 'low',
    category: 'Documentation',
    customerId: 'CUST-321',
    customerName: 'Alice Brown',
    customerEmail: 'alice.brown@example.com',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    tags: ['documentation', 'api'],
    sentiment: 'neutral',
  },
  {
    id: 'TKT-005',
    title: 'Slow dashboard loading',
    description: 'Dashboard takes over 10 seconds to load on mobile devices',
    status: 'in_progress',
    priority: 'medium',
    category: 'Performance',
    customerId: 'CUST-654',
    customerName: 'Charlie Davis',
    customerEmail: 'charlie.davis@example.com',
    assignedTo: 'Mike Chen',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    tags: ['performance', 'mobile', 'dashboard'],
    aiSuggestion: 'Optimize asset loading and enable caching',
    sentiment: 'negative',
  },
];

/**
 * GET /api/tickets
 * Returns list of all tickets (requires authentication)
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Ticket[]>>> {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can view tickets
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    // In a real implementation, you would:
    // - Parse query parameters for filtering (status, priority, etc.)
    // - Paginate results
    // - Fetch from database

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let filteredTickets = [...mockTickets];

    if (status) {
      filteredTickets = filteredTickets.filter((t) => t.status === status);
    }

    if (priority) {
      filteredTickets = filteredTickets.filter((t) => t.priority === priority);
    }

    return NextResponse.json({
      success: true,
      data: filteredTickets,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tickets',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * Creates a new ticket (requires agent, manager, or admin role)
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Ticket>>> {
  try {
    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - agents, managers, and admins can create tickets
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions to create tickets');
    }

    const body: CreateTicketRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.customerName || !body.customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: title, description, customerName, customerEmail',
        },
        { status: 400 }
      );
    }

    // Create new ticket
    const newTicket: Ticket = {
      id: `TKT-${String(mockTickets.length + 1).padStart(3, '0')}`,
      title: body.title,
      description: body.description,
      status: 'open',
      priority: body.priority || 'medium',
      category: body.category || 'General',
      customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: body.tags || [],
      sentiment: 'neutral',
    };

    // In a real implementation, save to database
    mockTickets.push(newTicket);

    return NextResponse.json(
      {
        success: true,
        data: newTicket,
        message: 'Ticket created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error creating ticket:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create ticket',
      },
      { status: 500 }
    );
  }
}
