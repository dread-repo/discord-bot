-- CreateTable
CREATE TABLE "guild_config" (
    "guild_id" TEXT NOT NULL,
    "bot_admin_role_id" TEXT,
    "dread_reply_channel_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guild_config_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "guild_thunderstore_config" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "ping_role_id" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guild_thunderstore_config_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "guild_github_config" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "events" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guild_github_config_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "guild_forum_config" (
    "guild_id" TEXT NOT NULL,
    "forum_channel_id" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "guild_forum_config_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "guild_bot_admins" (
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "guild_bot_admins_pkey" PRIMARY KEY ("guild_id","user_id")
);

-- CreateTable
CREATE TABLE "global_packages" (
    "id" UUID NOT NULL,
    "namespace" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_core" BOOLEAN NOT NULL,
    "github_repo" TEXT,
    "registered_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "global_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watcher_dedupe" (
    "dedupe_key" TEXT NOT NULL,
    "announced_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watcher_dedupe_pkey" PRIMARY KEY ("dedupe_key")
);

-- CreateTable
CREATE TABLE "forum_attempts" (
    "id" UUID NOT NULL,
    "thread_id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "query_summary" TEXT NOT NULL,
    "answer_summary" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forum_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_drafts" (
    "id" UUID NOT NULL,
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "llm_feedback" JSONB,
    "target_channel_id" TEXT,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "announcement_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_packages_namespace_name_key" ON "global_packages"("namespace", "name");

-- CreateIndex
CREATE INDEX "forum_attempts_thread_id_created_at_idx" ON "forum_attempts"("thread_id", "created_at");

-- AddForeignKey
ALTER TABLE "guild_thunderstore_config" ADD CONSTRAINT "guild_thunderstore_config_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild_config"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_github_config" ADD CONSTRAINT "guild_github_config_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild_config"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_forum_config" ADD CONSTRAINT "guild_forum_config_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild_config"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guild_bot_admins" ADD CONSTRAINT "guild_bot_admins_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guild_config"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;
