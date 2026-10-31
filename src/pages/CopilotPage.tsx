import React from 'react';
import { CopilotChat } from '../components/copilot/CopilotChat';

export const CopilotPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Natural Language Enterprise Copilot
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time synthesis across financial statements, specifications, policies, and cross-department workflows.
          </p>
        </div>
      </div>

      <CopilotChat />
    </div>
  );
};
