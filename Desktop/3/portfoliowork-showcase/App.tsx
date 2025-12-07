import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building, 
  Map as MapIcon, 
  FileText, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  MoreHorizontal,
  Home,
  Users,
  DollarSign,
  PieChart,
  Activity,
  Server,
  Cpu,
  RefreshCw,
  Zap,
  Lock,
  LogOut,
  ArrowRight,
  Menu,
  X,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Globe,
  CheckCircle2,
  Image as ImageIcon,
  Rocket,
  GitBranch,
  Terminal,
  ShieldCheck,
  Eye,
  ChevronRight
} from 'lucide-react';

// --- CUSTOM BRAND ASSETS ---
const AeLogo = ({ className = "w-8 h-8" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 100 100" 
    className={className}
    fill="none"
    aria-label="AE Real Estate Logo"
  >
    <defs>
      <linearGradient id="ae-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#065f46" />
      </linearGradient>
    </defs>
    <path 
      d="M50 5 L85 85 H65 L50 45 L35 85 H15 L50 5Z" 
      fill="url(#ae-grad)" 
      stroke="#10b981" 
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <rect x="70" y="35" width="15" height="50" rx="2" fill="#065f46" opacity="0.8" />
    <rect x="70" y="45" width="25" height="8" rx="2" fill="#10b981" />
    <rect x="70" y="65" width="20" height="8" rx="2" fill="#10b981" />
    <rect x="10" y="90" width="80" height="5" rx="2.5" fill="#10b981" />
    <circle cx="50" cy="25" r="5" fill="#ffffff" stroke="#065f46" strokeWidth="2" />
  </svg>
);

// --- MOCK ANALYTICS ENGINE ---
const AnalyticsEngine = {
  log: (event, metadata = {}) => {
    const timestamp = new Date().toISOString();
    console.log(`[ANALYTICS] ${timestamp} | ${event}`, metadata);
  },
  trackPage: (pageName) => {
    console.log(`[PAGE_VIEW] ${pageName}`);
  }
};

// --- EDGE STORAGE SIMULATION (Cloudflare KV) ---
const EdgeKV = {
  KEY: 'emerald_portable_db',
  
  seed: {
    listings: [
      { id: 'L-1024', address: '124 Ocean Blvd, Miami', price: 1250000, status: 'Active', type: 'Residential', dom: 14, views: 1240, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1600' },
      { id: 'L-1025', address: '880 Broadway, NYC', price: 850000, status: 'Pending', type: 'Condo', dom: 45, views: 3400, image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1600' },
      { id: 'L-1026', address: '45 Park Ave, Chicago', price: 2100000, status: 'Coming Soon', type: 'Estate', dom: 0, views: 120, image: 'https://images.unsplash.com/photo-1600596542815-6ad4c7213aa5?auto=format&fit=crop&q=80&w=1600' },
    ],
    blogs: [
      { id: 1, title: 'Q4 Market Analysis', date: 'Oct 24', snippet: 'Why waterfront properties are surging in value...' }
    ],
    stats: {
      salesVolume: 4250000,
      activeListings: 12,
      leads: 145,
      aiInsight: "Market analysis indicates a 15% surge in waterfront demand."
    },
    deployment: {
      env: 'production',
      version: 'v2.0.0-stable',
      lastDeploy: 'Just now',
      status: 'healthy'
    }
  },

  getData() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : this.seed;
  },

  saveData(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  async fetchListings() {
    await new Promise(r => setTimeout(r, 600)); 
    return this.getData().listings;
  },

  async addListing(listing) {
    await new Promise(r => setTimeout(r, 800));
    const data = this.getData();
    const newListing = { ...listing, id: `L-${Math.floor(Math.random() * 10000)}`, dom: 0, views: 0 };
    data.listings.unshift(newListing);
    data.stats.activeListings += 1;
    this.saveData(data);
    AnalyticsEngine.log('LISTING_CREATED', { id: newListing.id });
    return newListing;
  },

  async fetchStats() {
    await new Promise(r => setTimeout(r, 400));
    return this.getData().stats;
  },

  async fetchDeploymentStatus() {
    await new Promise(r => setTimeout(r, 300));
    return this.getData().deployment;
  },
  
  async login(password) {
    await new Promise(r => setTimeout(r, 1000));
    if (password === 'admin123') return { token: 'edge-token-xyz', name: 'Alex Sterling', role: 'admin' };
    throw new Error('Invalid Credentials');
  }
};

// --- MAIN APPLICATION COMPONENT ---

export default function EmeraldPortablePlatform() {
  const [view, setView] = useState('loading'); // loading, public, login, admin
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Fast "App-like" boot
      await new Promise(r => setTimeout(r, 800));
      
      const session = sessionStorage.getItem('emerald_session');
      if (session) {
        setUser(JSON.parse(session));
        setView('admin');
        AnalyticsEngine.trackPage('Admin_Dashboard_Resume');
      } else {
        setView('public');
        AnalyticsEngine.trackPage('Public_Landing');
      }
    };
    init();
  }, []);

  const handleLogin = async (password) => {
    try {
      AnalyticsEngine.log('LOGIN_ATTEMPT');
      const userData = await EdgeKV.login(password);
      setUser(userData);
      sessionStorage.setItem('emerald_session', JSON.stringify(userData));
      setView('admin');
      showNotify('Welcome back, Alex.', 'success');
      AnalyticsEngine.log('LOGIN_SUCCESS', { user: userData.name });
    } catch (e) {
      showNotify('Access Denied: Invalid Key', 'error');
      AnalyticsEngine.log('LOGIN_FAILURE');
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('emerald_session');
    setView('public');
    showNotify('Session Terminated', 'neutral');
    AnalyticsEngine.log('LOGOUT');
  };

  const showNotify = (msg, type) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (view === 'loading') return <SystemLoader />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        :root { --font-body: 'Inter', sans-serif; --font-display: 'Playfair Display', serif; --font-mono: 'JetBrains Mono', monospace; }
        .font-display { font-family: var(--font-display); }
        .font-mono { font-family: var(--font-mono); }
        /* iOS Smooth Scrolling & Touch Tweaks */
        html { -webkit-tap-highlight-color: transparent; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .ios-blur { backdrop-filter: saturate(180%) blur(20px); background-color: rgba(255, 255, 255, 0.85); }
        .ios-blur-dark { backdrop-filter: saturate(180%) blur(20px); background-color: rgba(15, 23, 42, 0.85); }
      `}</style>

      {/* Notification Toast - Mobile Optimized */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-[100] px-4 py-3 rounded-2xl shadow-2xl text-white text-sm font-bold flex items-center justify-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300 ${
          notification.type === 'error' ? 'bg-red-500' : notification.type === 'success' ? 'bg-emerald-600' : 'bg-slate-800'
        }`}>
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
          {notification.msg}
        </div>
      )}

      {/* VIEW ROUTER */}
      {view === 'public' && <PublicLanding onLoginClick={() => setView('login')} />}
      {view === 'login' && <LoginScreen onLogin={handleLogin} onBack={() => setView('public')} />}
      {view === 'admin' && <AdminDashboard user={user} onLogout={handleLogout} onNotify={showNotify} />}
    </div>
  );
}

// --- 0. SYSTEM LOADER ---
function SystemLoader() {
  return (
    <div className="h-screen bg-slate-900 flex flex-col items-center justify-center text-emerald-500">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full border-[3px] border-emerald-900 border-t-emerald-500 animate-spin flex items-center justify-center">
           <AeLogo className="w-10 h-10 animate-pulse" />
        </div>
      </div>
      <p className="font-mono text-xs tracking-[0.2em] uppercase animate-pulse text-emerald-400">Initializing OS</p>
    </div>
  );
}

// --- 1. PUBLIC LANDING PAGE ---
function PublicLanding({ onLoginClick }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    AnalyticsEngine.trackPage('Public_Landing');
    EdgeKV.fetchListings().then(data => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="bg-white">
      {/* Navigation - iOS Sticky Blur */}
      <nav className="sticky top-0 z-40 ios-blur border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-900">
            <AeLogo className="w-8 h-8" />
            <span className="font-display font-bold text-xl tracking-tight">AE<span className="text-emerald-600">REAL</span>ESTATE</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <a href="#featured" className="hover:text-emerald-600 transition-colors">Collection</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">The Firm</a>
            <a href="#journal" className="hover:text-emerald-600 transition-colors">Journal</a>
            <button onClick={onLoginClick} className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors border border-slate-200 px-3 py-1.5 rounded-full hover:border-emerald-600 active:scale-95 duration-150">
              <Lock className="w-3 h-3" /> Agent
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={onLoginClick} className="p-2 text-slate-400 active:text-emerald-600 transition-colors">
              <Lock className="w-5 h-5" />
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-900 active:scale-90 transition-transform">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-xl animate-in slide-in-from-top-2">
            <div className="flex flex-col p-4 gap-2">
              <a href="#featured" className="p-4 text-lg font-display text-slate-900 hover:bg-slate-50 rounded-xl">Collection</a>
              <a href="#about" className="p-4 text-lg font-display text-slate-900 hover:bg-slate-50 rounded-xl">The Firm</a>
              <a href="#contact" className="p-4 text-lg font-display text-slate-900 hover:bg-slate-50 rounded-xl">Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative h-[80vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover opacity-60 scale-105 animate-[pulse_10s_ease-in-out_infinite_alternate]" 
            alt="Luxury Home"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/20 to-slate-900/90"></div>
        </div>
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="font-display text-5xl md:text-8xl font-bold mb-6 md:mb-8 leading-[1.1] tracking-tight">
            Curating the <br/><span className="italic text-emerald-400">Exceptional.</span>
          </h1>
          <p className="text-base md:text-xl font-light text-slate-200 mb-10 md:mb-12 max-w-xl md:max-w-2xl mx-auto leading-relaxed">
            Exclusive representation for the world's most distinguished properties. Powered by proprietary market intelligence.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 w-full md:w-auto">
            <button className="bg-white text-slate-900 px-10 py-4 rounded-xl md:rounded-none font-bold text-sm tracking-widest hover:bg-emerald-50 transition-all active:scale-95 uppercase w-full md:w-auto shadow-lg shadow-white/10">
              View Collection
            </button>
            <button className="ios-blur text-white px-10 py-4 rounded-xl md:rounded-none font-bold text-sm tracking-widest hover:bg-white/20 transition-all active:scale-95 uppercase w-full md:w-auto border border-white/20">
              Contact Agent
            </button>
          </div>
        </div>
      </header>

      {/* Featured Listings */}
      <section id="featured" className="py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex flex-row justify-between items-end mb-12 md:mb-16">
          <div>
            <span className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-2 block">Our Portfolio</span>
            <h2 className="font-display text-3xl md:text-5xl text-slate-900">Featured Residences</h2>
          </div>
          <button className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-emerald-600 transition-colors group">
            View All Properties <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {[1,2,3].map(i => <div key={i} className="aspect-[4/5] bg-slate-100 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 md:gap-10">
            {listings.slice(0, 3).map((item) => (
              <div key={item.id} className="group cursor-pointer active:scale-[0.98] transition-transform duration-300">
                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 mb-5 rounded-2xl shadow-sm">
                  <img 
                    src={item.image} 
                    alt={item.address}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 md:opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 left-4 ios-blur px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-900 shadow-sm border border-white/20">
                    {item.status}
                  </div>
                  {/* Mobile Price Overlay */}
                  <div className="absolute bottom-4 left-4 md:hidden text-white">
                    <p className="font-bold text-lg">${item.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-xl md:text-2xl text-slate-900 mb-1 group-hover:text-emerald-800 transition-colors">{item.address}</h3>
                    <p className="text-slate-500 text-sm font-medium">{item.type} Residence</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <span className="font-bold text-slate-900 block text-lg">${item.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <button className="md:hidden w-full mt-8 py-4 bg-slate-100 rounded-xl font-bold text-slate-900 active:bg-slate-200 transition-colors">
            View All Properties
        </button>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-16 md:py-24 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <div className="flex items-center gap-2 mb-6 text-emerald-500">
               <AeLogo className="w-10 h-10" />
               <span className="font-display font-bold text-2xl">AE<span className="text-white">REAL</span>ESTATE</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl mb-6 leading-tight">Representing the Art of Living.</h2>
            <div className="flex gap-8 mb-8">
              <Instagram className="w-6 h-6 text-slate-500 cursor-pointer hover:text-emerald-500 transition-colors" />
              <Linkedin className="w-6 h-6 text-slate-500 cursor-pointer hover:text-emerald-500 transition-colors" />
              <Facebook className="w-6 h-6 text-slate-500 cursor-pointer hover:text-emerald-500 transition-colors" />
              <Twitter className="w-6 h-6 text-slate-500 cursor-pointer hover:text-emerald-500 transition-colors" />
            </div>
          </div>
          <div className="bg-slate-900 p-8 md:p-10 rounded-3xl border border-slate-800">
            <h3 className="font-display text-xl md:text-2xl mb-2">Private Consultation</h3>
            <p className="text-slate-400 text-sm mb-6">Join our exclusive off-market list.</p>
            <form className="space-y-4">
              <input type="email" placeholder="Email Address" className="w-full bg-slate-950 border border-slate-800 p-4 text-white focus:outline-none focus:border-emerald-600 rounded-xl transition-colors text-base" />
              <button className="w-full bg-emerald-600 text-white font-bold py-4 hover:bg-emerald-500 transition-colors rounded-xl uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/50 active:scale-95 duration-150">
                Request Access
              </button>
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- 2. LOGIN SCREEN (Mobile Optimized) ---
function LoginScreen({ onLogin, onBack }) {
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => AnalyticsEngine.trackPage('Login_Screen'), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(pass);
    setLoading(false);
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center px-6 relative overflow-hidden supports-[height:100svh]:h-[100svh]">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),rgba(255,255,255,0))]" />
      
      <button onClick={onBack} className="absolute top-safe-top left-6 pt-4 text-slate-500 hover:text-white flex items-center gap-2 text-sm font-bold z-10 transition-colors active:scale-95">
        <ArrowRight className="w-4 h-4 rotate-180" /> <span className="hidden md:inline">Return to Site</span>
      </button>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-500 rounded-3xl relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 mb-6 ring-4 ring-emerald-50/50">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-display text-3xl text-slate-900 font-bold mb-2">Admin Portal</h2>
          <p className="text-slate-500 text-sm">Secure Entry Point • Edge Authenticated</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide ml-1">Access Key</label>
            <div className="relative group">
              <input 
                type="password" 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className="w-full p-4 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 font-mono text-lg transition-all bg-slate-50 focus:bg-white text-base md:text-lg"
                autoFocus
              />
              <ShieldCheck className="absolute right-4 top-4 text-emerald-500 w-5 h-5 opacity-50 group-focus-within:opacity-100 transition-opacity" />
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1 ml-1">
               <Zap className="w-3 h-3" /> Connection Encrypted
               <span className="ml-auto opacity-50">Demo: admin123</span>
            </p>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-emerald-600 disabled:opacity-50 flex justify-center items-center gap-2 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98]"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'AUTHENTICATE'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- 3. ADMIN DASHBOARD (Responsive) ---
function AdminDashboard({ user, onLogout, onNotify }) {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [deployStatus, setDeployStatus] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newListing, setNewListing] = useState({ address: '', price: '', type: 'Residential', status: 'Active' });

  useEffect(() => {
    loadData();
    AnalyticsEngine.trackPage('Admin_Dashboard');
  }, []);

  const loadData = async () => {
    const s = await EdgeKV.fetchStats();
    const l = await EdgeKV.fetchListings();
    const d = await EdgeKV.fetchDeploymentStatus();
    setStats(s);
    setListings(l);
    setDeployStatus(d);
  };

  const handleCreate = async () => {
    if (!newListing.address || !newListing.price) return onNotify('Please fill required fields', 'error');
    const demoImg = `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1600585154340-be6161a56a0c' : '1512917774080-9991f1c4c750'}?auto=format&fit=crop&q=80&w=1600`;
    await EdgeKV.addListing({ ...newListing, price: parseInt(newListing.price), image: demoImg });
    setShowCreate(false);
    setNewListing({ address: '', price: '', type: 'Residential', status: 'Active' });
    onNotify('Listing Published to Edge', 'success');
    loadData();
  };

  return (
    <div className="flex h-screen bg-slate-50 supports-[height:100svh]:h-[100svh] overflow-hidden">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 bg-slate-900 text-white flex-col hidden md:flex shadow-2xl z-20">
        <div className="h-24 flex items-center px-8 border-b border-slate-800">
           <AeLogo className="w-8 h-8 mr-3" />
           <span className="font-bold text-lg tracking-tight">AE<span className="text-emerald-500">OS</span></span>
        </div>
        <nav className="p-6 space-y-2 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Overview" active={tab === 'overview'} onClick={() => setTab('overview')} />
          <SidebarItem icon={Home} label="Properties" active={tab === 'listings'} onClick={() => setTab('listings')} />
          <SidebarItem icon={Rocket} label="Deployments" active={tab === 'deploy'} onClick={() => setTab('deploy')} />
          <SidebarItem icon={Users} label="Clients" />
          <SidebarItem icon={Cpu} label="AI Writer" />
        </nav>
        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-900 text-emerald-200 flex items-center justify-center font-bold text-sm ring-2 ring-emerald-800">AS</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <div className="text-xs text-emerald-500 flex items-center gap-1 mt-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center gap-3 text-slate-400 hover:text-white text-sm font-medium transition-colors p-2 rounded-lg hover:bg-slate-800 active:scale-95">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative w-full">
        
        {/* MOBILE HEADER */}
        <header className="h-16 md:h-24 bg-white/80 ios-blur border-b border-slate-200 px-4 md:px-10 flex justify-between items-center shadow-sm z-30 sticky top-0">
          <div className="flex items-center gap-2 md:hidden text-emerald-900">
             <AeLogo className="w-6 h-6" />
             <span className="font-display font-bold text-lg">AE<span className="text-emerald-600">OS</span></span>
          </div>
          
          <div className="hidden md:block">
             <h1 className="text-2xl font-bold text-slate-800 capitalize tracking-tight">{tab === 'deploy' ? 'Deployment Center' : tab === 'listings' ? 'Property Assets' : 'Dashboard Overview'}</h1>
             <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                System Status: Healthy
             </p>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative active:scale-90 transition-transform">
               <Bell className="w-6 h-6" />
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <button onClick={() => setShowCreate(true)} className="bg-emerald-600 text-white p-2 md:px-6 md:py-3 rounded-full md:rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> <span className="hidden md:inline">New Listing</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 no-scrollbar">
          
          {tab === 'overview' && (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* AI Insight Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <Zap className="w-4 h-4" /> Daily AI Insight
                  </div>
                  <p className="text-lg md:text-2xl font-light opacity-90 leading-relaxed max-w-3xl">"{stats?.aiInsight}"</p>
                  <div className="mt-6 flex gap-3">
                     <button className="text-xs font-bold bg-white/10 px-4 py-2.5 rounded-lg backdrop-blur-md active:bg-white/20 transition-colors">Generate Report</button>
                  </div>
                </div>
              </div>

              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <StatCard label="Volume" value={`$${(stats?.salesVolume/1000000).toFixed(1)}M`} icon={DollarSign} trend="+12%" />
                <StatCard label="Assets" value={stats?.activeListings} icon={Home} trend="+2" />
                <StatCard label="Leads" value={stats?.leads} icon={Users} trend="+5" />
                <StatCard label="Tasks" value="4" icon={CheckCircle2} color="amber" />
              </div>

              {/* Recent Listings - Mobile: Cards, Desktop: Table */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 font-bold text-slate-800 flex justify-between items-center bg-slate-50/50">
                   <span>Recent Activity</span>
                   <button className="text-sm text-emerald-600 font-medium">View All</button>
                </div>
                
                {/* Desktop Table */}
                <table className="w-full text-sm text-left hidden md:table">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Property Address</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Valuation</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {listings.slice(0, 5).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4"><div className="font-bold text-slate-900">{l.address}</div><div className="text-xs text-slate-500 mt-0.5">{l.type}</div></td>
                        <td className="px-6 py-4"><StatusBadge status={l.status} /></td>
                        <td className="px-6 py-4 text-right font-mono font-medium">${l.price.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right"><button className="text-slate-400 hover:text-emerald-600"><MoreHorizontal className="w-5 h-5" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {listings.slice(0, 4).map(l => (
                    <div key={l.id} className="p-4 flex items-center gap-4 active:bg-slate-50">
                      <img src={l.image} className="w-14 h-14 rounded-xl object-cover bg-slate-200" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 text-sm truncate">{l.address}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={l.status} />
                          <span className="text-xs text-slate-500 font-mono">${(l.price/1000000).toFixed(2)}M</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 animate-in fade-in duration-500">
               {listings.map(l => (
                 <div key={l.id} className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm active:scale-[0.99] transition-all">
                   <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      <img src={l.image} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3"><StatusBadge status={l.status} /></div>
                   </div>
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 leading-tight">{l.address}</h3>
                        <p className="text-sm text-slate-500 mt-1">{l.type}</p>
                      </div>
                      <div className="text-right">
                         <div className="font-mono font-bold text-lg text-slate-900">${(l.price/1000).toFixed(0)}k</div>
                      </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                      <button className="flex-1 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl active:bg-slate-800">Manage</button>
                      <button className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl active:bg-slate-50">Analytics</button>
                   </div>
                 </div>
               ))}
            </div>
          )}

          {tab === 'deploy' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                         <Rocket className="w-7 h-7" />
                      </div>
                      <div>
                         <h2 className="text-lg font-bold text-slate-900">Production</h2>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Live</span>
                            <span className="text-slate-400 text-xs">emeraldrealty.com</span>
                         </div>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Version</p>
                        <p className="text-xl font-mono text-slate-900 font-bold">{deployStatus?.version}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                         <p className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded-lg">Healthy</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 font-mono text-xs relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-30"><Terminal className="w-5 h-5 text-white" /></div>
                   <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Live Logs
                   </h3>
                   <div className="text-slate-400 space-y-2 h-48 overflow-y-auto">
                      <p className="text-emerald-500">➜ worker-init success</p>
                      <p>2024-10-24 10:42:15 [ANALYTICS] Page_View</p>
                      <p>2024-10-24 10:45:00 [INFO] Fetching stats...</p>
                      <p className="text-amber-400">2024-10-24 10:45:01 [WARN] Latency 120ms</p>
                      <p className="animate-pulse opacity-50">_ Waiting for requests...</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* MOBILE BOTTOM NAVIGATION - iOS Style */}
        <div className="md:hidden fixed bottom-0 w-full bg-white/90 ios-blur border-t border-slate-200 pb-safe-bottom z-40">
           <div className="grid grid-cols-5 h-16 items-center">
              <MobileNavItem icon={LayoutDashboard} label="Home" active={tab === 'overview'} onClick={() => setTab('overview')} />
              <MobileNavItem icon={Home} label="Assets" active={tab === 'listings'} onClick={() => setTab('listings')} />
              <div className="flex items-center justify-center -mt-8">
                 <button onClick={() => setShowCreate(true)} className="w-14 h-14 bg-emerald-600 rounded-full text-white shadow-lg shadow-emerald-500/40 flex items-center justify-center active:scale-90 transition-transform">
                    <Plus className="w-7 h-7" />
                 </button>
              </div>
              <MobileNavItem icon={Rocket} label="Deploy" active={tab === 'deploy'} onClick={() => setTab('deploy')} />
              <MobileNavItem icon={Users} label="Client" active={tab === 'clients'} onClick={() => setTab('clients')} />
           </div>
        </div>
      </main>

      {/* CREATE LISTING MODAL - Bottom Sheet style on Mobile */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-end md:items-center justify-center md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300 h-[85vh] md:h-auto flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-900">Add New Asset</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 bg-slate-200/50 rounded-full active:bg-slate-300 transition-colors"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Property Address</label>
                <input 
                  type="text" 
                  value={newListing.address} 
                  onChange={e => setNewListing({...newListing, address: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl p-4 text-base focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white" 
                  placeholder="e.g. 123 Palm Ave"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Price</label>
                  <input 
                    type="number" 
                    value={newListing.price}
                    onChange={e => setNewListing({...newListing, price: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl p-4 text-base focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 outline-none transition-all bg-slate-50 focus:bg-white" 
                    placeholder="$$$"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-wider">Status</label>
                  <select 
                    value={newListing.status}
                    onChange={e => setNewListing({...newListing, status: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl p-4 text-base outline-none bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all appearance-none"
                  >
                    <option>Active</option>
                    <option>Pending</option>
                    <option>Coming Soon</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-white pb-safe-bottom">
                 <button onClick={handleCreate} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-[0.98]">
                   Publish to Edge
                 </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- UTILS ---
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
    <Icon className="w-5 h-5" /> {label}
  </button>
);

const MobileNavItem = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition-transform ${active ? 'text-emerald-600' : 'text-slate-400'}`}>
     <Icon className={`w-6 h-6 ${active ? 'fill-emerald-100' : ''}`} />
     <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const StatCard = ({ label, value, icon: Icon, trend, color = 'emerald' }) => (
  <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-200 shadow-sm active:scale-[0.98] transition-all group">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 rounded-2xl ${color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
         <Icon className="w-5 h-5" />
      </div>
      {trend && <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{trend}</span>}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
    <div className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1">{label}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = { 
    Active: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/50', 
    Pending: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200/50', 
    Sold: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/50', 
    'Coming Soon': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200/50' 
  };
  return <span className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold ${styles[status] || styles.Active}`}>{status}</span>;
};