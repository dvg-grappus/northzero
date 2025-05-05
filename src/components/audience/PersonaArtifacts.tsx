
import React from "react";

interface PersonaArtifactsProps {
  artifacts: string[];
}

const PersonaArtifacts: React.FC<PersonaArtifactsProps> = ({ artifacts }) => {
  return (
    <div>
      <h4 className="text-sm font-medium mb-3">Personal Artifacts</h4>
      <div className="grid grid-cols-3 gap-2">
        {artifacts.map((artifact, index) => (
          <div 
            key={index}
            className="aspect-square rounded overflow-hidden border border-border"
          >
            <img 
              src={artifact} 
              alt={`Artifact ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonaArtifacts;
