import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EditorProvider } from './state/EditorContext';
import { CourseProvider } from './state/CourseContext';
import { EditorLayout } from './components/editor/EditorLayout';
import { MetadataForm } from './components/course/MetadataForm';
import { CourseOutline } from './components/course/CourseOutline';
import { CourseRendererWrapper } from './components/renderer/CourseRendererWrapper';

function App() {
  return (
    <CourseProvider>
      <EditorProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/create-course" replace />} />
            <Route path="/create-course" element={<MetadataForm />} />
            <Route path="/course-outline" element={<CourseOutline />} />
            <Route path="/editor/:topicId" element={<EditorLayout />} />
            <Route path="/preview/:topicId" element={<CourseRendererWrapper />} />
            <Route path="/preview" element={<CourseRendererWrapper />} />
          </Routes>
        </BrowserRouter>
      </EditorProvider>
    </CourseProvider>
  );
}

export default App;
