import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileCheck, Shield, AlertTriangle, FileImage, FileText, ExternalLink, X } from 'lucide-react';
import { saveLicense, getLicense } from '../utils/vaultDB';

export default function ComplianceVault() {
  const [license, setLicense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [objectUrl, setObjectUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadLicense();
  }, []);

  useEffect(() => {
    if (license) {
      const url = URL.createObjectURL(license);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [license]);

  const loadLicense = async () => {
    setIsLoading(true);
    const storedLicense = await getLicense();
    if (storedLicense) {
      setLicense(storedLicense);
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const success = await saveLicense(file);
    if (success) {
      setLicense(file);
    } else {
      alert("Failed to securely store license. Please try again.");
    }
  };

  const clearLicense = async () => {
    if(window.confirm("Upload a new license? This will replace your currently saved license.")) {
        fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-4 font-mono text-slate-100 pb-32">
      <div className="flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
        <Shield className="text-emerald-500" size={20} />
        <h2 className="text-lg font-bold tracking-widest text-emerald-400 uppercase">Compliance Vault</h2>
      </div>

      {/* License Storage Zone */}
      <div className="mb-8">
        <h3 className="text-xs text-zinc-500 tracking-[0.2em] mb-3 uppercase flex items-center justify-between">
          <span>Digital License Wallet</span>
          <span className="bg-zinc-900 px-2 py-0.5 rounded text-[0.6rem] text-zinc-400">OFFLINE READY</span>
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center p-8 bg-zinc-900/50 rounded-lg border border-zinc-800 animate-pulse">
            <span className="text-zinc-500 text-xs">DECRYPTING VAULT...</span>
          </div>
        ) : license ? (
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-lg overflow-hidden flex flex-col relative">
            <div className="absolute top-2 right-2 bg-zinc-950/80 p-1.5 rounded-md border border-zinc-800 z-10 cursor-pointer" onClick={clearLicense}>
                <UploadCloud size={14} className="text-emerald-400" />
            </div>
            
            {license.type.includes('image') ? (
              <img src={objectUrl} alt="Fishing License" className="w-full h-auto max-h-64 object-contain bg-zinc-950" />
            ) : license.type.includes('pdf') ? (
              <div className="p-8 flex flex-col items-center justify-center text-center bg-zinc-950">
                <FileText size={48} className="text-emerald-500 mb-3" />
                <span className="text-sm text-slate-300 font-bold mb-1 max-w-[200px] truncate">{license.name}</span>
                <span className="text-xs text-zinc-500 mb-4">{(license.size / 1024 / 1024).toFixed(2)} MB • PDF Document</span>
                <a href={objectUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-md hover:bg-emerald-900 transition-colors text-xs font-bold tracking-wider">
                  <ExternalLink size={14} /> VIEW LICENSE
                </a>
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">Unsupported File Type</div>
            )}
            
            <div className="bg-emerald-950/20 px-4 py-2 border-t border-emerald-500/20 flex items-center justify-between">
                <span className="text-[0.65rem] text-emerald-500 font-bold tracking-widest flex items-center gap-1.5">
                    <FileCheck size={12} /> SECURE OFFLINE VAULT
                </span>
            </div>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center p-8 bg-zinc-900/30 rounded-lg border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/50 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Shield size={32} className="text-zinc-600 mb-3" />
            <span className="text-sm font-bold text-slate-300 tracking-widest mb-1 uppercase">Upload License</span>
            <span className="text-[0.65rem] text-zinc-500 text-center max-w-[200px] uppercase">Securely stored on your device. Supports Image & PDF.</span>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*,application/pdf" 
          className="hidden" 
        />
      </div>

      {/* Regulations Quick-Reference */}
      <div>
        <h3 className="text-xs text-zinc-500 tracking-[0.2em] mb-3 uppercase flex items-center gap-2">
          <AlertTriangle size={12} className="text-amber-500" />
          2026 Lake Michigan Limits
        </h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg divide-y divide-zinc-800/50 text-xs">
          <div className="p-3 flex justify-between items-center">
            <span className="font-bold text-slate-300">Coho Salmon</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">5 / DAY</span>
          </div>
          <div className="p-3 flex justify-between items-center">
            <span className="font-bold text-slate-300">Lake Trout</span>
            <div className="text-right">
              <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mb-1">2 / DAY</span>
              <div className="text-[0.55rem] text-zinc-500 uppercase">Min 15 inches</div>
            </div>
          </div>
          <div className="p-3 flex justify-between items-center bg-yellow-950/10">
            <span className="font-bold text-yellow-500">Brown Trout</span>
            <div className="text-right">
              <span className="text-yellow-500 font-bold bg-yellow-950/50 px-2 py-0.5 rounded border border-yellow-500/20 inline-block mb-1">2 / DAY</span>
              <div className="text-[0.55rem] text-zinc-500 uppercase">Min 10 inches</div>
            </div>
          </div>
          <div className="p-3 flex justify-between items-center">
            <span className="font-bold text-slate-300">Walleye</span>
            <div className="text-right">
              <span className="text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mb-1">5 / DAY</span>
              <div className="text-[0.55rem] text-zinc-500 uppercase">Min 15 inches</div>
            </div>
          </div>
          <div className="p-3 bg-zinc-950 text-[0.6rem] text-zinc-500 leading-relaxed border-t border-zinc-800">
            DISCLAIMER: These regulations are provided for general informational purposes only and do not have legal force or effect. Always consult the official Wisconsin DNR Guide to Fishing Regulations before harvesting fish. Pine Forge Digital LLC is not responsible for legal violations.
          </div>
          <a href="https://gowild.wi.gov/" target="_blank" rel="noreferrer" className="block p-3 text-center bg-zinc-800 hover:bg-zinc-700 text-slate-200 uppercase tracking-widest font-bold transition-colors">
            💳 PURCHASE / RENEW ON GO WILD
          </a>
        </div>
      </div>
    </div>
  );
}
