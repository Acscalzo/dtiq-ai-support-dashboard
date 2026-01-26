import { NextRequest, NextResponse } from 'next/server';
import { Ticket, UpdateTicketRequest, ApiResponse } from '@/types/api';
import { verifyAuthToken, hasAnyRole } from '@/lib/auth/apiAuth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiErrors';
import { getCompany } from '@/lib/config/company';

// Mock data (same as in tickets/route.ts - in real app, this would be from DB)
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
 * GET /api/tickets/[id]
 * Returns a single ticket by ID (requires authentication)
 * Multi-tenant: Returns ticket for the current company's subdomain
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Ticket>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can view tickets
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    const { id } = params;

    // Find ticket by ID
    const ticket = mockTickets.find((t) => t.id === id);

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: `Ticket with ID ${id} not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ticket',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tickets/[id]
 * Updates a ticket (requires authentication)
 * Multi-tenant: Updates ticket for the current company's subdomain
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<Ticket>>> {
  try {
    // Get current company from subdomain
    const company = getCompany();

    // Verify authentication
    const user = await verifyAuthToken(request);

    // Check role - all authenticated users can update tickets
    if (!hasAnyRole(user, ['admin', 'manager', 'agent'])) {
      return forbiddenResponse('Insufficient permissions');
    }

    const { id } = params;
    const body: UpdateTicketRequest = await request.json();

    // Find ticket by ID
    const ticketIndex = mockTickets.findIndex((t) => t.id === id);

    if (ticketIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: `Ticket with ID ${id} not found`,
        },
        { status: 404 }
      );
    }

    // Update ticket
    const updatedTicket: Ticket = {
      ...mockTickets[ticketIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // If status is being changed to resolved, set resolvedAt
    if (body.status === 'resolved' && mockTickets[ticketIndex].status !== 'resolved') {
      updatedTicket.resolvedAt = new Date().toISOString();
    }

    // In a real implementation, update in database
    mockTickets[ticketIndex] = updatedTicket;

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: 'Ticket updated successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }

    console.error('Error updating ticket:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update ticket',
      },
      { status: 500 }
    );
  }
}
