'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { fetchProject, Project } from '@/lib/api';
import {
  getChapterProgress,
  getPipelineStep,
  getProjectTitle,
} from '@/lib/project-utils';
import StepProgress from '@/components/ui/StepProgress';
import SettingTab from '@/components/SettingTab';
import OutlineTab from '@/components/OutlineTab';
import ChapterTab from '@/components/ChapterTab';
import ExportTab from '@/components/ExportTab';

type TabType = 'setting' | 'outline' | 'chapters' | 'export';

const PIPELINE_STEPS = [
  { key: 'setting', label: '设定' },
  { key: 'outline', label: '章纲' },
  { key: 'chapters', label: '正文' },
  { key: 'export', label: '导出' },
];

export default function ProjectPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('setting');
  const [loading, setLoading] = useState(true);
  const loadSeqRef = useRef(0);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null;
    if (tab && ['setting', 'outline', 'chapters', 'export'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function loadProject(): Promise<Project | null> {
    const seq = ++loadSeqRef.current;
    try {
      const data = await fetchProject(projectId);
      if (seq !== loadSeqRef.current) return data;

      setProject(data);

      const urlTab = searchParams.get('tab') as TabType | null;
      if (!urlTab) {
        if (
          data.status === 'done' ||
          (data.chapters?.length ?? 0) >= data.targetChapters
        ) {
          setActiveTab('export');
        } else if (
          (data.chapters?.length ?? 0) > 0 ||
          data.status === 'writing'
        ) {
          setActiveTab('chapters');
        } else if (
          (data.outlines?.length ?? 0) > 0 ||
          data.status === 'outline'
        ) {
          setActiveTab('outline');
        } else {
          setActiveTab('setting');
        }
      }

      return data;
    } catch {
      return null;
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-500">加载项目...</p>
      </div>
    );
  }

  if (!project) {
    return <div className="text-center py-12 text-red-500">项目不存在</div>;
  }

  const pipelineStep = getPipelineStep(project);
  const { percent } = getChapterProgress(project);
  const title = getProjectTitle(project);

  const steps = PIPELINE_STEPS.map((s, i) => ({
    ...s,
    done: pipelineStep > i + 1,
    active: pipelineStep === i + 1 || activeTab === s.key,
  }));

  const progressLabel =
    pipelineStep >= 3
      ? `正文 ${project.chapters?.length ?? 0}/${project.targetChapters} 章`
      : pipelineStep === 2
        ? '章纲已完成，待生成正文'
        : pipelineStep === 1
          ? '设定已完成，待生成章纲'
          : '待生成设定';

  const tabs: { key: TabType; label: string }[] = [
    { key: 'setting', label: '设定' },
    { key: 'outline', label: '章纲' },
    { key: 'chapters', label: '章节' },
    { key: 'export', label: '导出' },
  ];

  return (
    <div>
      <div className="mb-6">
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gold-dark transition"
        >
          ← 返回项目列表
        </a>
        <h1 className="text-2xl font-bold text-ink mt-2 font-serif">{title}</h1>
        <p className="text-gray-500 mt-1">
          {project.genre} · {project.targetChapters} 章 · {project.targetWords}{' '}
          字/章
        </p>
      </div>

      <StepProgress
        steps={steps}
        progress={percent}
        progressLabel={progressLabel}
        className="mb-6"
      />

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === tab.key ? 'tab-active' : 'tab-inactive'
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
