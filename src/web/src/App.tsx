import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './features/projects/ProjectsPage';
import { ProjectDetailPage } from './features/projects/ProjectDetailPage';
import { DailyNotePage } from './features/notes/DailyNotePage';
import { NoteDetailPage } from './features/notes/NoteDetailPage';
import { NotesPage } from './features/notes/NotesPage';
import { WinsPage } from './features/wins/WinsPage';
import { TimelinePage } from './features/wins/TimelinePage';
import { ArticlesPage } from './features/articles/ArticlesPage';
import { ArticleDetailPage } from './features/articles/ArticleDetailPage';
import { SearchPage } from './features/search/SearchPage';
import { TagManagementPage } from './features/tags/TagManagementPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/daily/:date" element={<DailyNotePage />} />
        <Route path="/notes/:id" element={<NoteDetailPage />} />
        <Route path="/wins" element={<WinsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/tags" element={<TagManagementPage />} />
        <Route path="/tags/:id" element={<TagManagementPage />} />
        <Route path="/wiki" element={<ArticlesPage />} />
        <Route path="/wiki/:id" element={<ArticleDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppLayout>
  );
}
