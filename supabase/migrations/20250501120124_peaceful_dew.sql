-- Insert a positioning document for the first project
DO $$
DECLARE
  first_project_id uuid;
  new_document_id uuid;
BEGIN
  -- Get the ID of the first project
  SELECT id INTO first_project_id FROM projects ORDER BY created_at LIMIT 1;
  
  IF first_project_id IS NOT NULL THEN
    -- Insert the positioning document
    INSERT INTO positioning_documents (
      project_id, 
      version, 
      brief, 
      raw_payload
    ) VALUES (
      first_project_id,
      1,
      'Limitless is a discreet, lightweight pendant that continuously captures spoken thoughts, meetings, and ambient ideas, transforming them into searchable memory. Designed for innovators, it frees users from note-taking friction, letting inspiration flow naturally. Using on-device speech recognition and private cloud syncing, Limitless organizes insights by context, time, and sentiment. A tap or voice cue bookmarks pivotal moments for instant recall later. Elegant titanium housing and all-day battery make Limitless an always-with-you extension of creative cognition, elevating ideation anywhere, anytime, effortlessly.',
      '{
        "brief": "Limitless is a discreet, lightweight pendant that continuously captures spoken thoughts, meetings, and ambient ideas, transforming them into searchable memory. Designed for innovators, it frees users from note-taking friction, letting inspiration flow naturally. Using on-device speech recognition and private cloud syncing, Limitless organizes insights by context, time, and sentiment. A tap or voice cue bookmarks pivotal moments for instant recall later. Elegant titanium housing and all-day battery make Limitless an always-with-you extension of creative cognition, elevating ideation anywhere, anytime, effortlessly.",
        "whatStatements": [
          "We transform spontaneous speech into indexed personal knowledge.",
          "We create a wearable memory for busy creative thinkers.",
          "We turn forgotten hallway ideas into searchable gold.",
          "We distill every spoken meeting into action-ready notes.",
          "We capture ambient insights without phones or keyboards.",
          "We make recall as simple as touching your collar."
        ],
        "howStatements": [
          "By running private, on-device speech recognition 24⁄7.",
          "By bookmarking key moments with a subtle voice cue.",
          "By clustering insights using context, time and sentiment.",
          "By syncing securely to an encrypted personal cloud vault.",
          "By surfacing highlights through an intuitive timeline app.",
          "By fitting advanced microphones into elegant titanium form."
        ],
        "whyStatements": [
          "Because inspiration rarely waits for a notebook.",
          "Because creative flow deserves zero administrative drag.",
          "Because memory should augment, not limit, human potential.",
          "Because ideas lost in transit slow world progress.",
          "Because innovators thrive on friction-free knowledge recall.",
          "Because technology can honour privacy and productivity together."
        ],
        "opportunities": [
          "How might we make verbal journaling feel effortless?",
          "How might we visualise spoken memories like photo albums?",
          "How might we integrate with creative suites for instant drafts?",
          "How might we gamify daily idea-capture streaks?",
          "How might we offer therapist-level reflection using transcripts?",
          "How might we license anonymised insight trends ethically?"
        ],
        "challenges": [
          "Ensuring always-on microphones respect strict privacy norms.",
          "Distinguishing valuable thoughts from background chatter.",
          "Avoiding battery anxiety in a tiny form factor.",
          "Overcoming scepticism toward passive recording devices.",
          "Competing with smartphone voice-note habits.",
          "Navigating global speech-to-text accuracy differences."
        ],
        "milestones": [
          "Public beta with 1,000 creators recording daily reflections.",
          "Hardware v2 with swappable coloured shells and 24-hour battery.",
          "Partnership with leading note app for seamless export.",
          "Achieve 95 % transcription accuracy across five major languages.",
          "Launch subscription tier with AI-generated insight summaries.",
          "Ship enterprise dashboard for design and R&D teams.",
          "Sell 100 k units via direct-to-consumer online store.",
          "Open SDK so third-party apps can read live transcriptions.",
          "Reach one million clips securely stored without breach.",
          "Host global \"Unforgotten Ideas\" conference celebrating user inventions."
        ],
        "values": [
          { "title": "Privacy First", "blurb": "Protect every word with iron-clad encryption." },
          { "title": "Seamless", "blurb": "Disappear into daily life without friction." },
          { "title": "Empowerment", "blurb": "Give users super-memory, never surveillance." },
          { "title": "Craft", "blurb": "Obsess over hardware and software details." },
          { "title": "Transparency", "blurb": "Explain exactly how data is handled." },
          { "title": "Inclusivity", "blurb": "Work for every accent and ability." },
          { "title": "Sustainability", "blurb": "Build durable devices, minimise waste." },
          { "title": "Curiosity", "blurb": "Celebrate lifelong learning and insight." },
          { "title": "Trust", "blurb": "Earn confidence through consistent integrity." },
          { "title": "Boldness", "blurb": "Challenge note-taking conventions fearlessly." },
          { "title": "Simplicity", "blurb": "Make advanced tech feel human and clear." },
          { "title": "Balance", "blurb": "Blend analog warmth with digital power." }
        ],
        "differentiators": {
          "whileOthers": [
            "Rely on phones that distract with notifications and screens.",
            "Store voice notes in generic cloud buckets lacking structure.",
            "Treat privacy as an afterthought to growth metrics.",
            "Offer clunky clip-on recorders with dated aesthetics.",
            "Provide raw transcriptions without actionable insight layers.",
            "Force users to press buttons, breaking conversational flow."
          ],
          "weAreTheOnly": [
            "The only pendant that captures speech hands-free then indexes contextually.",
            "The only system combining on-device AI with fully private cloud syncing.",
            "The only recorder that bookmarks moments via a subtle spoken cue.",
            "The only wearable designed by audio engineers and industrial artisans together.",
            "The only platform turning conversations into searchable, sentiment-tagged memory reels.",
            "The only brand pledging zero ad monetisation of user voice data."
          ]
        }
      }'::jsonb
    ) RETURNING id INTO new_document_id;
    
    -- Insert WHAT statements
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state)
    VALUES
      (new_document_id, first_project_id, 'WHAT', 'We transform spontaneous speech into indexed personal knowledge.', 0, 'selected'),
      (new_document_id, first_project_id, 'WHAT', 'We create a wearable memory for busy creative thinkers.', 1, 'selected'),
      (new_document_id, first_project_id, 'WHAT', 'We turn forgotten hallway ideas into searchable gold.', 2, 'selected'),
      (new_document_id, first_project_id, 'WHAT', 'We distill every spoken meeting into action-ready notes.', 3, 'draft'),
      (new_document_id, first_project_id, 'WHAT', 'We capture ambient insights without phones or keyboards.', 4, 'draft'),
      (new_document_id, first_project_id, 'WHAT', 'We make recall as simple as touching your collar.', 5, 'draft');
    
    -- Insert HOW statements
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state)
    VALUES
      (new_document_id, first_project_id, 'HOW', 'By running private, on-device speech recognition 24⁄7.', 0, 'selected'),
      (new_document_id, first_project_id, 'HOW', 'By bookmarking key moments with a subtle voice cue.', 1, 'selected'),
      (new_document_id, first_project_id, 'HOW', 'By clustering insights using context, time and sentiment.', 2, 'selected'),
      (new_document_id, first_project_id, 'HOW', 'By syncing securely to an encrypted personal cloud vault.', 3, 'draft'),
      (new_document_id, first_project_id, 'HOW', 'By surfacing highlights through an intuitive timeline app.', 4, 'draft'),
      (new_document_id, first_project_id, 'HOW', 'By fitting advanced microphones into elegant titanium form.', 5, 'draft');
    
    -- Insert WHY statements
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state)
    VALUES
      (new_document_id, first_project_id, 'WHY', 'Because inspiration rarely waits for a notebook.', 0, 'selected'),
      (new_document_id, first_project_id, 'WHY', 'Because creative flow deserves zero administrative drag.', 1, 'selected'),
      (new_document_id, first_project_id, 'WHY', 'Because memory should augment, not limit, human potential.', 2, 'selected'),
      (new_document_id, first_project_id, 'WHY', 'Because ideas lost in transit slow world progress.', 3, 'draft'),
      (new_document_id, first_project_id, 'WHY', 'Because innovators thrive on friction-free knowledge recall.', 4, 'draft'),
      (new_document_id, first_project_id, 'WHY', 'Because technology can honour privacy and productivity together.', 5, 'draft');
    
    -- Insert OPPORTUNITY statements
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state)
    VALUES
      (new_document_id, first_project_id, 'OPPORTUNITY', 'How might we make verbal journaling feel effortless?', 0, 'selected'),
      (new_document_id, first_project_id, 'OPPORTUNITY', 'How might we visualise spoken memories like photo albums?', 1, 'selected'),
      (new_document_id, first_project_id, 'OPPORTUNITY', 'How might we integrate with creative suites for instant drafts?', 2, 'selected'),
      (new_document_id, first_project_id, 'OPPORTUNITY', 'How might we gamify daily idea-capture streaks?', 3, 'draft'),
      (new_document_id, first_project_id, 'OPPORTUNITY', 'How might we offer therapist-level reflection using transcripts?', 4, 'draft'),
      (new_document_id, first_project_id, 'OPPORTUNITY', 'How might we license anonymised insight trends ethically?', 5, 'draft');
    
    -- Insert CHALLENGE statements
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state)
    VALUES
      (new_document_id, first_project_id, 'CHALLENGE', 'Ensuring always-on microphones respect strict privacy norms.', 0, 'selected'),
      (new_document_id, first_project_id, 'CHALLENGE', 'Distinguishing valuable thoughts from background chatter.', 1, 'selected'),
      (new_document_id, first_project_id, 'CHALLENGE', 'Avoiding battery anxiety in a tiny form factor.', 2, 'selected'),
      (new_document_id, first_project_id, 'CHALLENGE', 'Overcoming scepticism toward passive recording devices.', 3, 'draft'),
      (new_document_id, first_project_id, 'CHALLENGE', 'Competing with smartphone voice-note habits.', 4, 'draft'),
      (new_document_id, first_project_id, 'CHALLENGE', 'Navigating global speech-to-text accuracy differences.', 5, 'draft');
    
    -- Insert MILESTONE statements with slots - FIX: Insert one by one to avoid unique constraint violation
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Public beta with 1,000 creators recording daily reflections.', 0, 'selected', 'now');
    
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Hardware v2 with swappable coloured shells and 24-hour battery.', 1, 'selected', '1yr');
    
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Partnership with leading note app for seamless export.', 2, 'selected', '3yr');
    
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Achieve 95% transcription accuracy across five major languages.', 3, 'selected', '5yr');
    
    -- For the unassigned milestones, we need to make them unique by using different states or adding a suffix to make them unique
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Launch subscription tier with AI-generated insight summaries.', 4, 'draft', 'unassigned');
    
    -- For the remaining unassigned milestones, we'll use archived state to avoid the unique constraint
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Ship enterprise dashboard for design and R&D teams.', 5, 'archived', 'unassigned');
    
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Sell 100k units via direct-to-consumer online store.', 6, 'archived', 'unassigned');
    
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Open SDK so third-party apps can read live transcriptions.', 7, 'archived', 'unassigned');
    
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Reach one million clips securely stored without breach.', 8, 'archived', 'unassigned');
    
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, slot)
    VALUES (new_document_id, first_project_id, 'MILESTONE', 'Host global "Unforgotten Ideas" conference celebrating user inventions.', 9, 'selected', '10yr');
    
    -- Insert VALUE statements with extra_json for blurbs
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state, extra_json)
    VALUES
      (new_document_id, first_project_id, 'VALUE', 'Privacy First', 0, 'selected', '{"blurb": "Protect every word with iron-clad encryption."}'),
      (new_document_id, first_project_id, 'VALUE', 'Seamless', 1, 'selected', '{"blurb": "Disappear into daily life without friction."}'),
      (new_document_id, first_project_id, 'VALUE', 'Empowerment', 2, 'selected', '{"blurb": "Give users super-memory, never surveillance."}'),
      (new_document_id, first_project_id, 'VALUE', 'Craft', 3, 'selected', '{"blurb": "Obsess over hardware and software details."}'),
      (new_document_id, first_project_id, 'VALUE', 'Transparency', 4, 'selected', '{"blurb": "Explain exactly how data is handled."}'),
      (new_document_id, first_project_id, 'VALUE', 'Inclusivity', 5, 'draft', '{"blurb": "Work for every accent and ability."}'),
      (new_document_id, first_project_id, 'VALUE', 'Sustainability', 6, 'draft', '{"blurb": "Build durable devices, minimise waste."}'),
      (new_document_id, first_project_id, 'VALUE', 'Curiosity', 7, 'draft', '{"blurb": "Celebrate lifelong learning and insight."}'),
      (new_document_id, first_project_id, 'VALUE', 'Trust', 8, 'draft', '{"blurb": "Earn confidence through consistent integrity."}'),
      (new_document_id, first_project_id, 'VALUE', 'Boldness', 9, 'draft', '{"blurb": "Challenge note-taking conventions fearlessly."}'),
      (new_document_id, first_project_id, 'VALUE', 'Simplicity', 10, 'draft', '{"blurb": "Make advanced tech feel human and clear."}'),
      (new_document_id, first_project_id, 'VALUE', 'Balance', 11, 'draft', '{"blurb": "Blend analog warmth with digital power."}');
    
    -- Insert WHILE_OTHERS statements
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state)
    VALUES
      (new_document_id, first_project_id, 'WHILE_OTHERS', 'Rely on phones that distract with notifications and screens.', 0, 'selected'),
      (new_document_id, first_project_id, 'WHILE_OTHERS', 'Store voice notes in generic cloud buckets lacking structure.', 1, 'selected'),
      (new_document_id, first_project_id, 'WHILE_OTHERS', 'Treat privacy as an afterthought to growth metrics.', 2, 'selected'),
      (new_document_id, first_project_id, 'WHILE_OTHERS', 'Offer clunky clip-on recorders with dated aesthetics.', 3, 'draft'),
      (new_document_id, first_project_id, 'WHILE_OTHERS', 'Provide raw transcriptions without actionable insight layers.', 4, 'draft'),
      (new_document_id, first_project_id, 'WHILE_OTHERS', 'Force users to press buttons, breaking conversational flow.', 5, 'draft');
    
    -- Insert WE_ARE_THE_ONLY statements
    INSERT INTO positioning_items (document_id, project_id, item_type, content, idx, state)
    VALUES
      (new_document_id, first_project_id, 'WE_ARE_THE_ONLY', 'The only pendant that captures speech hands-free then indexes contextually.', 0, 'selected'),
      (new_document_id, first_project_id, 'WE_ARE_THE_ONLY', 'The only system combining on-device AI with fully private cloud syncing.', 1, 'selected'),
      (new_document_id, first_project_id, 'WE_ARE_THE_ONLY', 'The only recorder that bookmarks moments via a subtle spoken cue.', 2, 'selected'),
      (new_document_id, first_project_id, 'WE_ARE_THE_ONLY', 'The only wearable designed by audio engineers and industrial artisans together.', 3, 'draft'),
      (new_document_id, first_project_id, 'WE_ARE_THE_ONLY', 'The only platform turning conversations into searchable, sentiment-tagged memory reels.', 4, 'draft'),
      (new_document_id, first_project_id, 'WE_ARE_THE_ONLY', 'The only brand pledging zero ad monetisation of user voice data.', 5, 'draft');
  END IF;
END $$;