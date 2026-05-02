-- ============================================================
-- 0006_gamification_features.sql
-- Trek Challenges, Streaks, Daily Challenges, Stories
-- ============================================================

-- ── CHALLENGES ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS challenges (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  description      TEXT,
  challenge_type   TEXT NOT NULL CHECK (challenge_type IN ('distance','altitude','streak','social','speed','collection')),
  target_value     INTEGER NOT NULL,
  unit             TEXT DEFAULT '',
  start_date       TIMESTAMPTZ NOT NULL,
  end_date         TIMESTAMPTZ NOT NULL,
  prize_pool_sol   NUMERIC(10,4) DEFAULT 0,
  max_participants INTEGER,
  is_team_challenge BOOLEAN DEFAULT false,
  team_size        INTEGER DEFAULT 1,
  status           TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming','active','completed','cancelled')),
  banner_emoji     TEXT DEFAULT '🏆',
  created_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  captain_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  challenge_id   UUID REFERENCES challenges(id) ON DELETE CASCADE,
  total_progress INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE IF NOT EXISTS challenge_participants (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id     UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id          UUID REFERENCES teams(id) ON DELETE SET NULL,
  current_progress INTEGER DEFAULT 0,
  status           TEXT DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  joined_at        TIMESTAMPTZ DEFAULT now(),
  completed_at     TIMESTAMPTZ,
  rank             INTEGER,
  UNIQUE(challenge_id, user_id)
);

-- ── STREAKS ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_streaks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
  streak_type           TEXT NOT NULL CHECK (streak_type IN ('login','trek','checkin','social','quest')),
  current_streak        INTEGER DEFAULT 0,
  longest_streak        INTEGER DEFAULT 0,
  last_activity_date    DATE,
  freeze_count          INTEGER DEFAULT 0,
  total_freezes_earned  INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_type)
);

CREATE TABLE IF NOT EXISTS streak_milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  streak_type  TEXT NOT NULL,
  milestone_days INTEGER NOT NULL,
  achieved_at  TIMESTAMPTZ DEFAULT now(),
  xp_awarded   INTEGER,
  badge_awarded TEXT
);

-- ── DAILY CHALLENGES ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_challenges (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                DATE NOT NULL UNIQUE,
  challenge_type      TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  xp_reward           INTEGER DEFAULT 10,
  requirement_value   INTEGER DEFAULT 1,
  created_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  daily_challenge_id  UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, daily_challenge_id)
);

-- ── STORIES ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  content       TEXT NOT NULL,
  excerpt       TEXT,
  cover_image_url TEXT,
  route_id      UUID REFERENCES routes(id) ON DELETE SET NULL,
  difficulty    TEXT,
  season        TEXT,
  duration_days INTEGER,
  cost_usd      NUMERIC(10,2),
  upvotes       INTEGER DEFAULT 0,
  downvotes     INTEGER DEFAULT 0,
  views         INTEGER DEFAULT 0,
  is_featured   BOOLEAN DEFAULT false,
  is_published  BOOLEAN DEFAULT false,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id    UUID REFERENCES stories(id) ON DELETE CASCADE,
  image_url   TEXT NOT NULL,
  caption     TEXT,
  order_index INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID REFERENCES stories(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type  TEXT NOT NULL CHECK (vote_type IN ('upvote','downvote')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, user_id)
);

CREATE TABLE IF NOT EXISTS story_comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id          UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_comment_id UUID REFERENCES story_comments(id) ON DELETE CASCADE,
  content           TEXT NOT NULL,
  upvotes           INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS story_bookmarks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, user_id)
);

CREATE TABLE IF NOT EXISTS author_followers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(author_id, follower_id)
);

-- ── INDEXES ──────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_challenges_status       ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_dates        ON challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_cp_challenge            ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_cp_user                 ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user            ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date   ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_stories_published       ON stories(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_author          ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_story_votes_story       ON story_votes(story_id);
CREATE INDEX IF NOT EXISTS idx_story_comments_story    ON story_comments(story_id);

-- ── SEED: Demo challenges ─────────────────────────────────────

INSERT INTO challenges (title, description, challenge_type, target_value, unit, start_date, end_date, prize_pool_sol, status, banner_emoji)
VALUES
  ('May Distance King',    'Complete 50km of trekking this month',          'distance',   50,  'km',    now(), now() + interval '30 days', 2.5,  'active',   '🏃'),
  ('Altitude Ace May',     'Reach 5000m altitude on any trek',              'altitude',   5000,'m',     now(), now() + interval '30 days', 1.0,  'active',   '⛰️'),
  ('Weekend Warrior',      'Trek 3 consecutive weekends',                   'streak',     3,   'weeks', now(), now() + interval '21 days', 0.5,  'active',   '🔥'),
  ('Social Butterfly',     'Refer 5 friends to Tourism Chain Nepal',        'social',     5,   'refs',  now(), now() + interval '14 days', 0.75, 'active',   '🤝'),
  ('Speed Demon EBC',      'Complete Poon Hill in under 4 hours',           'speed',      240, 'min',   now() + interval '7 days', now() + interval '37 days', 3.0, 'upcoming', '⚡'),
  ('Place Collector',      'Visit 10 unique checkpoints across Nepal',      'collection', 10,  'places',now(), now() + interval '60 days', 1.5,  'active',   '📍')
ON CONFLICT DO NOTHING;

-- ── SEED: Today's daily challenge ────────────────────────────

INSERT INTO daily_challenges (date, challenge_type, title, description, xp_reward, requirement_value)
VALUES (CURRENT_DATE, 'checkin', 'Check In Today', 'Check in at any checkpoint during your trek', 20, 1)
ON CONFLICT (date) DO NOTHING;
