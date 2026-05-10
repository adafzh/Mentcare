import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { db, auth, googleProvider } from '../lib/firebase';
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  User, 
  Bell, 
  Search,
  Scan,
  Wind,
  Sparkles,
  Heart,
  ChevronRight,
  X,
  Zap,
  Smile,
  Meh,
  Frown,
  Volume2,
  Users,
  MessageCircle,
  ChevronDown,
  Settings,
  Lock,
  Languages,
  VolumeX,
  MapPin,
  Calendar,
  Send,
  Video,
  Monitor,
  Bookmark,
  PlayCircle,
  Clock,
  ArrowLeft,
  Share2,
  History,
  LogOut,
  HelpCircle,
  Activity,
  UserCircle,
  Camera,
  ArrowRight
} from 'lucide-react';
import { MainTab, UserProfile } from '../types';

// --- Components ---

function Logo({ className = "w-10 h-10" }: { className?: string }) {
  const [error, setError] = React.useState(false);

  if (error) {
    return <Sparkles className={`${className} text-white`} />;
  }

  return (
    <img 
      src="/logo.png" 
      alt="Mentcare Logo" 
      className={`${className} object-contain`}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export default function MainApp({ user: initialUser }: { user: UserProfile }) {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [showScan, setShowScan] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showVr, setShowVr] = useState(false);
  const [selectedExpertFromHome, setSelectedExpertFromHome] = useState<any>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Firestore error handler
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // We throw the error as a JSON string and also show a friendly message if needed
    throw new Error(JSON.stringify(errInfo));
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        try {
          // Load or create user profile
          const userRef = doc(db, 'users', authUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              name: data.name,
              avatar: data.avatar || authUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
              category: data.category || 'Umum'
            });
          } else {
            // New user, create profile
            const newUser = {
              name: authUser.displayName || 'Pengguna',
              avatar: authUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
              category: 'Umum',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            };
            await setDoc(userRef, newUser);
            setUser({ name: newUser.name, avatar: newUser.avatar, category: newUser.category });
          }

          // Load history
          const scansRef = collection(db, 'scans');
          const q = query(scansRef, where('userId', '==', authUser.uid), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const historyData = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            date: doc.data().dateString
          })) as any[];
          setScanHistory(historyData);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, 'init');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      try {
        await signOut(auth);
        setScanHistory([]);
      } catch (err) {
        console.error("Logout failed:", err);
      }
    }
  };

  const handleUpdateAvatar = async (newAvatar: string) => {
    setUser(prev => ({ ...prev, avatar: newAvatar }));
    
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, {
          name: user.name,
          category: 'Umum', // default
          avatar: newAvatar,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp() // setDoc will overwrite if exists, rule handles immutability of createdAt
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  // Functional States for Persistence & Overlays
  const [scanHistory, setScanHistory] = useState<{ id: string | number, date: string, mood: string, score: number }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const handleScanComplete = async (mood: string, score: number, additionalData?: any) => {
    const dateString = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    const newEntry = {
      date: dateString,
      mood,
      score,
      id: Date.now()
    };
    setScanHistory(prev => [newEntry, ...prev]);

    if (auth.currentUser) {
      try {
        await addDoc(collection(db, 'scans'), {
          userId: auth.currentUser.uid,
          dateString,
          mood,
          score,
          answers: additionalData?.answers || [],
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'scans');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-off flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center shadow-2xl shadow-primary/20"
        >
          <Logo className="w-10 h-10 text-white" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bg-off flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="space-y-4">
            <div className="w-24 h-24 bg-primary rounded-[40px] mx-auto flex items-center justify-center shadow-2xl shadow-primary/30">
              <Logo className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-black text-dark tracking-tight">Mentcare</h1>
            <p className="text-dark/40 font-medium text-sm">Masuk untuk menyimpan riwayat kesehatan mental Anda secara aman.</p>
          </div>

          <button 
            onClick={handleLogin}
            className="w-full bg-white p-6 rounded-[32px] border border-dark/5 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-4 font-bold text-dark"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            Lanjutkan dengan Google
          </button>

          <p className="text-[10px] text-dark/20 font-bold uppercase tracking-widest">Aman • Privat • Terenkripsi</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-off flex flex-col">
      {/* Search Header */}
      <header className="px-6 pt-8 pb-4 sticky top-0 bg-bg-off/90 backdrop-blur-lg z-40 transition-all">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-primary/20">
            <img src={user.avatar} alt={user.name} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-dark/30 uppercase tracking-[0.2em] mb-0.5">Halo,</p>
            <h2 className="text-lg font-bold text-dark">{user.name}</h2>
          </div>
          <button 
            onClick={() => setShowNotifications(true)}
            className="ml-auto w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-dark/20 relative active:scale-95 transition-transform"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-white" />
          </button>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Cari Dokter atau Materi Edukasi..."
            className="w-full bg-white border border-dark/5 rounded-2xl py-4 pl-12 pr-6 outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <HomeView 
              onScanStart={() => setShowScan(true)}
              onBreathingStart={() => setShowBreathing(true)} 
              onVrStart={() => setShowVr(true)}
              onEducationStart={() => setActiveTab('education')}
              onSeeAllExperts={() => setActiveTab('consultation')}
              onExpertClick={(expert) => {
                setSelectedExpertFromHome(expert);
                setActiveTab('consultation');
              }}
            />
          )}
          {activeTab === 'consultation' && (
            <ConsultationView 
              initialExpert={selectedExpertFromHome} 
              onClearInitial={() => setSelectedExpertFromHome(null)} 
            />
          )}
          {activeTab === 'education' && <EducationView />}
          {activeTab === 'profile' && (
            <ProfileView 
              user={user} 
              onOpenHistory={() => setShowHistory(true)}
              onOpenNotifications={() => setShowNotifications(true)}
              onOpenHelp={() => setShowHelpCenter(true)}
              onUpdateAvatar={handleUpdateAvatar}
              onUpdateProfile={(name, category) => setUser(prev => ({ ...prev!, name, category }))}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {showScan && (
          <ScanOverlay 
            onClose={() => setShowScan(false)} 
            setActiveTab={setActiveTab} 
            setShowBreathing={setShowBreathing} 
            setShowVr={setShowVr} 
            onComplete={handleScanComplete}
          />
        )}
        {showBreathing && <BreathingOverlay onClose={() => setShowBreathing(false)} onComplete={() => {}} />}
        {showVr && <VrOverlay onClose={() => setShowVr(false)} />}
        {showHistory && <HistoryOverlay history={scanHistory} onClose={() => setShowHistory(false)} />}
        {showNotifications && <NotificationsOverlay onClose={() => setShowNotifications(false)} />}
        {showHelpCenter && <HelpCenterOverlay onClose={() => setShowHelpCenter(false)} />}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/95 backdrop-blur-md border-t border-dark/5 flex items-center justify-around px-4 z-50 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <NavButton 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
          icon={<Home />} 
          label="Home" 
        />
        <NavButton 
          active={activeTab === 'consultation'} 
          onClick={() => setActiveTab('consultation')} 
          icon={<MessageSquare />} 
          label="Konsultasi" 
        />
        <NavButton 
          active={activeTab === 'education'} 
          onClick={() => setActiveTab('education')} 
          icon={<BookOpen />} 
          label="Edukasi" 
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={<User />} 
          label="Profile" 
        />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-500 ${active ? 'text-primary' : 'text-dark/15'}`}
    >
      <div className={`p-2 transition-transform duration-500 ${active ? 'scale-110' : 'scale-100'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
        {label}
      </span>
    </button>
  );
}

function HomeView({ onScanStart, onBreathingStart, onVrStart, onEducationStart, onSeeAllExperts, onExpertClick }: { 
  onScanStart: () => void, 
  onBreathingStart: () => void, 
  onVrStart: () => void, 
  onEducationStart: () => void,
  onSeeAllExperts: () => void,
  onExpertClick: (expert: any) => void
}) {
  const experts = [
    { id: 1, name: "dr. Sarah Wijaya", spec: "Psikolog Klinis", rating: 4.9, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi&mouth=smile", status: 'online', type: 'Psikolog' },
    { id: 2, name: "dr. Ahmad Fauzi", spec: "Konselor Keluarga", rating: 4.7, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sheldon&mouth=smile", status: 'online', type: 'Konselor' },
    { id: 3, name: "dr. Linda Sari", spec: "Psikiater", rating: 5.0, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha&mouth=smile", status: 'online', type: 'Psikiater' },
    { id: 4, name: "dr. Budi Santoso", spec: "Psikolog", rating: 4.8, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&mouth=smile", status: 'online', type: 'Psikolog' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 pt-4 w-full max-w-5xl mx-auto"
    >
      {/* Panic Button (Quick Access) */}
      <button 
        onClick={onBreathingStart}
        className="w-full bg-accent p-6 rounded-[32px] flex items-center justify-between shadow-lg shadow-accent/20 active:scale-[0.98] transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-active:animate-ping">
            <Zap className="w-6 h-6 fill-primary" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-primary tracking-tight">Mode Darurat (Panic)</h4>
            <p className="text-primary/60 text-xs font-medium">Relaksasi instan sekarang</p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-primary/40" />
      </button>

      {/* Featured Banner: Scan Kecemasan (Focal Point) */}
      <button 
        onClick={onScanStart}
        className="w-full bg-primary p-8 rounded-[40px] text-white flex flex-col gap-6 text-left relative overflow-hidden shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
      >
        <div className="relative z-10 space-y-2">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20">
            <Scan className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold leading-tight">Scan Kecemasan</h3>
          <p className="text-white/60 text-sm max-w-[200px]">Ukur level stresmu secara instan dengan teknologi AI.</p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-full opacity-10 pointer-events-none">
          <Scan className="w-full h-full p-4" />
        </div>
      </button>

      {/* Secondary Featured: Coping Mechanism */}
      <button 
        onClick={onBreathingStart}
        className="w-full bg-secondary/20 p-8 rounded-[40px] border border-primary/5 flex flex-col gap-6 text-left relative overflow-hidden active:scale-[0.98] transition-all"
      >
        <div className="relative z-10 space-y-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-primary leading-tight">Coping Mechanism</h3>
          <p className="text-primary/50 text-sm max-w-[200px]">Latihan pernapasan dan meditasi untuk ketenangan.</p>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 opacity-5 text-primary">
          <Wind className="w-full h-full" />
        </div>
      </button>

      {/* 2-Column Grid for others */}
      <div className="grid grid-cols-2 gap-4">
        <HomeToolCard 
          id="card-vr"
          icon={<Sparkles className="w-6 h-6" />} 
          title="Virtual Reality" 
          onClick={onVrStart}
          color="bg-accent/30 text-dark border border-accent/20" 
        />
        <HomeToolCard 
          id="card-education"
          icon={<BookOpen className="w-6 h-6" />} 
          title="Edukasi" 
          onClick={onEducationStart}
          color="bg-white text-primary border border-dark/5" 
        />
      </div>

      {/* experts recommendation */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold text-dark">Rekomendasi Ahli</h4>
          <button 
            onClick={onSeeAllExperts}
            className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-transform"
          >
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {experts.map(exp => (
            <DoctorCard 
              key={exp.id}
              name={exp.name} 
              spec={exp.spec} 
              rating={exp.rating} 
              img={exp.img} 
              status={exp.status as any}
              onClick={() => onExpertClick(exp)}
              onChat={() => onExpertClick(exp)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function HomeToolCard({ icon, title, color, onClick, id }: { icon: React.ReactNode, title: string, color: string, onClick?: () => void, id?: string }) {
  const triggerHaptic = () => {
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
    onClick?.();
  };

  return (
    <button 
      id={id}
      onClick={triggerHaptic}
      className={`p-6 rounded-[32px] ${color} flex flex-col gap-6 text-left transition-all active:scale-[0.98] active:opacity-90 shadow-sm`}
    >
      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <h5 className="font-bold text-sm leading-snug">{title}</h5>
    </button>
  );
}

function ConsultationView({ initialExpert, onClearInitial }: { initialExpert?: any, onClearInitial?: () => void }) {
  const [selectedExpert, setSelectedExpert] = useState<any>(initialExpert || null);
  const [view, setView] = useState<'list' | 'chat'>(initialExpert ? 'chat' : 'list');
  const [activeFilter, setActiveFilter] = useState("Semua");

  useEffect(() => {
    if (initialExpert) {
      setSelectedExpert(initialExpert);
      setView('chat');
      onClearInitial?.();
    }
  }, [initialExpert, onClearInitial]);

  const experts = [
    { id: 1, name: "dr. Sarah Wijaya", spec: "Psikolog Klinis", rating: 4.9, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi&mouth=smile", status: 'online', type: 'Psikolog', phone: "+628111111111" },
    { id: 2, name: "dr. Ahmad Fauzi", spec: "Konselor Keluarga", rating: 4.9, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sheldon&mouth=smile", status: 'online', type: 'Konselor', phone: "+628222222222" },
    { id: 3, name: "dr. Linda Sari", spec: "Psikiater", rating: 4.9, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha&mouth=smile", status: 'online', type: 'Psikiater', phone: "+628333333333" },
    { id: 4, name: "dr. Budi Santoso", spec: "Psikolog", rating: 4.9, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi&mouth=smile", status: 'online', type: 'Psikolog', phone: "+628111111111" },
  ];

  const filteredExperts = activeFilter === "Semua" 
    ? experts 
    : experts.filter(e => e.type === activeFilter);

  const launchWhatsApp = (phone: string) => {
    const message = encodeURIComponent("Halo, saya pengguna MENTCARE, ingin berkonsultasi mengenai hasil kuesioner saya.");
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-8 pt-4 pb-12 w-full max-w-5xl mx-auto"
    >
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-dark leading-tight">Konsultasi Ahli</h3>
        <p className="text-dark/40 text-base leading-relaxed">Pilih konsultan profesional kami untuk mendengarkan keluh kesahmu melalui WhatsApp.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 no-scrollbar">
        {["Semua", "Psikolog", "Psikiater", "Konselor"].map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setActiveFilter(cat)}
            className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all ${activeFilter === cat ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'bg-white text-dark/30 border border-dark/5'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filteredExperts.map((exp) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={exp.id}
            >
              <DoctorCard 
                name={exp.name} 
                spec={exp.spec} 
                rating={exp.rating} 
                img={exp.img} 
                status={exp.status as any}
                onClick={() => launchWhatsApp(exp.phone)}
                onChat={() => launchWhatsApp(exp.phone)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DoctorCard({ name, spec, rating, img, status, onClick, onChat }: { name: string, spec: string, rating: number, img: string, status?: 'online' | 'offline', onClick?: () => void, onChat?: () => void, key?: any }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-[28px] flex items-center gap-4 shadow-sm border border-dark/5 hover:border-primary/20 transition-all cursor-pointer active:scale-[0.98] group"
    >
      <div className="relative shrink-0">
        <div className="w-16 h-16 bg-bg-off rounded-2xl overflow-hidden border border-dark/5 group-hover:border-primary/10 transition-colors">
          <img src={img} alt={name} className="w-full h-full object-cover" />
        </div>
        {status && (
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-white shadow-sm ${status === 'online' ? 'bg-secondary' : 'bg-dark/10'}`} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h5 className="font-bold text-dark text-[15px] truncate leading-tight mb-0.5">{name}</h5>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-dark/30 uppercase tracking-wider truncate">{spec}</span>
          <div className="flex items-center gap-1 bg-accent/10 px-1.5 py-0.5 rounded-lg shrink-0">
            <Heart className="w-2.5 h-2.5 text-accent fill-accent" />
            <span className="text-[9px] font-black text-accent">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {status === 'online' ? (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (window.navigator?.vibrate) window.navigator.vibrate(10);
                onChat?.();
              }}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shadow-primary/10 active:scale-95 transition-all text-center"
            >
              <MessageCircle className="w-3.5 h-3.5" /> Chat Sekarang
            </button>
          ) : (
            <button className="flex-1 bg-bg-off text-dark/40 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-dark/5 active:scale-95 transition-all text-center">
              <Calendar className="w-3.5 h-3.5 opacity-40" /> Buat Janji
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EducationView() {
  const [activeCategory, setActiveCategory] = useState("Populer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const categories = ["Populer", "Kecemasan", "Meditasi", "Sosial", "Akademik", "Gaya Hidup"];

  const articles = [
    { id: 1, category: "Kecemasan", title: "Mengenal Panic Attack", time: "5 Menit Baca", img: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=400", author: "dr. Sarah Wijaya", content: "Panic attack adalah rasa takut yang intens dan tiba-tiba yang memicu reaksi fisik yang parah meskipun tidak ada bahaya nyata..." },
    { id: 2, category: "Meditasi", title: "Teknik Grounding 5-4-3-2-1", time: "3 Menit Baca", img: "https://images.unsplash.com/photo-1499728603263-13726abce5fd?auto=format&fit=crop&q=80&w=400", author: "MentCare Team", content: "Teknik 5-4-3-2-1 adalah latihan kesadaran (mindfulness) sederhana untuk membantu menenangkan pikiran di situasi stres..." },
    { id: 3, category: "Kecemasan", title: "Lawan Overthinking dalam 5 Menit", time: "4 Menit Baca", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400", author: "dr. Linda Sari", content: "Overthinking seringkali menjadi penghambat kebahagiaan. Berikut adalah langkah praktis untuk menghentikan siklus pikiran negatif..." },
    { id: 4, category: "Akademik", title: "Mengatur Stres Menjelang Ujian", time: "6 Menit Baca", img: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&q=80&w=400", author: "MentCare Academic", content: "Stres ujian adalah hal yang lumrah, namun jika berlebihan dapat mengganggu performa. Kuncinya ada pada manajemen waktu..." },
    { id: 5, category: "Gaya Hidup", title: "Pengaruh Kafein pada Kecemasan", time: "4 Menit Baca", img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400", author: "dr. Budi Santoso", content: "Tahukah Anda bahwa kopi berlebih dapat memicu palpitasi jantung yang memperburuk rasa cemas? Mari kita tinjau secara medis..." },
    { id: 6, category: "Gaya Hidup", title: "Digital Detox untuk Mental", time: "5 Menit Baca", img: "https://images.unsplash.com/photo-1520333789090-1afc82db536a?auto=format&fit=crop&q=80&w=400", author: "Tech-Wellness", content: "Ketergantungan pada gadget seringkali meningkatkan level kortisol. Cobalah digital detox selama 24 jam di akhir pekan..." },
    { id: 7, category: "Sosial", title: "Membangun Batasan (Boundaries)", time: "7 Menit Baca", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400", author: "Sarah Jane", content: "Mengatakan 'tidak' bukanlah tanda egois. Ini adalah bentuk perawatan diri yang mendasar untuk menjaga kesehatan mental..." },
    { id: 8, category: "Akademik", title: "Burnout Saat Mengerjakan Skripsi", time: "5 Menit Baca", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=400", author: "Academic Support", content: "Jika Anda merasa lelah luar biasa meski baru mulai mengetik satu paragraf, mungkin Anda mengalami burnout akademis..." },
    { id: 9, category: "Kecemasan", title: "Pentingnya Deep Sleep", time: "6 Menit Baca", img: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=400", author: "Sleep Specialist", content: "Tidur yang berkualitas adalah fondasi dari regulasi emosi yang baik. Berikut cara mencapai fase Deep Sleep setiap malam..." },
    { id: 10, category: "Meditasi", title: "Breathwork untuk Pemula", time: "3 Menit Baca", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400", author: "Zen Master", content: "Fokus pada napas adalah pintu masuk termudah menuju kedamaian batin. Mari kita mulai dengan teknik 3 detik..." },
  ];

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Populer" || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  if (selectedArticle) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed inset-0 bg-white z-[170] flex flex-col overflow-y-auto no-scrollbar"
      >
        <header className="sticky top-0 bg-white/80 backdrop-blur-md p-6 flex items-center justify-between border-b border-dark/5 z-10">
          <button onClick={() => setSelectedArticle(null)} className="p-2 text-dark/40 active:scale-90 transition-transform">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-4">
            <button onClick={(e) => toggleBookmark(e, selectedArticle.id)} className="p-2 text-primary">
              <Bookmark className={`w-6 h-6 ${bookmarks.includes(selectedArticle.id) ? 'fill-primary' : ''}`} />
            </button>
            <button className="p-2 text-dark/40"><Share2 className="w-6 h-6" /></button>
          </div>
        </header>

        <div className="flex-1 pb-12">
          <img src={selectedArticle.img} alt={selectedArticle.title} className="w-full h-72 object-cover" />
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest">{selectedArticle.category}</span>
                <span className="text-dark/30 text-[10px] font-bold uppercase tracking-widest">• {selectedArticle.time}</span>
              </div>
              <h1 className="text-3xl font-bold text-dark leading-tight">{selectedArticle.title}</h1>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{selectedArticle.author[0]}</div>
                <div>
                    <p className="text-dark font-bold text-sm leading-none">{selectedArticle.author}</p>
                    <p className="text-[10px] text-dark/40 font-bold uppercase tracking-widest">Penulis Ahli MentCare</p>
                </div>
              </div>
            </div>

            <button 
                onClick={() => {
                    const utter = new SpeechSynthesisUtterance(selectedArticle.content);
                    utter.lang = 'id-ID';
                    window.speechSynthesis.speak(utter);
                }}
                className="w-full bg-bg-off text-primary p-5 rounded-[28px] flex items-center justify-center gap-3 font-bold group border border-dark/5 active:scale-95 transition-all shadow-sm"
            >
              <PlayCircle className="w-6 h-6 text-primary" /> Dengarkan Artikel (Audio Reader)
            </button>

            <div className="article-content text-lg text-dark/70 leading-[1.8] space-y-6 font-medium">
              <p>{selectedArticle.content}</p>
              <p>Menjaga kesehatan mental seringkali dimulai dari hal-hal kecil yang kita lakukan secara konsisten. Membaca dan mengedukasi diri sendiri adalah investasi terbaik untuk kesejahteraan jangka panjang.</p>
              <p>Pastikan Anda mengambil jeda sejenak setelah membaca materi ini untuk merenungkan bagaimana Anda bisa menerapkan poin-poin di atas dalam kehidupan sehari-hari.</p>
            </div>

            <div className="pt-12 border-t border-dark/5">
              <h4 className="font-bold text-dark text-xl mb-6">Materi Terkait</h4>
              <div className="grid gap-4">
                {articles.filter(a => a.id !== selectedArticle.id).slice(0, 3).map(a => (
                  <button 
                    key={a.id} 
                    onClick={() => {
                        window.scrollTo(0, 0);
                        setSelectedArticle(a);
                    }}
                    className="flex gap-5 p-5 bg-bg-off rounded-[32px] text-left border border-transparent active:scale-[0.98] transition-all"
                  >
                    <img src={a.img} className="w-20 h-20 rounded-2xl object-cover" alt="" />
                    <div className="flex-1 space-y-1 py-1">
                      <h5 className="font-bold text-dark text-sm leading-tight">{a.title}</h5>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{a.category} • {a.time}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-8 pt-4 pb-20 w-full max-w-5xl mx-auto"
    >
      <div className="space-y-4">
        <h3 className="text-3xl font-bold text-dark leading-tight">Pusat Edukasi</h3>
        <p className="text-dark/40 text-base leading-relaxed">Pahami kesehatan mentalmu secara komprehensif melalui literasi yang tepat.</p>
      </div>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-dark/20 group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari topik (misal: Panic Attack)..."
          className="w-full bg-white rounded-[32px] pl-16 pr-6 py-5 text-sm font-medium border border-dark/5 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto -mx-6 px-6 no-scrollbar pb-2">
        {categories.map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-6 py-3 rounded-full font-bold text-sm transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'bg-white text-dark/30 border border-dark/5'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-5">
        <AnimatePresence mode="popLayout">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <motion.div 
                layout
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => setSelectedArticle(article)}
                className="w-full bg-white p-5 rounded-[40px] border border-dark/5 shadow-sm flex gap-5 text-left group active:scale-[0.98] transition-all relative cursor-pointer"
              >
                <div className="w-28 h-28 rounded-[32px] overflow-hidden flex-shrink-0 relative">
                  <img src={article.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className="absolute top-2 right-2">
                    <button 
                        onClick={(e) => toggleBookmark(e, article.id)} 
                        className={`p-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm ${bookmarks.includes(article.id) ? 'bg-primary text-white' : 'bg-black/20 text-white'}`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarks.includes(article.id) ? 'fill-white' : ''}`} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{article.category}</span>
                    <span className="text-dark/10">•</span>
                    <span className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">{article.time}</span>
                  </div>
                  <h4 className="font-bold text-dark text-lg leading-tight group-hover:text-primary transition-colors">{article.title}</h4>
                  <p className="text-dark/40 text-xs line-clamp-2 leading-relaxed">{article.content}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 text-dark/20 font-bold border-2 border-dashed border-dark/5 rounded-[40px]">Materi tidak ditemukan</div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ProfileView({ user, onOpenHistory, onOpenNotifications, onOpenHelp, onUpdateAvatar, onUpdateProfile, onLogout }: { 
  user: UserProfile, 
  onOpenHistory: () => void,
  onOpenNotifications: () => void,
  onOpenHelp: () => void,
  onUpdateAvatar: (url: string) => void,
  onUpdateProfile: (name: string, category: string) => void,
  onLogout: () => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempCategory, setTempCategory] = useState(user.category || "Remaja / Pelajar");
  const [saving, setSaving] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories = ["Remaja / Pelajar", "Mahasiswa", "Pekerja", "Umum", "Lansia"];

  useEffect(() => {
    // Fetch last few scans for context
    if (auth.currentUser?.uid) {
      const q = query(
        collection(db, 'scans'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      return onSnapshot(q, (snapshot) => {
        setScanHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }
  }, []);

  const lastScan = scanHistory[0];

  const handleSaveProfile = async () => {
    if (!auth.currentUser?.uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        name: tempName,
        category: tempCategory,
        updatedAt: serverTimestamp()
      }, { merge: true });
      onUpdateProfile(tempName, tempCategory);
      setIsEditing(false);
    } catch (err) {
      console.error("Gagal menyimpan profil:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && auth.currentUser?.uid) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const url = reader.result as string;
        onUpdateAvatar(url);
        // Persist avatar link to firestore
        await setDoc(doc(db, 'users', auth.currentUser!.uid), {
          avatar: url,
          updatedAt: serverTimestamp()
        }, { merge: true });
      };
      reader.readAsDataURL(file);
    }
  };

  // Personalized Karangan Kata-Kata Insight
  const getPersonalInsight = () => {
    if (!lastScan) return "Ayo mulai perjalananmu! Lakukan scan wajah pertamamu hari ini agar MentCare bisa memberikan insight yang membantu harimu.";
    
    const mood = lastScan.mood?.toLowerCase() || 'netral';
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'Pagi' : hour < 17 ? 'Siang' : 'Malam';
    
    const insights: Record<string, string> = {
      'senang': `Luar biasa! Energi positifmu hari ini sangat terpancar. Pertahankan momentum ini dengan berbagi senyum kepada orang di sekitarmu. Kebahagiaanmu adalah kekuatan terbesarmu saat ini.`,
      'sedih': `Tidak apa-apa merasa lelah sejenak. Ingatlah bahwa setiap awan yang mendung pasti akan berganti menjadi cerah. Berikan dirimu waktu untuk bernapas dan beristirahat. Kamu berharga.`,
      'cemas': `Tarik napas dalam, hembuskan perlahan. Dunia tidak akan runtuh hari ini. Fokuslah pada hal-hal kecil yang bisa kamu kendalikan. Kamu jauh lebih kuat dari rasa takutmu.`,
      'marah': `Energi emosimu sedang meluap. Cobalah teknik grounding sejenak untuk menenangkan detak jantungmu. Menyalurkan energi ini ke aktivitas kreatif atau fisik bisa sangat membantu.`,
      'netral': `Ketenangan hari ini adalah modal yang bagus untuk refleksi diri. Manfaatkan momen stabil ini untuk merencanakan hal-hal baik yang ingin kamu capai besok. Tetaplah fokus.`
    };

    return `Selamat ${timeOfDay}, ${user.name.split(' ')[0]}! ${insights[mood] || insights['netral']}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pt-4 pb-12 w-full max-w-5xl mx-auto"
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Header Profile - Responsive */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
        <div className="relative group">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[48px] border-4 border-white shadow-2xl relative overflow-hidden bg-white z-10 transition-transform group-hover:scale-[1.02]">
             <div className="w-full h-full rounded-full overflow-hidden">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
             </div>
             {isEditing && (
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
               >
                 <Camera className="text-white w-6 h-6" />
               </button>
             )}
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`absolute -bottom-2 -right-2 p-3 rounded-2xl shadow-lg border-2 border-white active:scale-90 transition-all z-20 ${isEditing ? 'bg-primary text-white' : 'bg-white text-primary'}`}
          >
            {isEditing ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          {isEditing ? (
            <div className="flex flex-col items-center md:items-start gap-4">
              <input 
                autoFocus
                type="text" 
                value={tempName} 
                onChange={(e) => setTempName(e.target.value)}
                className="text-2xl md:text-4xl font-black text-dark text-center md:text-left bg-transparent border-b-2 border-primary/20 focus:border-primary outline-none w-full max-w-sm pb-1 transition-all"
                placeholder="Namamu"
              />
              <div className="flex flex-col md:flex-row items-center gap-4">
                <label className="text-[10px] font-black text-dark/20 uppercase tracking-[0.2em]">Kategori</label>
                <select 
                  value={tempCategory} 
                  onChange={(e) => setTempCategory(e.target.value)}
                  className="bg-white px-6 py-2 rounded-xl text-xs font-bold text-primary outline-none border border-dark/5 shadow-sm appearance-none min-w-[150px]"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 bg-dark/5 rounded-full text-xs font-bold text-dark/40 active:scale-95">Batal</button>
                  <button onClick={handleSaveProfile} disabled={saving} className="px-6 py-2 bg-primary rounded-full text-xs font-bold text-white shadow-lg active:scale-95">{saving ? '...' : 'Simpan'}</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl md:text-5xl font-black text-dark leading-none">{tempName}</h2>
              <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-1.5 rounded-full mt-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{tempCategory}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Summary Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div 
          onClick={onOpenHistory}
          className="bg-white p-8 rounded-[40px] border border-dark/5 shadow-sm space-y-4 cursor-pointer hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 text-dark/30">
            <Scan className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Status Mental Terakhir</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-dark">{lastScan ? lastScan.mood : '-'}</p>
            {lastScan && <span className="text-dark/20 text-xs font-bold uppercase tracking-tighter">Terdeteksi</span>}
          </div>
          <p className="text-xs text-dark/40 font-medium">{lastScan ? `Data masuk pada ${lastScan.dateString}` : "Belum ada rekaman status emosi."}</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-dark/5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-dark/30">
            <Activity className="w-5 h-5 text-secondary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Aktivitas Wellness</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-dark">{lastScan ? 'Aktif' : 'Baru'}</p>
            <span className="text-dark/20 text-xs font-bold uppercase tracking-tighter">Status</span>
          </div>
          <p className="text-xs text-dark/40 font-medium">Melacak keteraturanmu dalam menjaga kesehatan mental.</p>
        </div>
      </div>

      {/* Personal Insight Layout - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <div className="bg-primary p-10 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-primary/20 group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.3em] text-secondary">Daily Personal Insight</span>
              </div>
              <p className="text-xl md:text-3xl font-black leading-tight italic max-w-2xl">
                "{getPersonalInsight()}"
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                 <div className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase border border-white/10 tracking-widest backdrop-blur-sm text-secondary">Analitik Berbasis Mood</div>
                 <div className="px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase border border-white/10 tracking-widest backdrop-blur-sm text-white/40">Updated Just Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items - Responsive Grid */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ProfileMenuItem 
            icon={<UserCircle className="w-5 h-5" />} 
            label="Pengaturan Akun" 
            onClick={() => setIsEditing(true)}
          />
          <ProfileMenuItem 
            icon={<History className="w-5 h-5" />} 
            label="Riwayat Perjalanan Mental" 
            onClick={onOpenHistory}
          />
          <ProfileMenuItem 
            icon={<Bell className="w-5 h-5" />} 
            label="Push Notifikasi" 
            onClick={onOpenNotifications}
          />
          <ProfileMenuItem 
            icon={<Lock className="w-5 h-5" />} 
            label="Keamanan & Bantuan" 
            onClick={onOpenHelp}
          />
        </div>

        <div className="lg:col-span-12">
          <button 
            onClick={onLogout}
            className="w-full p-8 bg-red-500/5 border-2 border-red-500/5 rounded-[40px] flex items-center justify-center gap-4 group hover:bg-red-500 hover:text-white transition-all active:scale-[0.98]"
          >
            <LogOut className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
            <span className="font-black text-dark group-hover:text-white transition-colors uppercase tracking-widest text-sm">Keluar dari Sesi</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileMenuItem({ icon, label, isLogout = false, onClick }: { icon: React.ReactNode, label: string, isLogout?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full bg-white p-5 rounded-[28px] border border-dark/5 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 bg-bg-off rounded-xl transition-colors ${isLogout ? 'text-accent/40 group-hover:bg-accent/5 group-hover:text-accent' : 'text-primary/40 group-hover:bg-primary/5 group-hover:text-primary'}`}>
          {icon}
        </div>
        <span className={`font-bold text-sm ${isLogout ? 'text-accent' : 'text-dark'}`}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-dark/10" />
    </button>
  );
}

function ForumView() {
  const categories = ["#Semua", "#StresKuliah", "#Meditasi", "#Dukungan"];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 pt-4 pb-12 w-full max-w-5xl mx-auto"
    >
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-dark">Forum & Komunitas</h3>
        <p className="text-dark/40 text-sm">Berbagi cerita di ruang aman tanpa penghakiman.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {categories.map((c, i) => (
          <button key={i} className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-dark/40 border border-dark/5'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-dark/5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20" />
              <div className="flex-1">
                <h5 className="text-xs font-bold text-dark">Anonim #{400 + i}</h5>
                <p className="text-[10px] text-dark/20 font-bold uppercase">{i + 1} jam yang lalu</p>
              </div>
            </div>
            <p className="text-sm text-dark/60 leading-relaxed">
              {i === 0 
                ? "Ada yang punya tips buat ngadepin revisi skripsi yang numpuk? Rasanya bener-bener cemas dan pengen banget istirahat tapi rasa bersalah dateng terus."
                : "Meditasi 5 menit tadi pagi bener-bener ngebantu banget buat ngerasa lebih tenang hari ini. Semangat semuanya!"}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-1.5 text-xs font-bold text-dark/30 hover:text-primary transition-colors">
                <Heart className="w-4 h-4" /> {24 - i * 5}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-bold text-dark/30 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4" /> {12 - i * 3}
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function BreathingOverlay({ onClose, onComplete }: { onClose: () => void, onComplete: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (phase === 'idle') return;

    let timer: any;
    if (count > 0) {
      timer = setTimeout(() => {
        setCount(count - 1);
        if (window.navigator?.vibrate && (phase === 'inhale' || phase === 'exhale')) {
          window.navigator.vibrate(5);
        }
      }, 1000);
    } else {
      if (phase === 'inhale') {
        setPhase('hold');
        setCount(7);
      } else if (phase === 'hold') {
        setPhase('exhale');
        setCount(8);
      } else if (phase === 'exhale') {
        if (cycle < 3) { // 4 cycles total
          setCycle(cycle + 1);
          setPhase('inhale');
          setCount(4);
        } else {
          setPhase('idle');
          onComplete();
        }
      }
    }
    return () => clearTimeout(timer);
  }, [count, phase, cycle, onComplete]);

  const startExercise = () => {
    setCycle(0);
    setPhase('inhale');
    setCount(4);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-primary/95 text-white z-[120] flex flex-col items-center justify-center p-8 text-center backdrop-blur-xl"
    >
      <button onClick={onClose} className="absolute top-8 right-8 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
        <X className="w-6 h-6" />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <div className="relative">
          {/* Pulsing Teal Background Effect */}
          <motion.div 
            animate={{ 
              scale: phase === 'inhale' ? 2 : phase === 'hold' ? 2 : 1,
              opacity: phase === 'inhale' ? 0.4 : phase === 'hold' ? 0.3 : 0.1
            }}
            transition={{ 
              duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0, 
              ease: "easeInOut" 
            }}
            className="absolute inset-0 bg-white rounded-full blur-3xl"
          />

          <motion.div 
            animate={{ 
              scale: phase === 'inhale' ? 1.6 : phase === 'hold' ? 1.6 : 1,
              backgroundColor: phase === 'idle' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'
            }}
            transition={{ 
              duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 8 : 0.5, 
              ease: "easeInOut" 
            }}
            className="w-48 h-48 rounded-full border-4 border-white/40 flex items-center justify-center backdrop-blur-md relative z-10"
          >
            <Wind className={`w-16 h-16 ${phase === 'idle' ? 'animate-pulse text-white/40' : 'text-white'}`} />
          </motion.div>
          
          {phase !== 'idle' && (
            <motion.div 
              key={phase + count}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center z-20"
            >
              <span className="text-5xl font-bold font-mono">{count}</span>
            </motion.div>
          )}
        </div>

        <div className="space-y-4 relative z-10">
          <motion.h2 
            key={phase}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-bold"
          >
            {phase === 'idle' && "Teknik 4-7-8"}
            {phase === 'inhale' && "Tarik Napas (4s)"}
            {phase === 'hold' && "Tahan Napas (7s)"}
            {phase === 'exhale' && "Buang Napas (8s)"}
          </motion.h2>
          <p className="text-white/60 text-base max-w-xs mx-auto leading-relaxed">
            {phase === 'idle' 
              ? "Gunakan teknik 4-7-8 untuk menenangkan sistem saraf Anda secara instan." 
              : `Selesaikan siklus ini. Fokus pada aliran udara... (${cycle + 1}/4)`}
          </p>
        </div>

        {phase === 'idle' && (
          <button 
            onClick={startExercise}
            className="bg-white text-primary px-12 py-5 rounded-full font-bold shadow-2xl active:scale-95 transition-all text-lg"
          >
            Mulai Latihan
          </button>
        )}
      </div>
      <footer className="p-12 text-[10px] uppercase font-bold tracking-[0.3em] text-white/30">MentCare Interactive Breathing</footer>
    </motion.div>
  );
}

function HistoryOverlay({ history, onClose }: { history: any[], onClose: () => void }) {
  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-bg-off z-[130] flex flex-col"
    >
      <header className="p-8 flex items-center justify-between sticky top-0 bg-bg-off/80 backdrop-blur-md z-10">
        <div>
          <h2 className="text-2xl font-bold text-dark">Riwayat Kesehatan</h2>
          <p className="text-dark/40 text-[10px] font-bold uppercase tracking-widest mt-1">Scan & Kuesioner</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white rounded-2xl shadow-sm border border-dark/5 active:scale-90 transition-all"><X /></button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-8 space-y-4 pb-12">
        {history.length === 0 ? (
          <div className="text-center py-20 opacity-20">
            <History className="w-16 h-16 mx-auto mb-4" />
            <p className="font-bold">Belum ada riwayat</p>
          </div>
        ) : (
          history.map(item => (
            <div key={item.id} className="bg-white p-6 rounded-[32px] border border-dark/5 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${item.mood === 'Senang' ? 'bg-green-50' : item.mood === 'Cemas' ? 'bg-orange-50' : 'bg-primary/5'}`}>
                    {item.mood === 'Senang' ? '😊' : item.mood === 'Cemas' ? '😟' : '😐'}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark text-sm">{item.mood}</h4>
                    <p className="text-[10px] text-dark/30 font-bold uppercase tracking-wider">{item.date}</p>
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-xl font-bold text-primary">{item.score}</div>
                  <div className="text-[8px] font-bold text-dark/20 uppercase tracking-tighter">Mental Score</div>
               </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function NotificationsOverlay({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'settings'>('alerts');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Tips Hari Ini', desc: 'Sesi pernapasan 5 menit dapat menurunkan stres hingga 30%.', type: 'tip', time: '2j yang lalu', unread: true },
    { id: 2, title: 'Chat dari Psikolog', desc: 'Halo! Bagaimana perasaanmu setelah sesi kemarin?', type: 'chat', time: '5j yang lalu', unread: true },
    { id: 3, title: 'Pengingat Scan', desc: 'Waktunya melakukan scan wajah harian untuk melacak mood-mu.', type: 'alert', time: '1h yang lalu', unread: false }
  ]);

  const toggleSetting = (id: string) => {
    // Current setting toggle logic (mocked)
  };

  const options = [
    { id: 'harian', title: 'Pengingat Harian', desc: 'Notifikasi untuk scan wajah setiap pagi.' },
    { id: 'tips', title: 'Tips Kesehatan', desc: 'Artikel dan tips relaksasi harian.' },
    { id: 'konsultasi', title: 'Pesan Konsultasi', desc: 'Notifikasi balasan dari psikolog.' }
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 bg-bg-off z-[150] flex flex-col"
    >
      <header className="p-8 flex flex-col gap-6 sticky top-0 bg-bg-off/80 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-dark">Pemberitahuan</h2>
          <button onClick={onClose} className="p-3 bg-white rounded-2xl shadow-sm active:scale-90 transition-all border border-dark/5 text-dark/20"><X /></button>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-2xl border border-dark/5">
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'alerts' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-dark/40'}`}
          >
            Aktivitas
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-dark/40'}`}
          >
            Pengaturan
          </button>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-32">
        {activeTab === 'alerts' ? (
          <div className="space-y-4">
            {notifications.map(noti => (
              <div key={noti.id} className="bg-white p-6 rounded-[32px] border border-dark/5 shadow-sm relative group active:scale-[0.98] transition-all">
                {noti.unread && <div className="absolute top-6 right-6 w-2 h-2 bg-accent rounded-full" />}
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${noti.type === 'chat' ? 'bg-blue-50 text-blue-500' : noti.type === 'tip' ? 'bg-green-50 text-green-500' : 'bg-primary/5 text-primary'}`}>
                    {noti.type === 'chat' ? <MessageCircle className="w-5 h-5" /> : noti.type === 'tip' ? <Activity className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-dark text-sm">{noti.title}</h4>
                      <span className="text-[8px] font-bold text-dark/20 uppercase">{noti.time}</span>
                    </div>
                    <p className="text-dark/40 text-[11px] leading-relaxed font-medium">{noti.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/5 mb-6">
              <h4 className="font-bold text-primary text-sm mb-2">Push Notifications</h4>
              <p className="text-dark/40 text-[10px] leading-relaxed font-medium uppercase tracking-wider">Kelola bagaimana kami menghubungimu.</p>
            </div>
            {options.map(opt => (
              <button 
                key={opt.id}
                className="w-full text-left p-6 bg-white border border-dark/5 rounded-[32px] flex items-center justify-between transition-all active:scale-[0.98] shadow-sm"
              >
                <div>
                  <h4 className="font-bold text-dark text-sm">{opt.title}</h4>
                  <p className="text-dark/30 text-[10px] mt-1 font-medium">{opt.desc}</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full p-1 relative flex items-center">
                  <div className="w-4 h-4 bg-white rounded-full shadow-sm translate-x-6" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HelpCenterOverlay({ onClose }: { onClose: () => void }) {
  const [activeInfo, setActiveInfo] = useState<{title: string, content: React.ReactNode} | null>(null);

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="fixed inset-0 bg-white z-[160] flex flex-col p-8 overflow-y-auto no-scrollbar"
    >
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-2xl font-bold text-dark">Bantuan</h2>
        <button onClick={onClose} className="p-3 bg-bg-off rounded-2xl active:scale-90 transition-all"><X /></button>
      </div>

      <div className="flex-1 space-y-8 pb-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <HelpCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-dark">Butuh Bantuan?</h3>
          <p className="text-dark/40 text-sm font-medium">Tim kami siap membantu kendalamu 24/7 melalui berbagai jalur komunikasi.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {[
             { 
               t: 'Keamanan Data', 
               d: 'Sistem Terenkripsi', 
               i: <Lock />, 
               color: 'bg-blue-500/10 text-blue-600',
               info: (
                 <div className="space-y-4">
                   <p>Privasi Anda adalah prioritas utama kami. Mentcare menggunakan standar keamanan industri:</p>
                   <ul className="list-disc pl-5 space-y-2">
                     <li><strong>Enkripsi AES-256 Bit:</strong> Semua data medis Anda dienkripsi sehingga tidak ada yang bisa membacanya tanpa kunci khusus.</li>
                     <li><strong>Kepatuhan HIPAA:</strong> Kami mengikuti pedoman pengolahan data kesehatan kelas dunia.</li>
                     <li><strong>Autentikasi Dua Faktor:</strong> Memastikan hanya Anda yang bisa mengakses akun Anda.</li>
                   </ul>
                 </div>
               )
             },
             { 
               t: 'Panduan Pengguna', 
               d: 'Tips Penggunaan Fitur', 
               i: <UserCircle />, 
               color: 'bg-purple-500/10 text-purple-600',
               info: (
                 <div className="space-y-4">
                   <p>Berikut langkah mudah memulai perjalanan kesehatan mental Anda:</p>
                   <div className="space-y-3">
                     <div className="p-4 bg-bg-off rounded-2xl">
                       <h5 className="font-bold text-xs uppercase text-primary mb-1">1. Mood Tracking</h5>
                       <p className="text-sm">Klik ikon deteksi wajah di home untuk memindai perasaanmu saat ini.</p>
                     </div>
                     <div className="p-4 bg-bg-off rounded-2xl">
                       <h5 className="font-bold text-xs uppercase text-primary mb-1">2. AI Consultation</h5>
                       <p className="text-sm">Gunakan chat AI untuk curhat kapanpun tanpa merasa dihakimi.</p>
                     </div>
                     <div className="p-4 bg-bg-off rounded-2xl">
                       <h5 className="font-bold text-xs uppercase text-primary mb-1">3. VR Meditation</h5>
                       <p className="text-sm">Pilih destinasi VR untuk relaksasi mendalam di lingkungan virtual yang tenang.</p>
                     </div>
                   </div>
                 </div>
               )
             },
             { 
               t: 'Hubungi Support', 
               d: 'WhatsApp atau Email', 
               i: <MessageCircle />, 
               color: 'bg-emerald-500/10 text-emerald-600',
               action: () => window.open('https://wa.me/628123456789', '_blank')
             }
           ].map(item => (
             <button 
               key={item.t} 
               onClick={item.action || (() => setActiveInfo({ title: item.t, content: item.info }))}
               className="p-8 bg-white border-2 border-dark/5 rounded-[40px] flex flex-col items-center text-center gap-6 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 hover:-translate-y-2 transition-all group relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`p-5 rounded-3xl ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>{item.i}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-dark text-xl">{item.t}</h4>
                  <p className="text-dark/40 text-sm mt-2 leading-relaxed">{item.d}</p>
                </div>
                <div className="text-primary flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-primary/5 px-4 py-2 rounded-full">
                  Lihat Detail <ArrowRight className="w-3 h-3" />
                </div>
             </button>
           ))}
        </div>
      </div>

      <AnimatePresence>
        {activeInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[170] flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl relative"
            >
              <div className="p-8 border-b border-dark/5 flex justify-between items-center bg-bg-off">
                <h3 className="text-xl font-bold text-dark">{activeInfo.title}</h3>
                <button 
                  onClick={() => setActiveInfo(null)}
                  className="p-2 hover:bg-dark/5 rounded-xl transition-colors"
                ><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 prose prose-sm max-w-none text-dark/70 font-medium leading-relaxed">
                {activeInfo.content}
              </div>
              <div className="p-8 pt-0">
                <button 
                  onClick={() => setActiveInfo(null)}
                  className="w-full p-6 bg-primary text-white rounded-[24px] font-bold active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Selesai Membaca
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function VrOverlay({ onClose }: { onClose: () => void }) {
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isVrMode, setIsVrMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const destinations = [
    { 
      id: 1, 
      title: "Hutan Pinus Pagi", 
      dur: "5 Menit", 
      desc: "Suara alam yang segar", 
      img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000",
      thumbnail: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 2, 
      title: "Ombak Senja Bali", 
      dur: "8 Menit", 
      desc: "Ketenangan pesisir pantai", 
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000",
      thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
    },
    { 
      id: 3, 
      title: "Pegunungan Salju", 
      dur: "10 Menit", 
      desc: "Kesunyian puncak gunung", 
      img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000",
      thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800"
    }
  ];

  if (isVrMode && selectedDestination) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black z-[200] overflow-hidden"
      >
        <button 
          onClick={() => setIsVrMode(false)} 
          className="absolute top-8 left-8 z-[210] w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Simulated VR Viewport (Draggable Image) */}
        <div className="w-full h-full cursor-move overflow-hidden relative">
          <motion.div 
            drag
            dragConstraints={{ left: -1000, right: 1000, top: -500, bottom: 500 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: '3000px', height: '2000px' }}
          >
            <img 
              src={selectedDestination.img} 
              className="w-full h-full object-cover select-none pointer-events-none" 
              alt="VR View" 
            />
          </motion.div>

          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
             <div className="bg-black/20 p-6 rounded-full border border-white/10 animate-pulse text-white/40">
                <Monitor className="w-12 h-12" />
             </div>
             <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Simulasi VR 360° • Geser Layar</p>
          </div>
        </div>

        {/* Info Overlay */}
        <div className="absolute top-0 right-0 left-0 p-8 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none flex items-center gap-4">
           <Monitor className="text-white w-6 h-6" />
           <h3 className="text-white font-bold text-lg">{selectedDestination.title}</h3>
        </div>

        {/* Exit Button */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
            <button 
              onClick={() => setIsVrMode(false)}
              className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-full font-bold text-primary shadow-2xl active:scale-95 transition-all flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Selesai Relaksasi
            </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-off z-[130] overflow-hidden flex flex-col pt-8"
    >
      <header className="px-6 flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-bold text-dark">VR Relaksasi</h3>
          <p className="text-dark/40 text-sm">Pilih video untuk mulai simulasi.</p>
        </div>
        <button onClick={onClose} className="p-3 bg-white rounded-2xl shadow-sm border border-dark/5 active:scale-90 transition-all"><X /></button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
        <div className="grid grid-cols-1 gap-6">
          {destinations.map((dest) => (
            <motion.button 
              key={dest.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedDestination(dest);
                setIsVrMode(true);
              }}
              className="w-full bg-white rounded-[32px] overflow-hidden shadow-sm border border-dark/5 text-left active:shadow-md transition-all group"
            >
              <div className="h-52 relative overflow-hidden">
                <img src={dest.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                   <h4 className="text-white font-bold text-xl">{dest.title}</h4>
                   <p className="text-white/60 text-xs">{dest.desc}</p>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-bold border border-white/20">
                  {dest.dur}
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <PlayCircle className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Mulai Relaksasi</span>
                </div>
                <ChevronRight className="text-dark/10" />
              </div>
            </motion.button>
          ))}
        </div>
        
        <div className="mt-12 p-8 bg-primary/5 rounded-[40px] border border-primary/5 text-center space-y-4">
           <Volume2 className="w-8 h-8 text-primary mx-auto opacity-20" />
           <p className="text-xs text-dark/40 font-medium leading-relaxed">
             Untuk pengalaman terbaik, gunakan headset dan pastikan Anda berada di posisi yang nyaman.
           </p>
        </div>
      </div>
    </motion.div>
  );
}

function ScanOverlay({ onClose, setActiveTab, setShowBreathing, setShowVr, onComplete }: { 
  onClose: () => void, 
  setActiveTab: (t: MainTab) => void, 
  setShowBreathing: (b: boolean) => void, 
  setShowVr: (v: boolean) => void,
  onComplete: (mood: string, score: number, data?: any) => void 
}) {
  const [step, setStep] = useState<'camera' | 'questions' | 'analyzing' | 'result'>('camera');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isWajahDetected, setIsWajahDetected] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const launchWhatsApp = (phone: string) => {
    const message = encodeURIComponent("Halo, saya pengguna MENTCARE, ingin berkonsultasi mengenai hasil kuesioner saya.");
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const questionsData = [
    {
      question: "Kurang tertarik atau kehilangan semangat melakukan hal-hal yang biasanya kamu sukai?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Merasa sedih, murung, atau putus asa?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Sulit tidur, sering terbangun, atau malah tidur terlalu lama?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Merasa lelah, lemas, atau merasa tidak punya energi?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Kurang nafsu makan atau justru makan terlalu banyak?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Merasa buruk terhadap diri sendiri, merasa gagal, atau mengecewakan keluarga?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Sulit berkonsentrasi pada hal-hal seperti membaca atau menonton?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Bergerak/berbicara sangat lambat, atau sebaliknya sangat gelisah dan tidak bisa diam?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    },
    {
      question: "Merasa lebih baik mati atau ingin melukai diri sendiri dengan cara apapun?",
      options: [
        { label: "Tidak Pernah", desc: "(Sama sekali tidak merasakannya)", icon: <Smile className="w-6 h-6" />, value: 0 },
        { label: "Beberapa Hari", desc: "(Kadang-kadang muncul)", icon: <Meh className="w-6 h-6" />, value: 1 },
        { label: "Lebih dari Seminggu", desc: "(Sering, lebih dari separuh waktu)", icon: <Frown className="w-6 h-6" />, value: 2 },
        { label: "Hampir Setiap Hari", desc: "(Terus-menerus mengganggu)", icon: <Zap className="w-6 h-6" />, value: 3 }
      ]
    }
  ];

  const currentQuestionData = questionsData[currentQuestion];

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
        setStream(activeStream);
        if (videoRef.current) videoRef.current.srcObject = activeStream;
        setCameraError(null);
        setTimeout(() => setIsWajahDetected(true), 2000);
      } catch (err: any) {
        console.error("Camera error:", err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError("Izin kamera ditolak. Mohon izinkan akses kamera di browser Anda untuk melanjutkan analisis.");
        } else {
          setCameraError("Gagal mengakses kamera. Pastikan kamera Anda tidak sedang digunakan oleh aplikasi lain.");
        }
      }
    }
    startCamera();
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const calculateResult = () => {
    const total = answers.reduce((a, b) => a + b, 0);
    const q9Score = answers[8] || 0;

    if (q9Score >= 2) {
      return { 
        level: "Resiko Bunuh Diri", 
        color: "bg-red-500", 
        text: "Peringatan! Terdeteksi pikiran untuk melukai diri sendiri. Kami sangat menyarankan kamu untuk segera menghubungi bantuan profesional atau orang kepercayaanmu.", 
        value: 20 
      };
    }
    if (total >= 15) {
      return { 
        level: "Depression", 
        color: "bg-[#2D2E5F]", 
        text: "Hasil menunjukkan indikasi depresi yang signifikan. Jangan hadapi ini sendirian, bicaralah dengan ahli yang kami rekomendasikan.", 
        value: 40 
      };
    }
    if (total >= 5) {
      return { 
        level: "Anxiety", 
        color: "bg-accent", 
        text: "Kamu terdeteksi mengalami tingkat kecemasan tertentu. Cobalah untuk meredakannya dengan teknik relaksasi atau konsultasi ringan.", 
        value: 65 
      };
    }
    return { 
      level: "Aman", 
      color: "bg-secondary", 
      text: "Kondisi mental kamu terpantau stabil dan sehat. Teruskan pola hidup yang tenang dan tetap perhatikan kesehatan dirimu.", 
      value: 95 
    };
  };

  const result = calculateResult();

  const handleAnswer = (val: number) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    if (currentQuestion < questionsData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep('analyzing');
      setTimeout(() => {
        setStep('result');
        const res = calculateResult();
        onComplete(res.level, res.value, { answers: newAnswers });
      }, 3000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-off z-[100] flex flex-col"
    >
      <div className="h-2 w-full bg-dark/5 sticky top-0 z-10">
        <motion.div 
          className="h-full bg-primary" 
          initial={{ width: 0 }}
          animate={{ width: `${((answers.length) / questionsData.length) * 100}%` }}
        />
      </div>

      <header className="p-6 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-dark/30 uppercase tracking-[0.2em] mb-1">MENTCARE AI ANALYSIS</span>
          <h3 className="font-bold text-dark">
            {step === 'camera' || step === 'questions' ? `Langkah ${answers.length + 1} dari 9` : 'Hasil Kuesioner'}
          </h3>
        </div>
        <button onClick={onClose} className="p-3 bg-white rounded-2xl shadow-sm border border-dark/5 active:scale-90 transition-all">
          <X className="w-6 h-6 text-dark" />
        </button>
      </header>

      <div className="flex-1 px-6 flex flex-col items-center relative overflow-y-auto no-scrollbar pb-10">
        {step === 'camera' && (
          <motion.div 
            layout
            className="w-full h-48 relative rounded-[32px] overflow-hidden bg-dark shadow-xl border-4 border-white transition-all duration-700 mt-4"
          >
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover grayscale opacity-60"
            />
            <AnimatePresence>
              {cameraError && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-red-500/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-30"
                >
                  <X className="w-10 h-10 text-white mb-2" />
                  <p className="text-xs font-bold text-white uppercase tracking-tight">{cameraError}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 border-2 border-white/20 rounded-full border-dashed animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <p className="text-[9px] font-bold text-white uppercase tracking-widest">
                  {isWajahDetected ? "Wajah Terdeteksi" : "Mencari Wajah..."}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'camera' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 mt-12"
          >
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-dark leading-tight">Mulai Deteksi Real-time</h2>
              <p className="text-sm text-dark/40 max-w-xs mx-auto">Sistem akan menganalisis mikro-ekspresi Anda selama kuesioner berlangsung.</p>
            </div>
            <button 
              onClick={() => setStep('questions')}
              className="bg-primary text-white px-10 py-5 rounded-full font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Mulai Kuesioner
            </button>
          </motion.div>
        )}

        {step === 'questions' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-lg space-y-8"
          >
            <div className="w-full text-center bg-primary/5 p-6 rounded-[32px] border border-primary/10">
              <p className="text-primary font-bold text-sm leading-relaxed italic">
                "Pikirkan kondisimu selama 2 minggu terakhir. Seberapa sering kamu terganggu oleh hal-hal berikut?"
              </p>
            </div>

            <div className={`p-8 rounded-[40px] text-center transition-all ${currentQuestion === 8 ? 'bg-red-50 border-2 border-red-200 shadow-lg' : 'bg-white shadow-xl shadow-primary/5 border border-dark/5'}`}>
              <h4 className={`text-xl font-black leading-tight ${currentQuestion === 8 ? 'text-red-600' : 'text-dark'}`}>
                {currentQuestionData.question}
              </h4>
              {currentQuestion === 8 && (
                <div className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                  Peringatan Khusus
                </div>
              )}
            </div>

            <div className="grid gap-3">
              {currentQuestionData.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.value)}
                  className="group bg-white p-5 rounded-[32px] border border-dark/5 shadow-sm hover:border-primary/20 hover:shadow-md transition-all active:scale-[0.98] flex items-center gap-5 text-left"
                >
                  <div className="w-12 h-12 bg-bg-off rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                    {opt.icon}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-dark text-base leading-tight mb-0.5">{opt.label}</h5>
                    <p className="text-dark/40 text-[10px] font-bold uppercase tracking-wider">{(opt as any).desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-32 h-32 border-4 border-primary/10 border-t-primary rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-dark mb-2">Menganalisis Jawaban...</h3>
              <p className="text-sm font-medium text-dark/40">Menghubungkan dengan pola deteksi AI MentCare.</p>
            </div>
          </div>
        )}

        {step === 'result' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg space-y-8 pb-10"
          >
            <div className={`${result.color} p-10 rounded-[48px] text-center shadow-2xl relative overflow-hidden`}>
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-[24px] flex items-center justify-center mx-auto backdrop-blur-md">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight">{result.level}</h2>
                <p className="text-white/80 font-bold leading-relaxed">{result.text}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-xl font-black text-dark">Rekomendasi Ahli</h4>
                <div className="h-0.5 flex-1 bg-dark/5 ml-4" />
              </div>
              
              <div className="grid gap-4">
                {[
                  { name: "Konsultan MentCare A", phone: "+628111111111", desc: "Manajemen Stres", avatar: "A" },
                  { name: "Psikolog MentCare B", phone: "+628222222222", desc: "Konselor Klinis", avatar: "B" },
                  { name: "Psikolog Klinis C", phone: "+628333333333", desc: "Spesialis Depresi", avatar: "C" }
                ].map((con, i) => (
                  <div key={i} className="bg-white p-5 rounded-[32px] border border-dark/5 shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-bg-off rounded-2xl flex items-center justify-center text-primary font-black border border-dark/5 group-hover:bg-primary/5">
                        {con.avatar}
                      </div>
                      <div>
                        <h5 className="font-bold text-dark text-sm leading-tight">{con.name}</h5>
                        <p className="text-[10px] font-bold text-dark/30 uppercase tracking-widest">{con.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => launchWhatsApp(con.phone)}
                      className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/10 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-wider hidden xs:inline">WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setShowBreathing(true); onClose(); }}
                className="p-6 bg-white rounded-[32px] border border-dark/5 text-left space-y-4 shadow-sm active:scale-95 transition-transform"
              >
                <Wind className="w-8 h-8 text-primary" />
                <h5 className="font-bold text-sm">Latihan Pernapasan</h5>
              </button>
              <button 
                onClick={() => { setActiveTab('education'); onClose(); }}
                className="p-6 bg-white rounded-[32px] border border-dark/5 text-left space-y-4 shadow-sm active:scale-95 transition-transform"
              >
                <BookOpen className="w-8 h-8 text-primary" />
                <h5 className="font-bold text-sm">Baca Edukasi</h5>
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <footer className="p-12" />
    </motion.div>
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
        <Logo className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-display font-bold text-dark mb-2">{title} Section</h2>
      <p className="text-dark/40 max-w-[240px]">Fitur {title} sedang dalam pengembangan untuk pengalaman terbaikmu.</p>
    </motion.div>
  );
}
