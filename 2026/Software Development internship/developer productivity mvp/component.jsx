import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  LayoutDashboard, Users, BarChart3, FileText, Settings, Search, 
  Download, ChevronDown, Zap, RefreshCw, Bug, Rocket, Box, 
  TrendingUp, AlertCircle, CheckCircle2, User, Bell, Shield, Info
} from 'lucide-react';

// --- Dummy Data ---
const PERFORMANCE_DATA = [
  { month: 'Nov', leadTime: 4.2, bugs: 8, prs: 12 },
  { month: 'Dec', leadTime: 4.8, bugs: 10, prs: 15 },
  { month: 'Jan', leadTime: 5.5, bugs: 15, prs: 10 },
  { month: 'Feb', leadTime: 5.0, bugs: 12, prs: 18 },
  { month: 'Mar', leadTime: 4.5, bugs: 9, prs: 20 },
  { month: 'Apr', leadTime: 5.2, bugs: 12, prs: 14 },
];

const METRICS = [
  { id: 1, title: 'Lead Time', value: '5.2 Days', icon: <Zap size={20} />, trend: '+12%', color: 'text-sky-400', rawValue: 5.2 },
  { id: 2, title: 'Cycle Time', value: '7.0 Days', icon: <RefreshCw size={20} />, trend: '+18%', color: 'text-amber-400', rawValue: 7.0 },
  { id: 3, title: 'Bug Rate', value: '12%', icon: <Bug size={20} />, trend: '+2%', color: 'text-red-400', rawValue: 12 },
  { id: 4, title: 'Deployments', value: '9', icon: <Rocket size={20} />, trend: '-5%', color: 'text-green-400', rawValue: 9 },
  { id: 5, title: 'PR Throughput', value: '14', icon: <Box size={20} />, trend: '+8%', color: 'text-indigo-400', rawValue: 14 },
];

// --- Sub-components ---

const SidebarItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
      active ? 'bg-sky-500/10 text-sky-400 border-r-2 border-sky-500' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

const MetricCard = ({ metric }) => (
  <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-5 rounded-2xl hover:scale-[1.02] hover:bg-slate-800/60 transition-all duration-300 group cursor-default">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg bg-slate-900/50 ${metric.color}`}>
        {metric.icon}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
        metric.trend.includes('+') && metric.title !== 'Bug Rate' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
      }`}>
        {metric.trend}
      </span>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{metric.title}</h3>
    <p className="text-2xl font-bold text-white mt-1 group-hover:text-sky-400 transition-colors">{metric.value}</p>
  </div>
);

// --- Page Components ---

const DashboardView = ({ insights }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <section>
      <h2 className="text-3xl font-bold text-white mb-1">Hello Rahul 👋</h2>
      <p className="text-slate-400">Your engineering performance summary for April</p>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {METRICS.map(m => (
        <MetricCard key={m.id} metric={m} />
      ))}
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-slate-800/30 border border-slate-800 p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="text-sky-400" size={20} />
            <span>Performance Trends</span>
          </h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PERFORMANCE_DATA}>
              <defs>
                <linearGradient id="colorLead" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9' }} />
              <Area type="monotone" dataKey="leadTime" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorLead)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
         <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-xs">Developer Health Score</h3>
         <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-700" />
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={440} strokeDashoffset={440 - (440 * 78) / 100} strokeLinecap="round" className="text-sky-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">78</span>
              <span className="text-slate-500 text-sm">/ 100</span>
            </div>
         </div>
         <div className="flex items-center space-x-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-sm">
            <TrendingUp size={14} />
            <span>Status: Improving</span>
         </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-6 text-sky-400">
          <AlertCircle size={20} />
          <h3 className="text-lg font-bold text-white">What is Happening?</h3>
        </div>
        <div className="space-y-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start space-x-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-700/30 group hover:border-sky-500/30 transition-all">
              <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${insight.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
              <p className="text-sm text-slate-300 leading-relaxed group-hover:text-white transition-colors">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-500/20 p-6 rounded-3xl">
        <h3 className="text-lg font-bold text-white mb-6">Smart Recommendations</h3>
        <div className="space-y-4">
          {["Split large PRs into smaller reviews", "Add unit tests before merge", "Daily 30-min review block"].map((text, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-md p-4 rounded-2xl flex items-center space-x-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-sky-500 text-xs font-bold text-white">{idx + 1}</span>
              <span className="text-sm font-medium text-slate-200">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PlaceholderView = ({ title }) => (
  <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-500">
    <div className="p-6 bg-slate-800/50 rounded-full text-sky-400 mb-4">
      <Info size={48} />
    </div>
    <h2 className="text-3xl font-bold text-white">{title}</h2>
    <p className="text-slate-400 max-w-md">This module is part of the premium intelligence suite. Data is currently being synchronized from your connected VCS repositories.</p>
    <button className="bg-sky-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-sky-400 transition-all">Refresh Sync</button>
  </div>
);

const SettingsView = () => (
  <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
    <h2 className="text-3xl font-bold text-white">Settings</h2>
    <div className="bg-slate-800/30 border border-slate-800 rounded-3xl p-6 space-y-6">
      {[
        { label: "Notification Settings", icon: <Bell size={18}/> },
        { label: "VCS Integrations (GitHub/GitLab)", icon: <Box size={18}/> },
        { label: "Security & API Keys", icon: <Shield size={18}/> },
        { label: "Team Permissions", icon: <Users size={18}/> },
      ].map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl hover:bg-slate-800/50 cursor-pointer transition-all border border-transparent hover:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="text-sky-400">{item.icon}</div>
            <span className="font-medium">{item.label}</span>
          </div>
          <ChevronDown size={18} className="-rotate-90 text-slate-500" />
        </div>
      ))}
    </div>
  </div>
);

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const insights = useMemo(() => [
    { text: "Your cycle time increased by 18%. Likely due to delayed code reviews.", type: "warning" },
    { text: "Bug rate is 2% above team average this month.", type: "alert" },
    { text: "PR throughput dropped slightly. Blockers identified in 'Staging'.", type: "info" }
  ], []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <DashboardView insights={insights} />;
      case 'Settings': return <SettingsView />;
      default: return <PlaceholderView title={activeTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col hidden lg:flex bg-[#0f172a] z-50">
        <div className="p-8 flex items-center space-x-2">
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
            <Zap className="text-white" size={20} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            DevPulse AI
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'Dashboard', icon: <LayoutDashboard size={20} /> },
            { id: 'Developer Insights', icon: <Users size={20} /> },
            { id: 'Team Analytics', icon: <BarChart3 size={20} /> },
            { id: 'Reports', icon: <FileText size={20} /> },
            { id: 'Settings', icon: <Settings size={20} /> },
          ].map(item => (
            <SidebarItem 
              key={item.id} 
              icon={item.icon} 
              label={item.id} 
              active={activeTab === item.id} 
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-3 bg-slate-800/30 rounded-2xl border border-slate-700/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white font-bold">R</div>
            <div>
              <p className="text-sm font-semibold text-white">Rahul S.</p>
              <p className="text-xs text-slate-500">Lead Engineer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-40">
          <h2 className="text-lg font-semibold text-white">{activeTab} Overview</h2>
          <div className="flex items-center space-x-4">
            <button className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2">
              <Download size={16} />
              <span>Export PDF</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;