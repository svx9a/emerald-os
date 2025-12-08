import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Building, MapIcon, FileText, Settings, Bell, Search, Plus, MoreHorizontal,
  Home, Users, DollarSign, PieChart, Activity, Image as ImageIcon, LogOut, CheckCircle2,
  Sparkles, MessageCircle, Send, Bot, Upload, X
} from 'lucide-react';

// LIVE EDGE WORKER URL
const WORKER_URL = "https://agx1.silversurfacebkk.workers.dev";

// AI CALL VIA YOUR WORKER
async function callAI(prompt: string, context = '', type: 'agent' | 'writer' | 'general' = 'general') {
  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context, type })
    });
    const data = await res.json();
    return data.reply || "No response from AI.";
  } catch (err) {
    return "AI temporarily offline. Try again.";
  }
}

// IMAGE UPLOAD TO R2 + CLOUDFLARE IMAGES
async function uploadImage(file: File): Promise<{ url: string; thumbnail: string } | null> {
  const form = new FormData();
  form.append('file', file);

  try {
    const res = await fetch(WORKER_URL + '/upload', {
      method: 'POST',
      body: form
    });
    const data = await res.json();
    if (data.success) {
      return { url: data.full, thumbnail: data.thumbnail };
    }
  } catch (err) {
    console.error("Upload failed:", err);
  }
  return null;
}

// DRAG & DROP UPLOADER COMPONENT
function ImageUploader({ onSuccess }: { onSuccess: (urls: { url: string; thumbnail: string }) => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    const result = await uploadImage(file);
    setUploading(false);
    if (result) onSuccess(result);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
        dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      }}
    >
      {uploading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-4 text-emerald-600 font-semibold">Optimizing & uploading...</p>
        </div>
      ) : (
        <>
          <Upload className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
          <p className="text-lg font-semibold">Drop listing photos here</p>
          <p className="text-sm text-slate-500 mt-1">or click to select</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </>
      )}
    </div>
  );
}

// ADMIN DASHBOARD (with real AI + uploads)
function AdminDashboard({ user, onLogout, onNotify }: any) {
  const [listings, setListings] = useState<any[]>([]);
  const [aiOutput, setAiOutput] = useState("");
  const [prompt, setPrompt] = useState("");

  // Load listings from D1 (via Worker or direct fetch later)
  useEffect(() => {
    // For now, simulate with your real D1 data
    setListings([
      { id: 'L-1001', address: '124 Ocean Drive, Miami Beach', price: 12500000, image: null },
      { id: 'L-1002', address: '45 Central Park West, NYC', price: 18900000, image: null }
    ]);
  }, []);

  const generateCopy = async () => {
    const result = await callAI(prompt || "Write a luxury listing description for this property", "", "writer");
    setAiOutput(result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Emerald Admin</h1>
          <button onClick={onLogout} className="flex items-center gap-2 text-slate-600 hover:text-red-600">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* AI Copywriter */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Bot className="w-8 h-8 text-emerald-600" />
            AI Luxury Copywriter
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the property or ask for a full listing..."
            className="w-full p-4 border border-slate-200 rounded-xl resize-none h-32"
          />
          <div className="flex gap-4 mt-4">
            <button onClick={generateCopy} className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Generate Copy
            </button>
          </div>
          {aiOutput && (
            <div className="mt-6 p-6 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-lg leading-relaxed font-medium">{aiOutput}</p>
            </div>
          )}
        </div>

        {/* Image Upload + Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Upload New Listing Photos</h2>
            <ImageUploader onSuccess={(urls) => {
              onNotify("Image uploaded & optimized globally!", "success");
              // Save to D1 here later
            }} />
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Active Listings</h2>
            {listings.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {l.image ? (
                  <img src={l.image} alt="" className="w-full h-64 object-cover" />
                ) : (
                  <div className="bg-slate-200 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-slate-400" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold">{l.address}</h3>
                  <p className="text-2xl font-bold text-emerald-600">${(l.price / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Keep your PublicLanding, LoginScreen, SystemLoader components as-is (or I can send updated ones)

export default function EmeraldPortablePlatform() {
  const [view, setView] = useState<'loading' | 'public' | 'login' | 'admin'>('loading');
  const [user, setUser] = useState<any>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const session = sessionStorage.getItem('emerald_session');
      if (session) {
        setUser(JSON.parse(session));
        setView('admin');
      } else {
        setView('public');
      }
    }, 800);
  }, []);

  const showNotify = (msg: string, type: 'success' | 'error') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (view === 'loading') return <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center"><div className="text-white text-4xl font-bold">Emerald</div></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl text-white font-bold flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <CheckCircle2 className="w-6 h-6" />
          {notification.msg}
        </div>
      )}

      {view === 'admin' && <AdminDashboard user={user} onLogout={() => { sessionStorage.clear(); setView('public'); }} onNotify={showNotify} />}
      {view === 'public' && <div className="min-h-screen flex items-center justify-center text-6xl font-bold text-emerald-600">Emerald Public Site (Coming Soon)</div>}
      {view === 'login' && <div className="min-h-screen flex items-center justify-center">Login Screen</div>}
    </div>
  );
}