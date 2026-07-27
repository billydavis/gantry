import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { ProjectDetailPage } from './features/projects/ProjectDetailPage';
import { DailyNotePage } from './features/notes/DailyNotePage';
import { ScratchPadPage } from './features/notes/ScratchPadPage';
import { NoteDetailPage } from './features/notes/NoteDetailPage';
import { WinsPage } from './features/wins/WinsPage';
import { TimelinePage } from './features/wins/TimelinePage';
import { SearchPage } from './features/search/SearchPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/notes" element={<DailyNotePage />} />
        <Route path="/notes/scratchpad" element={<ScratchPadPage />} />
        <Route path="/notes/daily/:date" element={<DailyNotePage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route path="/wins" element={<WinsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </AppLayout>
  );
}
