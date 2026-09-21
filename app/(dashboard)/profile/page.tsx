'use client'
import { signOut, useSession } from 'next-auth/react'
import Image from 'next/image'
import { LogOut, Bot, MessageSquare, Database, Zap, Crown, RefreshCcw, ChevronRight, Globe, FileText, Youtube, GitBranch, AlignLeft, ShieldCheck } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getUserProfile } from '@/action/user.action'
import Link from 'next/link'

const SOURCE_ICONS: Record<string, any> = {
  web: Globe,
  pdf: FileText,
  yt: Youtube,
  github: GitBranch,
  text: AlignLeft,
}

const SOURCE_LABELS: Record<string, string> = {
  web: 'Website',
  pdf: 'PDF',
  yt: 'YouTube',
  github: 'GitHub',
  text: 'Text',
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center gap-3 bg-[#fffefa] border border-[#d8ded5] rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="p-2.5 rounded-xl" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-gray-400 leading-none mb-1">{label}</p>
        <p className="text-[15px] font-semibold text-[#17221d]">{value}</p>
      </div>
    </div>
  )
}

const Profile = () => {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)
    const res = await getUserProfile()
    if (res.status === 200) setProfile(res)
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated') fetchProfile()
  }, [status])

  const quotaPercent = profile?.plan
    ? Math.min(100, Math.round((profile.plan.monthlyUsed / profile.plan.monthlyQuota) * 100))
    : 0

  const tierColor = profile?.plan?.tier === 'pro' ? '#c084fc' : '#cff45f'
  const tierBg = profile?.plan?.tier === 'pro' ? '#7c3aed' : '#546032'

  return (
    <div className="w-full min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-10">

         <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#17221d] [text-shadow:_-2px_1px_1px_#0000003a]">
            My Profile
          </h1>
          <button
            onClick={fetchProfile}
            className="p-2 rounded-full hover:bg-[#e8eee5] transition-colors text-gray-400 hover:text-[#546032]"
            title="Refresh"
          >
            <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {status !== 'loading' && session && (
          <>
             <div className="bg-[#fffefa] border border-[#d8ded5] rounded-3xl p-6 mb-5 shadow-[-2px_2px_0px_#0000001a]">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Image
                    src={session.user?.image!}
                    alt="profile"
                    width={72}
                    height={72}
                    className="rounded-2xl w-[72px] h-[72px] object-cover ring-2 ring-[#d8ded5]"
                  />
                   <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[#17221d] truncate">{session.user?.name}</h2>
                    {profile?.plan && (
                      <span
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider"
                        style={{ background: tierBg, color: tierColor }}
                      >
                        {profile.plan.tier === 'pro' ? <><Crown className="inline w-3 h-3 mr-0.5" />Pro</> : 'Free'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 truncate mt-0.5">{session.user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <ShieldCheck size={12} className="text-green-500" />
                    <span className="text-[11px] text-green-600 font-medium">Verified account</span>
                  </div>
                </div>
              </div>
            </div>

             {!loading && profile && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <StatCard icon={Bot} label="Total Agents" value={profile.agentCount ?? 0} color="#546032" />
                <StatCard icon={MessageSquare} label="Conversations" value={profile.totalConversations ?? 0} color="#2563eb" />
                <StatCard icon={Database} label="Max Bots" value={profile.plan?.maxBots ?? 3} color="#7c3aed" />
                <StatCard icon={Zap} label="Monthly Quota" value={`${profile.plan?.monthlyUsed ?? 0} / ${profile.plan?.monthlyQuota ?? 100}`} color="#d97706" />
              </div>
            )}

             {profile?.plan && (
              <div className="bg-[#fffefa] border border-[#d8ded5] rounded-2xl p-5 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#17221d]">Monthly Usage</span>
                  <span className="text-xs font-semibold text-gray-500">{quotaPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8eee5] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${quotaPercent}%`,
                      background: quotaPercent > 80 ? '#ef4444' : quotaPercent > 50 ? '#f59e0b' : '#546032',
                    }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  Resets on {profile.plan.quotaResetAt ? new Date(profile.plan.quotaResetAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </p>
              </div>
            )}

            {/* ── Source Breakdown ── */}
            {profile?.sourceBreakdown?.length > 0 && (
              <div className="bg-[#fffefa] border border-[#d8ded5] rounded-2xl p-5 mb-5">
                <p className="text-sm font-semibold text-[#17221d] mb-3">Knowledge Sources</p>
                <div className="flex flex-col gap-2">
                  {profile.sourceBreakdown.map((src: any) => {
                    const Icon = SOURCE_ICONS[src.source] ?? Database
                    return (
                      <div key={src.source} className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-[#e8eee5]">
                          <Icon size={13} className="text-[#546032]" />
                        </div>
                        <span className="text-sm text-gray-600 flex-1">{SOURCE_LABELS[src.source] ?? src.source}</span>
                        <span className="text-xs font-semibold bg-[#e8eee5] px-2.5 py-1 rounded-full text-[#546032]">
                          {src._count.id} agent{src._count.id !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

             <div className="bg-[#fffefa] border border-[#d8ded5] rounded-2xl overflow-hidden mb-5">
              {[
                { label: 'My Agents', href: '/my-chatbot', icon: Bot },
                { label: 'Dashboard', href: '/dashboard', icon: Zap },
                { label: 'Scripts & Embed', href: '/scripts', icon: Database },
              ].map(({ label, href, icon: Icon }, i, arr) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-5 py-4 hover:bg-[#f0f4ed] transition-colors ${i < arr.length - 1 ? 'border-b border-[#e8eee5]' : ''}`}
                >
                  <Icon size={16} className="text-[#546032]" />
                  <span className="text-sm font-medium text-[#17221d] flex-1">{label}</span>
                  <ChevronRight size={15} className="text-gray-300" />
                </Link>
              ))}
            </div>

             <button
              onClick={async () => { setSigningOut(true); await signOut() }}
              disabled={signingOut}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-sm transition-colors disabled:opacity-50"
            >
              <LogOut size={16} />
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </>
        )}

        {status === 'loading' && (
          <div className="flex flex-col gap-3 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-[#e8eee5] animate-pulse" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile