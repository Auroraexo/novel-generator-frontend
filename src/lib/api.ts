const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api`;

export interface Project {
  id: string;
  genre: string;
  subgenre: string;
  inspiration: string;
  targetChapters: number;
  targetWords: number;
  status: string;
  setting: any;
  createdAt: string;
  outlines?: Outline[];
  chapters?: Chapter[];
  memory?: any;
}

export interface Outline {
  id: string;
  index: number;
  title: string;
  data: any;
}

export interface Chapter {
  id: string;
  index: number;
  content: string;
  wordCount: number;
  version: number;
  summary: any;
}

export async function generateInspiration(
  genre: string,
  subgenre: string,
): Promise<string[]> {
  const res = await fetch(`${API_BASE}/inspiration/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ genre, subgenre }),
  });
  if (!res.ok) throw new Error('生成灵感失败');
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('获取项目列表失败');
  return res.json();
}

export async function fetchProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('获取项目失败');
  return res.json();
}

export async function createProject(data: {
  genre: string;
  subgenre: string;
  inspiration: string;
  targetChapters?: number;
  targetWords?: number;
}): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('创建项目失败');
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除项目失败');
}

export async function generateSetting(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/setting/generate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('生成设定失败');
  return res.json();
}

export async function updateSetting(projectId: string, setting: any) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/setting`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(setting),
  });
  if (!res.ok) throw new Error('更新设定失败');
  return res.json();
}

export async function generateOutline(projectId: string) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/outline/generate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('生成大纲失败');
  return res.json();
}

export async function regenerateOutlineChapter(
  projectId: string,
  index: number,
  feedback: string,
) {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/outline/${index}/regenerate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    },
  );
  if (!res.ok) throw new Error('重新生成章节大纲失败');
  return res.json();
}

export async function generateChapter(projectId: string, index: number) {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/chapters/${index}/generate`,
    { method: 'POST' },
  );
  if (!res.ok) throw new Error('生成章节失败');
  return res.json();
}

export async function generateAllChapters(projectId: string) {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/chapters/generate-all`,
    { method: 'POST' },
  );
  if (!res.ok) throw new Error('启动生成失败');
  return res.json();
}

export async function rewriteChapter(
  projectId: string,
  index: number,
  feedback: string,
  keepElements: string,
) {
  const res = await fetch(
    `${API_BASE}/projects/${projectId}/chapters/${index}/rewrite`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, keepElements }),
    },
  );
  if (!res.ok) throw new Error('重写章节失败');
  return res.json();
}

export function createEventSource(projectId: string) {
  return new EventSource(`${API_BASE}/projects/${projectId}/generation/events`);
}
