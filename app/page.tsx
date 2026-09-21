'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, ArrowUpRight, Bot, ChevronDown, Code2, Globe2, Menu, Play, ShieldCheck, X } from 'lucide-react';
import { AnimatedBeamMultipleOutputDemo } from '@/components/ui/animated-beam-multiple-inputs';
import Subscription from './(dashboard)/pricing/page';
import {navItems,features, stats} from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const growthData = [                     
  { month: 'Jan', conversations: 420   },
  { month: 'Feb', conversations: 780   },
  { month: 'Mar', conversations: 1100  },
  { month: 'Apr', conversations: 1650  },
  { month: 'May', conversations: 2300  },
  { month: 'Jun', conversations: 3200  },
  { month: 'Jul', conversations: 4800  },
  { month: 'Aug', conversations: 6400  },
  { month: 'Sep', conversations: 9100  },
  { month: 'Oct', conversations: 13500 },
  { month: 'Nov', conversations: 19800 },
  { month: 'Dec', conversations: 28000 },
];                                        

const topicData = [
  { name: 'Product Q&A', value: 38, color: '#cff45f' },
  { name: 'Onboarding', value: 24, color: '#ff9b7a' },
  { name: 'Billing', value: 17, color: '#93c5fd' },
  { name: 'Technical', value: 13, color: '#c4b5fd' },
  { name: 'Other', value: 8, color: '#d9ddd4' },
];

const volumeData = [
  { day: 'Mon', resolved: 310, escalated: 22 },
  { day: 'Tue', resolved: 480, escalated: 31 },
  { day: 'Wed', resolved: 520, escalated: 18 },
  { day: 'Thu', resolved: 690, escalated: 42 },
  { day: 'Fri', resolved: 820, escalated: 35 },
  { day: 'Sat', resolved: 410, escalated: 14 },
  { day: 'Sun', resolved: 290, escalated: 9 },
];

export default function Home() {
  const { data } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-reveal',
         { y: 38, opacity: 0 },
          { y: 0, opacity: 1, duration: .9, stagger: .12, ease: 'power3.out', delay: .15 });
      gsap.fromTo('.float-card',
         { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: .8, stagger: .14, ease: 'power3.out', delay: .65 });
      
    }, root);
    return () => ctx.revert();
  }, []);

  return (
  <main ref={root} className="site-shell relative ">
    <div className="grain" />


    <nav className="nav-wrap fixed! w-[80%] !z-[100] top-6 rounded-full bg-linear-180 to-[#00000012] from-[#0000008f] shadow left-1/2 -translate-x-1/2 ">
       <Link href="/" className="brand flex center  rounded-4xl py-0">
         <img className=' w-14 h-18  drop-shadow-[-3px_2px_0px_#28362e66   ' src="/logo2.png" alt="" />
         <h1 className='text-[#f6f5ef]! text-[30px]! font-medium!   '>Nexora</h1>
      </Link>
      <div className="nav-links">
        {navItems.map((item, i) => (
          <a key={item} href={i === 3 ? "#pricing" : "#platform"}>
            {item}
            {i < 3 && <ChevronDown size={14} />}
          </a>
        ))}
      </div>
      <div className="nav-actions">
       
        <Link
          href={data?.user ? "/dashboard" : "/sign-in"}
          className="button py-1.5! rounded-4xl! button-dark"
        >
          {data?.user ? "Dashboard" : "Get started"} <ArrowRight size={16} />
        </Link>
      </div>
      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mobile-menu"
          >
            {navItems.map((x) => (
              <a key={x} href="#platform" onClick={() => setMenuOpen(false)}>
                {x}
              </a>
            ))}
            <Link href="/sign-in">Get started</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>

    <section className="hero mt-[70px]! section-pad"> 
      <div className="hero-copy">
        
        <h1 className="hero-reveal font-light! [text-shadow:_-3px_2px_1px_#0000004d] ">
         <span className='log text-[#17221d]!'> Your website</span> 
          <br />
        <span className='log text-[#17221d]! '>  has a new</span>  <em className=' '>expert.</em>
        </h1>
        <p className="hero-reveal text-sm!">
          Turn everything your company knows into an AI agent that answers,
          guides, and converts — anywhere your customers need it.
        </p>
        <div className="hero-buttons hero-reveal">
          <Link href="/sign-in" className="button button-light">
            Build your agent <ArrowRight size={17} />
          </Link>
          <a href="#demo" className="text-button">
            <span className="play-icon">
              <Play size={13} fill="currentColor" />
            </span>{" "}
            See it in action
          </a>
        </div>
        
      </div>
      
      <div className='  ]'>
      <AnimatedBeamMultipleOutputDemo />
      </div>
    </section>
 
    <section className="story-section section-pad" id="platform">
      
      <div className="section-intro items-start! flex! flex-col!"> 
        <h2 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d] '>
          More than a chatbot.
          <br />
          <em>Your best teammate.</em>
        </h2>

        <h3 >
          Nexora gives every customer an expert guide, while giving your team
          the space to do their best work.
        </h3>
        
      </div>
      <div className="feature-grid">
        {features?.map(([title, text, Icon], i) => (
          <motion.article
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className={" relative feature-card card-" + i}
            key={String(title)}
          >
            <div className="pointer-events-none absolute inset-x-4 inset-y-16 mix-blend-darken" aria-hidden="true"><svg className="pointer-events-none absolute inset-0 text-neutral-300/50" width="100%" height="100%"><defs><pattern id="dots-_R_2i5fksivb_" x="-1" y="-1" width="12" height="12" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="2" height="2" fill="currentColor"></rect></pattern></defs><rect fill="url(#dots-_R_2i5fksivb_)" width="100%" height="100%"></rect></svg></div>

            <div className="feature-icon">
              <Icon size={23} />
            </div>
            <span className="card-number">0{i + 1}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <a href="#how">
              Explore capability <ArrowUpRight size={16} />
            </a>
          </motion.article>
        ))}
      </div>
    </section>

    <section className="marquee">
      <div>
        ANSWER MORE <span>•</span> DELIGHT ALWAYS <span>•</span> MOVE FASTER{" "}
        <span>•</span> ANSWER MORE <span>•</span> DELIGHT ALWAYS <span>•</span>
      </div>
    </section>

    <section className="workflow section-pad" id="how">
      <div className="section-intro centered">
      
        <h2 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'>
          Built in an afternoon.
          <br />
          <em>Useful from the first hello.</em>
        </h2>
      </div>
      <div className="steps">
        <div className="step">
          <span>01</span>
          <Globe2 />
          <h3>Bring your knowledge</h3>
          <p>
            Drag in files, point us at a URL, or connect the tools your team
            already uses.
          </p>
        </div>
        <div className="connector" />
        <div className="step">
          <span>02</span>
          <Bot />
          <h3>Shape the experience</h3>
          <p>
            Give your agent a name, a tone and clear rules for when humans
            should step in.
          </p>
        </div>
        <div className="connector" />
        <div className="step">
          <span>03</span>
          <Code2 />
          <h3>Paste one script</h3>
          <p>
            Copy your tiny snippet, add it to your site, and say hello to a very
            capable teammate.
          </p>
        </div>
      </div>
      <div className=" relative code-panel">

         <div className="code-copy">
          <span className="eyebrow">ONE LINE, INFINITE HELP</span>
          <h3>It’s really that simple.</h3>
          <p>
            Our widget is lightweight, responsive and feels completely at home
            on your brand.
          </p>
          <div className="security-row">
            <ShieldCheck /> Enterprise-grade security, by default
          </div>
        </div>
        <pre>
          <code>
            <span>&lt;script</span>
            {"\n"} src=<i>"https://cdn.Nexora.ai/widget.js"</i>
            {"\n"} data-agent=<i>"your-agent-id"</i>
            {"\n"} async<span>&gt;&lt;/script&gt;</span>
          </code>
        </pre>
      </div>
    </section>

     <section className="border-t border-[#d9ddd4] bg-[#f6f5ef] py-24 px-[max(6vw,32px)]" id="scale">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
        className="mb-12"
      >
         <h2 className='text-[#17221d] [text-shadow:_-3px_2px_1px_#0000004d] text-[clamp(42px,5vw,70px)] font-bold leading-[0.94] tracking-[-4px] mt-3 mb-4'>
          Start small.
          <br />
          <em className='font-[Georgia] font-normal'>Grow without limits.</em>
        </h2>
        <p className="text-[#64716a] text-[17px] leading-relaxed max-w-[500px]">
          From your first 500 conversations to 28 million — Nexora scales with zero rearchitecting.
        </p>
      </motion.div>

       <div className="flex flex-wrap gap-4 mb-10">
        {[['28k+', 'conversations / month at peak'], ['66×', 'growth in 12 months'], ['< 2 min', 'to add capacity']].map(([n, l]) => (
          <motion.div
            key={n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="flex items-baseline gap-2 bg-white border border-[#d9ddd4] rounded-xl px-5 py-3 shadow-sm"
          >
            <span className="text-2xl font-black tracking-tight text-[#17221d]">{n}</span>
            <span className="text-xs text-[#64716a]">{l}</span>
          </motion.div>
        ))}
      </div>

      {/* area chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        viewport={{ once: true }}
        className="bg-white border border-[#d9ddd4] rounded-2xl p-6 shadow-[-4px_4px_0_#d9ddd4]"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#64716a]">CONVERSATION GROWTH</p>
            <p className="text-sm text-[#64716a] mt-0.5">Jan – Dec, illustrative trajectory</p>
          </div>
          <span className="text-xs bg-[#cff45f] text-[#17221d] font-bold px-3 py-1 rounded-full">↑ 66× YoY</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={growthData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cff45f" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#cff45f" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ebe4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64716a' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64716a' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
            <Tooltip
              contentStyle={{ background: '#17221d', border: 'none', borderRadius: 10, color: '#f6f5ef', fontSize: 12 }}
              itemStyle={{ color: '#cff45f' }}
              formatter={(v) => [`${(v as number)?.toLocaleString() ?? v} convos`, '']}
            />
            <Area type="monotone" dataKey="conversations" stroke="#97b246" strokeWidth={2.5} fill="url(#growthGrad)" dot={false} activeDot={{ r: 5, fill: '#17221d' }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </section>

    <section className="impact relative ">

      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-px top-0 z-0 flex h-16 w-full max-w-[min(700px,calc(100vw-2rem))] items-start justify-center">
        <svg viewBox="0 0 85 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto shrink-0 translate-x-px translate-y-px overflow-visible"><rect x="0" y="0" width="85" height="1" fill="currentColor" transform="translate(0, -1)"></rect><path d="M50 45C57.3095 56.6952 71.2084 63.9997 85 64V0H0C13.7915 0 26.6905 7.30481 34 19L50 45Z" fill="currentColor"></path></svg>
        <div className="border-t-1 relative z-10 h-[calc(100%+1px)] min-w-0 grow border-current bg-current"></div>
        <svg viewBox="0 0 85 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto shrink-0 -translate-x-px translate-y-px -scale-x-100 overflow-visible"><rect x="0" y="0" width="85" height="1" fill="currentColor" transform="translate(0, -1)"></rect><path d="M50 45C57.3095 56.6952 71.2084 63.9997 85 64V0H0C13.7915 0 26.6905 7.30481 34 19L50 45Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="impact-copy">
        <span className="eyebrow light">THE COMPOUND EFFECT</span>
        <h2>
          Every answer is
          <br />a better <em>experience.</em>
        </h2>
        <p>
          When people get unstuck faster, they stay longer, buy with confidence,
          and tell others about you.
        </p>
        <Link href="/sign-in" className="button button-light">
          Start building today <ArrowRight size={17} />
        </Link>
      </div>
      <div className="impact-stats">
        {stats.map(([number, label]) => (
          <div key={label}>
            <strong>{number}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="testimonial section-pad">
      <div className="quote-mark">“</div>
      <blockquote className=' text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d] '>
        Nexora feels like we hired our most patient, most knowledgeable
        teammate — and put them on every page of our website.
      </blockquote>
    
    </section>

    <section className="faq relative section-pad">

      <div className="pointer-events-none absolute inset-x-4 inset-y-16 mix-blend-darken" aria-hidden="true"><svg className="pointer-events-none absolute inset-0 text-neutral-200/80" width="100%" height="100%"><defs><pattern id="dots-_R_2i5fksivb_" x="-1" y="-1" width="12" height="12" patternUnits="userSpaceOnUse"><rect x="1" y="1" width="2" height="2" fill="currentColor"></rect></pattern></defs><rect fill="url(#dots-_R_2i5fksivb_)" width="100%" height="100%"></rect></svg></div>
      <div>

        
        <h2 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'>
          Let’s make it
          <br />
          <em>easy.</em>
        </h2>
        <p>
          Can’t find what you’re looking for?{" "}
          <a href="mailto:hello@Nexora.ai">Talk to our team.</a>
        </p>
      </div>
      <div className="faq-list">
        {[
          [
            "How fast can I get an agent live?",
            "Most teams publish their first agent in under two minutes. Add your sources, customize its behavior, and paste the script onto your site.",
          ],
          [
            "Does Nexora work with my existing stack?",
            "Yes. Start with websites and documents, then connect your product, help desk and internal tools as your needs grow.",
          ],
          [
            "Can I control what the agent says?",
            "Absolutely. Use instructions, source controls, tone settings and human handoff rules to make every answer feel safe and on-brand.",
          ],
          [
            "Is our data secure?",
            "Your data is encrypted in transit and at rest. We provide the controls modern B2B teams expect, with security built into every layer.",
          ],
        ].map(([q, a], i) => (
          <button
            className="faq-item"
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            key={q}
          >
            <span>{q}</span>
            <i>{openFaq === i ? "−" : "+"}</i>
            <AnimatePresence>
              {openFaq === i ? (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {a}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </section>

    <Subscription />

     <section className="bg-[#17221d] py-24 px-[max(6vw,32px)]" id="monitoring">
       <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
        viewport={{ once: true, amount: 0.2 }}
        className="mb-14"
      >
        <span className="text-[11px] font-black tracking-[1.5px] text-[#cff45f] flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#cff45f] animate-pulse" />
          LIVE MONITORING
        </span>
        <h2 className="text-[clamp(38px,5vw,68px)] font-bold leading-[0.94] tracking-[-4px] text-[#f6f5ef] mt-0 mb-4">
          Know what your agent<br />
          <em className="font-[Georgia] font-normal text-[#cff45f]">is doing, always.</em>
        </h2>
        <p className="text-[#b9c6bd] text-[16px] leading-relaxed max-w-[480px]">
          Real-time dashboards for topic distribution, resolution rates, and
          daily conversation volume — all in one view.
        </p>
      </motion.div>
 
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-6">
 
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-[#1e2e27] border border-[#2e4038] rounded-2xl p-6"
        >
          <p className="text-xs font-bold tracking-widest text-[#b9c6bd] mb-0.5">TOPIC DISTRIBUTION</p>
          <p className="text-sm text-[#788f83] mb-4">What your customers ask about</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={topicData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
              >
                {topicData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0f1a14', border: 'none', borderRadius: 10, color: '#f6f5ef', fontSize: 12 }}
                formatter={(v) => [`${v}%`, '']}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ color: '#b9c6bd', fontSize: 12 }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
 
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="bg-[#1e2e27] border border-[#2e4038] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#b9c6bd] mb-0.5">WEEKLY CONVERSATION VOLUME</p>
              <p className="text-sm text-[#788f83]">Resolved vs escalated — last 7 days</p>
            </div>
            <div className="flex gap-4 text-xs text-[#788f83]">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#cff45f] inline-block" />Resolved</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff9b7a] inline-block" />Escalated</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={volumeData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cff45f" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#cff45f" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="escalatedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff9b7a" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ff9b7a" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2e4038" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#788f83' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#788f83' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f1a14', border: 'none', borderRadius: 10, color: '#f6f5ef', fontSize: 12 }}
                itemStyle={{ color: '#b9c6bd' }}
              />
              <Area type="monotone" dataKey="resolved" stroke="#97b246" strokeWidth={2} fill="url(#resolvedGrad)" dot={false} activeDot={{ r: 4, fill: '#cff45f' }} />
              <Area type="monotone" dataKey="escalated" stroke="#b95645" strokeWidth={2} fill="url(#escalatedGrad)" dot={false} activeDot={{ r: 4, fill: '#ff9b7a' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
 
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { label: 'Avg. response time', value: '1.2s', delta: '↓ 0.4s', good: true },
          { label: 'Resolution rate', value: '94.3%', delta: '↑ 6.1%', good: true },
          { label: 'Escalation rate', value: '5.7%', delta: '↓ 2.3%', good: true },
          { label: 'CSAT score', value: '4.8/5', delta: '↑ 0.3', good: true },
        ].map(({ label, value, delta, good }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            viewport={{ once: true }}
            className="bg-[#1e2e27] border border-[#2e4038] rounded-xl px-5 py-4"
          >
            <p className="text-xs text-[#788f83] mb-1">{label}</p>
            <p className="text-2xl font-black tracking-tight text-[#f6f5ef]">{value}</p>
            <p className={`text-xs font-bold mt-1 ${good ? 'text-[#cff45f]' : 'text-[#ff9b7a]'}`}>{delta} vs last week</p>
          </motion.div>
        ))}
      </div>
    </section>

    <section className="final-cta"  >
       <span className="eyebrow">YOUR TEAM IS READY</span>
      <h2 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'>
        Make every visit
        <br />
        <em>feel personal.</em>
      </h2>
      <p>
        Start free. Launch fast. Make your website your hardest-working
        teammate.
      </p>
      <Link href="/sign-in" className="button button-coral">
        Create your first agent <ArrowRight size={17} />
      </Link>
    </section>
    <footer>
      <Link href="/" className="brand flex items-center gap-3">
         <img className=' w-20 h-25 drop-shadow-[#00000090] drop-shadow-xl ' src="/logo2.png" alt="" /> Nexora
      </Link>
       <div>
        <a href="#platform">Product</a>
        <a href="#how">Resources</a>
        <a href="#pricing">Pricing</a>
        <a href="/sign-in">Log in</a>
      </div>
      <small>
        © 2026 Nexora, Inc. Crafted for better
        conversations.
      </small>
    </footer>
  </main>
);

}
