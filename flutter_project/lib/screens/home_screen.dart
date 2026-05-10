import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';
import 'package:mentcare/screens/scan_screen.dart';
import 'package:mentcare/screens/breathing_screen.dart';
import 'package:mentcare/screens/education_screen.dart';
import 'package:mentcare/screens/consultation_screen.dart';
import 'package:mentcare/screens/profile_screen.dart';
import 'package:mentcare/screens/detail_psikolog_screen.dart';
import 'package:mentcare/screens/chat_screen.dart';
import 'package:mentcare/screens/vr_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const HomeContent(),
    const Center(child: Text('Chat Screen (Placeholder)')),
    const Center(child: Text('Schedule Screen (Placeholder)')),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7F8),
      body: _screens[_currentIndex],
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      padding: const EdgeInsets.only(bottom: 24, left: 12, right: 12, top: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFF1F1F1))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _navItem(LucideIcons.home, 0),
          _navItem(LucideIcons.messageCircle, 1),
          _navItem(LucideIcons.calendar, 2),
          _navItem(LucideIcons.user, 3),
        ],
      ),
    );
  }

  Widget _navItem(IconData icon, int index) {
    bool isActive = _currentIndex == index;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => setState(() => _currentIndex = index),
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFF2D6A6A).withOpacity(0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(icon, color: isActive ? const Color(0xFF2D6A6A) : Colors.black.withOpacity(0.2), size: 24),
        ),
      ),
    );
  }
}

class HomeContent extends StatelessWidget {
  const HomeContent({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeader(context),
            const SizedBox(height: 32),
            _buildDailyMoodCard(context),
            const SizedBox(height: 32),
            _buildSectionTitle('Layanan Kami'),
            const SizedBox(height: 16),
            _buildFeatureGrid(context),
            const SizedBox(height: 32),
            _buildSectionHeader(context, 'Rekomendasi Ahli'),
            const SizedBox(height: 16),
            _buildExpertRecommendations(context),
            const SizedBox(height: 32),
            _buildSectionTitle('Rekomendasi Edukasi'),
            const SizedBox(height: 16),
            _buildEducationCard(context),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return FadeIn(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Selamat Pagi,',
                style: TextStyle(
                  color: Colors.black.withOpacity(0.4),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Text(
                'Ahda Fauziah',
                style: TextStyle(
                  color: Color(0xFF2D3250),
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          Material(
            color: Colors.transparent,
            shape: const CircleBorder(),
            child: InkWell(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Berhasil diklik! Menuju halaman detail profil...'), duration: Duration(seconds: 1)),
                );
              },
              customBorder: const CircleBorder(),
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF2D6A6A), width: 2),
                ),
                child: const CircleAvatar(
                  radius: 24,
                  backgroundImage: NetworkImage('https://api.dicebear.com/7.x/avataaars/svg?seed=Ahda'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDailyMoodCard(BuildContext context) {
    return ZoomIn(
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF2D6A6A),
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2D6A6A).withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          children: [
            const Text(
              'Bagaimana perasaanmu?',
              style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _moodIcon(context, '😊', 'Senang'),
                _moodIcon(context, '😐', 'Biasa'),
                _moodIcon(context, '😔', 'Sedih'),
                _moodIcon(context, '😨', 'Cemas'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _moodIcon(BuildContext context, String emoji, String label) {
    return Column(
      children: [
        Material(
          color: Colors.white.withOpacity(0.1),
          shape: const CircleBorder(),
          child: InkWell(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Berhasil diklik! Mood $label tercatat! Terima kasih.'), duration: const Duration(seconds: 1)),
              );
            },
            customBorder: const CircleBorder(),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Text(emoji, style: const TextStyle(fontSize: 24)),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 10, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Color(0xFF2D3250)),
    );
  }

  Widget _buildSectionHeader(BuildContext context, String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildSectionTitle(title),
        TextButton(
          onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ConsultationScreen()));
          },
          child: const Text('Lihat Semua', style: TextStyle(color: Color(0xFF2D6A6A), fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }

  Widget _buildExpertRecommendations(BuildContext context) {
    final List<Map<String, dynamic>> topDoctors = [
      { "name": "dr. Sarah Wijaya", "spec": "Psikolog Klinis", "rating": 4.9, "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", "status": "Online" },
      { "name": "dr. Ahmad Fauzi", "spec": "Konselor Keluarga", "rating": 4.7, "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad", "status": "Offline" },
    ];

    return Column(
      children: topDoctors.map((doc) => _expertCard(context, doc)).toList(),
    );
  }

  Widget _expertCard(BuildContext context, Map<String, dynamic> doc) {
  return Container(
    margin: const EdgeInsets.only(bottom: 12),
    child: Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      // Aturan: Border didefinisikan di Material agar tidak menutupi InkWell
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.black.withOpacity(0.05)),
      ),
      child: InkWell(
        onTap: () {
          // Bukti klik sesuai instruksi
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Berhasil diklik! Menuju halaman...'))
          );
          // Navigasi dengan passing data
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => ChatScreen(doctor: doc)),
          );
        },
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Hero(
                tag: 'doctor-${doc["name"]}',
                child: CircleAvatar(
                  radius: 28,
                  backgroundColor: const Color(0xFF2D6A6A).withOpacity(0.1),
                  backgroundImage: NetworkImage(doc["img"]),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(doc["name"], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Text(doc["spec"], style: TextStyle(color: Colors.black.withOpacity(0.4), fontSize: 10, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 8),
                        const Icon(Icons.star_rounded, color: Colors.orange, size: 12),
                        const SizedBox(width: 2),
                        Text(doc["rating"].toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10)),
                      ],
                    ),
                  ],
                ),
              ),
              // Icon indikator chat
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF2D6A6A).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(LucideIcons.messageSquare, color: Color(0xFF2D6A6A), size: 18),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  }

  Widget _buildFeatureGrid(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.1,
      children: [
        _featureCard(
          context: context,
          icon: LucideIcons.scanFace,
          label: 'Scan Kecemasan',
          bgColor: const Color(0xFF76ABAE).withOpacity(0.1),
          iconColor: const Color(0xFF2D6A6A),
          onTap: () {
            // TODO: Navigasi ke ScanScreen
            Navigator.push(context, MaterialPageRoute(builder: (context) => const ScanScreen()));
          },
        ),
        _featureCard(
          context: context,
          icon: LucideIcons.wind,
          label: 'Coping Meditasi',
          bgColor: Colors.blue.withOpacity(0.05),
          iconColor: Colors.blue,
          onTap: () {
            // TODO: Navigasi ke BreathingScreen
            Navigator.push(context, MaterialPageRoute(builder: (context) => const BreathingScreen()));
          },
        ),
        _featureCard(
          context: context,
          icon: LucideIcons.bookOpen,
          label: 'Pusat Edukasi',
          bgColor: Colors.orange.withOpacity(0.05),
          iconColor: Colors.orange,
          onTap: () {
            // TODO: Navigasi ke EducationScreen
            Navigator.push(context, MaterialPageRoute(builder: (context) => const EducationScreen()));
          },
        ),
        _featureCard(
          context: context,
          icon: Icons.vrpano,
          label: 'VR Relaksasi',
          bgColor: Colors.teal.withOpacity(0.05),
          iconColor: Colors.teal,
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => const VrListScreen()));
          },
        ),
      ],
    );
  }

  Widget _featureCard({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color bgColor,
    required Color iconColor,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.black.withOpacity(0.05)),
      ),
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Berhasil diklik! Menuju halaman...')));
          onTap();
        },
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(12)),
                child: Icon(icon, color: iconColor, size: 24),
              ),
              Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEducationCard(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: BorderSide(color: Colors.black.withOpacity(0.05)),
      ),
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Berhasil diklik! Menuju halaman...')));
          Navigator.push(context, MaterialPageRoute(builder: (context) => const EducationScreen()));
        },
        borderRadius: BorderRadius.circular(24),
        child: SizedBox(
          width: double.infinity,
          child: Row(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(24)),
                child: Image.network(
                  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=200',
                  width: 100,
                  height: 100,
                  fit: BoxFit.cover,
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Teknik Grounding 5-4-3-2-1', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      SizedBox(height: 4),
                      Text('3 Menit Baca • Meditasi', style: TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
