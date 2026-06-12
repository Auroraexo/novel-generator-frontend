import { Project } from './api';

export const STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  setting: '已生成设定',
  outline: '已生成大纲',
  writing: '正在生成',
  done: '已完成',
};

export function getProjectTitle(project: Project): string {
  return (project.setting as { title?: string } | null)?.title || project.subgenre;
}

export function getChapterProgress(project: Project): {
  completed: number;
  total: number;
  percent: number;
} {
  const total = project.targetChapters;
  const completed = project.chapters?.length ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}

export function getPipelineStep(project: Project): number {
  if (project.status === 'done' || (project.chapters?.length ?? 0) >= project.targetChapters) {
    return 4;
  }
  if ((project.chapters?.length ?? 0) > 0 || project.status === 'writing') return 3;
  if ((project.outlines?.length ?? 0) > 0 || project.status === 'outline') return 2;
  if (project.setting) return 1;
  return 0;
}

export function estimateGenerationMinutes(
  chapters: number,
  wordsPerChapter: number,
): string {
  const chapterMinutes = wordsPerChapter <= 2500 ? 2 : wordsPerChapter <= 4000 ? 3.5 : 5;
  const outlineMinutes = Math.ceil(chapters / 2) * 1.5 + 2;
  const settingMinutes = 2;
  const total = settingMinutes + outlineMinutes + chapters * chapterMinutes;
  if (total < 60) return `约 ${Math.round(total)} 分钟`;
  const hours = Math.floor(total / 60);
  const mins = Math.round(total % 60);
  return mins > 0 ? `约 ${hours} 小时 ${mins} 分钟` : `约 ${hours} 小时`;
}

export function getContinueTab(project: Project): 'setting' | 'outline' | 'chapters' | 'export' {
  const step = getPipelineStep(project);
  if (step >= 4) return 'export';
  if (step >= 3) return 'chapters';
  if (step >= 2) return 'outline';
  return 'setting';
}
