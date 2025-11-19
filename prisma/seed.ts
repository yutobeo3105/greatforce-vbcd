import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PERMISSIONS, ROLES } from "../src/lib/permissions/config";

const prisma = new PrismaClient();

const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
const ACTIVITY_TYPES = ["Call", "Email", "Meeting", "Task", "Demo"];

const INDUSTRIES = [
  "Technology", "SaaS", "E-commerce", "Finance", "Healthcare", "Manufacturing",
  "Consulting", "Real Estate", "Education", "Retail", "Marketing", "Media",
  "Telecommunications", "Transportation", "Energy", "Insurance", "Legal", "Hospitality"
];

const COMPANY_SIZES = ["1-10", "10-50", "50-100", "100-500", "500-1000", "1000+"];

const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
  "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
  "Benjamin", "Samantha", "Samuel", "Katherine", "Raymond", "Christine", "Gregory", "Debra"
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy"
];

const JOB_TITLES = [
  "CEO", "CTO", "CFO", "COO", "VP of Sales", "VP of Marketing", "VP of Engineering",
  "Director of Sales", "Director of Marketing", "Director of Operations", "Director of IT",
  "Sales Manager", "Marketing Manager", "Product Manager", "Project Manager", "Account Manager",
  "Business Development Manager", "Customer Success Manager", "Regional Manager", "Operations Manager",
  "IT Manager", "Engineering Manager", "HR Manager", "Finance Manager", "Purchasing Manager",
  "Senior Sales Executive", "Sales Executive", "Account Executive", "Business Analyst", "Data Analyst",
  "Software Engineer", "Solutions Architect", "Technical Lead", "Team Lead", "Department Head",
  "Founder", "Co-Founder", "Partner", "Principal", "Consultant", "Senior Consultant"
];

const COMPANY_PREFIXES = [
  "Tech", "Digital", "Smart", "Global", "Innovative", "Advanced", "Premier", "Elite",
  "Dynamic", "Strategic", "Bright", "Swift", "Cloud", "Data", "Next", "Future",
  "Modern", "Quantum", "Alpha", "Beta", "Omega", "Summit", "Apex", "Nexus",
  "Vertex", "Matrix", "Fusion", "Synergy", "Catalyst", "Momentum", "Velocity", "Impact"
];

const COMPANY_SUFFIXES = [
  "Solutions", "Systems", "Technologies", "Group", "Corporation", "Enterprises", "Inc",
  "Labs", "Partners", "Consulting", "Services", "Innovations", "Dynamics", "Networks",
  "Software", "Digital", "Media", "Analytics", "Intelligence", "Platform", "Hub"
];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCompanyName(): string {
  const type = Math.random();
  if (type < 0.4) {
    return `${randomElement(COMPANY_PREFIXES)} ${randomElement(COMPANY_SUFFIXES)}`;
  } else if (type < 0.7) {
    return `${randomElement(LAST_NAMES)} ${randomElement(COMPANY_SUFFIXES)}`;
  } else {
    return `${randomElement(COMPANY_PREFIXES)}${randomElement(COMPANY_SUFFIXES)}`;
  }
}

function generateEmail(firstName: string, lastName: string, company: string): string {
  const domain = company.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15) + ".com";
  const emailFormat = Math.random();
  
  if (emailFormat < 0.5) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  } else if (emailFormat < 0.8) {
    return `${firstName.toLowerCase().charAt(0)}${lastName.toLowerCase()}@${domain}`;
  } else {
    return `${firstName.toLowerCase()}${lastName.toLowerCase().charAt(0)}@${domain}`;
  }
}

function generatePhone(): string {
  return `+1-555-${String(randomInt(1000, 9999))}`;
}

function generateWebsite(companyName: string): string {
  const domain = companyName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  const tld = randomElement(["com", "io", "co", "net", "tech"]);
  return `https://${domain}.${tld}`;
}

async function main() {
  console.log("🌱 Starting comprehensive seed...");

  await prisma.comment.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.customField.deleteMany();
  await prisma.file.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();

  console.log("📦 Creating 60 companies...");
  const companies = await Promise.all(
    Array.from({ length: 60 }, () => {
      const name = generateCompanyName();
      return prisma.company.create({
        data: {
          name,
          website: generateWebsite(name),
          industry: randomElement(INDUSTRIES),
          size: randomElement(COMPANY_SIZES),
          description: `${randomElement([
            "Leading provider of", "Innovative solutions in", "Enterprise-grade",
            "Cutting-edge", "Award-winning", "Trusted partner for", "Global leader in"
          ])} ${randomElement([
            "business solutions", "digital transformation", "cloud services",
            "data analytics", "customer engagement", "enterprise software",
            "technology consulting", "managed services", "automation tools"
          ])}`,
        },
      });
    })
  );
  console.log(`✅ Created ${companies.length} companies`);

  console.log("👥 Creating 120 contacts...");
  const contacts = await Promise.all(
    Array.from({ length: 120 }, (_, index) => {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      const company = randomElement(companies);
      const tags = [];
      
      if (Math.random() > 0.7) tags.push("vip");
      if (Math.random() > 0.6) tags.push("decision-maker");
      if (Math.random() > 0.8) tags.push("champion");
      if (Math.random() > 0.7) tags.push(randomElement(["hot-lead", "warm-lead", "cold-lead"]));
      
      const baseEmail = generateEmail(firstName, lastName, company.name);
      const uniqueEmail = index > 0 ? baseEmail.replace('@', `${index}@`) : baseEmail;
      
      return prisma.contact.create({
        data: {
          firstName,
          lastName,
          email: uniqueEmail,
          phone: Math.random() > 0.2 ? generatePhone() : null,
          title: randomElement(JOB_TITLES),
          companyId: company.id,
          tags: tags.join(", "),
          notes: Math.random() > 0.5 ? randomElement([
            "Very responsive, prefers email communication",
            "Budget approved for next quarter",
            "Looking for enterprise-grade solution",
            "Referred by existing customer",
            "Attending industry conference next month",
            "Interested in API integrations",
            "Currently using competitor product",
            "Decision timeline: 30-60 days",
            "Requires custom features",
            "Price sensitive, looking for best value"
          ]) : null,
        },
      });
    })
  );
  console.log(`✅ Created ${contacts.length} contacts`);

  console.log("💰 Creating 90 deals with historical data...");
  const now = new Date();
  
  const dealTypes = [
    "Enterprise License", "Annual Subscription", "Professional Services",
    "Implementation Package", "Consulting Engagement", "Training Program",
    "Platform Migration", "Custom Development", "Support Contract",
    "Software Upgrade", "Integration Services", "Managed Services",
    "Cloud Deployment", "Security Assessment", "Data Migration",
    "API Integration", "Mobile Solution", "Analytics Package"
  ];
  
  const probabilities: Record<string, number> = {
    "Lead": randomInt(10, 30),
    "Qualified": randomInt(30, 50),
    "Proposal": randomInt(50, 75),
    "Negotiation": randomInt(75, 95),
    "Closed Won": 100,
    "Closed Lost": 0,
  };

  const dealsToCreate = [];
  
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 1);
    
    const dealsInMonth = randomInt(12, 18);
    const wonDealsInMonth = Math.floor(dealsInMonth * (0.3 + Math.random() * 0.2));
    
    for (let i = 0; i < dealsInMonth; i++) {
      const contact = randomElement(contacts);
      const isWon = i < wonDealsInMonth;
      const stage = isWon 
        ? "Closed Won" 
        : monthOffset === 0 
          ? randomElement(["Lead", "Qualified", "Proposal", "Negotiation"])
          : randomElement(STAGES);
      
      const dayInMonth = randomInt(1, 28);
      const createdDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayInMonth);
      const updatedDate = isWon 
        ? new Date(createdDate.getTime() + randomInt(7, 45) * 24 * 60 * 60 * 1000)
        : new Date(createdDate.getTime() + randomInt(1, 10) * 24 * 60 * 60 * 1000);

      dealsToCreate.push({
        title: `${randomElement(dealTypes)} - ${contact.companyId ? companies.find(c => c.id === contact.companyId)?.name.split(' ')[0] : contact.lastName}`,
        value: randomInt(10, 300) * 1000,
        stage,
        probability: probabilities[stage] ?? 50,
        contactId: contact.id,
        companyId: contact.companyId,
        expectedCloseDate: nextMonth,
        description: randomElement([
          "Full platform deployment with training and support",
          "Annual subscription with premium features included",
          "Custom implementation with dedicated support team",
          "Multi-year contract with volume discounts",
          "Pilot program with option to expand",
          "Enterprise package with SLA guarantees",
          "Starter package with growth options",
          "Complete digital transformation solution"
        ]),
        createdAt: createdDate,
        updatedAt: updatedDate,
      });
    }
  }
  
  const deals = await Promise.all(
    dealsToCreate.map(dealData => prisma.deal.create({ data: dealData }))
  );
  
  console.log(`✅ Created ${deals.length} deals across 6 months`);

  console.log("📅 Creating 180 activities...");
  const activityTitles = {
    Call: [
      "Discovery Call", "Follow-up Call", "Check-in Call", "Quarterly Review Call",
      "Contract Discussion", "Technical Q&A", "Pricing Discussion", "Status Update Call"
    ],
    Email: [
      "Send Proposal", "Send Contract", "Share Case Study", "Send Pricing Info",
      "Follow-up Email", "Send Resources", "Schedule Meeting", "Send Demo Recording"
    ],
    Meeting: [
      "Product Demo", "Executive Briefing", "Kickoff Meeting", "Strategy Session",
      "Requirements Gathering", "Final Presentation", "Quarterly Business Review", "Negotiation Meeting"
    ],
    Task: [
      "Prepare Proposal", "Update CRM Notes", "Research Competitor", "Prepare Demo",
      "Create Custom Quote", "Draft Contract", "Schedule Follow-up", "Send NDA"
    ],
    Demo: [
      "Product Walkthrough", "Technical Deep Dive", "Feature Demonstration", "Live Demo Session",
      "Pilot Demonstration", "Custom Integration Demo", "Mobile App Demo", "API Demo"
    ],
  };

  const activities = await Promise.all(
    Array.from({ length: 180 }, () => {
      const type = randomElement(ACTIVITY_TYPES);
      const contact = randomElement(contacts);
      const deal = Math.random() > 0.3 ? randomElement(deals) : null;
      
      const daysOffset = Math.random() > 0.3 
        ? randomInt(-5, 30)
        : randomInt(-30, -1);
      
      const isCompleted = daysOffset < 0 && Math.random() > 0.4;

      return prisma.activity.create({
        data: {
          type,
          title: randomElement(activityTitles[type as keyof typeof activityTitles]),
          description: randomElement([
            "High priority - needs immediate attention",
            "Scheduled and confirmed with attendees",
            "Awaiting customer response",
            "Follow-up to previous conversation",
            "Critical for deal progression",
            "Routine check-in activity",
            "Preparation for upcoming milestone",
            "Action item from last meeting"
          ]),
          dueDate: new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000),
          completed: isCompleted,
          contactId: contact.id,
          dealId: deal?.id,
        },
      });
    })
  );
  console.log(`✅ Created ${activities.length} activities`);

  console.log("👤 Creating admin user and 24 other users...");
  const defaultPassword = await bcrypt.hash("password123", 10);
  
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@greatforce.com",
      password: defaultPassword,
      role: "admin",
      isActive: true,
    },
  });
  console.log(`✅ Created admin user: admin@greatforce.com / password123`);
  
  const userRoles = ["admin", "sales", "marketing", "support", "manager"];
  
  const users = await Promise.all(
    Array.from({ length: 24 }, (_, i) => {
      const firstName = randomElement(FIRST_NAMES);
      const lastName = randomElement(LAST_NAMES);
      return prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@greatforce.com`,
          password: defaultPassword,
          role: randomElement(userRoles),
          isActive: i < 20,
        },
      });
    })
  );
  console.log(`✅ Created ${users.length} additional users (all with password: password123)`);

  console.log("🔐 Creating permissions...");
  let permissionCount = 0;
  for (const [role, permissions] of Object.entries(DEFAULT_PERMISSIONS)) {
    for (const permission of permissions) {
      await prisma.permission.create({
        data: {
          role,
          resource: permission.resource,
          action: permission.action,
          enabled: permission.enabled,
        },
      });
      permissionCount++;
    }
  }
  console.log(`✅ Created ${permissionCount} permissions for all roles`);

  console.log("📦 Creating 50 products...");
  const productCategories = [
    { name: "Software Licenses", items: ["Enterprise License", "Professional License", "Team License", "Starter License", "Developer License"] },
    { name: "Cloud Services", items: ["Cloud Storage", "Cloud Computing", "Cloud Database", "Cloud Security", "Cloud Backup"] },
    { name: "Support Plans", items: ["24/7 Premium Support", "Business Hours Support", "Email Support", "Enterprise Support", "Developer Support"] },
    { name: "Professional Services", items: ["Implementation Service", "Consulting Hours", "Training Session", "Custom Development", "Integration Service"] },
    { name: "Add-ons", items: ["API Access", "Advanced Analytics", "Custom Reporting", "White Label", "Mobile App Access"] },
    { name: "Hardware", items: ["Server", "Workstation", "Router", "Switch", "Firewall"] },
    { name: "Subscriptions", items: ["Monthly Plan", "Annual Plan", "Enterprise Plan", "Premium Plan", "Basic Plan"] },
    { name: "Training", items: ["Onboarding Training", "Advanced Training", "Admin Training", "Developer Training", "User Training"] },
  ];

  const products: any[] = [];
  for (const category of productCategories) {
    for (const item of category.items) {
      const basePrice = randomInt(500, 50000);
      const product = await prisma.product.create({
        data: {
          name: item,
          description: `${randomElement([
            "Industry-leading", "Enterprise-grade", "Professional", "Premium", "Advanced",
            "Comprehensive", "Robust", "Scalable", "Flexible", "Customizable"
          ])} ${item.toLowerCase()} with ${randomElement([
            "24/7 support", "dedicated success manager", "unlimited usage", "priority support",
            "advanced features", "custom integrations", "white-glove service", "SLA guarantees"
          ])}`,
          sku: `${category.name.substring(0, 3).toUpperCase()}-${String(products.length + 1).padStart(4, '0')}`,
          price: basePrice,
          cost: Math.round(basePrice * (0.3 + Math.random() * 0.3)),
          category: category.name,
          isActive: Math.random() > 0.1,
        },
      });
      products.push(product);
    }
  }
  console.log(`✅ Created ${products.length} products`);

  console.log("📄 Creating 40 quotes...");
  const quoteStatuses = ["Draft", "Sent", "Viewed", "Accepted", "Declined", "Expired"];
  
  const quotes = await Promise.all(
    Array.from({ length: 40 }, (_, i) => {
      const contact = randomElement(contacts);
      const deal = randomElement(deals);
      const daysOffset = randomInt(-60, 30);
      const validDays = randomInt(7, 30);
      const createdDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      const validUntil = new Date(createdDate.getTime() + validDays * 24 * 60 * 60 * 1000);
      
      let status = randomElement(quoteStatuses);
      if (validUntil < now && status !== "Accepted") {
        status = "Expired";
      }

      return prisma.quote.create({
        data: {
          quoteNumber: `Q-${String(i + 1).padStart(5, '0')}`,
          title: `${randomElement(["Annual", "Quarterly", "Enterprise", "Professional", "Custom"])} ${randomElement(["Package", "Solution", "Bundle", "Plan"])}`,
          status,
          contactId: contact.id,
          companyId: contact.companyId,
          dealId: deal.id,
          validUntil,
          notes: Math.random() > 0.5 ? randomElement([
            "Volume discount applied",
            "Special promotional pricing",
            "Includes free training session",
            "Annual billing - 20% discount",
            "Custom pricing for enterprise",
            "Includes premium support",
            "Multi-year commitment discount",
            "Early bird pricing"
          ]) : null,
          tax: randomInt(8, 12),
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });
    })
  );
  console.log(`✅ Created ${quotes.length} quotes`);

  console.log("📋 Creating quote line items...");
  let totalQuoteItems = 0;
  for (const quote of quotes) {
    const itemCount = randomInt(1, 5);
    const selectedProducts = Array.from(
      { length: itemCount }, 
      () => randomElement(products)
    );
    
    for (let i = 0; i < itemCount; i++) {
      const product = selectedProducts[i]!;
      const quantity = randomInt(1, Math.random() > 0.7 ? 50 : 10);
      const discount = Math.random() > 0.7 ? randomInt(5, 20) : 0;
      const total = quantity * product.price * (1 - discount / 100);
      
      await prisma.quoteItem.create({
        data: {
          quoteId: quote.id,
          productId: product.id,
          description: product.description,
          quantity,
          unitPrice: product.price,
          total,
          discount,
        },
      });
      totalQuoteItems++;
    }
  }
  console.log(`✅ Created ${totalQuoteItems} quote line items`);

  console.log("📧 Creating email templates...");
  const emailTemplates = [
    {
      name: "Welcome Email",
      subject: "Welcome to {{company_name}}!",
      body: `Hi {{contact_name}},

Welcome aboard! We're thrilled to have you as part of the {{company_name}} family.

Here's what you can expect next:
• Your account manager {{user_name}} will reach out within 24 hours
• Access to our knowledge base and training materials
• Invitation to our next onboarding webinar

If you have any questions, don't hesitate to reach out.

Best regards,
{{user_name}}
{{user_title}}`,
      category: "Onboarding",
      isActive: true,
    },
    {
      name: "Follow-up After Demo",
      subject: "Great connecting with you, {{contact_name}}",
      body: `Hi {{contact_name}},

Thank you for taking the time to meet with me yesterday. I enjoyed learning more about {{company_name}}'s needs and showing you how our solution can help.

As discussed, here are the next steps:
• I'll send over the proposal by {{date}}
• Schedule a technical deep-dive with your team
• Provide references from similar companies in {{industry}}

Demo recording: {{demo_link}}
Resource materials: {{resources_link}}

What works best for your schedule next week?

Best regards,
{{user_name}}`,
      category: "Sales",
      isActive: true,
    },
    {
      name: "Proposal Sent",
      subject: "Your customized proposal from {{company_name}}",
      body: `Hi {{contact_name}},

I'm pleased to share your customized proposal for {{company_name}}.

Proposal highlights:
• Total investment: {{deal_value}}
• Implementation timeline: {{timeline}}
• ROI projection: {{roi}}
• Included: {{included_services}}

View proposal: {{proposal_link}}

I'm confident this solution will deliver significant value for {{company_name}}. Let's schedule a call to walk through any questions.

Available times:
{{available_times}}

Looking forward to our partnership!

Best regards,
{{user_name}}`,
      category: "Sales",
      isActive: true,
    },
    {
      name: "Contract Renewal Reminder",
      subject: "Your {{company_name}} contract renewal",
      body: `Hi {{contact_name}},

I hope this email finds you well. Your contract with us is coming up for renewal on {{renewal_date}}.

Current plan details:
• Plan: {{plan_name}}
• Annual value: {{contract_value}}
• Contract end date: {{end_date}}

We'd love to continue supporting {{company_name}}'s success. I've prepared some options:
• Renewal at current terms
• Upgrade options with new features
• Multi-year commitment discount

Can we schedule a quick call next week to discuss?

Best regards,
{{user_name}}`,
      category: "Account Management",
      isActive: true,
    },
    {
      name: "Payment Reminder",
      subject: "Payment reminder for Invoice {{invoice_number}}",
      body: `Hi {{contact_name}},

This is a friendly reminder that Invoice {{invoice_number}} for {{amount}} is due on {{due_date}}.

Invoice details:
• Invoice number: {{invoice_number}}
• Amount: {{amount}}
• Due date: {{due_date}}
• Payment link: {{payment_link}}

If you've already sent payment, please disregard this message. If you have any questions about this invoice, please let me know.

Thank you for your business!

Best regards,
{{user_name}}`,
      category: "Billing",
      isActive: true,
    },
    {
      name: "Meeting Request",
      subject: "Let's schedule time to discuss {{topic}}",
      body: `Hi {{contact_name}},

I'd like to schedule some time to discuss {{topic}} with you and your team at {{company_name}}.

Proposed agenda:
• {{agenda_item_1}}
• {{agenda_item_2}}
• {{agenda_item_3}}
• Next steps and timeline

Meeting duration: {{duration}}

Here are a few times that work for me:
{{available_times}}

Please let me know what works best for you, or feel free to suggest an alternative time.

Calendar link: {{calendar_link}}

Best regards,
{{user_name}}`,
      category: "Sales",
      isActive: true,
    },
    {
      name: "Thank You - Purchase",
      subject: "Thank you for your purchase, {{contact_name}}!",
      body: `Hi {{contact_name}},

Thank you for choosing {{company_name}}! We're excited to partner with you.

Your order details:
• Order number: {{order_number}}
• Purchase date: {{purchase_date}}
• Total amount: {{total_amount}}

What happens next:
• Implementation kickoff: {{kickoff_date}}
• Your dedicated account manager: {{account_manager}}
• Support team contact: {{support_email}}

Access your customer portal: {{portal_link}}

We're committed to your success. Welcome to the family!

Best regards,
{{user_name}}`,
      category: "Onboarding",
      isActive: true,
    },
    {
      name: "Customer Feedback Request",
      subject: "How are we doing, {{contact_name}}?",
      body: `Hi {{contact_name}},

You've been working with {{company_name}} for {{duration}} now, and I wanted to check in on your experience.

I'd love to hear your feedback on:
• How well we've met your expectations
• Areas where we can improve
• Features you'd like to see added
• Overall satisfaction with our service

Would you have 15 minutes for a quick call next week? Or if you prefer, you can share your thoughts via our survey:

{{survey_link}}

Your feedback helps us serve you and other customers better.

Thanks for being a valued partner!

Best regards,
{{user_name}}`,
      category: "Account Management",
      isActive: true,
    },
    {
      name: "Check-in - Inactive Customer",
      subject: "We miss you at {{company_name}}",
      body: `Hi {{contact_name}},

I noticed it's been a while since we last connected, and I wanted to reach out.

We've made some exciting updates since we last spoke:
• {{new_feature_1}}
• {{new_feature_2}}
• {{new_feature_3}}

I'd love to learn more about:
• What's changed for {{company_name}}
• Whether our solution still fits your needs
• How we can better support your goals

No pressure - just want to make sure we're here if you need us. Would you be open to a quick 15-minute call?

Best regards,
{{user_name}}`,
      category: "Re-engagement",
      isActive: true,
    },
    {
      name: "Case Study Request",
      subject: "Would {{company_name}} like to be featured?",
      body: `Hi {{contact_name}},

We've been impressed with the results {{company_name}} has achieved using our solution, and I think your story would inspire other companies in {{industry}}.

Would you be interested in participating in a case study?

What's involved:
• 30-minute interview about your experience
• Review and approval of all content before publication
• Co-marketing opportunities
• Showcase your company's innovation

Benefits:
• Featured on our website and marketing materials
• Increased brand visibility
• Position {{company_name}} as an industry leader
• Complimentary {{incentive}}

Let me know if you're interested!

Best regards,
{{user_name}}`,
      category: "Marketing",
      isActive: true,
    },
    {
      name: "Quarterly Business Review Invite",
      subject: "Let's schedule your Q{{quarter}} business review",
      body: `Hi {{contact_name}},

As we wrap up Q{{quarter}}, I'd like to schedule your quarterly business review to discuss {{company_name}}'s progress and results.

We'll cover:
• Key metrics and performance data
• ROI analysis
• Usage trends and adoption
• Success stories and wins
• Optimization opportunities
• Roadmap and upcoming features
• Goals for next quarter

Suggested duration: 60 minutes
Attendees: {{attendees}}

Available dates:
{{available_dates}}

I'll prepare a comprehensive report for our discussion. Looking forward to celebrating your successes!

Best regards,
{{user_name}}`,
      category: "Account Management",
      isActive: true,
    },
    {
      name: "Upsell - Premium Features",
      subject: "Unlock more value with Premium features",
      body: `Hi {{contact_name}},

I've been reviewing your usage of our platform, and I noticed {{company_name}} could benefit from some of our Premium features.

Based on your current usage:
• You're using {{usage_percent}}% of your current plan limits
• Your team has grown by {{growth_percent}}% since you started
• {{feature_name}} could save you {{time_savings}} per week

Premium plan benefits:
• {{benefit_1}}
• {{benefit_2}}
• {{benefit_3}}
• {{benefit_4}}

Upgrade investment: {{upgrade_cost}}/month
Estimated ROI: {{roi_estimate}}

I'd love to show you a quick demo. Are you available for a 20-minute call this week?

Best regards,
{{user_name}}`,
      category: "Sales",
      isActive: true,
    },
    {
      name: "Training Session Invitation",
      subject: "Invitation: {{training_topic}} training session",
      body: `Hi {{contact_name}},

You're invited to our upcoming training session on {{training_topic}}!

Session details:
• Date: {{training_date}}
• Time: {{training_time}}
• Duration: {{duration}}
• Format: {{format}}
• Instructor: {{instructor}}

What you'll learn:
• {{learning_objective_1}}
• {{learning_objective_2}}
• {{learning_objective_3}}
• Q&A session

Register here: {{registration_link}}

Space is limited to ensure personalized attention. Can't make this session? We offer recordings and alternate dates.

See you there!

Best regards,
{{user_name}}`,
      category: "Training",
      isActive: true,
    },
    {
      name: "Cold Outreach - Introduction",
      subject: "{{company_name}} + {{prospect_company}}",
      body: `Hi {{contact_name}},

I came across {{prospect_company}} while researching companies in {{industry}}, and I was impressed by {{specific_achievement}}.

I'm reaching out because we've helped similar companies like {{customer_1}} and {{customer_2}} achieve:
• {{result_1}}
• {{result_2}}
• {{result_3}}

I don't want to take up too much of your time, but I'd love to learn more about {{prospect_company}}'s priorities and see if there's a fit.

Would you be open to a quick 15-minute conversation? No pressure - just exploring if we can help.

Best regards,
{{user_name}}
{{user_title}}
{{company_name}}`,
      category: "Prospecting",
      isActive: true,
    },
    {
      name: "Event Invitation",
      subject: "You're invited: {{event_name}}",
      body: `Hi {{contact_name}},

I'd like to personally invite you to {{event_name}}, happening on {{event_date}}.

Event highlights:
• Keynote: {{keynote_speaker}}
• Topic: {{main_topic}}
• Networking with {{industry}} leaders
• Exclusive product announcements
• Location: {{location}}

As a valued customer, your ticket is complimentary (worth {{ticket_value}}).

RSVP here: {{rsvp_link}}

Can't attend in person? We're also offering virtual attendance.

Hope to see you there!

Best regards,
{{user_name}}`,
      category: "Events",
      isActive: true,
    },
  ];

  const createdTemplates = await Promise.all(
    emailTemplates.map(template => 
      prisma.emailTemplate.create({ data: template })
    )
  );
  console.log(`✅ Created ${createdTemplates.length} email templates`);

  console.log("📝 Creating 150 notes...");
  const noteTypes = ["General", "Meeting", "Call", "Task", "Follow-up"];
  const entities = [...contacts.map(c => ({ type: "CONTACT" as const, id: c.id })), 
                    ...companies.map(c => ({ type: "COMPANY" as const, id: c.id })),
                    ...deals.map(d => ({ type: "DEAL" as const, id: d.id }))];

  const notes = await Promise.all(
    Array.from({ length: 150 }, () => {
      const entity = randomElement(entities);
      const author = randomElement(users);
      const daysAgo = randomInt(0, 60);
      
      return prisma.note.create({
        data: {
          content: randomElement([
            "Had a great conversation about their Q4 goals. They're particularly interested in scaling their operations.",
            "Follow-up: Send case study from similar industry. They mentioned being budget-conscious.",
            "Decision maker is on vacation until next week. Will reconnect on Monday.",
            "Technical team raised concerns about API integration. Scheduling deep-dive with engineering.",
            "Very positive meeting. They want to move forward with pilot program starting next month.",
            "Competitor pricing came up. Our value proposition resonated well when we discussed ROI.",
            "They need approval from CFO. Sending executive summary and cost-benefit analysis.",
            "Excellent demo session. They loved the reporting features. Asking for trial extension.",
            "Contract review in progress with legal team. Expecting feedback by end of week.",
            "Customer is expanding to 3 new locations. Great upsell opportunity for enterprise plan.",
            "Referral from existing customer. Fast-tracked through qualification. High intent.",
            "Budget allocated for next fiscal year. Timeline moved up 3 months.",
            "Champions at the company but need to convince operations team. Planning workshop.",
            "They're currently locked into competitor contract until end of quarter.",
            "Strong interest but want to see product roadmap before committing.",
            "Asked about implementation timeline. They want to launch before holiday season.",
            "Risk: They're evaluating 2 other vendors. Need to differentiate on customer success.",
            "Positive response to proposal. Negotiating on payment terms and SLA.",
            "Requested references from customers in similar industry and company size.",
            "Great relationship with champion. They're advocating for us internally."
          ]),
          entityType: entity.type,
          entityId: entity.id,
          createdBy: author.id,
          createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    })
  );
  console.log(`✅ Created ${notes.length} notes`);

  console.log("💬 Creating 100 comments...");
  const commentEntities = [...deals.map(d => ({ type: "DEAL" as const, id: d.id })),
                            ...quotes.map(q => ({ type: "QUOTE" as const, id: q.id }))];

  const comments = await Promise.all(
    Array.from({ length: 100 }, () => {
      const entity = randomElement(commentEntities);
      const author = randomElement(users);
      const daysAgo = randomInt(0, 30);
      const hasMention = Math.random() > 0.7;
      const mentionedUser = hasMention ? randomElement(users) : null;
      
      return prisma.comment.create({
        data: {
          content: hasMention 
            ? `@${mentionedUser!.name} ${randomElement([
                "can you follow up on this?",
                "what's your take on this approach?",
                "please review and provide feedback",
                "need your input on pricing",
                "can you schedule a call?",
                "please update the proposal"
              ])}`
            : randomElement([
                "Moving this to next quarter priorities",
                "Updated the timeline based on customer feedback",
                "Legal team approved the contract terms",
                "Customer requested additional features - creating add-on quote",
                "Competitor tried to undercut us, but we won on value",
                "Implementation team is ready to kick off",
                "Customer asked for payment plan options",
                "This is ready for final review",
                "Need executive approval before proceeding",
                "Customer is very responsive - good sign"
              ]),
          entityType: entity.type,
          entityId: entity.id,
          authorId: author.id,
          mentions: hasMention ? mentionedUser!.id : undefined,
          createdAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });
    })
  );
  console.log(`✅ Created ${comments.length} comments`);


  const stats = {
    companies: companies.length,
    contacts: contacts.length,
    deals: deals.length,
    activities: activities.length,
    users: users.length + 1,
    permissions: permissionCount,
    products: products.length,
    quotes: quotes.length,
    quoteItems: totalQuoteItems,
    emailTemplates: createdTemplates.length,
    notes: notes.length,
    comments: comments.length,
    
    
    totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
    avgDealSize: Math.round(deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length),
    wonDeals: deals.filter(d => d.stage === "Closed Won").length,
    lostDeals: deals.filter(d => d.stage === "Closed Lost").length,
    totalQuoteValue: quotes.reduce((sum, quote) => {
      return sum;
    }, 0),
  };

  console.log("\n✨ Seed completed successfully!");
  console.log("📊 Comprehensive Statistics:");
  console.log(`   Companies: ${stats.companies}`);
  console.log(`   Contacts: ${stats.contacts}`);
  console.log(`   Deals: ${stats.deals}`);
  console.log(`   Activities: ${stats.activities}`);
  console.log(`   Users: ${stats.users}`);
  console.log(`   Permissions: ${stats.permissions} (${Object.keys(ROLES).length} roles)`);
  console.log(`   Products: ${stats.products} across 8 categories`);
  console.log(`   Quotes: ${stats.quotes} with ${stats.quoteItems} line items`);
  console.log(`   Email Templates: ${stats.emailTemplates}`);
  console.log(`   Notes: ${stats.notes}`);
  console.log(`   Comments: ${stats.comments}`);
  console.log(`   `);
  console.log(`   `);
  console.log(`   Total Pipeline Value: $${stats.totalValue.toLocaleString()}`);
  console.log(`   Average Deal Size: $${stats.avgDealSize.toLocaleString()}`);
  console.log(`   Won Deals: ${stats.wonDeals}`);
  console.log(`   Lost Deals: ${stats.lostDeals}`);
  console.log(`   Active Pipeline: ${stats.deals - stats.wonDeals - stats.lostDeals} deals\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
