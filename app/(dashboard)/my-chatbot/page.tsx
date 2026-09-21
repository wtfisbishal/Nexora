'use client'
import Loading from '@/components/ui/loading'
import { useGetModels, useDeleteModel } from '@/hooks/useModel'
import { Bot, BotIcon, DotIcon, RefreshCcw, BarChart2, PieChart as PieIcon, LayoutGrid, TrendingUp, LoaderCircle, Trash2, X, FileText, Globe, Youtube, FileCode, AlignLeft, Plus, BrainCircuit } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap';
import { generateEmbeddings } from '@/embedings'
import PdfUploader from '@/components/pdfupload'
import { sources } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toastSuccess } from '@/lib/toast'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { SLICE_COLORS } from '@/lib/utils'


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1f1b] border border-[#cff45f]/30 rounded-xl px-4 py-2 shadow-xl text-sm">
        <p className="font-semibold text-[#cff45f]">{label || payload[0].name}</p>
        <p className="text-white mt-0.5">
          Conversations: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};
//   Custom tooltip for bar chart  
const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1f1b] border border-[#cff45f]/30 rounded-xl px-4 py-2 shadow-xl text-sm">
        <p className="font-semibold text-[#cff45f]">{label}</p>
        <p className="text-white mt-0.5">
          Conversations: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

//   Custom tooltip for pie chart  
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1f1b] border border-[#cff45f]/30 rounded-xl px-4 py-2 shadow-xl text-sm">
        <p className="font-semibold text-[#cff45f]">{payload[0].name}</p>
        <p className="text-white mt-0.5">
          Conversations: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const MyChatBot = () => {
  const { data, isLoading, refetch } = useGetModels()
  const { mutate: deleteModel, isPending: isDeleting } = useDeleteModel()
  const [toallConversations, setTotalConversations] = useState<any>({});
  const root = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'monitoring'>('cards');

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this chatbot?')) {
      deleteModel(id, {
        onSuccess: () => refetch()
      });
    }
  };

  const [trainingModel, setTrainingModel] = useState<any>(null);
  const [activeSource, setActiveSource] = useState<'pdf' | 'website' | 'youtube' | 'textData' | 'github'>('website');
  const client = useQueryClient();

  const createCollections = useMutation({
    mutationFn: async ({ textData, type, collectionName, targetModelId }: {
      textData: string; type: 'web' | 'text' | 'yt' | 'github'; collectionName: string; targetModelId?: string;
    }) => generateEmbeddings(textData, type, collectionName, 'bot', targetModelId),
    onSuccess: (result) => {
      toastSuccess(result ? 'Knowledge added to queue!' : 'Could not add that source.');
      client.invalidateQueries({ queryKey: ['modelsinfo'] });
    },
  });

  async function submitTrainSource(formData: FormData) {
    if (!trainingModel) return;
    const values = [['youtube', 'yt'], ['website', 'web'], ['textData', 'text'], ['github', 'github']] as const;
    const found = values.find(([field]) => String(formData.get(field) || '').trim());
    if (!found) return;
    const [field, type] = found;
    const value = String(formData.get(field)).trim();
    createCollections.mutate({ textData: value, type, collectionName: trainingModel.collection_name, targetModelId: trainingModel.id });
  }


  useEffect(() => {
    const s = data?.res?.reduce(
      (acc: any, curr: any) => {
        acc.totalTimes += curr.times || 0;
        if (!acc.uniqueSources.has(curr.source)) {
          acc.uniqueSources.add(curr.source);
        }
        return acc;
      },
      { totalTimes: 0, uniqueSources: new Set() }
    );

    // Convert Set size into totalSources
    const result = {
      totalTimes: s?.totalTimes,
      totalSources: s?.uniqueSources.size,
    };

    setTotalConversations(result || {});
  }, [data])


  const barData = useMemo(() => {
    if (!data?.res) return [];
    return data.res
      .map((m: any) => ({
        name: (m.name || 'Unnamed').toUpperCase(),
        conversations: m.times || 0,
      }))
      .sort((a: any, b: any) => b.conversations - a.conversations);
  }, [data]);

  const pieData = useMemo(() => {
    if (!data?.res) return [];
    const grouped: Record<string, number> = {};
    data.res.forEach((m: any) => {
      const src = (m.source || 'Unknown').toUpperCase();
      grouped[src] = (grouped[src] || 0) + (m.times || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [data]);

  const topModel = useMemo(() => {
    if (!pieData.length) return null;
    return [...pieData].sort((a, b) => b.value - a.value)[0];
  }, [pieData]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".dash-reveal",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }
      );
      gsap.fromTo(
        ".abot",
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
      gsap.fromTo(
        ".chart-reveal",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          delay: 0.45,
          ease: "power3.out",
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className=' max-w-[1400px] mx-auto min-h-screen pb-20'>


      <div className=' flex justify-between px-5 '>
        <section className="dash-hero -mt-">
          <div className="dash-reveal">
            <h1 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'> {viewMode === 'cards' ? " My Agents " : 'Monitoring'}</h1>
          </div>
        </section>

        <div className='flex items-center gap-3'>

          <div className='flex gap-3 w-fit h-fit p-1 rounded-full border border-[#959795] '>

            <button className={`w-fit h-[40px] px-4 py-0 rounded-full flex items-center gap-2   ${viewMode === 'monitoring' ? 'text-[#cff45f] bg-[#17221d]' : 'text-[#959795]'}`}
              onClick={() => setViewMode('monitoring')}>
              <TrendingUp size={18} /> Analytics
            </button>
            <button className={`w-fit h-[40px] px-4 py-0 rounded-full flex items-center gap-2   ${viewMode === 'cards' ? 'text-[#cff45f] bg-[#17221d]' : ' text-[#959795] '}`}
              onClick={() => setViewMode('cards')}>
              <LayoutGrid size={18} /> Agents
            </button>
          </div>

          <button className='w-fit h-[40px] button-light bg px-4 py-0 !rounded-full flex items-center gap-2'
            onClick={() => refetch()}>Refetch <RefreshCcw size={20} />
          </button>
        </div>

      </div>

      <div className=' gap-5 flex items-center justify-evenly mb-10'>
        <div className=' dash-reveal w-[30%]   h-[100px] bg-[#f7f9f5] flex-1 border border-[#c9d0c5]  p-6  shadow-[-3px_2px_1px_#0000005e] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>    Total chatbots </p>
          <p className=' text-3xl text-[#64716a] font-bold'>{data?.res?.length}</p>
        </div>

        <div className=' dash-reveal w-[30%]   h-[100px] bg-[#f7f9f5] flex-1 border border-[#c9d0c5] p-6  shadow-[-3px_2px_1px_#0000005e] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>Total Conversations</p>
          <p className=' text-3xl text-[#64716a] font-bold'>{toallConversations?.totalTimes} / 100</p>
        </div>

        <div className='dash-reveal w-[30%]   h-[100px] bg-[#f7f9f5] flex-1 border border-[#c9d0c5]  p-6  shadow-[-3px_2px_1px_#0000005e] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>Context Sources</p>
          <p className=' text-3xl text-[#64716a] font-bold'>{toallConversations?.totalSources}</p>
        </div>
      </div>

      {/*   Monitoring view   */}
      {viewMode === 'monitoring' && (

        isLoading ? (
          <>
            <Loading boxes={2} child={' h-full  w-full rounded-3xl '} parent={' !px-5 !flex-col !flex-warp h-[740px] w-full '} />

          </>
        ) :
          <>

            <div className='px-5 mb-12  flex lg:grid-cols-3 gap-6'>

              {/* Bar Chart   */}
              <div className='chart-reveal bg-[#f7f9f5] flex-1 border border-[#c9d0c5] rounded-3xl p-6  shadow-[-3px_2px_1px_#0000005e]'>
                <div className='flex items-center gap-2 mb-5'>
                  <div className='bg-[#cff45f] p-2 rounded-xl'>
                    <BarChart2 size={18} className='text-[#17221d]' />
                  </div>
                  <div>
                    <h2 className='font-bold text-[#17221d] text-base leading-tight'>Conversations per Chatbot</h2>
                    <p className='text-xs text-[#64716a]'>Total usage by agent</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} barSize={25} margin={{ top: 4, right: 10, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="1 1" stroke="#c9d0c5" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#64716a', fontSize: 10, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fill: '#64716a', fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: '#64716a18' }} />
                    <Bar dataKey="conversations" radius={[4, 4, 0, 0]}>
                      {barData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {barData[0] && (
                  <p className='text-center text-xs text-[#64716a] mt-1 font-medium'>
                    🏆 Most active: <span className='text-[#17221d] font-bold'>{barData[0].name}</span> ({barData[0].conversations} chats)
                  </p>
                )}

              </div>

              {/* Pie/Donut Chart — Conversations by AI model source */}
              <div className='chart-reveal bg-[#f7f9f5]  border border-[#c9d0c5] rounded-3xl p-6  shadow-[-3px_2px_1px_#0000005e]'>
                <div className='flex items-center gap-2 mb-5'>
                  <div className='bg-[#64716a] p-2 rounded-xl'>
                    <PieIcon size={18} className='text-[#cff45f]' />
                  </div>
                  <div>
                    <h2 className='font-bold text-[#17221d] text-base leading-tight'>AI Model Usage</h2>
                    <p className='text-xs text-[#64716a]'>Which model drives the most conversations</p>
                  </div>
                </div>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={230}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => (
                            <span style={{ color: '#64716a', fontSize: 12, fontWeight: 600 }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    {topModel && (
                      <p className='text-center text-xs text-[#64716a] mt-1 font-medium'>
                        🤖 Top model: <span className='text-[#17221d] font-bold'>{topModel.name}</span> ({topModel.value} conversations)
                      </p>
                    )}
                  </>
                ) : (
                  <div className='h-[230px] flex items-center justify-center text-[#64716a] text-sm'>
                    No conversation data yet
                  </div>
                )}
              </div>
            </div>

            <div className='chart-reveal bg-[#f7f9f5] flex-1 border border-[#c9d0c5] rounded-3xl p-6  shadow-[-3px_2px_1px_#0000005e] p-'>
              <h3 className='font-bold mb-4'>Conversation Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={barData}>
                  <defs>
                    <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                      <stop offset="50%" stopColor="#6366F1" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="conversations"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fill="url(#colorConversations)"
                    fillOpacity={1}
                    dot={{
                      r: 4,
                      fill: "#3B82F6",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 7,
                      fill: "#2563EB",
                      stroke: "#fff",
                      strokeWidth: 3,
                    }}
                  />
                </AreaChart>

              </ResponsiveContainer>
            </div>
          </>

      )}


      {viewMode === 'cards' && (
        isLoading ? (
          <Loading boxes={3} child={' h-[300px]  w-[500px] rounded-2xl '} parent={' !flex-row !flex-warp h-[400px] w-full '} />
        ) : (
          <div>
            {data?.status === 200 ? (
              <ul className="list-none p-0 m-0">
                {data.res && data.res.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                    <div className="bg-amber-100 p-5 rounded-3xl">
                      <BotIcon size={40} className="text-amber-500" />
                    </div>
                    <p className="text-lg font-semibold text-zinc-700">No agents yet</p>
                    <p className="text-sm text-zinc-400 max-w-xs">
                      Create your first agent by uploading documents or adding text in the Dashboard.
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-[#cff45f] text-[#17221d] text-sm font-bold rounded-full hover:bg-[#bde04f] transition-colors"
                    >
                      <Plus size={15} /> Go to Dashboard
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data.res && data.res.map((model: any) => (
                      <div
                        key={model.id}
                        className={`group relative flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${model.status === 'PENDING' ? 'opacity-60 pointer-events-none' : ''}`}
                      >
                        {/* colour-coded top strip */}
                        <div className={`h-1 w-full ${model.status === 'FAILED' ? 'bg-red-400' : model.status === 'PENDING' ? 'bg-amber-400' : 'bg-[#cff45f]'}`} />

                        {/* card body */}
                        <div className="p-5 flex flex-col gap-4 flex-1">

                          {/* header row */}
                          <div className="flex items-start justify-between gap-3">
                            {/* bot icon */}
                            <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#cff45f] to-[#a8d432] flex items-center justify-center shadow-sm">
                              <Bot size={20} className="text-[#2d3d1a]" />
                            </div>

                            {/* status badge */}
                            {model.status === 'PENDING' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                <LoaderCircle size={11} className="animate-spin" /> Processing
                              </span>
                            ) : model.status === 'FAILED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 border border-red-200">
                                ✕ Failed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                              </span>
                            )}
                          </div>

                          {/* agent name */}
                          <div>
                            <p className="text-base font-bold text-zinc-900 tracking-tight truncate">
                              {model?.name?.toUpperCase()}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5 truncate">{model.id}</p>
                          </div>

                          {/* metadata grid */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-zinc-50 rounded-xl px-3 py-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">Source</p>
                              <p className="text-xs font-semibold text-zinc-700 truncate">{model?.source?.toUpperCase() || '—'}</p>
                            </div>
                            <div className="bg-zinc-50 rounded-xl px-3 py-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">Conversations</p>
                              <p className="text-xs font-bold text-[#3a5a20]">{model?.times ?? 0}</p>
                            </div>
                            <div className="col-span-2 bg-zinc-50 rounded-xl px-3 py-2.5">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">Site ID</p>
                              <p className="text-xs font-mono text-zinc-600 truncate">{model.collection_name}</p>
                            </div>
                          </div>

                          {/* timestamps */}
                          <div className="flex flex-col gap-1 text-[11px] text-zinc-400 border-t border-zinc-100 pt-3">
                            <span>Last active: <span className="text-zinc-600 font-medium">{model.updated_at.toLocaleString('en-US')}</span></span>
                            <span>Created: <span className="text-zinc-500">{model.created_at.toLocaleString('en-US')}</span></span>
                          </div>

                          {/* action buttons */}
                          <div className="flex items-center gap-2 pt-1">
                            {model.status !== 'FAILED' && (
                              <>
                                <button
                                  onClick={() => { setTrainingModel(model); setActiveSource('website'); }}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-[#cff45f] text-[#3a4a20] bg-[#cff45f]/10 hover:bg-[#cff45f]/30 transition-colors"
                                >
                                  <BrainCircuit size={13} /> Train
                                </button>
                                <Link
                                  href={model.status === 'PENDING' ? '#' : `embed?siteId=${model.collection_name}&id=${model.id}&welcomeMessage=hi how can i assist you`}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#17221d] text-white hover:bg-[#2a3f33] transition-colors"
                                >
                                  Test agent
                                </Link>
                              </>
                            )}
                            <button
                              onClick={() => handleDelete(model.id)}
                              disabled={isDeleting}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 transition-colors disabled:opacity-40 shrink-0"
                              title="Delete agent"
                            >
                              {isDeleting ? <LoaderCircle className="animate-spin" size={16} /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ul>
            ) : (
              <div className="flex items-center justify-center py-16 text-zinc-400 text-sm">
                No data found
              </div>
            )}
          </div>
        )
      )}

      <AnimatePresence>
        {trainingModel && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrainingModel(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 h-full w-full max-w-[520px] bg-[#f7f9f5] border-l border-[#c9d0c5] shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#c9d0c5] bg-[#fffefa]">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <BrainCircuit size={18} className="text-[#546032]" />
                    <h2 className="font-semibold text-[#17221d] text-base">Train Agent</h2>
                  </div>
                  <p className="text-xs text-gray-500 truncate max-w-[340px]">
                    Adding context to: <span className="font-medium text-[#17221d]">{trainingModel.name?.toUpperCase()}</span>
                  </p>
                </div>
                <button
                  onClick={() => setTrainingModel(null)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Source Tabs */}
              <div className="px-6 pt-5">
                <div className="flex gap-2 flex-wrap mb-5">
                  <button
                    onClick={() => setActiveSource('pdf')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeSource === 'pdf' ? 'bg-[#17221d] text-[#cff45f] border-[#17221d]' : 'border-[#c9d0c5] text-gray-500 hover:border-[#17221d]'}`}
                  >
                    <FileText size={13} /> PDF
                  </button>
                  {sources.map((src) => (
                    <button
                      key={src.field}
                      onClick={() => setActiveSource(src.field)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${activeSource === src.field ? 'bg-[#17221d] text-[#cff45f] border-[#17221d]' : 'border-[#c9d0c5] text-gray-500 hover:border-[#17221d]'}`}
                    >
                      <src.icon size={13} /> {src.name}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeSource === 'pdf' ? (
                    <motion.div key="pdf" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <PdfUploader mode="bot" targetModelId={trainingModel.id} />
                    </motion.div>
                  ) : (
                    (() => {
                      const cur = sources.find(s => s.field === activeSource);
                      if (!cur) return null;
                      return (
                        <motion.form
                          key={cur.field}
                          action={submitTrainSource}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex flex-col gap-4"
                        >
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#c9d0c5]">
                            <div className="p-2 rounded-xl bg-[#eef2e8]">
                              <cur.icon size={20} className="text-[#546032]" />
                            </div>
                            <div>
                              <p className="font-medium text-[#17221d] text-sm">Add from {cur.name}</p>
                              <p className="text-xs text-gray-400">{cur.description}</p>
                            </div>
                          </div>

                          {cur.field === 'textData' ? (
                            <textarea
                              name="textData"
                              placeholder={cur.placeholder}
                              rows={7}
                              className="w-full rounded-2xl border border-[#c9d0c5] bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#cff45f]/60 text-[#17221d] placeholder-gray-400"
                            />
                          ) : (
                            <input
                              name={cur.field}
                              placeholder={cur.placeholder}
                              className="w-full rounded-2xl border border-[#c9d0c5] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cff45f]/60 text-[#17221d] placeholder-gray-400"
                            />
                          )}

                          <button
                            disabled={createCollections.isPending}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#17221d] text-[#cff45f] font-semibold text-sm hover:bg-[#253328] transition-colors disabled:opacity-50"
                          >
                            {createCollections.isPending ? (
                              <><LoaderCircle className="animate-spin" size={16} /> Training…</>
                            ) : (
                              <><Plus size={16} /> Add to knowledge</>
                            )}
                          </button>
                        </motion.form>
                      );
                    })()
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyChatBot
