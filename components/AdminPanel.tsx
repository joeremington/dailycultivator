
import React, { useState, useRef } from 'react';
import { AppSettings, ThemeMode, PricingTier, ThemeColors } from '../types';
import UserManagementTable from './UserManagementTable';

interface AdminPanelProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onUpdate }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'branding' | 'users' | 'pricing'>('branding');
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessKey === 'admin123' || accessKey === 'admin@dailycultivator.com') {
      setIsAdmin(true);
      setError('');
    } else {
      setError('Invalid access credentials. Use "admin123"');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for demo
        alert("File is too large. Please select an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSettings({
          ...localSettings,
          logoUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const updateTier = (index: number, updates: Partial<PricingTier>) => {
    const newTiers = [...localSettings.pricing.tiers];
    newTiers[index] = { ...newTiers[index], ...updates };
    setLocalSettings({ ...localSettings, pricing: { tiers: newTiers } });
  };

  const updateColor = (mode: 'light' | 'dark', key: keyof ThemeColors, value: string) => {
    setLocalSettings({
      ...localSettings,
      branding: {
        ...localSettings.branding,
        [mode]: {
          ...localSettings.branding[mode],
          [key]: value
        }
      }
    });
  };

  const handleApplyGlobally = () => {
    onUpdate(localSettings);
    alert("Brand changes have been applied to the entire application successfully!");
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-surface rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-2xl text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
          <i className="fa-solid fa-lock text-2xl"></i>
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">Admin Console</h2>
        <p className="text-sm opacity-60 mb-8 font-medium">Authentication required.</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="password" 
            placeholder="Master Key"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none text-center font-bold tracking-widest text-primary"
          />
          {error && <p className="text-red-500 text-[10px] font-black uppercase">{error}</p>}
          <button type="submit" className="w-full py-4 bg-primary text-white font-black rounded-2xl shadow-lg hover:scale-[1.02] transition-transform">Unlock Control Center</button>
        </form>
      </div>
    );
  }

  const ColorField = ({ mode, label, keyName }: { mode: 'light' | 'dark', label: string, keyName: keyof ThemeColors }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[9px] font-black uppercase opacity-50 tracking-widest ml-1">{label}</label>
      <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-900/50 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
        <input 
          type="color" 
          value={localSettings.branding[mode][keyName]} 
          onChange={(e) => updateColor(mode, keyName, e.target.value)}
          className="w-9 h-9 rounded-lg overflow-hidden border-none cursor-pointer p-0 bg-transparent"
        />
        <input 
          type="text" 
          value={localSettings.branding[mode][keyName]} 
          onChange={(e) => updateColor(mode, keyName, e.target.value)}
          className="bg-transparent border-none text-[10px] font-mono font-black w-full uppercase focus:outline-none"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-surface p-2 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-20">
        <div className="flex gap-1">
          {['branding', 'users', 'pricing'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-primary text-white shadow-md' : 'opacity-40 hover:opacity-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button 
          onClick={handleApplyGlobally}
          className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
           Apply Globally
        </button>
      </div>

      {activeTab === 'branding' && (
        <div className="space-y-8">
          <div className="bg-surface p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
            <div>
              <h3 className="font-black text-xl flex items-center gap-3 mb-6">
                <i className="fa-solid fa-signature text-primary"></i>
                App Identity
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-widest ml-1">Application Name</label>
                  <input 
                    type="text" 
                    value={localSettings.appName} 
                    onChange={(e) => setLocalSettings({...localSettings, appName: e.target.value})}
                    className="w-full mt-1.5 px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-black text-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase opacity-50 tracking-widest ml-1">App Logo (Icon / Favicon)</label>
                  <div className="mt-1.5 flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center overflow-hidden">
                      {localSettings.logoUrl ? (
                        <img src={localSettings.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <i className="fa-solid fa-image opacity-20"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary/20 transition-all border border-primary/20"
                      >
                        Upload Image
                      </button>
                      <p className="text-[9px] mt-1 opacity-40 font-bold uppercase tracking-tighter">Recommended: Square SVG or PNG</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Light Mode Scheme</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ColorField mode="light" label="Brand Primary" keyName="primary" />
                  <ColorField mode="light" label="Brand Secondary" keyName="secondary" />
                  <ColorField mode="light" label="Page Background" keyName="background" />
                  <ColorField mode="light" label="Component Surface" keyName="surface" />
                  <ColorField mode="light" label="Main Text" keyName="text" />
                  <ColorField mode="light" label="Muted Text" keyName="textMuted" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Dark Mode Scheme</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <ColorField mode="dark" label="Brand Primary" keyName="primary" />
                  <ColorField mode="dark" label="Brand Secondary" keyName="secondary" />
                  <ColorField mode="dark" label="Page Background" keyName="background" />
                  <ColorField mode="dark" label="Component Surface" keyName="surface" />
                  <ColorField mode="dark" label="Main Text" keyName="text" />
                  <ColorField mode="dark" label="Muted Text" keyName="textMuted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserManagementTable />}
      
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {localSettings.pricing.tiers.map((tier, idx) => (
            <div key={tier.id} className="bg-surface p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="text-4xl mb-2">{tier.badge}</div>
                <h4 className="font-black text-xl tracking-tight">{tier.name}</h4>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase opacity-40">Price / mo</span>
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="font-bold text-primary">$</span>
                    <input 
                      type="number" 
                      value={tier.price / 100} 
                      onChange={(e) => updateTier(idx, { price: Math.round(parseFloat(e.target.value) * 100) })}
                      className="w-16 bg-transparent font-black focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                {Object.entries(tier.limits).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-[9px] font-black uppercase opacity-50 tracking-widest">{key}</label>
                    <input 
                      type="number" 
                      value={val} 
                      onChange={(e) => updateTier(idx, { limits: { ...tier.limits, [key]: parseInt(e.target.value) } })}
                      className="w-full mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-black"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
