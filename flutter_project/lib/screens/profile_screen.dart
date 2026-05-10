import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7F8),
      body: SingleChildScrollView(
        child: Column(
          children: [
            _buildHeader(context),
            const SizedBox(height: 24),
            _buildStatsSummary(),
            const SizedBox(height: 24),
            _buildMenuItems(context),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(24, 60, 24, 40),
      child: FadeInDown(
        duration: const Duration(milliseconds: 800),
        child: Column(
          children: [
            Stack(
              children: [
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Ubah foto profil...'), duration: Duration(seconds: 1)),
                      );
                    },
                    borderRadius: BorderRadius.circular(60),
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF2D6A6A), width: 2),
                      ),
                      child: const CircleAvatar(
                        radius: 50,
                        backgroundImage: NetworkImage('https://api.dicebear.com/7.x/avataaars/svg?seed=Ahda'),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Material(
                    color: const Color(0xFF2D6A6A),
                    shape: const CircleBorder(),
                    child: InkWell(
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Membuka kamera...'), duration: Duration(seconds: 1)),
                        );
                      },
                      borderRadius: BorderRadius.circular(30),
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        child: const Icon(LucideIcons.camera, color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'Ahda Fauziah',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Color(0xFF2D3250),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'ahdafauziah@students.unnes.ac.id',
              style: TextStyle(
                fontSize: 14,
                color: Colors.black.withOpacity(0.4),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSummary() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: FadeInUp(
        duration: const Duration(milliseconds: 1000),
        child: Container(
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
          child: Row(
            children: [
              _statItem(LucideIcons.activity, 'Status Terakhir', 'Tenang'),
              Container(width: 1, height: 40, color: Colors.white.withOpacity(0.2)),
              _statItem(LucideIcons.wind, 'Terakhir Coping', '2 jam lalu'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statItem(IconData icon, String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: Colors.white.withOpacity(0.6), size: 18),
          const SizedBox(height: 8),
          Text(
            label.toUpperCase(),
            style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 10, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItems(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          FadeInUp(
            delay: const Duration(milliseconds: 100),
            child: _menuItem(
              icon: LucideIcons.user,
              label: 'Informasi Pribadi',
              onTap: () {
                // TODO: Navigasi ke Halaman Informasi Pribadi
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Menuju halaman Informasi Pribadi...'), duration: Duration(seconds: 1)),
                );
              },
            ),
          ),
          FadeInUp(
            delay: const Duration(milliseconds: 200),
            child: _menuItem(
              icon: LucideIcons.history,
              label: 'Riwayat Scan Kecemasan',
              onTap: () {
                // TODO: Navigasi ke Halaman Riwayat
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Menuju halaman Riwayat Scan...'), duration: Duration(seconds: 1)),
                );
              },
            ),
          ),
          FadeInUp(
            delay: const Duration(milliseconds: 300),
            child: _menuItem(
              icon: LucideIcons.bell,
              label: 'Notifikasi',
              onTap: () {
                // TODO: Navigasi ke Halaman Notifikasi
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Menuju halaman Notifikasi...'), duration: Duration(seconds: 1)),
                );
              },
            ),
          ),
          FadeInUp(
            delay: const Duration(milliseconds: 400),
            child: _menuItem(
              icon: LucideIcons.lock,
              label: 'Privasi & Keamanan',
              onTap: () {
                // TODO: Navigasi ke Halaman Privasi
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Menuju halaman Privasi & Keamanan...'), duration: Duration(seconds: 1)),
                );
              },
            ),
          ),
          FadeInUp(
            delay: const Duration(milliseconds: 500),
            child: _menuItem(
              icon: LucideIcons.helpCircle,
              label: 'Pusat Bantuan',
              onTap: () {
                // TODO: Navigasi ke Halaman Bantuan
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Menuju halaman Pusat Bantuan...'), duration: Duration(seconds: 1)),
                );
              },
            ),
          ),
          const SizedBox(height: 12),
          FadeInUp(
            delay: const Duration(milliseconds: 600),
            child: _menuItem(
              icon: LucideIcons.logOut,
              label: 'Keluar (Logout)',
              isLogout: true,
              onTap: () {
                _showLogoutDialog(context);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _menuItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isLogout = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(24),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.black.withOpacity(0.05)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isLogout ? Colors.red.withOpacity(0.05) : const Color(0xFF2D6A6A).withOpacity(0.05),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    icon,
                    color: isLogout ? Colors.red : const Color(0xFF2D6A6A),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: isLogout ? Colors.red : const Color(0xFF2D3250),
                    ),
                  ),
                ),
                Icon(
                  LucideIcons.chevronRight,
                  color: Colors.black.withOpacity(0.15),
                  size: 18,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: const Text('Konfirmasi Logout', style: TextStyle(fontWeight: FontWeight.bold)),
        content: const Text('Apakah Anda yakin ingin keluar dari akun MENTCARE?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
