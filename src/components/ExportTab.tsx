'use client';

import { Project } from '@/lib/api';

interface Props {
  project: Project;
}

export default function ExportTab({ project }: Props) {
  const chapters = project.chapters || [];
  const outlines = project.outlines || [];
  const setting = project.setting as any;

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
      if (chapter) {
        lines.push(chapter.content);
      } else {
        lines.push('（未生成）');
      }
      lines.push('\n');
    }

    return lines.join('\n');
  }

  function getTxtText(): string {
    const lines: string[] = [];

    if (setting?.title) {
      lines.push(setting.title);
      lines.push('');
    }

    for (const outline of outlines) {
      const chapter = chapters.find((c) => c.index === outline.index);
      lines.push(`第${outline.index}章 ${outline.title}`);
      lines.push('');
      if (chapter) {
        lines.push(chapter.content);
      }
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
  const title = setting?.title || project.subgenre;

  return (
    <div>
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">导出概览</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {completedCount}/{totalCount}
            </div>
            <div className="text-sm text-gray-500">已完成章节</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {totalWords.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">总字数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {chapters.length > 0
                ? Math.round(totalWords / chapters.length)
                : 0}
            </div>
            <div className="text-sm text-gray-500">平均字数/章</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => download(getFullText(), `${title}.md`)}
          disabled={chapters.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          导出 Markdown
        </button>
        <button
          onClick={() => download(getTxtText(), `${title}.txt`)}
          disabled={chapters.length === 0}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
        >
          导出 TXT
        </button>
      </div>

      {chapters.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-medium mb-4">全文预览</h3>
          <div className="max-h-[500px] overflow-y-auto prose prose-sm max-w-none">
            {outlines.map((outline) => {
              const chapter = chapters.find((c) => c.index === outline.index);
              return (
                <div key={outline.index} className="mb-8">
                  <h4 className="text-base font-medium text-gray-900">
                    第{outline.index}章 {outline.title}
                  </h4>
                  {chapter ? (
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed mt-2">
                      {chapter.content}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">（未生成）</p>
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
