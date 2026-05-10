import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';
import 'package:mentcare/screens/chat_screen.dart';

class DetailPsikologScreen extends StatelessWidget {
  final Map<String, dynamic> doctor;

  const DetailPsikologScreen({super.key, required this.doctor});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7F8),
      appBar: AppBar(
        title: const Text('Profil Psikolog', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF2D6A6A),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            FadeInDown(
              child: Center(
                child: Hero(
                  tag: 'doctor-${doctor["name"]}',
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF2D6A6A), width: 3),
                    ),
                    child: CircleAvatar(
                      radius: 60,
                      backgroundColor: const Color(0xFF2D6A6A).withOpacity(0.1),
                      backgroundImage: NetworkImage(doctor["img"]),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            FadeInUp(
              child: Column(
                children: [
                  Text(
                    doctor["name"],
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Color(0xFF2D3250)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    doctor["spec"],
                    style: TextStyle(fontSize: 16, color: Colors.black.withOpacity(0.5), fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _infoBadge(LucideIcons.star, doctor["rating"].toString(), Colors.orange),
                      const SizedBox(width: 12),
                      _infoBadge(LucideIcons.messageSquare, '48 Ulasan', Colors.blue),
                      const SizedBox(width: 12),
                      _infoBadge(LucideIcons.clock, 'Exp. 5 Thn', Colors.green),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            FadeInUp(
              delay: const Duration(milliseconds: 200),
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(color: Colors.black.withOpacity(0.05)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Tentang Psikolog',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2D3250)),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      '${doctor["name"]} adalah seorang ${doctor["spec"]} yang berpengalaman dalam menangani berbagai masalah kesehatan mental, terutama kecemasan dan gangguan mood. Telah membantu lebih dari 500+ klien.',
                      style: TextStyle(color: Colors.black.withOpacity(0.6), height: 1.6),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            FadeInUp(
              delay: const Duration(milliseconds: 400),
              child: SizedBox(
                width: double.infinity,
                height: 60,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => ChatScreen(doctor: doctor)),
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2D6A6A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    elevation: 0,
                  ),
                  child: const Text('Mulai Konsultasi (Rp 50.000)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoBadge(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }
}
