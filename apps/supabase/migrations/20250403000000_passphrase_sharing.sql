-- Make share_url nullable (passphrase-based sharing replaces URL-based sharing)
ALTER TABLE share_settings ALTER COLUMN share_url DROP NOT NULL;
