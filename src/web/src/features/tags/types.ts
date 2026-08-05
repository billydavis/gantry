export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface SearchResult {
  type: 'Project' | 'Todo' | 'Note' | 'Win' | 'Resource' | 'Article';
  id: string;
  title: string;
  subtitle: string | null;
  snippet: string | null;
  projectName: string | null;
  projectId: string | null;
}
