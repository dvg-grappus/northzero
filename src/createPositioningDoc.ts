import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwjwdnovswqdfqvkvbww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3andkbm92c3dxZGZxdmt2Ynd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjkxNzEsImV4cCI6MjA2MTYwNTE3MX0.dYJSEOIyxP8H2g_dHPG1gA9xT12KI9rmO9EpVCxwIEs';

const supabase = createClient(supabaseUrl, supabaseKey);

const positioningData = {
  "brief": "LumenRail is an autonomous micro‑tram that glides above existing city streets on lightweight carbon tracks, delivering silent ʻlast‑mileʼ transit without altering ground traffic. Passengers summon pods via an app; AI dynamically routes carriages into on‑demand chains, slashing wait times and emissions. Solar skin panels and regenerative braking feed surplus energy back into the grid. LumenRail installs overnight in modular spans, letting dense urban districts unlock elevated mobility without decades‑long dig projects.",
  "whatStatements": [
    "We thread modular tram pods through skylines on carbon fiber rails.",
    "We provide silent aerial transit for the walk‑but‑too‑far distance.",
    "We retrofit cities with elevated transport without tearing up streets.",
    "We give commuters summonable micro‑trams that link to any network.",
    "We recycle braking energy to power street lighting beneath the track.",
    "We turn idle rooftops into solar stations for urban mobility."
  ],
  "howStatements": [
    "By assembling rails from overnight‑installed carbon fiber lattice sections.",
    "By chaining AI‑routed pods into demand‑based express caravans.",
    "By riding mag‑wheel bogies that whisper instead of screech.",
    "By charging from photovoltaic skin and regenerative deceleration.",
    "By integrating with city APIs to predict crowd surges in real time.",
    "By designing stations the width of a bus stop, not a terminal."
  ],
  "whyStatements": [
    "Because congestion steals life hours and pollutes shared air.",
    "Because dense cities deserve upgrades without decade‑long tunnels.",
    "Because quiet streets invite cafés, not constant honking traffic.",
    "Because mobility equity starts with affordable, frequent micro‑routes.",
    "Because climate goals need transit that produces surplus watts.",
    "Because imaginative infrastructure can coexist with heritage boulevards."
  ],
  "opportunities": [
    "How might we gamify energy surplus contributions for citizens?",
    "How might we turn pod interiors into dynamic art galleries?",
    "How might we licence rails as aerial parcel‑delivery lanes at night?",
    "How might we integrate biometric ticketing for frictionless boarding?",
    "How might we offer real‑time carbon offset dashboards to riders?",
    "How might we fold micro‑tram data into urban digital twins?"
  ],
  "challenges": [
    "Navigating air‑rights regulations across fragmented property owners.",
    "Convincing municipalities to approve skyline visual changes.",
    "Engineering vibration damping for heritage building proximity.",
    "Maintaining pod sanitation under unmanned operations.",
    "Balancing peak‑time pod scarcity with energy constraints.",
    "Educating riders on emergency egress from elevated platforms."
  ],
  "milestones": [
    "Demonstrate 300‑metre pilot loop generating net positive energy.",
    "Achieve average pod wait time under 90 seconds citywide.",
    "Secure multi‑city framework deal covering five global megacities.",
    "Launch open developer kit for third‑party mobility super‑apps.",
    "Carry first million passengers with zero safety incidents recorded.",
    "Integrate real‑time wheelchair ramp automation across all stations.",
    "Deploy night‑time parcel pods, boosting utilisation to 20 hours daily.",
    "Surpass break‑even on operating costs via energy resale credits.",
    "Publish peer‑reviewed LCA proving 70 % lower CO₂ than buses.",
    "Receive UNESCO commendation for heritage‑friendly infrastructure."
  ],
  "values": [
    { "title": "Quiet Progress",   "blurb": "Advance cities without drowning them in noise." },
    { "title": "Energy Positive",  "blurb": "Return more power than we consume daily." },
    { "title": "Agile Build",      "blurb": "Install infrastructure at the pace of software." },
    { "title": "Open Data",        "blurb": "Share mobility metrics for civic innovation." },
    { "title": "Design Harmony",   "blurb": "Respect skyline heritage through elegant forms." },
    { "title": "Access First",     "blurb": "Prioritise riders of all abilities everywhere." },
    { "title": "Eco Integrity",    "blurb": "Audit every material for cradle‑to‑cradle impact." },
    { "title": "Transparent Cost", "blurb": "Show exactly where each fare dollar flows." },
    { "title": "Safety Above",     "blurb": "Make zero‑incident travel our non‑negotiable norm." },
    { "title": "Community Voice",  "blurb": "Co‑create routes with neighbourhood councils." },
    { "title": "Iterative Future", "blurb": "Evolve hardware with software‑like release cadence." },
    { "title": "Playful Wonder",   "blurb": "Turn commutes into skyline adventures." }
  ],
  "differentiators": {
    "whileOthers": [
      "Dig disruptive subway tunnels that snarl traffic for a decade.",
      "Ignore small‑distance trips, forcing riders into ride‑hail cars.",
      "Treat energy recovery as a nice‑to‑have efficiency metric.",
      "Position elevated tracks as futuristic sculptural vanity projects.",
      "Lock route data in proprietary silos hindering civic planning.",
      "Use bulky stations that commandeer precious sidewalk real estate."
    ],
    "weAreTheOnly": [
      "The only micro‑tram installed overnight with modular carbon spans.",
      "The only aerial network delivering net positive electricity to the grid.",
      "The only system that chains pods dynamically based on realtime demand maps.",
      "The only transit brand pledging full open‑source route and usage data.",
      "The only elevated rail requiring station footprints smaller than a bus bay.",
      "The only mobility platform blending kinetic architecture with city heritage codes."
    ]
  }
};

async function createPositioningDocument() {
  const projectId = 'e74bf53a-b5c7-4497-807a-0be23c473456'; // North of Zero's ID

  const { data, error } = await supabase
    .from('positioning_documents')
    .insert({
      project_id: projectId,
      version: 1,
      brief: positioningData.brief,
      raw_payload: positioningData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating positioning document:', error);
    return;
  }

  console.log('Successfully created positioning document:', data);
}

createPositioningDocument(); 