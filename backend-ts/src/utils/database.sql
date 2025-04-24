-- Create database
CREATE DATABASE document_management;

-- Connect to the database
\c document_management;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  avatar VARCHAR(255) DEFAULT '',
  phone VARCHAR(50) DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create incoming_documents table
CREATE TABLE incoming_documents (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  received_date TIMESTAMP NOT NULL,
  sender VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  document_type VARCHAR(50) NOT NULL DEFAULT 'official',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  assigned_department VARCHAR(255) DEFAULT '',
  manager_opinion TEXT DEFAULT '',
  deadline TIMESTAMP NULL,
  attachments JSONB DEFAULT '[]',
  processing_history JSONB DEFAULT '[]',
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document_assignments table
CREATE TABLE document_assignments (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES incoming_documents(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  assigned_by_id INTEGER NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document_responses table
CREATE TABLE document_responses (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL REFERENCES incoming_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  manager_comment TEXT DEFAULT '',
  approved_by_id INTEGER REFERENCES users(id),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create outgoing_documents table
CREATE TABLE outgoing_documents (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  sent_date TIMESTAMP NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  content TEXT DEFAULT '',
  document_type VARCHAR(50) NOT NULL DEFAULT 'official',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  creator_id INTEGER NOT NULL REFERENCES users(id),
  approver_id INTEGER REFERENCES users(id),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  note TEXT DEFAULT '',
  attachments JSONB DEFAULT '[]',
  history JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create work_plans table
CREATE TABLE work_plans (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'planned',
  tasks JSONB DEFAULT '[]',
  attachments JSONB DEFAULT '[]',
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schedules table
CREATE TABLE schedules (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'week',
  start_date TIMESTAMP NOT NULL,  NOT NULL,
  period VARCHAR(20) NOT NULL DEFAULT 'week',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  items JSONB DEFAULT '[]',
  creator_id INTEGER NOT NULL REFERENCES users(id),
  approver_id INTEGER REFERENCES users(id),
  approved_at TIMESTAMP NULL,
  comments TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
