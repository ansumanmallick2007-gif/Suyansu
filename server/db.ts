import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

export type UserRole = 'admin' | 'manager' | 'employee';
export type DepartmentType = 'finance' | 'hr' | 'engineering' | 'operations' | 'product';
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  department: DepartmentType;
  created_at: string;
  avatar_url?: string;
}

export interface Document {
  id: string;
  title: string;
  department: DepartmentType;
  file_type: string;
  raw_content: string;
  ai_summary: string;
  extracted_entities: {
    sentiment?: string;
    keyEntities?: string[];
    actionItems?: string[];
    summary?: string;
    [key: string]: any;
  };
  uploaded_by: string | null;
  uploaded_by_name?: string;
  created_at: string;
}

export interface WorkflowSubtask {
  id: string;
  title: string;
  estimatedHours: number;
  suggestedDepartment: string;
  completed: boolean;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  department: DepartmentType;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to: string | null;
  assigned_to_name?: string;
  ai_suggestions: {
    recommendedSubtasks?: WorkflowSubtask[];
    riskAssessment?: string;
    [key: string]: any;
  } | null;
  due_date: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name?: string;
  action: string;
  details: any;
  created_at: string;
}

// In-Memory & File Store fallback for sandbox resilience
interface DatabaseState {
  users: User[];
  documents: Document[];
  workflows: Workflow[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'synapse_db.json');

// Initialize password hashes synchronously for default seed users
const DEFAULT_PASSWORD = 'Enterprise2026!';
const DEFAULT_HASH = bcrypt.hashSync(DEFAULT_PASSWORD, 12);

const INITIAL_USERS: User[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    name: 'Sarah Lin',
    email: 'admin@synapse.ai',
    password_hash: DEFAULT_HASH,
    role: 'admin',
    department: 'operations',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    avatar_url: '/src/assets/images/avatar_exec_sarah_1793427664570.jpg'
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    name: 'Marcus Vance',
    email: 'manager@synapse.ai',
    password_hash: DEFAULT_HASH,
    role: 'manager',
    department: 'engineering',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    avatar_url: '/src/assets/images/avatar_exec_marcus_1793427664159.jpg'
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    name: 'Elena Rostova',
    email: 'employee@synapse.ai',
    password_hash: DEFAULT_HASH,
    role: 'employee',
    department: 'product',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  }
];

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc-001',
    title: 'FY2026 Q3 Capital Expenditure & Cloud Margin Review',
    department: 'finance',
    file_type: 'Financial Report',
    raw_content: 'Q3 cloud infrastructure expenditures grew 14.2% quarter-over-quarter to $1.42M, primarily driven by GPU cluster provisioning for enterprise AI models. Operational margins contracted slightly to 71.4%. Recommendation: Implement reserved instance scheduling and cold-storage offloading by November 15, 2026 to reclaim approximately $180,000 monthly.',
    ai_summary: 'Cloud expenditure climbed 14.2% to $1.42M due to GPU provisioning. Recommends RI reservations and storage tiering before mid-November to save $180K/mo.',
    extracted_entities: {
      sentiment: 'Neutral',
      keyEntities: ['$1.42M Q3 spend', '71.4% gross margin', '$180,000 monthly potential savings', 'Deadline: November 15, 2026'],
      actionItems: [
        'Audit idle GPU instances across staging clusters',
        'Finalize 1-year reserved cloud capacity commitment',
        'Present revised unit economics at next Board Operations committee'
      ]
    },
    uploaded_by: '11111111-1111-4111-a111-111111111111',
    uploaded_by_name: 'Sarah Lin',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'doc-002',
    title: 'Global Remote Work & Cross-Border Compliance Policy 2026',
    department: 'hr',
    file_type: 'HR Policy',
    raw_content: 'This policy governs cross-border employment arrangements across APAC and EMEA. Mandatory 180-day physical presence thresholds trigger domestic corporate tax nexus obligations. All international business travel over 14 consecutive calendar days requires prior written sign-off from People Operations and Finance.',
    ai_summary: 'Establishes international compliance boundaries for overseas remote employees, codifying 180-day tax nexus triggers and mandatory 14-day travel pre-approvals.',
    extracted_entities: {
      sentiment: 'Positive',
      keyEntities: ['180-day tax nexus ceiling', '14-day travel notification rule', 'APAC and EMEA jurisdictions', 'People Ops and Tax Compliance'],
      actionItems: [
        'Integrate automated immigration duration tracking into HRIS',
        'Distribute updated tax residency compliance guidelines to department leads',
        'Conduct bi-annual cross-border presence audit'
      ]
    },
    uploaded_by: '11111111-1111-4111-a111-111111111111',
    uploaded_by_name: 'Sarah Lin',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'doc-003',
    title: 'Enterprise Architecture Spec: Distributed RAG & Semantic Cache',
    department: 'engineering',
    file_type: 'Technical Spec',
    raw_content: 'Design specification for zero-leakage enterprise retrieval augmented generation. Embeddings generated via Gemini multimodal pipeline. Vector similarity query latency SLA set at under 35ms p99. Strict tenant isolation enforced at row-level security and vector collection partitions.',
    ai_summary: 'Technical architecture specification outlining p99 <35ms query latency SLA and strict multi-tenant isolation for Gemini embedding pipelines.',
    extracted_entities: {
      sentiment: 'Positive',
      keyEntities: ['Gemini Multimodal Embeddings', '35ms p99 latency SLA', 'Row-Level Security (RLS)', 'Tenant vector isolation'],
      actionItems: [
        'Bench-test vector indexing throughput under 10k concurrent RPS',
        'Verify zero cross-tenant query leakage in security penetration testing',
        'Deploy hot cache failover across secondary availability zone'
      ]
    },
    uploaded_by: '22222222-2222-4222-a222-222222222222',
    uploaded_by_name: 'Marcus Vance',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-101',
    title: 'SOC2 Type II Annual Security Certification Audit',
    description: 'Coordinate cross-functional evidence collection across Engineering, IT, and HR for annual SOC2 re-certification.',
    department: 'operations',
    status: 'in_progress',
    priority: 'critical',
    assigned_to: '11111111-1111-4111-a111-111111111111',
    assigned_to_name: 'Sarah Lin',
    ai_suggestions: {
      recommendedSubtasks: [
        { id: 'st-1', title: 'Export IAM access logs and inactive account audit', estimatedHours: 6, suggestedDepartment: 'Engineering', completed: true },
        { id: 'st-2', title: 'Compile mandatory employee security training completion certs', estimatedHours: 4, suggestedDepartment: 'HR', completed: true },
        { id: 'st-3', title: 'Execute third-party external penetration vulnerability scan', estimatedHours: 12, suggestedDepartment: 'Operations', completed: false }
      ],
      riskAssessment: 'Tight auditor timeline: Pending evidence collection from 3 vendor contracts could delay final report issuance by 10 business days.'
    },
    due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'wf-102',
    title: 'Zero-Downtime Database Migration to Partitioned Clusters',
    description: 'Implement blue-green migration pipeline to partition operational audit logs and document vector indices.',
    department: 'engineering',
    status: 'in_progress',
    priority: 'high',
    assigned_to: '22222222-2222-4222-a222-222222222222',
    assigned_to_name: 'Marcus Vance',
    ai_suggestions: {
      recommendedSubtasks: [
        { id: 'st-4', title: 'Provision target replica cluster with logical replication slots', estimatedHours: 8, suggestedDepartment: 'Engineering', completed: true },
        { id: 'st-5', title: 'Benchmark write lock contention on audit_logs table', estimatedHours: 5, suggestedDepartment: 'Engineering', completed: false },
        { id: 'st-6', title: 'Simulate disaster recovery failover under synthetic traffic', estimatedHours: 10, suggestedDepartment: 'Engineering', completed: false }
      ],
      riskAssessment: 'High I/O spikes during initial data backfill could saturate shared disk throughput if scheduled during peak European business hours.'
    },
    due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'wf-103',
    title: 'Unified Enterprise Copilot Onboarding Journey for Q4 Hires',
    description: 'Design self-service interactive tutorial demonstrating document intelligence and workflow delegation to 45 new team members.',
    department: 'product',
    status: 'review',
    priority: 'medium',
    assigned_to: '33333333-3333-4333-a333-333333333333',
    assigned_to_name: 'Elena Rostova',
    ai_suggestions: {
      recommendedSubtasks: [
        { id: 'st-7', title: 'Draft scenario-based prompt cheat-sheet for finance analysts', estimatedHours: 4, suggestedDepartment: 'Product', completed: true },
        { id: 'st-8', title: 'Embed guided tour tooltips into main dashboard layout', estimatedHours: 6, suggestedDepartment: 'Engineering', completed: true },
        { id: 'st-9', title: 'Gather qualitative feedback from pilot department cohort', estimatedHours: 5, suggestedDepartment: 'HR', completed: false }
      ],
      riskAssessment: 'Low risk. Minor dependencies on design approval for onboarding hero cards.'
    },
    due_date: new Date(Date.now() + 4 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'wf-104',
    title: 'Enterprise Vendor Contract Rationalization',
    description: 'Review duplicated SaaS licensing across Engineering and Operations to consolidate single-sign-on subscriptions.',
    department: 'finance',
    status: 'backlog',
    priority: 'medium',
    assigned_to: null,
    ai_suggestions: {
      recommendedSubtasks: [
        { id: 'st-10', title: 'Compile aggregated billing statements across departmental corporate cards', estimatedHours: 7, suggestedDepartment: 'Finance', completed: false },
        { id: 'st-11', title: 'Renegotiate enterprise tier with cloud monitoring providers', estimatedHours: 9, suggestedDepartment: 'Operations', completed: false }
      ],
      riskAssessment: 'Potential pushback on tool replacement from specialized engineering squads.'
    },
    due_date: new Date(Date.now() + 21 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'wf-105',
    title: 'Cross-Department AI Ethics & Governance Framework',
    description: 'Publish verified guidelines for training data retention, model hallucination prevention, and executive review standards.',
    department: 'operations',
    status: 'completed',
    priority: 'high',
    assigned_to: '11111111-1111-4111-a111-111111111111',
    assigned_to_name: 'Sarah Lin',
    ai_suggestions: {
      recommendedSubtasks: [
        { id: 'st-12', title: 'Align framework with NIST AI RMF and EU AI Act definitions', estimatedHours: 12, suggestedDepartment: 'Operations', completed: true },
        { id: 'st-13', title: 'Review audit log export capabilities for compliance regulators', estimatedHours: 6, suggestedDepartment: 'Engineering', completed: true }
      ],
      riskAssessment: 'Completed successfully with executive committee ratification.'
    },
    due_date: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  }
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    user_id: '11111111-1111-4111-a111-111111111111',
    user_name: 'Sarah Lin',
    action: 'INITIATIVE_CREATED',
    details: { initiative: 'SOC2 Type II Annual Security Certification Audit', department: 'operations', priority: 'critical' },
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'aud-002',
    user_id: '22222222-2222-4222-a222-222222222222',
    user_name: 'Marcus Vance',
    action: 'DOCUMENT_INGESTED',
    details: { title: 'Enterprise Architecture Spec: Distributed RAG', file_type: 'Technical Spec', department: 'engineering' },
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'aud-003',
    user_id: '11111111-1111-4111-a111-111111111111',
    user_name: 'Sarah Lin',
    action: 'STATUS_UPDATED',
    details: { workflowId: 'wf-105', newStatus: 'completed' },
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'aud-004',
    user_id: '33333333-3333-4333-a333-333333333333',
    user_name: 'Elena Rostova',
    action: 'COPILOT_QUERY',
    details: { query: 'Summarize Q3 Cloud Margin and GPU expenditure', model: 'gemini-2.5-flash' },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

class DatabaseManager {
  private pgPool: pg.Pool | null = null;
  private isPostgresConnected = false;
  private state: DatabaseState = {
    users: [...INITIAL_USERS],
    documents: [...INITIAL_DOCUMENTS],
    workflows: [...INITIAL_WORKFLOWS],
    audit_logs: [...INITIAL_AUDIT_LOGS]
  };

  constructor() {
    this.loadStateFromFile();
    this.initPostgres();
  }

  private loadStateFromFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.documents && parsed.workflows) {
          this.state = parsed;
          return;
        }
      }
      this.saveStateToFile();
    } catch (err) {
      console.warn('[DB] Failed reading local db file, using in-memory defaults:', err);
    }
  }

  private saveStateToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[DB] Could not persist state to file:', err);
    }
  }

  private async initPostgres() {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) {
      console.log('[DB] No DATABASE_URL specified. Running on high-performance resilient storage.');
      return;
    }

    try {
      this.pgPool = new Pool({
        connectionString: connStr,
        connectionTimeoutMillis: 3000,
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
      });

      const client = await this.pgPool.connect();
      console.log('[DB] Connected to PostgreSQL instance successfully.');
      this.isPostgresConnected = true;

      // Initialize schema
      await client.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('admin', 'manager', 'employee');
        EXCEPTION WHEN duplicate_object THEN null; END $$;

        DO $$ BEGIN
          CREATE TYPE department_type AS ENUM ('finance', 'hr', 'engineering', 'operations', 'product');
        EXCEPTION WHEN duplicate_object THEN null; END $$;

        DO $$ BEGIN
          CREATE TYPE task_priority AS ENUM ('critical', 'high', 'medium', 'low');
        EXCEPTION WHEN duplicate_object THEN null; END $$;

        DO $$ BEGIN
          CREATE TYPE task_status AS ENUM ('backlog', 'in_progress', 'review', 'completed');
        EXCEPTION WHEN duplicate_object THEN null; END $$;

        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role user_role DEFAULT 'employee',
          department department_type NOT NULL,
          avatar_url VARCHAR(500),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          department department_type NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          raw_content TEXT NOT NULL,
          ai_summary TEXT,
          extracted_entities JSONB,
          uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workflows (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          department department_type NOT NULL,
          status task_status DEFAULT 'backlog',
          priority task_priority DEFAULT 'medium',
          assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
          ai_suggestions JSONB,
          due_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          action VARCHAR(255) NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed if empty
      const userCountRes = await client.query('SELECT count(*) FROM users');
      if (parseInt(userCountRes.rows[0].count, 10) === 0) {
        console.log('[DB] Seeding PostgreSQL with initial Synapse enterprise data...');
        for (const u of INITIAL_USERS) {
          await client.query(
            `INSERT INTO users (id, name, email, password_hash, role, department, created_at, avatar_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (email) DO NOTHING`,
            [u.id, u.name, u.email, u.password_hash, u.role, u.department, u.created_at, u.avatar_url || null]
          );
        }
      }
      client.release();
    } catch (err) {
      console.warn('[DB] PostgreSQL initialization attempt failed, utilizing persistent resilient local store:', (err as Error).message);
      this.isPostgresConnected = false;
      this.pgPool = null;
    }
  }

  // User Operations
  public async findUserByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [normalized]);
        return res.rows[0] || null;
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }
    return this.state.users.find(u => u.email.toLowerCase() === normalized) || null;
  }

  public async findUserById(id: string): Promise<User | null> {
    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT * FROM users WHERE id = $1', [id]);
        return res.rows[0] || null;
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }
    return this.state.users.find(u => u.id === id) || null;
  }

  public async createUser(data: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email.toLowerCase(),
      password_hash: data.password_hash,
      role: data.role,
      department: data.department,
      created_at: new Date().toISOString(),
      avatar_url: data.avatar_url
    };

    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `INSERT INTO users (id, name, email, password_hash, role, department, created_at, avatar_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [newUser.id, newUser.name, newUser.email, newUser.password_hash, newUser.role, newUser.department, newUser.created_at, newUser.avatar_url || null]
        );
        return res.rows[0];
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }

    this.state.users.push(newUser);
    this.saveStateToFile();
    return newUser;
  }

  public async getAllUsers(): Promise<Omit<User, 'password_hash'>[]> {
    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query('SELECT id, name, email, role, department, avatar_url, created_at FROM users ORDER BY name ASC');
        return res.rows;
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }
    return this.state.users.map(({ password_hash, ...rest }) => rest);
  }

  // Document Operations
  public async getDocuments(departmentFilter?: DepartmentType): Promise<Document[]> {
    if (this.isPostgresConnected && this.pgPool) {
      try {
        const query = departmentFilter
          ? `SELECT d.*, u.name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.department = $1 ORDER BY d.created_at DESC`
          : `SELECT d.*, u.name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id ORDER BY d.created_at DESC`;
        const params = departmentFilter ? [departmentFilter] : [];
        const res = await this.pgPool.query(query, params);
        return res.rows;
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }

    let docs = [...this.state.documents];
    if (departmentFilter) {
      docs = docs.filter(d => d.department === departmentFilter);
    }
    return docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async getDocumentById(id: string): Promise<Document | null> {
    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT d.*, u.name as uploaded_by_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.id = $1`,
          [id]
        );
        return res.rows[0] || null;
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }
    return this.state.documents.find(d => d.id === id) || null;
  }

  public async createDocument(doc: Omit<Document, 'id' | 'created_at'>): Promise<Document> {
    const newDoc: Document = {
      ...doc,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `INSERT INTO documents (id, title, department, file_type, raw_content, ai_summary, extracted_entities, uploaded_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            newDoc.id,
            newDoc.title,
            newDoc.department,
            newDoc.file_type,
            newDoc.raw_content,
            newDoc.ai_summary,
            JSON.stringify(newDoc.extracted_entities),
            newDoc.uploaded_by,
            newDoc.created_at
          ]
        );
        return res.rows[0];
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }

    this.state.documents.unshift(newDoc);
    this.saveStateToFile();
    return newDoc;
  }

  // Workflow Operations
  public async getWorkflows(departmentFilter?: DepartmentType): Promise<Workflow[]> {
    if (this.isPostgresConnected && this.pgPool) {
      try {
        const query = departmentFilter
          ? `SELECT w.*, u.name as assigned_to_name FROM workflows w LEFT JOIN users u ON w.assigned_to = u.id WHERE w.department = $1 ORDER BY w.created_at DESC`
          : `SELECT w.*, u.name as assigned_to_name FROM workflows w LEFT JOIN users u ON w.assigned_to = u.id ORDER BY w.created_at DESC`;
        const params = departmentFilter ? [departmentFilter] : [];
        const res = await this.pgPool.query(query, params);
        return res.rows;
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }

    let items = [...this.state.workflows];
    if (departmentFilter) {
      items = items.filter(w => w.department === departmentFilter);
    }
    return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async createWorkflow(wf: Omit<Workflow, 'id' | 'created_at'>): Promise<Workflow> {
    const newWf: Workflow = {
      ...wf,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    if (this.isPostgresConnected && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `INSERT INTO workflows (id, title, description, department, status, priority, assigned_to, ai_suggestions, due_date, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            newWf.id,
            newWf.title,
            newWf.description,
            newWf.department,
            newWf.status,
            newWf.priority,
            newWf.assigned_to,
            JSON.stringify(newWf.ai_suggestions),
            newWf.due_date,
            newWf.created_at
          ]
        );
        return res.rows[0];
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }

    this.state.workflows.unshift(newWf);
    this.saveStateToFile();
    return newWf;
  }

  public async updateWorkflow(id: string, updates: Partial<Workflow>): Promise<Workflow | null> {
    const index = this.state.workflows.findIndex(w => w.id === id);
    if (index === -1) return null;

    const updated = {
      ...this.state.workflows[index],
      ...updates
    };

    if (updates.assigned_to) {
      const u = this.state.users.find(x => x.id === updates.assigned_to);
      if (u) updated.assigned_to_name = u.name;
    }

    this.state.workflows[index] = updated;
    this.saveStateToFile();

    if (this.isPostgresConnected && this.pgPool) {
      try {
        await this.pgPool.query(
          `UPDATE workflows SET status = COALESCE($1, status), priority = COALESCE($2, priority), assigned_to = COALESCE($3, assigned_to), ai_suggestions = COALESCE($4, ai_suggestions) WHERE id = $5`,
          [updates.status || null, updates.priority || null, updates.assigned_to || null, updates.ai_suggestions ? JSON.stringify(updates.ai_suggestions) : null, id]
        );
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }

    return updated;
  }

  public async deleteWorkflow(id: string): Promise<boolean> {
    const idx = this.state.workflows.findIndex(w => w.id === id);
    if (idx === -1) return false;
    this.state.workflows.splice(idx, 1);
    this.saveStateToFile();

    if (this.isPostgresConnected && this.pgPool) {
      try {
        await this.pgPool.query('DELETE FROM workflows WHERE id = $1', [id]);
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }
    return true;
  }

  // Audit Log Operations
  public async createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<AuditLog> {
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    if (this.isPostgresConnected && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO audit_logs (id, user_id, action, details, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [newLog.id, newLog.user_id, newLog.action, JSON.stringify(newLog.details), newLog.created_at]
        );
      } catch (err) {
        console.error('[DB PG Error]', err);
      }
    }

    this.state.audit_logs.unshift(newLog);
    // Keep max 500 audit logs
    if (this.state.audit_logs.length > 500) {
      this.state.audit_logs = this.state.audit_logs.slice(0, 500);
    }
    this.saveStateToFile();
    return newLog;
  }

  public async getAuditLogs(limit = 50, actionFilter?: string): Promise<AuditLog[]> {
    let logs = [...this.state.audit_logs];
    if (actionFilter) {
      logs = logs.filter(l => l.action.toLowerCase().includes(actionFilter.toLowerCase()));
    }
    return logs.slice(0, limit);
  }

  public getRawState(): DatabaseState {
    return this.state;
  }
}

export const db = new DatabaseManager();
