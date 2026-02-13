-- Add indexes for better search performance
-- Create indexes on username, display_name, and poem content/title for faster searching

-- Index for user search by username (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username));

-- Index for user search by display name (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_display_name_lower ON users (LOWER(display_name));

-- Index for poem search by title (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_poems_title_lower ON poems (LOWER(title)) WHERE title IS NOT NULL;

-- Index for poem search by content (case-insensitive) - using trigram for better partial matching
-- Note: This requires the pg_trgm extension which should be enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index for content search
CREATE INDEX IF NOT EXISTS idx_poems_content_trgm ON poems USING gin (content gin_trgm_ops);

-- Trigram index for title search (for better fuzzy matching)
CREATE INDEX IF NOT EXISTS idx_poems_title_trgm ON poems USING gin (title gin_trgm_ops) WHERE title IS NOT NULL;

-- Trigram indexes for user search (for better fuzzy matching)
CREATE INDEX IF NOT EXISTS idx_users_username_trgm ON users USING gin (username gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_display_name_trgm ON users USING gin (display_name gin_trgm_ops);

-- Add indexes for ordering poems by created_at in search results
CREATE INDEX IF NOT EXISTS idx_poems_created_at_desc ON poems (created_at DESC);

-- Comments for documentation
COMMENT ON INDEX idx_users_username_lower IS 'Index for case-insensitive username search';
COMMENT ON INDEX idx_users_display_name_lower IS 'Index for case-insensitive display name search';
COMMENT ON INDEX idx_poems_title_lower IS 'Index for case-insensitive poem title search';
COMMENT ON INDEX idx_poems_content_trgm IS 'Trigram index for full-text content search';
COMMENT ON INDEX idx_poems_title_trgm IS 'Trigram index for fuzzy title matching';
COMMENT ON INDEX idx_users_username_trgm IS 'Trigram index for fuzzy username matching';
COMMENT ON INDEX idx_users_display_name_trgm IS 'Trigram index for fuzzy display name matching';
COMMENT ON INDEX idx_poems_created_at_desc IS 'Index for ordering poems by creation date in descending order';
