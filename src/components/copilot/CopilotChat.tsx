import React, { useState, useRef, useEffect } from 'react';
import { CopilotMessage } from '../../types';
import { copilotApi } from '../../services/api';
import {
  Sparkles,
  Send,
  User,
  ShieldCheck,
  FileText,
  CornerDownRight,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'What are our top operational bottlenecks this quarter?',
  'Summarize Q3 cloud expenditure and potential savings',
  'Audit cross-department dependencies for SOC2 Type II certification',
  'Which initiatives are flagged as critical priority across engineering?'
];

export const CopilotChat: React.FC = () => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content:
        'Welcome to Synapse Core Copilot. I am grounded in your enterprise document repository, operational workflows, and active cross-departmental metrics. How can I assist leadership today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
      suggestedFollowUps: [
        'What are our top operational bottlenecks this quarter?',
        'Summarize Q3 cloud expenditure and potential savings'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const data = await copilotApi.query(textToSend.trim());
      const assistantMsg: CopilotMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        confidence: data.confidence,
        suggestedFollowUps: data.suggestedFollowUps
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content:
          'Unable to complete query due to a temporary service disruption. Please ensure documents are indexed or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        content:
          'Conversation refreshed. Ready to synthesize enterprise intelligence across documents and tasks.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [],
        suggestedFollowUps: SUGGESTED_PROMPTS.slice(0, 2)
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Copilot Bar */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white tracking-wide">
                Synapse Core Enterprise Copilot
              </h2>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>RAG Grounded</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Query cross-department metrics, contracts, specifications, and initiatives.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors font-mono"
          title="Clear Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3.5 max-w-3xl ${
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-semibold ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-indigo-400'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`rounded-xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/90 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px] font-mono text-slate-400">
                <span className="font-semibold text-slate-300">
                  {msg.sender === 'user' ? 'Executive Query' : 'Synapse Intelligence'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">{msg.timestamp}</span>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-slate-200 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {/* Grounding Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                    Grounded Reference Sources:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {msg.citations.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
                      >
                        <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{c.title}</span>
                        <span className="text-slate-400">({c.department})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence Metric */}
              {msg.confidence !== undefined && (
                <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span>Confidence:</span>
                  <span className="text-emerald-400 tabular-nums">
                    {Math.round(msg.confidence * 100)}%
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Model: gemini-2.5-flash</span>
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400 block mb-1.5">
                    Suggested Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((promptText, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(promptText)}
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors text-left"
                      >
                        <CornerDownRight className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{promptText}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 max-w-xl">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
              <span>Synthesizing enterprise data across documents and active workflows...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="px-6 py-2.5 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-mono text-slate-400 shrink-0">Quick Queries:</span>
        {SUGGESTED_PROMPTS.map((promptText, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(promptText)}
            className="text-[11px] px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-300 hover:text-white transition-colors whitespace-nowrap shrink-0 font-mono"
          >
            {promptText}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask enterprise copilot (e.g. 'What are our operational risks in Q4?')"
          disabled={loading}
          className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Copilot</span>
        </button>
      </form>
    </div>
  );
};
