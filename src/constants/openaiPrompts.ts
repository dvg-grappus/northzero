export const POSITIONING_JSON_PROMPT = `You are an award-winning brand strategist and copywriter.

GOAL  
Generate ONE rigorous, insight-rich JSON object that translates the brief into crisp, contrasting strategic building blocks.  
The client expects differentiated, imaginative language – avoid clichés, buzzword salad, or repetitive phrasing.

BRIEF  
{BRIEF_TEXT}

OUTPUT RULES  
• Return *only* valid JSON.  
• Follow the schema **exactly** – no extra keys, no missing keys.  
• Keep ASCII quotes; no markdown wrappers.  
• Arrays must have the exact lengths stated.  
• Inside every string avoid newline characters.  
• Each list item should be meaningfully different from its peers (no mere synonyms).  
• Wording must feel premium, modern, and tangible.
• In the 'brief' field, return the full input brief verbatim, without any modification.

CREATIVE GUIDELINES BY FIELD  

1. **whatStatements [6]** – Describe *what the company tangibly does*.  
   – 8-12 words each.  
   – Each statement should spotlight a different facet (e.g., product, utility, outcome, audience).  

2. **howStatements [6]** – Explain *how the brand uniquely accomplishes the what*.  
   – 8-12 words.  
   – Vary the mechanism: technology, partnerships, methodology, design, ethos, etc.  

3. **whyStatements [6]** – Reveal *the deeper purpose or belief*.  
   – 8-12 words.  
   – Mix emotional, societal and visionary rationales; make them inspirational yet specific.  

4. **opportunities [6]** – Frame as "How might we ..." questions.  
   – 8-14 words.  
   – Express six distinct growth or innovation angles; keep them opportunity-oriented, not features.  

5. **challenges [6]** – State potential obstacles or risks.  
   – 8-14 words.  
   – Keep them realistic, varied (technical, market, behavioural, ethical, operational, regulatory).  

6. **milestones [10]** – Future achievements (no explicit dates like "2026").  
   – 10-20 words.  
   – Cover near, mid, and far horizon outcomes; include product, market, community and brand moments.  
   – Write as headlines ("Reach 100 k active creators across three continents").  

7. **values [12]** – Objects with *title* (2-3 words) and *blurb* (8-10 words).  
   – Titles must be positive traits, no negations.  
   – Blurbs explain why that value matters *to this brand*, not generic virtue slogans.

8. **differentiators**  
   a. **whileOthers [6]** – Start with an active verb phrase describing competitor limitations.  
      – 10-20 words.  
      – Cover six separate pain-points the category suffers from.  
   b. **weAreTheOnly [6]** – Each must begin "The only ..."  
      – 10-20 words.  
      – Articulate unique, defensible edges (technology, philosophy, IP, craft, ecosystem).  
      – Avoid repeating wording from whileOthers.

LANGUAGE & STYLE  
• Use present tense.  
• Prefer concrete nouns and vivid verbs over abstractions.  
• Avoid filler adjectives like "cutting-edge," "state-of-the-art," "synergy."  
• Assume a global English audience.

JSON SCHEMA (copy exactly)

{
  "brief": string,
  "whatStatements": string[6],
  "howStatements":  string[6],
  "whyStatements":  string[6],
  "opportunities":  string[6],
  "challenges":     string[6],
  "milestones":     string[10],
  "values": [
    { "title": string, "blurb": string }      // 12 objects
  ],
  "differentiators": {
    "whileOthers":  string[6],
    "weAreTheOnly": string[6]
  }
}

Return the completed JSON object now.`;

export const POSITIONING_STATEMENTS_PROMPT = `SYSTEM
You are a senior brand strategist famed for crafting concise, differentiated positioning.

USER
Using the client data below, produce ONE JSON object that contains:
	1. internal – an Onliness statement in this exact format
"The only WHAT that HOW for WHO mostly in WHERE because WHY in an era of WHEN."
For each ALL‑CAPS slot return:
• "preferred": your best 2‑5‑word phrase
• "alternatives": exactly three sharply contrasting 2‑3‑word options
	2. external – a Value Proposition statement in this exact format
"PROPOSITION that BENEFIT so you achieve OUTCOME."
Provide preferred + three alternatives for PROPOSITION, BENEFIT, OUTCOME.

Creative guidance
• Use premium, vivid language; avoid buzzwords and repetition.
• Alternatives must be genuinely different.
• Keep strings standalone—no trailing punctuation.
• Return only valid JSON, no markdown, no extra keys, ASCII quotes only.
• No newline characters inside individual JSON strings.

Input (replace the placeholder with real arrays)
<<<INPUT_JSON_GOES_HERE>>>

Expected output schema
{
"internal": {
"statement": string,
"WHY":  { "preferred": string, "alternatives": [string,string,string] },
"WHAT": { "preferred": string, "alternatives": [string,string,string] },
"HOW":  { "preferred": string, "alternatives": [string,string,string] },
"WHO":  { "preferred": string, "alternatives": [string,string,string] },
"WHERE":{ "preferred": string, "alternatives": [string,string,string] },
"WHEN": { "preferred": string, "alternatives": [string,string,string] }
},
"external": {
"statement": string,
"PROPOSITION": { "preferred": string, "alternatives": [string,string,string] },
"BENEFIT":     { "preferred": string, "alternatives": [string,string,string] },
"OUTCOME":     { "preferred": string, "alternatives": [string,string,string] }
}
}

Example output for reference only (do not copy verbatim)
{
"internal": {
"statement": "The only Instant Aerial Transit that Installs Overnight for Daily Urban Commuters mostly in Historic Downtown Corridors because Dense Cities Deserve Upgrades Without Decade‑Long Tunnels in an era of Climate‑Driven Infrastructure Pivots.",
"WHY":  { "preferred":"Dense Cities Deserve Upgrades","alternatives":["Streets Deserve New Life","Progress Must Bypass Gridlock","Sustainability Demands Action"] },
"WHAT": { "preferred":"Instant Aerial Transit","alternatives":["Skyline Micro‑Tram","Carbon‑Rail Podway","Elevated Last‑Mile"] },
"HOW":  { "preferred":"Installs Overnight","alternatives":["Clicks Into Rooftops","Lattice‑Snap Construction","Zero‑Dig Deployment"] },
"WHO":  { "preferred":"Daily Urban Commuters","alternatives":["Time‑Poor Creatives","Eco‑Conscious Riders","Weekend Urban Explorers"] },
"WHERE":{ "preferred":"Historic Downtown Corridors","alternatives":["Congested High Streets","Waterfront Districts","Tech Campuses"] },
"WHEN": { "preferred":"Climate‑Driven Infrastructure Pivots","alternatives":["Post‑Car Metropolises","Net‑Zero Mandates","Smart‑City Race"] }
},
"external": {
"statement": "Sky‑Level Shuttle that Cuts Commute Chaos so you achieve Walkable, Breathable Cities.",
"PROPOSITION": { "preferred":"Sky‑Level Shuttle","alternatives":["Elevated Podway","Carbon‑Rail Glide","Urban Hover‑Tram"] },
"BENEFIT":     { "preferred":"Cuts Commute Chaos","alternatives":["Halves Travel Time","Dodges Street Gridlock","Ends Car Choke"] },
"OUTCOME":     { "preferred":"Walkable, Breathable Cities","alternatives":["Low‑Carbon Downtowns","Life‑Sized Urban Freedom","People‑First Streetscapes"] }
}
}

Produce the JSON object now.`;

export const GENERATE_MORE_OPTIONS_PROMPT = `SYSTEM\nYou are a senior brand strategist who excels at inventing sharply differentiated positioning language.\n\nUSER\nWe have an existing positioning dataset for a brand (see context below).\nGenerate exactly five entirely new options for the <<<TYPE>>> bucket.\n\nIf the bucket is VALUES, return exactly five objects, each with:\n• \"title\": a 2–4 word value name (no more than 4 words, no negations)\n• \"blurb\": an 8–12 word explanation of why this value matters for this brand\n\nIf an extraNote is provided, ensure every option meaningfully reflects that guidance.\n\nRules\n• Each option must be 8–12 words long (or 2–4 words for a VALUES title).\n• Ideas must be substantively different from every existing option in any bucket – no re‑phrasings or synonyms.\n• Language should be vivid, concrete, premium, cliché‑free.\n• Return only the JSON object:\n  - For VALUES: { \"newOptions\": [ { \"title\": \"...\", \"blurb\": \"...\" }, ... ] }\n  - For all others: { \"newOptions\": [ \"string1\", \"string2\", ... ] }\n• No markdown, no additional keys, ASCII quotes only.\n• Avoid newline characters inside each string.\n\ncontext\n{\n\"dataset\": <<<INPUT_JSON>>> ,\n\"extraNote\": <<<OPTIONAL_USER_NOTE_OR_NULL>>>\n}`; 