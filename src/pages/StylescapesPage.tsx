
import React from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import StylescapesCraftPage from './stylescapes/StylescapesCraftPage';
import StylescapesPreviewPage from './stylescapes/StylescapesPreviewPage';
import StylescapesProvider from '@/providers/StylescapesProvider';

const StylescapesPage: React.FC = () => {
  const params = useParams();
  console.log("StylescapesPage rendered with substep:", params.substep);
  
  const renderStylescapeContent = () => {
    switch (params.substep) {
      case "craft":
        return <StylescapesCraftPage />;
      case "preview":
        return <StylescapesPreviewPage />;
      default:
        // Default to craft page if no substep specified
        return <Navigate to="/step/6/craft" replace />;
    }
  };
  
  return (
    <StylescapesProvider>
      <Routes>
        <Route path="/" element={renderStylescapeContent()} />
        <Route path="*" element={<Navigate to="/step/6/craft" replace />} />
      </Routes>
    </StylescapesProvider>
  );
};

export default StylescapesPage;
