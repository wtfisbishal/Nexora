'use client'
import { toastSuccess } from '@/lib/toast';
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap';
import { useGetModels } from '@/hooks/useModel';

type Chatbot = {
  id: string;
  collection_name: string | null;
  [key: string]: any;
};

type WidgetConfig = {
  buttonLabel: string;
  buttonColor: string;
  buttonTextColor: string;
  buttonPosition: 'right' | 'left';
  buttonBorderRadius: number;
  windowWidth: number;
  windowHeight: number;
  welcomeMessage: string;
  headerTitle: string;
  primaryColor: string;
  theme: 'light' | 'dark';
};

const defaultConfig: WidgetConfig = {
  buttonLabel: 'Ask AI 💬',
  buttonColor: '#476100',
  buttonTextColor: '#ffffff',
  buttonPosition: 'right',
  buttonBorderRadius: 14,
  windowWidth: 400,
  windowHeight: 500,
  welcomeMessage: 'Hello! How can I assist you today?',
  headerTitle: 'Nexora AI',
  primaryColor: '#476100',
  theme: 'light',
};

const ScriptsPage = () => {
  const [generatedScript, setGeneratedScript] = useState<string>('');
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [frameworkTab, setFrameworkTab] = useState<'html' | 'react' | 'next' | 'vue' | 'astro'>('html');
  const [frameworkCopied, setFrameworkCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { data:chatbots, isLoading   } = useGetModels()
  

   useEffect(() => {
    if (!selectedChatbot) return;
    buildScript();
   }, [config, selectedChatbot]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = chatbots?.res && chatbots?.res.find((c: any) => c.collection_name === e.target.value);
    setSelectedChatbot(selected || null);
  };

  const buildScript = () => {
    if (!selectedChatbot) return;
    const script = `<script
  id="Nexora-widget"
  src="https://nexora.bishal.online/widget.js"
  data-server-url="https://nexora.bishal.online"
  data-site-id="${selectedChatbot.collection_name}"
  data-unique-id="${selectedChatbot.id}"
  data-welcome-message="${config.welcomeMessage}"
  data-header-title="${config.headerTitle}"
  data-button-label="${config.buttonLabel}"
  data-button-color="${config.buttonColor}"
  data-button-text-color="${config.buttonTextColor}"
  data-button-position="${config.buttonPosition}"
  data-button-border-radius="${config.buttonBorderRadius}"
  data-window-width="${config.windowWidth}"
  data-window-height="${config.windowHeight}"
  data-primary-color="${config.primaryColor}"
  data-theme="${config.theme}"
></script>`;
    setGeneratedScript(script);
  };

  const handleGenerate = () => {
    buildScript();
  };

  const set = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  async function copyTextToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toastSuccess('Script copied to clipboard!');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { }
  }

  // Preview mock messages
  const previewMessages = [
    { role: 'assistant', content: config.welcomeMessage },
    { role: 'user', content: 'What can you help me with?' },
    { role: 'assistant', content: 'I can answer questions from your knowledge base!' },
  ];

  const isDark = config.theme === 'dark';
  const windowBg = isDark ? '#141424' : '#f8f9fa';
  const chatBg = isDark ? '#192034' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1a202c';
  const subTextColor = isDark ? '#94a3b8' : '#6b7280';
  const inputBg = isDark ? '#2d3a4a' : '#f1f5f9';


  useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".dash-reveal",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }
    );
    gsap.fromTo(
      ".dash-card",
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        delay: 0.28,
        ease: "power2.out",
      }
    );
  }, root);
  return () => ctx.revert();
}, []);

  return (
    <div ref={root} className="min-h-screen max-w-[1500px] mx-auto" style={{ fontFamily: 'Inter, Arial, sans-serif' }}>
      {/* Header */}
      <section className="dash-hero -mt-">
        <div className="dash-reveal">
          <h1 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'>Widget Customizer</h1>
          <p>Customize your AI chatbot widget, preview it live, then copy the embed script.</p>
        </div>
      </section>


       <div className="flex  gap-5 min-h-[680px]" style={{ alignItems: 'flex-start' }}>

         <div
          className="flex bg-[#EFF8D2]! dash-reveal rounded-3xl!  dash-card flex-col gap-4 shrink-0"
          style={{ width: '280px', minWidth: '260px' }}
        >
           <div className="card  rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Chatbot</p>
            <select
              onChange={handleSelectChange}
              className="w-full border-2 bordercolor outline-none px-3 py-2 rounded-xl text-sm bg-transparent"
            >
              <option value="">Select Chatbot</option>
              {chatbots?.res?.map((chatbot: Chatbot, index: number) => (
                <option key={index} value={chatbot.collection_name || ""}>
                  {chatbot.name ? chatbot.name : chatbot.collection_name}
                </option>
              ))}
            </select>
          </div>

           <div className="card rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Button</p>

            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Label</span>
              <input
                type="text"
                maxLength={20}
                value={config.buttonLabel}
                onChange={(e) => set('buttonLabel', e.target.value)}
                className="w-full border-2 bordercolor outline-none px-3 py-2 rounded-xl text-sm bg-transparent"
              />
            </label>

            <div className="flex gap-3 mb-3">
              <label className="flex-1">
                <span className="text-xs text-gray-500 mb-1 block">BG Color</span>
                <div className="flex items-center gap-2 border-2 bordercolor rounded-xl px-2 py-1.5">
                  <input
                    type="color"
                    value={config.buttonColor}
                    onChange={(e) => set('buttonColor', e.target.value)}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{config.buttonColor}</span>
                </div>
              </label>
              <label className="flex-1">
                <span className="text-xs text-gray-500 mb-1 block">Text Color</span>
                <div className="flex items-center gap-2 border-2 bordercolor rounded-xl px-2 py-1.5">
                  <input
                    type="color"
                    value={config.buttonTextColor}
                    onChange={(e) => set('buttonTextColor', e.target.value)}
                    className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono">{config.buttonTextColor}</span>
                </div>
              </label>
            </div>

            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Position</span>
              <div className="flex gap-2">
                {(['right', 'left'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => set('buttonPosition', pos)}
                    className="flex-1 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                    style={{
                      background: config.buttonPosition === pos ? config.primaryColor : 'transparent',
                      color: config.buttonPosition === pos ? '#fff' : '#6b7280',
                      border: `2px solid ${config.buttonPosition === pos ? config.primaryColor : '#e5e7eb'}`,
                    }}
                  >
                    {pos === 'right' ? '→ Right' : '← Left'}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Border Radius: {config.buttonBorderRadius}px</span>
              <input
                type="range" min={0} max={30} step={1}
                value={config.buttonBorderRadius}
                onChange={(e) => set('buttonBorderRadius', parseInt(e.target.value))}
                className="w-full accent-[#bed96d] text-[#293A30] "
              />
            </label>
          </div>

           <div className="card rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Chat Window</p>

            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Header Title</span>
              <input
                type="text"
                value={config.headerTitle}
                onChange={(e) => set('headerTitle', e.target.value)}
                maxLength={20}
                className="w-full border-2 bordercolor outline-none px-3 py-2 rounded-xl text-sm bg-transparent"
              />
            </label>

            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Welcome Message</span>
              <textarea
                value={config.welcomeMessage}
                onChange={(e) => set('welcomeMessage', e.target.value)}
                rows={2}
                className="w-full border-2 bordercolor outline-none px-3 py-2 rounded-xl text-sm bg-transparent resize-none"
              />
            </label>

            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Primary Color</span>
              <div className="flex items-center gap-2 border-2 bordercolor rounded-xl px-2 py-1.5">
                <input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => set('primaryColor', e.target.value)}
                  className="w-7 h-7 rounded-lg border-none cursor-pointer bg-transparent"
                />
                <span className="text-xs font-mono">{config.primaryColor}</span>
              </div>
            </label>

            <div className="flex gap-3 mb-3">
              <label className="flex-1">
                <span className="text-xs text-gray-500 mb-1 block">Width: {config.windowWidth}px</span>
                <input
                  type="range" min={300} max={550} step={10}
                  value={config.windowWidth}
                  onChange={(e) => set('windowWidth', parseInt(e.target.value))}
                  className="w-full accent-[#bed96d] text-[#293A30] "
                />
              </label>
              <label className="flex-1">
                <span className="text-xs text-gray-500 mb-1 block">Height: {config.windowHeight}px</span>
                <input
                  type="range" min={350} max={700} step={10}
                  value={config.windowHeight}
                  onChange={(e) => set('windowHeight', parseInt(e.target.value))}
                  className="w-full accent-[#bed96d] text-[#293A30] "
                />
              </label>
            </div>

            <label className="block ">
              <span className="text-xs text-gray-500 mb-2 block">Theme</span>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => set('theme', t)}
                    className="flex-1  py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                    style={{
                      background: config.theme === t ? config.primaryColor : 'transparent',
                      color: config.theme === t ? '#293A30' : '#6b7280',
                      border: `2px solid ${config.theme === t ? config.primaryColor : '#e5e7eb'}`,
                    }}
                  >
                    {t === 'light' ? '☀ Light' : '🌙 Dark'}
                  </button>
                ))}
              </div>
            </label>
          </div>

           <button
            onClick={handleGenerate}
            disabled={!selectedChatbot}
            className="buttonbg px-4 py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            ✦ Generate Script
          </button>
        </div>

         <div className="flex-1 min-w-0">
          <div className="card dash-reveal rounded-3xl p-5 pt-0 h-full min-h-[600px] relative overflow-hidden">
            <p className="text-xs text-center font-semibold uppercase tracking-widest text-gray-400 mb-2">Live Preview</p>

             <div
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ background: '#f1f3f4', border: '1px solid #e0e0e0' }}
            >
               <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#e8eaed', borderBottom: '1px solid #d5d7da' }}>
                <span className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#febc2e' }} />
                <span className="w-3 h-3 rounded-full" style={{ background: '#27c840' }} />
                <div className="flex-1 mx-4 bg-white rounded-full text-center px-3 py-1.5 text-xs text-gray-400 font-mono">
                  yourwebsite.com
                </div>
              </div>

               <div className="relative" style={{ height: '540px', background: windowBg, overflow: 'hidden' }}>
                 <div className="p-8">
                  <div className="h-5 rounded-full mb-3 w-3/4" style={{ background: isDark ? '#2d3748' : '#e2e8f0' }} />
                  <div className="h-4 rounded-full mb-2 w-full" style={{ background: isDark ? '#2d3748' : '#e2e8f0' }} />
                  <div className="h-4 rounded-full mb-2 w-5/6" style={{ background: isDark ? '#2d3748' : '#e2e8f0' }} />
                  <div className="h-4 rounded-full mb-6 w-4/6" style={{ background: isDark ? '#2d3748' : '#e2e8f0' }} />
                  <div className="h-4 rounded-full mb-2 w-full" style={{ background: isDark ? '#2d3748' : '#e2e8f0' }} />
                  <div className="h-4 rounded-full mb-2 w-3/4" style={{ background: isDark ? '#2d3748' : '#e2e8f0' }} />
                  <div className="h-4 rounded-full w-5/6" style={{ background: isDark ? '#2d3748' : '#e2e8f0' }} />
                </div>

                 {isChatOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '70px',
                      [config.buttonPosition]: '16px',
                      width: `${Math.min(config.windowWidth * 0.65, 300)}px`,
                      height: `${Math.min(config.windowHeight * 0.6, 340)}px`,
                      borderRadius: '16px',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                      background: chatBg,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      border: isDark ? '1px solid #2d3748' : '1px solid #e5e7eb',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                     <div
                      style={{
                        background: `linear-gradient(135deg, ${config.primaryColor}dd, ${config.primaryColor})`,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className=' '
                          style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px',
                          }}
                        > <img src="/logo2.png" className=" w-full h-full object-cover" alt="" />  </div>
                        <div>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: '12px', margin: 0 }}>{config.headerTitle}</p>
                          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', margin: 0 }}>● Online</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >✕</button>
                    </div>

                     <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {previewMessages.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div
                            style={{
                              maxWidth: '80%',
                              padding: '7px 11px',
                              borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                              background: msg.role === 'user' ? `${config.primaryColor}cc` : isDark ? '#2d3748' : '#f1f5f9',
                              color: msg.role === 'user' ? '#fff' : textColor,
                              fontSize: '10px',
                              lineHeight: '1.5',
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>

                     <div
                      style={{
                        padding: '8px 10px',
                        borderTop: isDark ? '1px solid #2d3748' : '1px solid #e5e7eb',
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        background: inputBg,
                      }}
                    >
                      <div style={{ flex: 1, background: chatBg, border: isDark ? '1px solid #4a5568' : '1px solid #e5e7eb', borderRadius: '20px', padding: '6px 12px', fontSize: '10px', color: subTextColor }}>
                        Ask me anything...
                      </div>
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${config.primaryColor}, ${config.primaryColor}bb)`,
                          borderRadius: '50%', width: '26px', height: '26px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '11px', cursor: 'pointer',
                        }}
                      >➤</div>
                    </div>

                     
                    <div style={{ textAlign: 'center', padding: '4px', fontSize: '8px', color: subTextColor }}>
                      Powered by <span style={{ color: config.primaryColor, fontWeight: 700 }}>Nexora AI</span>
                    </div>
                  </div>
                )}
 
                <div
                  onClick={() => setIsChatOpen((v) => !v)}
                  style={{
                    position: 'absolute',
                    bottom: '16px',
                    [config.buttonPosition]: '16px',
                    backgroundColor: config.buttonColor,
                    color: config.buttonTextColor,
                    borderRadius: `${config.buttonBorderRadius}px`,
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: `0 4px 20px ${config.buttonColor}60`,
                    transition: 'all 0.3s ease',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isChatOpen ? '✕ Close' : config.buttonLabel}
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-3">
              Click the button in the preview to toggle the chat window
            </p>
          </div>
        </div>

          {/* ── Install Code Panel ─────────────────────────────────────── */}
          {(() => {
            const FW = [
              { id: 'html',  label: 'HTML',    icon: '🌐' },
              { id: 'react', label: 'React',   icon: '⚛️' },
              { id: 'next',  label: 'Next.js', icon: '▲'  },
              { id: 'vue',   label: 'Vue',     icon: '💚' },
              { id: 'astro', label: 'Astro',   icon: '🚀' },
            ] as const;

            const hints: Record<typeof frameworkTab, string> = {
              html:  'Paste before the closing </body> tag.',
              react: 'Add <NexoraWidget /> to your root layout.',
              next:  'Place in app/layout.tsx — loads after interactive.',
              vue:   'Add to App.vue — mounts after component is ready.',
              astro: 'Add to Layout.astro so it loads on every page.',
            };

            /** Parse script attributes into { attr, val }[] */
            const parseAttrs = (src: string) =>
              src.split('\n').filter(l => l.includes('=')).map(l => {
                const eq = l.indexOf('=');
                return { attr: l.substring(0, eq).trim(), val: l.substring(eq + 1).trim() };
              });

            const snippets: Record<typeof frameworkTab, string> = {
              html: generatedScript
                ? `<!-- Paste before </body> -->\n${generatedScript}`
                : '',

              react: generatedScript ? `// components/NexoraWidget.tsx
'use client';
import { useEffect } from 'react';

export default function NexoraWidget() {
  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://nexora.bishal.online/widget.js';
    ${parseAttrs(generatedScript).map(({ attr, val }) => `s.setAttribute('${attr}', ${val});`).join('\n    ')}
    document.body.appendChild(s);
  }, []);
  return null;
}` : '',

              next: generatedScript ? `// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html><body>
      {children}
      <Script
        ${parseAttrs(generatedScript).map(({ attr, val }) => `${attr}={${val}}`).join('\n        ')}
        strategy="afterInteractive"
      />
    </body></html>
  );
}` : '',

              vue: generatedScript ? `<!-- App.vue -->
<script setup>
import { onMounted } from 'vue';
onMounted(() => {
  const s = document.createElement('script');
  s.src = 'https://nexora.bishal.online/widget.js';
  ${parseAttrs(generatedScript).map(({ attr, val }) => `s.setAttribute('${attr}', ${val});`).join('\n  ')}
  document.body.appendChild(s);
});
<\/script>

<template><div id="app"><RouterView /></div></template>` : '',

              astro: generatedScript ? `---
// src/layouts/Layout.astro
---
<html>
  <body>
    <slot />
    ${generatedScript.replace(/\n/g, '\n    ')}
  </body>
</html>` : '',
            };

            const activeSnippet = snippets[frameworkTab];

            const copySnippet = async () => {
              if (!activeSnippet) return;
              await navigator.clipboard.writeText(activeSnippet);
              setFrameworkCopied(true);
              setTimeout(() => setFrameworkCopied(false), 2000);
            };

            /** Minimal syntax highlighter */
            const highlight = (code: string) =>
              code.split('\n').map((line, i) => {
                const t = line.trim();
                if (t.startsWith('//') || t.startsWith('<!--') || t.startsWith('---'))
                  return <div key={i} style={{ color: '#6a9955' }}>{line}{'\n'}</div>;
                if (t.startsWith('<') || t.startsWith('>'))
                  return <div key={i} style={{ color: '#ff7b72' }}>{line}{'\n'}</div>;
                if (/^(import|export|from|const|return|async|await|function|'use client')/.test(t)) {
                  const m = line.match(/^(\s*)(import|export|from|const|return|async|await|function|'use client')(.*)$/);
                  if (m) return (
                    <div key={i}>
                      {m[1]}<span style={{ color: '#c586c0' }}>{m[2]}</span>
                      <span style={{ color: '#c9d1d9' }}>{m[3]}</span>{'\n'}
                    </div>
                  );
                }
                if (line.includes('=')) {
                  const eq = line.indexOf('=');
                  return (
                    <div key={i}>
                      <span style={{ color: '#79c0ff' }}>{line.substring(0, eq)}</span>
                      <span style={{ color: '#c9d1d9' }}>=</span>
                      <span style={{ color: '#a5d6ff' }}>{line.substring(eq + 1)}</span>{'\n'}
                    </div>
                  );
                }
                return <div key={i} style={{ color: '#c9d1d9' }}>{line}{'\n'}</div>;
              });

            const tabBorder = (active: boolean) => ({
              background: active ? '#0d1117' : 'transparent',
              color:      active ? '#bed96d' : '#4a6030',
              border:     active ? '1px solid #2a4010' : '1px solid transparent',
              borderBottom: active ? '1px solid #0d1117' : '1px solid transparent',
              marginBottom: '-1px',
              position:  'relative' as const,
              zIndex:    active ? 1 : 0,
            });

            return (
              <div className="dash-reveal flex flex-col shrink-0" style={{ width: 340, minWidth: 300 }}>
                <div className="card rounded-2xl overflow-hidden flex flex-col min-h-[660px]" style={{ padding: 0 }}>

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1a2e06' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full inline-block" style={{
                        background: generatedScript ? '#bed96d' : '#3a4a2a',
                        boxShadow: generatedScript ? '0 0 6px #bed96d88' : 'none',
                      }} />
                      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Install Code</span>
                    </div>
                    {generatedScript && (
                      <button onClick={copySnippet}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all duration-200"
                        style={{
                          background: frameworkCopied ? '#22c55e22' : '#1a2e06',
                          color:      frameworkCopied ? '#22c55e'   : '#bed96d',
                          border:    `1px solid ${frameworkCopied ? '#22c55e44' : '#2a4010'}`,
                        }}>
                        {frameworkCopied ? '✓ Copied!' : '⎘ Copy'}
                      </button>
                    )}
                  </div>

                  {/* Framework Tabs */}
                  <div className="flex items-center gap-0.5 px-3 pt-3">
                    {FW.map(fw => (
                      <button key={fw.id} onClick={() => setFrameworkTab(fw.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-t-lg transition-all duration-150"
                        style={tabBorder(frameworkTab === fw.id)}>
                        <span className="text-[10px]">{fw.icon}</span>{fw.label}
                      </button>
                    ))}
                  </div>

                  {/* Code area */}
                  {!generatedScript ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 mx-3 mb-3 rounded-b-xl rounded-tr-xl"
                      style={{ background: '#0d1117', border: '1px solid #2a4010' }}>
                      <span className="text-4xl" style={{ filter: 'grayscale(0.3)' }}>⚡</span>
                      <p className="text-sm leading-relaxed" style={{ color: '#4a6030' }}>
                        Select a chatbot and click{' '}
                        <strong style={{ color: '#bed96d' }}>Generate Script</strong>{' '}
                        to get your embed code.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto font-mono text-xs leading-relaxed mx-3 mb-3 rounded-b-xl rounded-tr-xl"
                      style={{ background: '#0d1117', border: '1px solid #2a4010', padding: '14px', whiteSpace: 'pre' }}>
                      <div className="flex gap-3">
                        <div className="select-none text-right shrink-0 text-[10px]"
                          style={{ color: '#3a4a2a', lineHeight: '1.6' }}>
                          {activeSnippet.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                        </div>
                        <div style={{ lineHeight: '1.6', flex: 1 }}>{highlight(activeSnippet)}</div>
                      </div>
                    </div>
                  )}

                  {/* Footer hint */}
                  {generatedScript && (
                    <div className="px-3 pb-3">
                      <div className="flex items-start gap-2 text-[10px] px-3 py-2 rounded-xl leading-relaxed"
                        style={{ background: '#0a1505', border: '1px solid #1e2d0e', color: '#4a6030' }}>
                        <span style={{ color: '#bed96d' }}>💡</span>
                        {hints[frameworkTab]}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })()}

      </div>
    </div>
  );
};

export default ScriptsPage;