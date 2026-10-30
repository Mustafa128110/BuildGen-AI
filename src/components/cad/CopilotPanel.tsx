"use client";

import React, { useState } from "react";
import { CopilotMessage, DraftingDelta } from "@/types/cad";
import { 
  Bot, 
  Send, 
  Paperclip, 
  Mic, 
  CheckCheck, 
  Sparkles, 
  Trash2,
  Terminal,
  Undo2,
  Redo2
} from "lucide-react";

interface CopilotPanelProps {
  messages: CopilotMessage[];
  onSendMessage: (text: string) => void;
  onApplyDelta: (delta: DraftingDelta) => void;
  onClearChat?: () => void;
  isThinking?: boolean;
  isActivePanel?: boolean;
  onMouseEnter?: () => void;
  onUndoChat?: () => void;
  canUndoChat?: boolean;
  onRedoChat?: () => void;
  canRedoChat?: boolean;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({
  messages,
  onSendMessage,
  onApplyDelta,
  onClearChat,
  isThinking = false,
  isActivePanel = false,
  onMouseEnter,
  onUndoChat,
  canUndoChat = false,
  onRedoChat,
  canRedoChat = false,
}) => {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <aside 
      onMouseEnter={onMouseEnter}
      className={`w-96 bg-white border-l border-slate-300 flex flex-col justify-between h-full z-40 shrink-0 select-none transition-colors ${
        isActivePanel ? "ring-1 ring-inset ring-sky-500/30" : ""
      }`}
    >
      {/* Panel Header: CHAT // AI CO-PILOT */}
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-7 h-7 rounded bg-sky-700 text-white flex items-center justify-center font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
              isActivePanel ? "bg-sky-600 animate-ping" : "bg-slate-400"
            }`}></span>
          </div>
          <div>
            <div className="font-sans text-[11px] font-bold text-slate-900 tracking-wider uppercase">
              CHAT // AI CO-PILOT
            </div>
            <div className="font-mono text-[9px] text-amber-800 font-medium flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
              {isActivePanel ? "FOCUS: CHAT [Ctrl+Z to Undo]" : "SCRIPT ENGINE ACTIVE"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Chat Undo / Redo buttons */}
          {onUndoChat && (
            <button
              onClick={onUndoChat}
              disabled={!canUndoChat}
              className={`p-1 border rounded-xs transition-colors ${
                canUndoChat
                  ? "border-slate-300 hover:bg-white text-slate-700 font-bold"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Undo Last Chat Prompt [Ctrl+Z]"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onRedoChat && (
            <button
              onClick={onRedoChat}
              disabled={!canRedoChat}
              className={`p-1 border rounded-xs transition-colors ${
                canRedoChat
                  ? "border-slate-300 hover:bg-white text-slate-700 font-bold"
                  : "border-slate-200 text-slate-300 cursor-not-allowed"
              }`}
              title="Redo Chat Action [Ctrl+Y]"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          )}

          {messages.length > 0 && onClearChat && (
            <button
              onClick={onClearChat}
              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              title="Clear Chat Conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <span className="px-2 py-0.5 bg-white border border-slate-300 font-mono text-[10px] text-sky-700 font-bold shadow-xs">
            BUILDGEN-AI
          </span>
        </div>
      </div>

      {/* Conversation Stream */}
      <div className="flex-1 p-3 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center font-mono text-xs text-slate-500 space-y-3">
            <div className="w-10 h-10 rounded-full bg-sky-50 border border-sky-300 text-sky-700 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div className="font-bold text-slate-800 text-sm font-sans uppercase">
              AI Design Co-Pilot Ready
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed max-w-xs">
              Direct the AI in natural language to add rooms, expand spaces, place doors/windows, or optimize spatial floor plans.
            </p>
            <div className="space-y-1.5 text-[10px] text-slate-500 text-left bg-white border border-slate-200 p-3 w-full shadow-xs">
              <div className="font-bold text-slate-700 text-[10px] mb-1">EXAMPLE DRAFTING PROMPTS:</div>
              <div 
                onClick={() => onSendMessage("Add a 25 sqm Master Bedroom in the top right")}
                className="cursor-pointer hover:text-sky-700 hover:underline"
              >
                • &quot;Add a 25 sqm Master Bedroom in the top right&quot;
              </div>
              <div 
                onClick={() => onSendMessage("Expand the terrace loggia by 1.2m")}
                className="cursor-pointer hover:text-sky-700 hover:underline"
              >
                • &quot;Expand the terrace loggia by 1.2m&quot;
              </div>
              <div 
                onClick={() => onSendMessage("Place an 850mm swing door between living and bedroom")}
                className="cursor-pointer hover:text-sky-700 hover:underline"
              >
                • &quot;Place an 850mm swing door between living and bedroom&quot;
              </div>
              <div 
                onClick={() => onSendMessage("Optimize circulation and calculate total floor area")}
                className="cursor-pointer hover:text-sky-700 hover:underline"
              >
                • &quot;Optimize circulation and calculate total floor area&quot;
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${
                msg.sender === "architect" ? "items-end" : "items-start"
              }`}
            >
              {/* Header info */}
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                {msg.sender === "copilot" && (
                  <span className="text-sky-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-600" />
                    {msg.badge || "AI COPILOT"}
                  </span>
                )}
                {msg.sender === "architect" && (
                  <span className="text-amber-800 font-bold">
                    {msg.badge || "YOU"}
                  </span>
                )}
                <span className="text-[9px]">{msg.timestamp}</span>
              </div>

              {/* Bubble text */}
              <div
                className={`p-2.5 font-mono text-xs leading-relaxed shadow-xs max-w-[95%] ${
                  msg.sender === "architect"
                    ? "bg-sky-50 border border-sky-300 text-slate-900 text-right"
                    : "bg-white border border-slate-200 text-slate-800"
                }`}
              >
                {msg.text}
              </div>

              {/* Proposed drafting delta card */}
              {msg.delta && (
                <div className="w-full mt-2 p-3 bg-white border-2 border-sky-600 space-y-2.5 shadow-md">
                  <div className="flex justify-between items-center font-mono text-[10px] border-b border-slate-200 pb-1">
                    <span className="text-amber-800 font-bold">{msg.delta.title}</span>
                    <span className="text-slate-500">{msg.delta.delta_id}</span>
                  </div>

                  <div className="h-14 bg-slate-50 border border-slate-300 relative overflow-hidden flex items-center justify-center p-2">
                    <div className="w-full h-full border border-dashed border-amber-600 flex flex-col justify-center items-center bg-amber-50/50">
                      <span className="font-mono text-[9px] text-amber-900 font-bold">
                        {msg.delta.description}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono text-[9px]">
                    <div className="flex justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-500">Gross Loggia Area:</span>
                      <span className="text-slate-900 font-bold">
                        {msg.delta.gross_area_delta}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-0.5">
                      <span className="text-slate-500">Bearing Columns:</span>
                      <span className="text-slate-900 font-bold">
                        {msg.delta.bearing_columns_note}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Deflection Check:</span>
                      <span className="text-amber-800 font-bold">
                        {msg.delta.deflection_note}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={msg.delta.applied}
                    onClick={() => msg.delta && onApplyDelta(msg.delta)}
                    className={`w-full py-1.5 font-mono text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                      msg.delta.applied
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300"
                        : "bg-sky-700 hover:bg-sky-600 text-white border border-sky-800 cursor-pointer active:scale-95"
                    }`}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    {msg.delta.applied ? "APPLIED TO SHEET" : msg.delta.action_label}
                  </button>
                </div>
              )}
            </div>
          ))
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 text-slate-500 font-mono text-xs shadow-xs">
            <div className="w-2 h-2 bg-sky-600 rounded-full animate-ping"></div>
            <span>AI Co-Pilot is synthesizing geometry and updating floor plan...</span>
          </div>
        )}
      </div>

      {/* Chat Drafting Command Input Box */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="border border-slate-300 focus-within:border-sky-600 bg-white p-2 transition-all shadow-xs">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-0 text-slate-900 placeholder:text-slate-400 font-mono text-xs focus:ring-0 p-0 resize-none leading-tight outline-none"
            placeholder="Type design instruction (e.g., 'Add a 20 sqm bedroom', 'Clear canvas')..."
            rows={2}
          ></textarea>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200 mt-1">
            <div className="flex items-center gap-1 text-slate-500">
              <button
                type="button"
                onClick={() => alert("Attach architectural DXF / DWG block.")}
                className="p-1 hover:text-sky-700 transition-colors"
                title="Attach DWG/DXF Block"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => alert("Voice dictation listening...")}
                className="p-1 hover:text-sky-700 transition-colors"
                title="Voice Dictation"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[9px] text-slate-500 font-semibold ml-1">
                ORTHO-AI
              </span>
            </div>
            {/* Run Script / Send Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="px-2.5 py-1 bg-sky-700 text-white font-mono text-[10px] font-bold tracking-wider hover:bg-sky-600 transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>SEND</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
