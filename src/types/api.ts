/**
 * API Response Types for the Dashboard
 */

// Ticket Types
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  category: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  aiSuggestion?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  customerName: string;
  customerEmail: string;
  tags?: string[];
}

export interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  assignedTo?: string;
  tags?: string[];
}

// Metrics Types
export interface DashboardMetrics {
  openTickets: number;
  avgResponseTime: string;
  resolutionRate: string;
  aiAutomation: string;
  timeRange: '24h' | '7d' | '30d' | '90d';
}

// Analytics Types
export interface TrendDataPoint {
  date: string;
  created: number;
  resolved: number;
  aiResolved: number;
}

export interface AnalyticsTrends {
  data: TrendDataPoint[];
  timeRange: string;
}

// Insights Types
export interface InsightsSummary {
  upsellCount: number;
  trainingNeeded: number;
  recurringIssues: number;
  positiveSentiment: number;
}

// Documentation Types
export interface DocumentationArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface CreateDocumentationRequest {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface DocumentationStats {
  totalArticles: number;
  totalViews: number;
  categories: {
    name: string;
    count: number;
    viewCount: number;
  }[];
}

// Search Types
export interface SearchResult {
  type: 'ticket' | 'documentation';
  id: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  status?: string;
  priority?: string;
  createdAt?: string;
}

export interface SearchResponse {
  tickets: SearchResult[];
  documentation: SearchResult[];
  totalResults: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
