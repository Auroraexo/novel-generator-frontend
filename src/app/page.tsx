'use client';

import { useState, useEffect } from 'react';
import { fetchProjects, createProject, deleteProject, generateInspiration, Project } from '@/lib/api';

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [genre, setGenre] = useState('都市/现代');
  const [subgenre, setSubgenre] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [targetChapters, setTargetChapters] = useState(12);
  const [targetWords, setTargetWords] = useState(2000);
  const [inspirations, setInspirations] = useState<string[]>([]);
  const [generatingInsp, setGeneratingInsp] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const project = await createProject({
      genre,
      subgenre,
      inspiration,
      targetChapters,
      targetWords,
    });
    setShowForm(false);
    window.location.href = `/project/${project.id}`;
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除此项目？')) return;
    await deleteProject(id);
    setProjects(projects.filter((p) => p.id !== id));
  }

  const statusMap: Record<string, string> = {
    draft: '草稿',
    setting: '已生成设定',
    outline: '已生成大纲',
    writing: '正在生成',
    done: '已完成',
  };

  const statusColor: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    setting: 'bg-blue-100 text-blue-700',
    outline: 'bg-yellow-100 text-yellow-700',
    writing: 'bg-purple-100 text-purple-700',
    done: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">加载中...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">我的项目</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          新建项目
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold">创建新项目</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                题材
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="言情/古言/总裁">言情/古言/总裁</option>
                <option value="悬疑/推理/惊悚">悬疑/推理/惊悚</option>
                <option value="玄幻/仙侠/奇幻">玄幻/仙侠/奇幻</option>
                <option value="都市/现代">都市/现代</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                子类型
              </label>
              <input
                type="text"
                value={subgenre}
                onChange={(e) => setSubgenre(e.target.value)}
                placeholder="如：总裁追妻、密室杀人、修仙升级..."
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  一句话灵感
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!subgenre.trim()) return;
                    setGeneratingInsp(true);
                    try {
                      const list = await generateInspiration(genre, subgenre);
                      setInspirations(list);
                    } catch {} finally {
                      setGeneratingInsp(false);
                    }
                  }}
                  disabled={generatingInsp || !subgenre.trim()}
                  className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  {generatingInsp ? 'AI 生成中...' : 'AI 生成'}
                </button>
              </div>
              <textarea
                value={inspiration}
                onChange={(e) => setInspiration(e.target.value)}
                placeholder="描述你的故事核心创意，或点击右上角 AI 生成"
                className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
                required
              />
              {inspirations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {inspirations.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setInspiration(item); setInspirations([]); }}
                      className="block w-full text-left text-sm px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-gray-700 transition"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  章节数
                </label>
                <input
                  type="number"
                  value={targetChapters}
                  onChange={(e) => setTargetChapters(parseInt(e.target.value))}
                  min={5}
                  max={20}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  每章字数
                </label>
                <input
                  type="number"
                  value={targetWords}
                  onChange={(e) => setTargetWords(parseInt(e.target.value))}
                  min={1000}
                  max={5000}
                  step={500}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                创建
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">还没有项目</p>
          <p className="mt-1">点击「新建项目」开始创作</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {(project.setting as any)?.title || project.subgenre}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {project.genre}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${statusColor[project.status] || statusColor.draft}`}
                >
                  {statusMap[project.status] || project.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {project.inspiration}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {project.targetChapters} 章 / {project.targetWords} 字每章
                </span>
                <div className="flex gap-2">
                  <a
                    href={`/project/${project.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    打开
                  </a>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
