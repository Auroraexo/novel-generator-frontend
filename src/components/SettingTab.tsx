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

  const setting = project.setting as any;

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    try {
      await generateSetting(project.id);
      onUpdate();
    } catch (e: any) {
      setError(e.message || '生成失败');
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
    } catch (e: any) {
      setError('JSON 格式错误: ' + e.message);
    }
  }

  if (!setting) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">尚未生成故事设定</p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {generating ? '生成中...' : '生成故事设定'}
        </button>
        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">编辑设定</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
            >
              保存
            </button>
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
            >
              取消
            </button>
          </div>
        </div>
        {error && <p className="mb-3 text-red-500 text-sm">{error}</p>}
        <textarea
          value={editJson}
          onChange={(e) => setEditJson(e.target.value)}
          className="w-full h-[600px] font-mono text-sm border rounded-lg p-4 resize-none"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">{setting.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={startEdit}
            className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
          >
            编辑
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? '重新生成中...' : '重新生成'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-gray-600 mb-2">{setting.logline}</p>
          <span className="text-sm text-gray-400">基调: {setting.tone}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-medium mb-3">主角</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex"><dt className="w-16 text-gray-500">姓名</dt><dd>{setting.protagonist?.name}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">年龄</dt><dd>{setting.protagonist?.age}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">身份</dt><dd>{setting.protagonist?.identity}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">性格</dt><dd>{setting.protagonist?.personality}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">动机</dt><dd>{setting.protagonist?.motivation}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">缺陷</dt><dd>{setting.protagonist?.flaw}</dd></div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-medium mb-3">对手</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex"><dt className="w-16 text-gray-500">姓名</dt><dd>{setting.antagonist?.name}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">身份</dt><dd>{setting.antagonist?.identity}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">目标</dt><dd>{setting.antagonist?.goal}</dd></div>
              <div className="flex"><dt className="w-16 text-gray-500">关系</dt><dd>{setting.antagonist?.relationship}</dd></div>
            </dl>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-medium mb-3">故事弧线</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-gray-500">开篇钩子</dt><dd className="mt-0.5">{setting.story_arc?.opening_hook}</dd></div>
            <div><dt className="text-gray-500">中段反转</dt><dd className="mt-0.5">{setting.story_arc?.midpoint_twist}</dd></div>
            <div><dt className="text-gray-500">高潮</dt><dd className="mt-0.5">{setting.story_arc?.climax}</dd></div>
            <div><dt className="text-gray-500">结局</dt><dd className="mt-0.5">{setting.story_arc?.resolution}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-medium mb-3">冲突</h3>
          <p className="text-sm"><span className="text-gray-500">核心冲突:</span> {setting.core_conflict}</p>
          <div className="mt-2">
            <span className="text-sm text-gray-500">次要冲突:</span>
            <ul className="list-disc list-inside text-sm mt-1">
              {setting.secondary_conflicts?.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {setting.selling_points && (
          <div className="flex gap-2 flex-wrap">
            {setting.selling_points.map((p: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
