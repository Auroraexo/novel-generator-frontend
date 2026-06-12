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
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '重新生成失败');
    } finally {
      setRegeneratingIdx(null);
    }
  }

  if (outlines.length === 0) {
    return (
      <div className="card text-center py-16 px-6">
        <div className="text-4xl mb-3">📋</div>
        <p className="text-gray-500 mb-2">
          {project.setting ? '尚未生成章纲' : '请先在「设定」Tab 生成故事设定'}
        </p>
        <button
          onClick={handleGenerate}
          disabled={generating || !project.setting}
          className="btn-primary mt-4"
        >
          {generating
            ? '生成中（约 3–5 分钟，请勿重复点击）...'
            : '生成章纲'}
        </button>
        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold font-serif">
          章纲 · {outlines.length} 章
        </h2>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-secondary text-sm py-1.5"
        >
          {generating ? '重新生成中（约 3–5 分钟）...' : '重新生成全部'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {outlines.map((outline) => {
          const data = outline.data as Record<string, unknown>;
          const isExpanded = expandedIdx === outline.index;

          return (
            <div key={outline.id} className="card overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setExpandedIdx(isExpanded ? null : outline.index)
                }
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-paper-dark/50 transition"
              >
                <span className="shrink-0 w-7 h-7 rounded-full bg-gold/15 text-gold-dark text-xs font-semibold flex items-center justify-center">
                  {outline.index}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ink truncate">
                    {outline.title}
                  </h3>
                  {!isExpanded && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {String(data.ending_hook || data.scene || '')}
                    </p>
                  )}
                </div>
                <span className="text-gray-400 text-sm shrink-0">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  <p className="text-sm text-gray-600 mt-3">{String(data.scene)}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(data.characters as string[] | undefined)?.map((c, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-paper-dark rounded-full text-gray-600"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div>
                      <dt className="text-gray-400 text-xs">冲突</dt>
                      <dd className="text-gray-700">{String(data.conflict)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs">爽点</dt>
                      <dd className="text-gray-700">{String(data.payoff)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-400 text-xs">章末钩子</dt>
                      <dd className="text-gray-700">{String(data.ending_hook)}</dd>
                    </div>
                  </dl>
                  <button
                    onClick={() =>
                      setFeedbackIdx(
                        feedbackIdx === outline.index ? null : outline.index,
                      )
                    }
                    className="mt-3 text-sm text-gold-dark hover:text-gold"
                  >
                    重新生成本章
                  </button>
                  {feedbackIdx === outline.index && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="输入修改诉求..."
                        className="input-field text-sm flex-1"
                      />
                      <button
                        onClick={() => handleRegenerate(outline.index)}
                        disabled={regeneratingIdx === outline.index}
                        className="btn-primary text-sm py-1.5 shrink-0"
                      >
                        {regeneratingIdx === outline.index ? '...' : '确定'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
