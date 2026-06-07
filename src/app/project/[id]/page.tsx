'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { fetchProject, Project } from '@/lib/api';
import SettingTab from '@/components/SettingTab';
import OutlineTab from '@/components/OutlineTab';
import ChapterTab from '@/components/ChapterTab';
import ExportTab from '@/components/ExportTab';

type TabType = 'setting' | 'outline' | 'chapters' | 'export';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('setting');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      const data = await fetchProject(projectId);
      setProject(data);
      if (data.status === 'done' || data.chapters?.length) {
        setActiveTab('chapters');
      } else if (data.status === 'outline' || data.outlines?.length) {
        setActiveTab('outline');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-red-500">项目不存在</div>;
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'setting', label: '设定' },
    { key: 'outline', label: '大纲' },
    { key: 'chapters', label: '章节' },
    { key: 'export', label: '导出' },
  ];

  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; 返回项目列表
        </a>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          {(project.setting as any)?.title || project.subgenre}
        </h1>
        <p className="text-gray-500 mt-1">
          {project.genre} &middot; {project.targetChapters} 章 &middot;{' '}
          {project.targetWords} 字/章
        </p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'setting' && (
        <SettingTab project={project} onUpdate={loadProject} />
      )}
      {activeTab === 'outline' && (
        <OutlineTab project={project} onUpdate={loadProject} />
      )}
      {activeTab === 'chapters' && (
        <ChapterTab project={project} onUpdate={loadProject} />
      )}
      {activeTab === 'export' && <ExportTab project={project} />}
    </div>
  );
}
