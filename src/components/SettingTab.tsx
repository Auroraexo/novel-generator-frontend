'use client';

import { useState } from 'react';
import { Project, generateSetting, updateSetting } from '@/lib/api';

interface Props {
  project: Project;
  onUpdate: () => void;
}

export default function SettingTab({ project, onUpdate }: Props) {
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editJson, setEditJson] = useState('');
  const [error, setError] = useState('');

  const setting = project.setting as Record<string, unknown> | null;

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      await generateSetting(project.id);
      onUpdate();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setGenerating(false);
    }
  }

  function startEdit() {
    setEditJson(JSON.stringify(setting, null, 2));
    setEditing(true);
  }

  async function handleSave() {
    try {
      const parsed = JSON.parse(editJson);
      await updateSetting(project.id, parsed);
      setEditing(false);
      onUpdate();
    } catch (e: unknown) {
      setError('JSON 格式错误: ' + (e instanceof Error ? e.message : ''));
    }
  }

  if (!setting) {
    return (
      <div className="card text-center py-16 px-6">
        <div className="text-4xl mb-3">🎭</div>
        <p className="text-gray-500 mb-4">尚未生成故事设定</p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary"
        >
          {generating ? '生成中...' : '生成故事设定'}
        </button>
        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  if (editing) {
    return (
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-serif">编辑设定 (JSON)</h2>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary text-sm py-1.5">
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              className="btn-secondary text-sm py-1.5"
            >
              取消
            </button>
          </div>
        </div>
        {error && <p className="mb-3 text-red-500 text-sm">{error}</p>}
        <textarea
          value={editJson}
          onChange={(e) => setEditJson(e.target.value)}
          className="w-full h-[600px] font-mono text-sm border border-gray-200 rounded-lg p-4 resize-none focus:ring-2 focus:ring-gold/30"
        />
      </div>
    );
  }

  const protagonist = setting.protagonist as Record<string, unknown> | undefined;
  const antagonist = setting.antagonist as Record<string, unknown> | undefined;
  const storyArc = setting.story_arc as Record<string, unknown> | undefined;
  const sellingPoints = setting.selling_points as string[] | undefined;
  const secondaryConflicts = setting.secondary_conflicts as string[] | undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold font-serif text-ink">
          {String(setting.title)}
        </h2>
        <div className="flex gap-2">
          <button onClick={startEdit} className="btn-secondary text-sm py-1.5">
            编辑 JSON
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-primary text-sm py-1.5"
          >
            {generating ? '重新生成中...' : '重新生成'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5 border-l-4 border-l-gold">
          <p className="text-gray-700 text-base leading-relaxed">
            {String(setting.logline)}
          </p>
          <span className="inline-block mt-3 text-xs px-2.5 py-1 bg-paper-dark rounded-full text-gray-600">
            基调：{String(setting.tone)}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              主角
            </h3>
            <dl className="space-y-2 text-sm">
              {(
                [
                  ['姓名', protagonist?.name],
                  ['身份', protagonist?.identity],
                  ['性格', protagonist?.personality],
                  ['动机', protagonist?.motivation],
                  ['缺陷', protagonist?.flaw],
                ] as [string, unknown][]
              ).map(([label, val]) => (
                <div key={String(label)} className="flex gap-2">
                  <dt className="w-12 shrink-0 text-gray-400">{label}</dt>
                  <dd className="text-gray-700">{String(val ?? '')}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              对手
            </h3>
            <dl className="space-y-2 text-sm">
              {(
                [
                  ['姓名', antagonist?.name],
                  ['身份', antagonist?.identity],
                  ['目标', antagonist?.goal],
                  ['关系', antagonist?.relationship],
                ] as [string, unknown][]
              ).map(([label, val]) => (
                <div key={String(label)} className="flex gap-2">
                  <dt className="w-12 shrink-0 text-gray-400">{label}</dt>
                  <dd className="text-gray-700">{String(val ?? '')}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-3">故事弧线</h3>
          <dl className="grid sm:grid-cols-2 gap-3 text-sm">
            {(
              [
                ['开篇钩子', storyArc?.opening_hook],
                ['中段反转', storyArc?.midpoint_twist],
                ['高潮', storyArc?.climax],
                ['结局', storyArc?.resolution],
              ] as [string, unknown][]
            ).map(([label, val]) => (
              <div key={String(label)}>
                <dt className="text-gray-400 text-xs mb-0.5">{label}</dt>
                <dd className="text-gray-700">{String(val ?? '')}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-ink mb-2">核心冲突</h3>
          <p className="text-sm text-gray-700">{String(setting.core_conflict)}</p>
          {secondaryConflicts && secondaryConflicts.length > 0 && (
            <ul className="mt-2 space-y-1">
              {secondaryConflicts.map((c, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-300">·</span>
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        {sellingPoints && sellingPoints.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {sellingPoints.map((p, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gold/10 text-gold-dark rounded-full text-sm border border-gold/20"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
