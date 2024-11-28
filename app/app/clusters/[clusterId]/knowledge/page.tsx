"use client";

import { KnowledgeQuickstart } from "@/components/knowledge-quickstart";

export default function KnowledgeOverview() {
  return (
    <div className="flex items-start justify-start h-full">
      <div className="max-w-3xl w-full">
        <KnowledgeQuickstart />
      </div>
    </div>
  );
}
