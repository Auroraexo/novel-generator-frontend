'use client';

import { useState } from 'react';
import { createProject, generateInspiration } from '@/lib/api';
import { estimateGenerationMinutes } from '@/lib/project-utils';

interface Props {
  onClose: () => void;
}

const GENRES = [
  '言情/古言/总裁',
  '悬疑/推理/惊悚',
  '玄幻/仙侠/奇幻',
  '都市/现代',
];

export default function CreateProjectWizard({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [genre, setGenre] = useState('都市/现代');
  const [subgenre, setSubgenre] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [targetChapters, setTargetChapters] = useState(12);
  const [targetWords, setTargetWords] = useState(2000);
  const [inspirations, setInspirations] = useState<string[]>([]);
  const [generatingInsp, setGeneratingInsp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const estimate = estimateGenerationMinutes(targetChapters, targetWords);

  async function handleGenerateInspiration() {
    if (!subgenre.trim()) return;
    setGeneratingInsp(true);
    try {
      const list = await generateInspiration(genre, subgenre);
      setInspirations(list);
    } finally {
      setGeneratingInsp(false);
    }
  }

  async function handleCreate() {
    setSubmitting(true);
    try {
      const project = await createProject({
        genre,
        subgenre,
        inspiration,
        targetChapters,
        targetWords,
      });
      window.location.href = `/project/${project.id}`;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/60 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg shadow-card-hover">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold font-serif">创建新项目</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  s <= step ? 'bg-gold' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            步骤 {step}/3：{step === 1 ? '选择题材' : step === 2 ? '填写灵感' : '设定篇幅'}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4 min-h-[280px]">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-ink-light mb-1.5">
                  题材
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={`px-3 py-2.5 rounded-lg text-sm text-left border transition ${
                        genre === g
                          ? 'border-gold bg-gold/10 text-ink font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-light mb-1.5">
                  子类型
                </label>
                <input
                  type="text"
                  value={subgenre}
                  onChange={(e) => setSubgenre(e.target.value)}
                  placeholder="如：总裁追妻、密室杀人、修仙升级..."
                  className="input-field"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-ink-light">
                    一句话灵感
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateInspiration}
                    disabled={generatingInsp || !subgenre.trim()}
                    className="text-xs text-gold-dark hover:text-gold disabled:opacity-50"
                  >
                    {generatingInsp ? 'AI 生成中...' : '✨ AI 生成灵感'}
                  </button>
                </div>
                <textarea
                  value={inspiration}
                  onChange={(e) => setInspiration(e.target.value)}
                  placeholder="描述你的故事核心创意，或点击 AI 生成"
                  className="input-field h-24 resize-none"
                />
              </div>
              {inspirations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">点击选用：</p>
                  {inspirations.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setInspiration(item);
                        setInspirations([]);
                      }}
                      className="block w-full text-left text-sm px-3 py-2.5 rounded-lg bg-paper-dark hover:bg-gold/10 border border-transparent hover:border-gold/30 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-ink-light mb-2">
                  章节数：{targetChapters} 章
                </label>
                <input
                  type="range"
                  min={5}
                  max={20}
                  value={targetChapters}
                  onChange={(e) => setTargetChapters(parseInt(e.target.value))}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5 章</span>
                  <span>20 章</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-light mb-2">
                  每章字数：{targetWords} 字
                </label>
                <input
                  type="range"
                  min={1000}
                  max={5000}
                  step={500}
                  value={targetWords}
                  onChange={(e) => setTargetWords(parseInt(e.target.value))}
                  className="w-full accent-gold"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1000 字</span>
                  <span>5000 字</span>
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
                <span className="font-medium">预计生成耗时：</span>
                {estimate}
                <p className="text-xs text-amber-600 mt-1">
                  含设定、章纲、全部正文，实际时间取决于 AI 速度
                </p>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="btn-secondary flex-1"
            >
              上一步
            </button>
          ) : (
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              取消
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !subgenre.trim() : !inspiration.trim()}
              className="btn-primary flex-1"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? '创建中...' : '创建并开始 →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
