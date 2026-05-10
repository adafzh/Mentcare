import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Heart, Eye, EyeOff } from 'lucide-react';

export default function AuthScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Mohon isi email dan kata sandi.');
      return;
    }

    if (!isLogin && !name) {
      setError('Mohon isi nama lengkap Anda.');
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('mentcare_users') || '{}');

    if (isLogin) {
      const user = savedUsers[email];
      if (!user) {
        setError('Email tidak terdaftar. Silakan daftar terlebih dahulu.');
        return;
      }
      if (user.password !== password) {
        setError('Kata sandi salah. Mohon periksa kembali.');
        return;
      }
      onLogin(user.name);
    } else {
      if (savedUsers[email]) {
        setError('Email sudah terdaftar. Silakan masuk saja.');
        return;
      }
      // Register new user
      savedUsers[email] = { name, password };
      localStorage.setItem('mentcare_users', JSON.stringify(savedUsers));
      onLogin(name);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg-off overflow-y-auto px-6 py-12 flex flex-col">
      <div className="mb-12">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-6 border border-white/10 p-3 shadow-lg">
          <img 
            src="/logo.png" 
            alt="Mentcare Logo" 
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-4xl font-bold text-dark mb-3 tracking-tight">
          {isLogin ? 'Selamat Datang Kembali' : 'Daftar Akun Baru'}
        </h1>
        <p className="text-dark/40 font-medium text-base">
          {isLogin ? 'Masuk untuk mengelola kesehatan mentalmu.' : 'Mulai perjalanan ketenanganmu hari ini.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLogin && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-dark/30 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20" />
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-dark/5 shadow-sm rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-dark/30 uppercase tracking-[0.2em] ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20" />
            <input 
              type="email" 
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-dark/5 shadow-sm rounded-2xl py-4.5 pl-14 pr-6 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-dark/30 uppercase tracking-[0.2em] ml-1">Kata Sandi</label>
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-dark/5 shadow-sm rounded-2xl py-4.5 pl-14 pr-14 outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-dark/20 hover:text-dark/40 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="pt-8">
          <button 
            type="submit"
            className="w-full bg-primary text-white py-4.5 rounded-full font-bold shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
          >
            {isLogin ? 'Masuk Sekarang' : 'Daftar Akun'}
          </button>
        </div>
      </form>

      <div className="mt-auto pt-12 text-center">
        <p className="text-dark/60 font-medium">
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-primary font-bold decoration-2"
          >
            {isLogin ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  );
}
