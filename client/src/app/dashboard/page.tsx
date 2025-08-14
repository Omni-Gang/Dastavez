'use client';

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { history, undo, redo } from "prosemirror-history";
import { ySyncPlugin, yCursorPlugin, yUndoPlugin } from "y-prosemirror";
import ThemeToggleButton from '@/components/ThemeToggleButton';
import "prosemirror-view/style/prosemirror.css";
import { Users, FileText, Undo2, Redo2, Download, Share2 } from "lucide-react";

interface ConnectedUser {
  name: string;
  color: string;
  cursor?: number;
}

// Functions for cursor, selection, and title remain the same
const generateRandomName = () => {
  const adjectives = ["Smart", "Creative", "Brilliant", "Quick", "Clever"];
  const animals = ["Fox", "Eagle", "Wolf", "Lion", "Bear"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${adj} ${animal}`;
};
const generateRandomColor = () => {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
function buildCursor(user: any) {
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  cursor.style.borderLeft = `2px solid ${user.color}`;
  cursor.style.position = "relative";
  cursor.style.marginLeft = "-1px";
  cursor.style.height = "1.2em";
  cursor.style.display = "inline-block";

  const label = document.createElement("div");
  label.textContent = user.name;
  label.style.position = "absolute";
  label.style.top = "-25px";
  label.style.backgroundColor = user.color;
  label.style.color = "white";
  label.style.padding = "2px 6px";
  label.style.borderRadius = "3px";
  label.style.fontSize = "12px";
  label.style.whiteSpace = "nowrap";
  label.style.pointerEvents = "none";
  label.style.zIndex = "1000";

  cursor.appendChild(label);
  return cursor;
}
function buildSelection(user: any) {
  return { style: `background-color: ${user.color}20` };
}
function updateCursorPosition(view: EditorView, provider: WebsocketProvider) {
  const { from } = view.state.selection;
  provider.awareness.setLocalStateField("cursor", { anchor: from });
}
function getTitleFromMap(map: Y.Map<any>): string {
  return String(map.get("title") || "Untitled Document");
}

export default function Dashboard() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<Map<number, ConnectedUser>>(new Map());
  const [docTitle, setDocTitle] = useState("Untitled Document");
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const metadataMapRef = useRef<Y.Map<any> | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200];

  const handleUndo = () => { if (viewRef.current) undo(viewRef.current.state, viewRef.current.dispatch); };
  const handleRedo = () => { if (viewRef.current) redo(viewRef.current.state, viewRef.current.dispatch); };
  const handleShare = async () => {
    const url = window.location.href;
    try { await navigator.clipboard.writeText(url); alert("Document URL copied!"); } 
    catch (err) { console.error("Failed to copy URL:", err); }
  };
  const handleExport = () => {
    if (viewRef.current) {
      const content = viewRef.current.state.doc.textContent;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Yjs + ProseMirror initialization (same as your code)
  useEffect(() => {
    if (!editorRef.current) return;

    const ydoc = new Y.Doc();
    const roomName = window.location.pathname.slice(1) || "default-room";
    const provider = new WebsocketProvider("ws://localhost:1234", roomName, ydoc);
    const yXmlFragment = ydoc.getXmlFragment("prosemirror");
    const metadataMap = ydoc.getMap("metadata");
    metadataMapRef.current = metadataMap;

    const userName = generateRandomName();
    const userColor = generateRandomColor();

    provider.awareness.setLocalStateField("user", { name: userName, color: userColor, cursor: null });
    provider.on("status", ({ status }: { status: string }) => setIsConnected(status === "connected"));
    provider.awareness.on("change", () => {
      const states = provider.awareness.getStates();
      const users = new Map<number, ConnectedUser>();
      states.forEach((state, clientId) => {
        if (state.user && clientId !== provider.awareness.clientID) {
          users.set(clientId, { name: state.user.name, color: state.user.color, cursor: state.cursor?.anchor });
        }
      });
      setConnectedUsers(users);
      setUserCount(states.size);
    });

    const view = new EditorView(editorRef.current, {
      state: EditorState.create({
        schema: new Schema({
          nodes: {
            doc: { content: "block+" },
            paragraph: { group: "block", content: "inline*", attrs: { align: { default: null } }, parseDOM: [{ tag: "p" }], toDOM(node){ const attrs:any={}; if(node.attrs.align) attrs.style=`text-align:${node.attrs.align}`; return ["p", attrs, 0]; } },
            heading: { group: "block", content: "inline*", attrs: { level: { default: 1 } }, defining:true, parseDOM:[{ tag:"h1", attrs:{level:1} }, { tag:"h2", attrs:{level:2} }, { tag:"h3", attrs:{level:3} }], toDOM(node){ return [`h${node.attrs.level}`, 0]; } },
            text: { group: "inline" },
          },
          marks: {
            strong: { parseDOM:[{ tag:"strong" }, { tag:"b" }], toDOM:()=>["strong",0] },
            em: { parseDOM:[{ tag:"i" }, { tag:"em" }], toDOM:()=>["em",0] },
            underline: { parseDOM:[{ tag:"u" }], toDOM:()=>["u",0] },
          },
        }),
        plugins: [ ySyncPlugin(yXmlFragment), yCursorPlugin(provider.awareness, { cursorBuilder: buildCursor, selectionBuilder: buildSelection }), yUndoPlugin(), history(), keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo }), keymap(baseKeymap) ],
      }),
      attributes: { class: "ProseMirror-focused", spellcheck: "true" },
      handleKeyDown: (view, event) => { setTimeout(()=>updateCursorPosition(view, provider),0); return false; },
      handleClick: (view) => { updateCursorPosition(view, provider); return false; },
    });

    viewRef.current = view;
    view.focus();

    return () => { view.destroy(); provider.destroy(); ydoc.destroy(); };
  }, []);

  useEffect(() => {
    const map = metadataMapRef.current;
    if (!map) return;
    setDocTitle(getTitleFromMap(map));
    const observer = (event: Y.YMapEvent<any>) => {
      if(event.keysChanged.has("title")) setDocTitle(getTitleFromMap(map));
    };
    map.observe(observer);
    return () => { map.unobserve(observer); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500">
      
      {/* Header */}
      <div className="backdrop-blur-md bg-white/10 dark:bg-gray-800/50 border-b border-white/10 dark:border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-blue-400" />
              <input
                type="text"
                value={docTitle}
                onChange={(e) => { const newTitle = e.target.value; setDocTitle(newTitle); metadataMapRef.current?.set("title", newTitle); }}
                className="text-lg font-semibold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-300 focus:ring-2 focus:ring-blue-500 px-2 py-1 rounded transition-colors"
                placeholder="Untitled Document"
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
              <span className="text-sm text-gray-500 dark:text-gray-300">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button onClick={handleUndo} className="p-2 hover:bg-white/20 dark:hover:bg-gray-700 rounded-full transition-colors" title="Undo"><Undo2 className="w-4 h-4" /></button>
              <button onClick={handleRedo} className="p-2 hover:bg-white/20 dark:hover:bg-gray-700 rounded-full transition-colors" title="Redo"><Redo2 className="w-4 h-4" /></button>
              <div className="w-px h-6 bg-white/20 dark:bg-gray-700 mx-2" />
              <button onClick={handleExport} className="p-2 hover:bg-white/20 dark:hover:bg-gray-700 rounded-full transition-colors" title="Export"><Download className="w-4 h-4" /></button>
              <select value={zoomLevel} onChange={(e)=>setZoomLevel(parseInt(e.target.value))} className="text-sm border border-white/20 dark:border-gray-600 bg-white/10 dark:bg-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" title="Zoom">
                {ZOOM_LEVELS.map(z => <option key={z} value={z} className="bg-gray-900 dark:bg-gray-700">{z}%</option>)}
              </select>
              <button onClick={handleShare} className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors shadow-md"><Share2 className="w-4 h-4" /><span>Share</span></button>
              <ThemeToggleButton />
            </div>

            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              <span className="text-sm text-gray-500 dark:text-gray-300">{userCount}</span>
              <div className="flex -space-x-2">
                {Array.from(connectedUsers.values()).slice(0,3).map((user, index) => (
                  <div key={index} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium" style={{ backgroundColor: user.color }} title={user.name}>
                    {user.name.charAt(0)}
                  </div>
                ))}
                {connectedUsers.size > 3 && <div className="w-8 h-8 bg-gray-500 dark:bg-gray-700 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-medium">+{connectedUsers.size - 3}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white/5 dark:bg-gray-800/20 shadow-2xl rounded-xl min-h-[800px] overflow-hidden border border-white/10 dark:border-gray-700 transition-colors">
          <div ref={editorRef} className="prosemirror-editor text-gray-900 dark:text-gray-100" style={{ minHeight:"800px", padding:"96px", lineHeight:"1.6", fontSize:"14px", fontFamily:"Arial, sans-serif", outline:"none", maxWidth:"100%", wordWrap:"break-word", transform:`scale(${zoomLevel/100})`, transformOrigin:"top left" }} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror { outline:none !important; border:none !important; min-height:800px; word-wrap:break-word; overflow-wrap:break-word; white-space:pre-wrap; }
        .ProseMirror p { margin:0 0 12px 0; line-height:1.5; }
        .ProseMirror h1,h2,h3 { font-weight:bold; margin:16px 0 12px 0; }
        .ProseMirror h1 { font-size:24px; }
        .ProseMirror h2 { font-size:20px; }
        .ProseMirror h3 { font-size:16px; }
        .ProseMirror-focused { outline:none !important; }
        .cursor { animation: blink 1s infinite; }
        @keyframes blink { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
      `}</style>
    </div>
  );
}
