'use client';

import { Project } from '@/lib/api';
import {
  STATUS_LABELS,
  getChapterProgress,
  getContinueTab,
  getProjectTitle,
} from '@/lib/project-utils';

interface Props {
  project: Project;
  onDelete: (id: string) => void;
}

export default function ProjectCard({ project, onDelete }: Props) {
  const { completed, total, percent } = getChapterProgress(project);
  const title = getProjectTitle(project);
  const continueTab = getContinueTab(project);
  const isActive = project.status === 'writing';

  return (
    <div className="card p-5 hover:shadow-card-hover transition group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-ink truncate font-serif">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{project.genre}</p>
        </div>
        <span
          className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
            project.status === 'done'
              ? 'bg-green-100 text-green-700'
              : project.status === 'writing'
                ? 'bg-purple-100 text-purple-700'
                : project.status === 'outline'
                  ? 'bg-amber-100 text-amber-700'
                  : project.status === 'setting'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
          }`}
        >
          {STATUS_LABELS[project.status] || project.status}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[2.5rem]">
        {project.inspiration}
      </p>

      {total > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>章节进度</span>
            <span>
              {completed}/{total} 章
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                percent === 100 ? 'bg-green-500' : 'bg-gold'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {project.targetChapters} 章 · {project.targetWords} 字/章
        </span>
        <div className="flex gap-2">
          <a
            href={`/project/${project.id}?tab=${continueTab}`}
            className="text-sm font-medium text-gold-dark hover:text-gold transition"
          >
            {isActive ? '查看进度' : percent === 100 ? '查看作品' : '继续创作'} →
          </a>
          <button
            onClick={() => onDelete(project.id)}
            className="text-sm text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
}
