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
  onUpdate: () => void;
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

  function startListening() {
    closeEventSource();

    eventSourceRef.current = subscribeGenerationEvents(project.id, {
      onProgress: (event) => {
        if (event.data.message) {
          setProgressText(event.data.message);
        }
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
        }
        onUpdate();
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
        onUpdate();
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
    } catch (e: any) {
      setError(e.message || '生成失败');
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
    } catch (e: any) {
      setError(e.message || '批量生成失败');
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
    } catch (e: any) {
      setError(e.message || '批量生成失败');
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
      onUpdate();
    } catch (e: any) {
      setError(e.message || '重写失败');
    } finally {
      setRewriting(false);
    }
  }

  const isBusy = generating || generatingAll;

  if (outlines.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        请先生成章纲
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="w-56 shrink-0">
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">章节列表</h3>
            <span className="text-xs text-gray-400">
              {completedCount}/{outlines.length}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {remainingCount > 0 && (
              <button
                onClick={handleGenerateRemaining}
                disabled={isBusy}
                className="w-full px-2 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                {generatingAll ? '生成中...' : `生成剩余 ${remainingCount} 章`}
              </button>
            )}
            <button
              onClick={handleGenerateAll}
              disabled={isBusy}
              className="w-full px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 disabled:opacity-50"
            >
              {generatingAll ? '生成中...' : '重新生成全部'}
            </button>
          </div>
        </div>

        {progressText && (
          <div className="mb-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            {progressText}
          </div>
        )}

        <div className="space-y-1">
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
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">
                    第{outline.index}章 {outline.title}
                  </span>
                  {isGeneratingThis ? (
                    <span className="text-xs text-blue-500 ml-1">...</span>
                  ) : chapter ? (
                    <span className="text-xs text-green-500 ml-1">&#10003;</span>
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              第 {selectedIdx} 章: {selectedOutline?.title}
            </h2>
            {selectedChapter && (
              <span className="text-sm text-gray-500">
                {selectedChapter.wordCount} 字 (v{selectedChapter.version})
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {selectedChapter && (
              <button
                onClick={() => setShowRewrite(!showRewrite)}
                disabled={isBusy}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                重写
              </button>
            )}
            <button
              onClick={() => handleGenerate(selectedIdx)}
              disabled={isBusy}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {generating && activeChapterIdx === selectedIdx
                ? '生成中...'
                : selectedChapter
                  ? '重新生成本章'
                  : '生成本章'}
            </button>
          </div>
        </div>

        {error && <p className="mb-3 text-red-500 text-sm">{error}</p>}

        {showRewrite && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="修改反馈（如：节奏太慢，对话不够犀利...）"
              className="w-full border rounded-lg px-3 py-2 text-sm h-20 resize-none"
            />
            <input
              type="text"
              value={keepElements}
              onChange={(e) => setKeepElements(e.target.value)}
              placeholder="保留要素（如：开头的对手戏、结尾的反转）"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleRewrite}
              disabled={rewriting || !feedback.trim()}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {rewriting ? '重写中...' : '提交重写'}
            </button>
          </div>
        )}

        {selectedChapter ? (
          <div className="bg-white rounded-xl border p-6 prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {selectedChapter.content}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            {isBusy
              ? '章节正在后台生成，完成后会自动显示'
              : '本章尚未生成。建议点击左侧「生成剩余 X 章」一键完成'}
          </div>
        )}
      </div>
    </div>
  );
}
