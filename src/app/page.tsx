'use client';

import { useState, useEffect } from 'react';
import { fetchProjects, Project } from '@/lib/api';
import { deleteProject } from '@/lib/api';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectWizard from '@/components/CreateProjectWizard';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showWizard, setShowWizard] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此项目？')) return;
    await deleteProject(id);
    setProjects(projects.filter((p) => p.id !== id));
  }

  const completed = projects.filter(
    (p) =>
      p.status === 'done' ||
      (p.chapters?.length ?? 0) >= p.targetChapters,
  );
  const inProgress = projects.filter(
    (p) =>
      !completed.includes(p) &&
      ((p.chapters?.length ?? 0) > 0 || p.status === 'writing'),
  );
  const drafts = projects.filter(
    (p) => !completed.includes(p) && !inProgress.includes(p),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink font-serif">我的项目</h1>
          <p className="text-gray-500 mt-1">从灵感到完稿，AI 助你创作短篇网文</p>
        </div>
        <button onClick={() => setShowWizard(true)} className="btn-primary">
          + 新建项目
        </button>
      </div>

      {showWizard && <CreateProjectWizard onClose={() => setShowWizard(false)} />}

      {projects.length === 0 ? (
        <div className="card text-center py-20 px-6">
          <div className="text-5xl mb-4">📖</div>
          <p className="text-lg text-ink font-medium">还没有项目</p>
          <p className="text-gray-500 mt-2 mb-6">创建第一个故事，开始 AI 创作之旅</p>
          <button onClick={() => setShowWizard(true)} className="btn-primary">
            创建第一个项目
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {inProgress.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                进行中 ({inProgress.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {inProgress.map((p) => (
                  <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {drafts.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                草稿 ({drafts.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {drafts.map((p) => (
                  <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                已完成 ({completed.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((p) => (
                  <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
