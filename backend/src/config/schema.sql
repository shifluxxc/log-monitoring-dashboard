-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    api_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create logs table as a hypertable
CREATE TABLE IF NOT EXISTS logs (
    timestamp TIMESTAMP NOT NULL,
    user_id UUID NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB
);

-- Convert logs table to hypertable
SELECT create_hypertable('logs', 'timestamp', if_not_exists => TRUE);

-- Create traces table
CREATE TABLE IF NOT EXISTS traces (
    trace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    root_span_name TEXT NOT NULL,
    start_time_unix_nano BIGINT NOT NULL,
    duration_nano BIGINT NOT NULL,
    span_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create spans table
CREATE TABLE IF NOT EXISTS spans (
    span_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trace_id UUID NOT NULL,
    parent_span_id UUID,
    name TEXT NOT NULL,
    start_time_unix_nano BIGINT NOT NULL,
    end_time_unix_nano BIGINT NOT NULL,
    attributes JSONB
);

-- Add foreign key constraints
ALTER TABLE logs ADD CONSTRAINT fk_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE traces ADD CONSTRAINT fk_traces_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE spans ADD CONSTRAINT fk_spans_trace_id FOREIGN KEY (trace_id) REFERENCES traces(trace_id) ON DELETE CASCADE;
ALTER TABLE spans ADD CONSTRAINT fk_spans_parent_span_id FOREIGN KEY (parent_span_id) REFERENCES spans(span_id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traces_user_id ON traces(user_id);
CREATE INDEX IF NOT EXISTS idx_spans_trace_id ON spans(trace_id);
CREATE INDEX IF NOT EXISTS idx_spans_parent_span_id ON spans(parent_span_id); 