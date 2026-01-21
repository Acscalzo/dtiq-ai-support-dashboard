import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.insight.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.documentation.deleteMany();
  await prisma.setting.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Agents
  const agents = await Promise.all([
    prisma.agent.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        role: 'Senior Support Agent',
        avgQualityScore: 4.8,
        totalTickets: 145,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        role: 'Support Agent',
        avgQualityScore: 4.6,
        totalTickets: 98,
      },
    }),
    prisma.agent.create({
      data: {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        role: 'Team Lead',
        avgQualityScore: 4.9,
        totalTickets: 203,
      },
    }),
  ]);

  console.log(`✅ Created ${agents.length} agents`);

  // Create Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'John Smith',
        email: 'john.smith@acmecorp.com',
        companyName: 'Acme Corporation',
        phone: '+1-555-0123',
        status: 'active',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@techstart.io',
        companyName: 'TechStart Inc',
        phone: '+1-555-0124',
        status: 'active',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'David Park',
        email: 'david.park@innovate.co',
        companyName: 'Innovate Co',
        phone: '+1-555-0125',
        status: 'active',
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create Tickets with Interactions and Insights
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Unable to access dashboard after login',
      description: 'User reports getting a blank screen after successful authentication. Browser console shows 403 error.',
      status: 'resolved',
      priority: 'high',
      category: 'Technical',
      customerId: customers[0].id,
      assignedToId: agents[0].id,
      aiResolved: false,
      sentimentScore: -0.3,
      resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      interactions: {
        create: [
          {
            type: 'email',
            content: 'Initial report: Cannot access dashboard, seeing blank screen',
            agentId: agents[0].id,
            sentiment: 'frustrated',
            qualityScore: 4.5,
            aiSummary: 'Customer experiencing post-login access issue with 403 error',
          },
          {
            type: 'chat',
            content: 'Troubleshooting: Checked user permissions and found expired session token',
            agentId: agents[0].id,
            sentiment: 'neutral',
            qualityScore: 4.8,
            aiSummary: 'Agent identified expired session token as root cause',
          },
        ],
      },
      insights: {
        create: [
          {
            type: 'recurring_issue',
            description: 'Multiple users experiencing session timeout issues. Consider increasing session duration.',
            confidenceScore: 0.85,
            status: 'pending',
            metadata: { affected_users: 12, timeframe_days: 7 },
          },
        ],
      },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Interested in enterprise plan features',
      description: 'Customer asking about SSO, advanced analytics, and dedicated support options.',
      status: 'in_progress',
      priority: 'medium',
      category: 'Sales',
      customerId: customers[1].id,
      assignedToId: agents[2].id,
      aiResolved: false,
      sentimentScore: 0.7,
      interactions: {
        create: [
          {
            type: 'call',
            content: 'Discussed enterprise features: SSO, custom integrations, SLA guarantees',
            agentId: agents[2].id,
            sentiment: 'positive',
            qualityScore: 4.9,
            aiSummary: 'Customer expressing strong interest in enterprise upgrade',
          },
        ],
      },
      insights: {
        create: [
          {
            type: 'upsell',
            description: 'High-value customer showing strong interest in enterprise plan. Recommend priority follow-up.',
            confidenceScore: 0.92,
            status: 'pending',
            metadata: { estimated_value: 50000, likelihood: 'high' },
          },
        ],
      },
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'API rate limit exceeded',
      description: 'Customer hitting rate limits on API endpoint /api/v1/data',
      status: 'open',
      priority: 'high',
      category: 'Technical',
      customerId: customers[2].id,
      assignedToId: agents[1].id,
      aiResolved: false,
      sentimentScore: -0.5,
      interactions: {
        create: [
          {
            type: 'email',
            content: 'Receiving 429 errors when polling data endpoint every 30 seconds',
            agentId: agents[1].id,
            sentiment: 'concerned',
            qualityScore: 4.2,
            aiSummary: 'Customer exceeding API rate limits with frequent polling',
          },
        ],
      },
    },
  });

  const ticket4 = await prisma.ticket.create({
    data: {
      title: 'Request to update billing email',
      description: 'Customer needs to change billing contact email address for invoices',
      status: 'resolved',
      priority: 'low',
      category: 'Billing',
      customerId: customers[0].id,
      assignedToId: agents[1].id,
      aiResolved: true,
      sentimentScore: 0.2,
      resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      interactions: {
        create: [
          {
            type: 'chat',
            content: 'AI Assistant updated billing email and sent confirmation',
            sentiment: 'satisfied',
            qualityScore: 4.7,
            aiSummary: 'Simple billing update handled automatically by AI',
          },
        ],
      },
    },
  });

  const ticket5 = await prisma.ticket.create({
    data: {
      title: 'Feature request: Export data to CSV',
      description: 'Would like ability to export analytics reports in CSV format',
      status: 'open',
      priority: 'low',
      category: 'Feature Request',
      customerId: customers[1].id,
      aiResolved: false,
      sentimentScore: 0.4,
      interactions: {
        create: [
          {
            type: 'email',
            content: 'Request for CSV export functionality for monthly reports',
            agentId: agents[0].id,
            sentiment: 'hopeful',
            qualityScore: 4.5,
            aiSummary: 'Feature request for data export capabilities',
          },
        ],
      },
    },
  });

  const ticket6 = await prisma.ticket.create({
    data: {
      title: 'Password reset not working',
      description: 'User not receiving password reset emails',
      status: 'in_progress',
      priority: 'high',
      category: 'Technical',
      customerId: customers[2].id,
      assignedToId: agents[0].id,
      aiResolved: false,
      sentimentScore: -0.6,
      interactions: {
        create: [
          {
            type: 'chat',
            content: 'Investigating email delivery issues, checking spam filters',
            agentId: agents[0].id,
            sentiment: 'frustrated',
            qualityScore: 4.3,
            aiSummary: 'Password reset email delivery failure',
          },
        ],
      },
      insights: {
        create: [
          {
            type: 'recurring_issue',
            description: 'Email deliverability issues detected. Recommend reviewing email service configuration.',
            confidenceScore: 0.78,
            status: 'pending',
            metadata: { affected_tickets: 5, email_provider: 'smtp' },
          },
        ],
      },
    },
  });

  const ticket7 = await prisma.ticket.create({
    data: {
      title: 'Training needed on advanced features',
      description: 'Customer team struggling with workflow automation setup',
      status: 'open',
      priority: 'medium',
      category: 'Training',
      customerId: customers[1].id,
      assignedToId: agents[2].id,
      aiResolved: false,
      sentimentScore: 0.1,
      interactions: {
        create: [
          {
            type: 'call',
            content: 'Scheduled training session for workflow automation',
            agentId: agents[2].id,
            sentiment: 'engaged',
            qualityScore: 4.6,
            aiSummary: 'Customer requesting training on advanced automation features',
          },
        ],
      },
      insights: {
        create: [
          {
            type: 'training_needed',
            description: 'Customer showing good engagement but needs structured training. Opportunity to offer premium onboarding.',
            confidenceScore: 0.88,
            status: 'pending',
            metadata: { team_size: 8, feature: 'workflow_automation' },
          },
        ],
      },
    },
  });

  const ticket8 = await prisma.ticket.create({
    data: {
      title: 'Mobile app crashing on iOS',
      description: 'App crashes when trying to upload images on iPhone 15',
      status: 'resolved',
      priority: 'high',
      category: 'Technical',
      customerId: customers[0].id,
      assignedToId: agents[1].id,
      aiResolved: false,
      sentimentScore: -0.4,
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      interactions: {
        create: [
          {
            type: 'email',
            content: 'Bug report with crash logs and device information',
            agentId: agents[1].id,
            sentiment: 'disappointed',
            qualityScore: 4.4,
            aiSummary: 'iOS app crash issue during image upload',
          },
          {
            type: 'chat',
            content: 'Issue resolved with app update v2.1.3',
            agentId: agents[1].id,
            sentiment: 'satisfied',
            qualityScore: 4.8,
            aiSummary: 'Bug fixed in latest app release',
          },
        ],
      },
    },
  });

  const ticket9 = await prisma.ticket.create({
    data: {
      title: 'Question about data retention policy',
      description: 'Seeking clarification on how long data is stored and backup procedures',
      status: 'closed',
      priority: 'low',
      category: 'General',
      customerId: customers[2].id,
      aiResolved: true,
      sentimentScore: 0.3,
      resolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      interactions: {
        create: [
          {
            type: 'email',
            content: 'AI provided documentation links and summary of data retention policy',
            sentiment: 'satisfied',
            qualityScore: 4.6,
            aiSummary: 'Documentation query handled by AI',
          },
        ],
      },
    },
  });

  const ticket10 = await prisma.ticket.create({
    data: {
      title: 'Integration with Salesforce not syncing',
      description: 'Contact sync between our platform and Salesforce stopped working yesterday',
      status: 'in_progress',
      priority: 'high',
      category: 'Integration',
      customerId: customers[1].id,
      assignedToId: agents[2].id,
      aiResolved: false,
      sentimentScore: -0.7,
      interactions: {
        create: [
          {
            type: 'call',
            content: 'Investigating Salesforce API connection and OAuth tokens',
            agentId: agents[2].id,
            sentiment: 'urgent',
            qualityScore: 4.7,
            aiSummary: 'Critical integration failure requiring immediate attention',
          },
        ],
      },
      insights: {
        create: [
          {
            type: 'recurring_issue',
            description: 'Salesforce integration experiencing intermittent failures. Engineering team needs to investigate API stability.',
            confidenceScore: 0.91,
            status: 'pending',
            metadata: { integration: 'salesforce', failure_rate: 0.15 },
          },
        ],
      },
    },
  });

  console.log(`✅ Created 10 tickets with interactions and insights`);

  // Create Documentation
  const docs = await Promise.all([
    prisma.documentation.create({
      data: {
        title: 'Getting Started Guide',
        content: 'Complete guide for new users to set up their account and navigate the platform.',
        category: 'Onboarding',
        aiEnabled: true,
      },
    }),
    prisma.documentation.create({
      data: {
        title: 'API Authentication',
        content: 'Documentation on API key generation, OAuth flows, and security best practices.',
        category: 'API',
        aiEnabled: true,
      },
    }),
    prisma.documentation.create({
      data: {
        title: 'Troubleshooting Common Issues',
        content: 'Solutions for frequently encountered problems including login issues, data sync, and performance.',
        category: 'Troubleshooting',
        aiEnabled: true,
      },
    }),
    prisma.documentation.create({
      data: {
        title: 'Billing and Subscription Management',
        content: 'Information about plans, pricing, upgrades, and payment methods.',
        category: 'Billing',
        aiEnabled: false,
      },
    }),
    prisma.documentation.create({
      data: {
        title: 'Advanced Workflow Automation',
        content: 'Guide to creating custom workflows, triggers, and automated processes.',
        category: 'Features',
        aiEnabled: true,
      },
    }),
  ]);

  console.log(`✅ Created ${docs.length} documentation articles`);

  // Create Settings
  const settings = await Promise.all([
    prisma.setting.create({
      data: {
        key: 'ai_enabled',
        value: { enabled: true, model: 'claude-sonnet-4-5', auto_resolve_threshold: 0.9 },
      },
    }),
    prisma.setting.create({
      data: {
        key: 'notification_preferences',
        value: { email: true, slack: true, high_priority_only: false },
      },
    }),
    prisma.setting.create({
      data: {
        key: 'business_hours',
        value: {
          timezone: 'America/New_York',
          hours: { monday: '9:00-17:00', tuesday: '9:00-17:00', wednesday: '9:00-17:00', thursday: '9:00-17:00', friday: '9:00-17:00' }
        },
      },
    }),
    prisma.setting.create({
      data: {
        key: 'sla_targets',
        value: { high_priority: 4, medium_priority: 24, low_priority: 72, unit: 'hours' },
      },
    }),
  ]);

  console.log(`✅ Created ${settings.length} settings`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\nSummary:');
  console.log(`- ${agents.length} Agents`);
  console.log(`- ${customers.length} Customers`);
  console.log(`- 10 Tickets`);
  console.log(`- ${docs.length} Documentation articles`);
  console.log(`- ${settings.length} Settings`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
