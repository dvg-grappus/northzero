

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."pos_item_type" AS ENUM (
    'WHAT',
    'HOW',
    'WHY',
    'OPPORTUNITY',
    'CHALLENGE',
    'MILESTONE',
    'VALUE',
    'WHILE_OTHERS',
    'WE_ARE_THE_ONLY',
    'STATEMENT_WHAT',
    'STATEMENT_HOW',
    'STATEMENT_WHY',
    'STATEMENT_WHO',
    'STATEMENT_WHERE',
    'STATEMENT_WHEN',
    'STATEMENT_PROPOSITION',
    'STATEMENT_BENEFIT',
    'STATEMENT_OUTCOME'
);


ALTER TYPE "public"."pos_item_type" OWNER TO "postgres";


CREATE TYPE "public"."pos_source" AS ENUM (
    'ai',
    'user'
);


ALTER TYPE "public"."pos_source" OWNER TO "postgres";


CREATE TYPE "public"."pos_state" AS ENUM (
    'draft',
    'selected',
    'archived'
);


ALTER TYPE "public"."pos_state" OWNER TO "postgres";


CREATE TYPE "public"."roadmap_slot" AS ENUM (
    'now',
    '1yr',
    '3yr',
    '5yr',
    '10yr',
    'unassigned'
);


ALTER TYPE "public"."roadmap_slot" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."insights" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "insight_type" "text" NOT NULL,
    "message" "text" NOT NULL,
    "insight_references" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "section" "text"
);


ALTER TABLE "public"."insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."llm_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "model_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "config_type" "text" DEFAULT 'selected_model'::"text" NOT NULL,
    "model_type" "text",
    "prompt_type" "text",
    "prompt_name" "text",
    "prompt_text" "text",
    "prompt_description" "text"
);


ALTER TABLE "public"."llm_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."positioning_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "brief" "text" NOT NULL,
    "raw_payload" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."positioning_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."positioning_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "item_type" "public"."pos_item_type" NOT NULL,
    "content" "text" NOT NULL,
    "extra_json" "jsonb",
    "slot" "public"."roadmap_slot" DEFAULT 'unassigned'::"public"."roadmap_slot",
    "idx" smallint NOT NULL,
    "state" "public"."pos_state" DEFAULT 'draft'::"public"."pos_state",
    "source" "public"."pos_source" DEFAULT 'ai'::"public"."pos_source",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "statement_id" "uuid"
);


ALTER TABLE "public"."positioning_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."positioning_statements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "statements_json" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."positioning_statements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "thumbnail" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "progress" integer DEFAULT 0,
    "status" "text" DEFAULT 'draft'::"text",
    "collaborators" "jsonb",
    "user_id" "uuid"
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


ALTER TABLE ONLY "public"."insights"
    ADD CONSTRAINT "insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."llm_config"
    ADD CONSTRAINT "llm_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."llm_config"
    ADD CONSTRAINT "llm_config_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."positioning_documents"
    ADD CONSTRAINT "positioning_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."positioning_items"
    ADD CONSTRAINT "positioning_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."positioning_statements"
    ADD CONSTRAINT "positioning_statements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



CREATE INDEX "pos_items_project_type_idx" ON "public"."positioning_items" USING "btree" ("project_id", "item_type");



CREATE UNIQUE INDEX "pos_unique_milestone_slot" ON "public"."positioning_items" USING "btree" ("id", "document_id", "slot") WHERE (("item_type" = 'MILESTONE'::"public"."pos_item_type") AND ("state" <> 'archived'::"public"."pos_state"));



CREATE UNIQUE INDEX "positioning_latest_doc" ON "public"."positioning_documents" USING "btree" ("project_id", "version" DESC);



CREATE UNIQUE INDEX "positioning_statements_project_id_idx" ON "public"."positioning_statements" USING "btree" ("project_id");



CREATE OR REPLACE TRIGGER "set_llm_config_updated_at" BEFORE UPDATE ON "public"."llm_config" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



ALTER TABLE ONLY "public"."insights"
    ADD CONSTRAINT "insights_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."llm_config"
    ADD CONSTRAINT "llm_config_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."positioning_documents"
    ADD CONSTRAINT "positioning_documents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."positioning_documents"
    ADD CONSTRAINT "positioning_documents_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."positioning_items"
    ADD CONSTRAINT "positioning_items_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."positioning_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."positioning_items"
    ADD CONSTRAINT "positioning_items_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."positioning_items"
    ADD CONSTRAINT "positioning_items_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "public"."positioning_statements"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."positioning_statements"
    ADD CONSTRAINT "positioning_statements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."positioning_statements"
    ADD CONSTRAINT "positioning_statements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Users can delete their own projects" ON "public"."projects" FOR DELETE USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can insert their own projects" ON "public"."projects" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can read their own projects" ON "public"."projects" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "Users can update their own projects" ON "public"."projects" FOR UPDATE USING ((("auth"."uid"() = "user_id") OR ("user_id" IS NULL)));



CREATE POLICY "positioning_items_rw" ON "public"."positioning_items" USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."user_id" = "auth"."uid"()))));



CREATE POLICY "positioning_rw" ON "public"."positioning_documents" USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."user_id" = "auth"."uid"()))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."insights" TO "anon";
GRANT ALL ON TABLE "public"."insights" TO "authenticated";
GRANT ALL ON TABLE "public"."insights" TO "service_role";



GRANT ALL ON TABLE "public"."llm_config" TO "anon";
GRANT ALL ON TABLE "public"."llm_config" TO "authenticated";
GRANT ALL ON TABLE "public"."llm_config" TO "service_role";



GRANT ALL ON TABLE "public"."positioning_documents" TO "anon";
GRANT ALL ON TABLE "public"."positioning_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."positioning_documents" TO "service_role";



GRANT ALL ON TABLE "public"."positioning_items" TO "anon";
GRANT ALL ON TABLE "public"."positioning_items" TO "authenticated";
GRANT ALL ON TABLE "public"."positioning_items" TO "service_role";



GRANT ALL ON TABLE "public"."positioning_statements" TO "anon";
GRANT ALL ON TABLE "public"."positioning_statements" TO "authenticated";
GRANT ALL ON TABLE "public"."positioning_statements" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
