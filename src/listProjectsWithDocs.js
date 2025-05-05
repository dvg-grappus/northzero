const { getProjects } = require('./services/projectService');
const { getLatestPositioningDocument } = require('./services/positioningService');

(async () => {
  const projects = await getProjects();
  console.log('Projects in DB:');
  for (const project of projects) {
    const doc = await getLatestPositioningDocument(project.id);
    console.log(`- ${project.name} (ID: ${project.id}) | Positioning Doc: ${doc ? 'YES' : 'NO'}`);
  }
})(); 