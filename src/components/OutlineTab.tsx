'use client';

import { useState } from 'react';
import {
  Project,
  generateOutline,
  regenerateOutlineChapter,
} from '@/lib/api';

interface Props {
  project: Project;
  onUpdate: () => void;
}

export default function OutlineTab({ project, onUpdate }: Props) {
  const [generating, setGenerating] = useState(false);
  const [regeneratingIdx, setRegeneratingIdx] = useState<number | null>(null);
  const [feedbackIdx, setFeedbackIdx] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const outlines = project.outlines || [];

  async function handleGenerate() {
    if (!project.setting) {
      setError('请先生成故事设定');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      await generateOutline(project.id);
      onUpdate();
    } catch (e: any) {
      setError(e.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  }

  async function handleRegenerate(index: number) {
    if (!feedback.trim()) return;
    setRegeneratingIdx(index);
    try {
      await regenerateOutlineChapter(project.id, index, feedback);
      setFeedbackIdx(null);
      setFeedback('');
      onUpdate();
    } catch (e: any) {
      setError(e.message || '重新生成失败');
    } finally {
      setRegeneratingIdx(null);
    }
  }

  if (outlines.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">
          {project.setting ? '尚未生成章纲' : '请先生成故事设定'}
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating || !project.setting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? '生成中（约 3–5 分钟，请勿重复点击）...' : '生成章纲'}
        </button>
        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          章纲 ({outlines.length} 章)
        </h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? '重新生成中（约 3–5 分钟）...' : '重新生成全部'}
        </button>
      </div>

      {error && <p className="mb-3 text-red-500 text-sm">{error}</p>}

      <div className="space-y-3">
        {outlines.map((outline) => {
          const data = outline.data as any;
          return (
            <div
              key={outline.id}
              className="bg-white rounded-xl border p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600">
                      第 {outline.index} 章
                    </span>
                    <h3 className="font-medium text-gray-900">
                      {outline.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.scene}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {data.characters?.map((c: string, i: number) => (
                      <span
                        key={i}
                    className="text-xs px-2 py-0.5 bg-gray-100 rounded"
           >
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p><span className="text-gray-400">冲突:</span> {data.conflict}</p>
                    <p><span className="text-gray-400">爽点:</span> {data.payoff}</p>
                    <p><span className="text-gray-400">钩子:</span> {data.ending_hook}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setFeedbackIdx(feedbackIdx === outline.index ? null : outline.index)
                  }
                  className="ml-4 text-sm text-gray-400 hover:text-blue-600"
                >
                  重新生成
                </button>
              </div>

              {feedbackIdx === outline.index && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="输入修改诉求..."
                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                  />
                  <button
                    onClick={() => handleRegenerate(outline.index)}
                    disabled={regeneratingIdx === outline.index}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    {regeneratingIdx === outline.index ? '生成中...' : '确定'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
