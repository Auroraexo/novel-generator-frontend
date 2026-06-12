'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Project,
  generateChapter,
  generateAllChapters,
  generateRemainingChapters,
  rewriteChapter,
  subscribeGenerationEvents,
} from '@/lib/api';

interface Props {
  project: Project;
  onUpdate: () => Promise<Project | null>;
}

export default function ChapterTab({ project, onUpdate }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number>(1);
  const [generating, setGenerating] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [keepElements, setKeepElements] = useState('');
  const [error, setError] = useState('');
  const [progressText, setProgressText] = useState('');
  const [activeChapterIdx, setActiveChapterIdx] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const chapters = project.chapters || [];
  const outlines = project.outlines || [];
  const selectedChapter = chapters.find((c) => c.index === selectedIdx);
  const selectedOutline = outlines.find((o) => o.index === selectedIdx);
  const completedCount = chapters.length;
  const remainingCount = outlines.length - completedCount;

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  function closeEventSource() {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }

  async function refreshProject(expectedChapterIndex?: number) {
    let latest = await onUpdate();
    if (expectedChapterIndex == null) return latest;

    for (let attempt = 0; attempt < 5; attempt++) {
      if (latest?.chapters?.some((c) => c.index === expectedChapterIndex)) {
        return latest;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
      latest = await onUpdate();
    }

    return latest;
  }

  function startListening() {
    closeEventSource();

    eventSourceRef.current = subscribeGenerationEvents(project.id, {
      onProgress: (event) => {
        if (event.data.message) setProgressText(event.data.message);
        if (event.data.index) {
          setActiveChapterIdx(event.data.index);
          setSelectedIdx(event.data.index);
        }
      },
      onChapterComplete: (event) => {
        const { index, total } = event.data;
        if (index && total) {
          setProgressText(`第 ${index}/${total} 章已完成，继续生成中...`);
          setActiveChapterIdx(index);
          setSelectedIdx(index);
          void refreshProject(index);
        }
      },
      onError: (event) => {
        setError(event.data.message || '生成失败');
        setGenerating(false);
        setGeneratingAll(false);
        setActiveChapterIdx(null);
        setProgressText('');
        closeEventSource();
      },
      onDone: (event) => {
        setProgressText(event.data.message || '生成完成');
        setGenerating(false);
        setGeneratingAll(false);
        setActiveChapterIdx(null);
        closeEventSource();
        void refreshProject(event.data.index);
      },
    });
  }

  async function handleGenerate(index: number) {
    setGenerating(true);
    setGeneratingAll(false);
    setError('');
    setProgressText(`第 ${index} 章排队中...`);
    setActiveChapterIdx(index);
    startListening();
    try {
      await generateChapter(project.id, index);
      setProgressText(`正在生成第 ${index} 章，请稍候...`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
      setGenerating(false);
      setActiveChapterIdx(null);
      setProgressText('');
      closeEventSource();
    }
  }

  async function handleGenerateAll() {
    setGeneratingAll(true);
    setGenerating(false);
    setError('');
    setProgressText(`准备生成全部 ${outlines.length} 章...`);
    startListening();
    try {
      await generateAllChapters(project.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '批量生成失败');
      setGeneratingAll(false);
      setProgressText('');
      closeEventSource();
    }
  }

  async function handleGenerateRemaining() {
    setGeneratingAll(true);
    setGenerating(false);
    setError('');
    setProgressText(`准备生成剩余 ${remainingCount} 章...`);
    startListening();
    try {
      await generateRemainingChapters(project.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '批量生成失败');
      setGeneratingAll(false);
      setProgressText('');
      closeEventSource();
    }
  }

  async function handleRewrite() {
    if (!feedback.trim()) return;
    setRewriting(true);
    setError('');
    try {
      await rewriteChapter(project.id, selectedIdx, feedback, keepElements);
      setShowRewrite(false);
      setFeedback('');
      setKeepElements('');
      await refreshProject(selectedIdx);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '重写失败');
    } finally {
      setRewriting(false);
    }
  }

  const isBusy = generating || generatingAll;
  const hasPrev = selectedIdx > 1;
  const hasNext = selectedIdx < outlines.length;

  if (outlines.length === 0) {
    return (
      <div className="card text-center py-16 text-gray-500">
        请先在「章纲」Tab 生成章节大纲
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 左侧章节列表 */}
      <aside className="w-full lg:w-60 shrink-0">
        <div className="card p-4 sticky top-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink">章节</h3>
            <span className="text-xs text-gray-400">
              {completedCount}/{outlines.length}
            </span>
          </div>

          <div className="h-1.5 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all"
              style={{
                width: `${outlines.length ? (completedCount / outlines.length) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="space-y-2 mb-4">
            {remainingCount > 0 && (
              <button
                onClick={handleGenerateRemaining}
                disabled={isBusy}
                className="btn-primary w-full text-sm py-2"
              >
                {generatingAll ? '生成中...' : `生成剩余 ${remainingCount} 章`}
              </button>
            )}
            <button
              onClick={handleGenerateAll}
              disabled={isBusy}
              className="btn-secondary w-full text-sm py-2"
            >
              重新生成全部
            </button>
          </div>

          {progressText && (
            <div className="mb-3 rounded-lg bg-gold/10 border border-gold/20 px-3 py-2 text-xs text-amber-900">
              {progressText}
            </div>
          )}

          <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
            {outlines.map((outline) => {
              const chapter = chapters.find((c) => c.index === outline.index);
              const isActive = selectedIdx === outline.index;
              const isGeneratingThis =
                activeChapterIdx === outline.index && isBusy;

              return (
                <button
                  key={outline.index}
                  onClick={() => setSelectedIdx(outline.index)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-gold/15 text-ink font-medium border border-gold/30'
                      : 'text-gray-600 hover:bg-paper-dark'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs">
                      {outline.index}. {outline.title}
                    </span>
                    {isGeneratingThis ? (
                      <span className="shrink-0 w-3 h-3 border border-gold border-t-transparent rounded-full animate-spin" />
                    ) : chapter ? (
                      <span className="shrink-0 text-green-500 text-xs">✓</span>
                    ) : null}
                  </div>
                  {chapter && (
                    <span className="text-xs text-gray-400">
                      {chapter.wordCount} 字
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 右侧阅读区 */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs text-gold-dark font-medium mb-1">
              第 {selectedIdx} 章
            </p>
            <h2 className="text-xl font-semibold text-ink font-serif">
              {selectedOutline?.title}
            </h2>
            {selectedChapter && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedChapter.wordCount} 字 · v{selectedChapter.version}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {selectedChapter && (
              <button
                onClick={() => setShowRewrite(!showRewrite)}
                disabled={isBusy}
                className="btn-secondary text-sm py-1.5"
              >
                重写
              </button>
            )}
            <button
              onClick={() => handleGenerate(selectedIdx)}
              disabled={isBusy}
              className="btn-primary text-sm py-1.5"
            >
              {generating && activeChapterIdx === selectedIdx
                ? '生成中...'
                : selectedChapter
                  ? '重新生成'
                  : '生成本章'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        {showRewrite && (
          <div className="card p-4 mb-4 space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="修改反馈（如：节奏太慢，对话不够犀利...）"
              className="input-field h-20 resize-none text-sm"
            />
            <input
              type="text"
              value={keepElements}
              onChange={(e) => setKeepElements(e.target.value)}
              placeholder="保留要素（如：开头的对手戏、结尾的反转）"
              className="input-field text-sm"
            />
            <button
              onClick={handleRewrite}
              disabled={rewriting || !feedback.trim()}
              className="btn-primary text-sm"
            >
              {rewriting ? '重写中...' : '提交重写'}
            </button>
          </div>
        )}

        {selectedChapter ? (
          <div className="card overflow-hidden">
            <div className="bg-paper px-6 sm:px-10 py-8 sm:py-12 min-h-[400px]">
              <div className="reader-content">{selectedChapter.content}</div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <button
                onClick={() => hasPrev && setSelectedIdx(selectedIdx - 1)}
                disabled={!hasPrev}
                className="btn-secondary text-sm py-1.5 disabled:opacity-30"
              >
                ← 上一章
              </button>
              <span className="text-xs text-gray-400">
                {selectedIdx} / {outlines.length}
              </span>
              <button
                onClick={() => hasNext && setSelectedIdx(selectedIdx + 1)}
                disabled={!hasNext}
                className="btn-secondary text-sm py-1.5 disabled:opacity-30"
              >
                下一章 →
              </button>
            </div>
          </div>
        ) : (
          <div className="card text-center py-20 px-6">
            <div className="text-4xl mb-3">✍️</div>
            <p className="text-gray-500">
              {isBusy
                ? '章节正在后台生成，完成后会自动显示'
                : '本章尚未生成'}
            </p>
            {!isBusy && remainingCount > 0 && (
              <button
                onClick={handleGenerateRemaining}
                className="btn-primary mt-4 text-sm"
              >
                一键生成剩余 {remainingCount} 章
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
