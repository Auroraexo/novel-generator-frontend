'use client';

import { Suspense } from 'react';
import ProjectPageClient from './ProjectPageClient';

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-gray-500">加载项目...</p>
    </div>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProjectPageClient />
    </Suspense>
  );
}
