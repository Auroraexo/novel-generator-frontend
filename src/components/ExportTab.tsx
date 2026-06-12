'use client';

import { Project } from '@/lib/api';
import { getProjectTitle } from '@/lib/project-utils';

interface Props {
  project: Project;
}

export default function ExportTab({ project }: Props) {
  const chapters = project.chapters || [];
  const outlines = project.outlines || [];
  const setting = project.setting as Record<string, unknown> | null;

  function getFullText(): string {
    const lines: string[] = [];
    if (setting?.title) {
      lines.push(`# ${setting.title}\n`);
      lines.push(`> ${setting.logline}\n`);
      lines.push('---\n');
    }
    for (const outline of outlines) {
      const chapter = chapters.find((c) => c.index === outline.index);
      lines.push(`## 第${outline.index}章 ${outline.title}\n`);
      lines.push(chapter ? chapter.content : '（未生成）');
      lines.push('\n');
    }
    return lines.join('\n');
  }

  function getTxtText(): string {
    const lines: string[] = [];
    if (setting?.title) {
      lines.push(String(setting.title));
      lines.push('');
    }
    for (const outline of outlines) {
      const chapter = chapters.find((c) => c.index === outline.index);
      lines.push(`第${outline.index}章 ${outline.title}`);
      lines.push('');
      if (chapter) lines.push(chapter.content);
      lines.push('');
    }
    return lines.join('\n');
  }

  function download(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const completedCount = chapters.length;
  const totalCount = outlines.length;
  const title = getProjectTitle(project);
  const isComplete = completedCount >= totalCount && totalCount > 0;

  return (
    <div>
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold font-serif mb-5">导出概览</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              value: `${completedCount}/${totalCount}`,
              label: '已完成章节',
              color: 'text-gold-dark',
            },
            {
              value: totalWords.toLocaleString(),
              label: '总字数',
              color: 'text-green-600',
            },
            {
              value:
                chapters.length > 0
                  ? Math.round(totalWords / chapters.length).toLocaleString()
                  : '0',
              label: '平均字数/章',
              color: 'text-purple-600',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-4 rounded-xl bg-paper-dark"
            >
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
        {isComplete && (
          <p className="mt-4 text-sm text-green-700 bg-green-50 rounded-lg px-4 py-2 text-center">
            🎉 全部章节已完成，可以导出了
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => download(getFullText(), `${title}.md`)}
          disabled={chapters.length === 0}
          className="btn-primary"
        >
          导出 Markdown
        </button>
        <button
          onClick={() => download(getTxtText(), `${title}.txt`)}
          disabled={chapters.length === 0}
          className="btn-secondary"
        >
          导出 TXT
        </button>
      </div>

      {chapters.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold font-serif mb-4">全文预览</h3>
          <div className="max-h-[500px] overflow-y-auto bg-paper rounded-lg p-6">
            {outlines.map((outline) => {
              const chapter = chapters.find((c) => c.index === outline.index);
              return (
                <div key={outline.index} className="mb-8 last:mb-0">
                  <h4 className="text-base font-medium text-ink font-serif">
                    第{outline.index}章 {outline.title}
                  </h4>
                  {chapter ? (
                    <p className="reader-content mt-3 text-base">
                      {chapter.content}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic mt-2">（未生成）</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
