-- Update existing tables to add missing columns

-- Add created_at and updated_at to candidates table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidates' AND column_name = 'created_at') THEN
        ALTER TABLE candidates ADD COLUMN created_at timestamp default now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'candidates' AND column_name = 'updated_at') THEN
        ALTER TABLE candidates ADD COLUMN updated_at timestamp default now();
    END IF;
END $$;

-- Add created_at and updated_at to employers table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employers' AND column_name = 'created_at') THEN
        ALTER TABLE employers ADD COLUMN created_at timestamp default now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employers' AND column_name = 'updated_at') THEN
        ALTER TABLE employers ADD COLUMN updated_at timestamp default now();
    END IF;
END $$;

-- Update existing records to have created_at/updated_at values
UPDATE candidates SET created_at = now() WHERE created_at IS NULL;
UPDATE candidates SET updated_at = now() WHERE updated_at IS NULL;

UPDATE employers SET created_at = now() WHERE created_at IS NULL;
UPDATE employers SET updated_at = now() WHERE updated_at IS NULL;