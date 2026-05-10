import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';
import 'package:mentcare/screens/detail_psikolog_screen.dart';
import 'package:mentcare/screens/chat_screen.dart';

class ConsultationScreen extends StatelessWidget {
  const ConsultationScreen({super.key});

  final List<Map<String, dynamic>> doctors = const [
    { "name": "dr. Sarah Wijaya", "spec": "Psikolog Klinis", "rating": 4.9, "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", "status": "Online" },
    { "name": "dr. Ahmad Fauzi", "spec": "Konselor Keluarga", "rating": 4.7, "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad", "status": "Offline" },
    { "name": "dr. Linda Sari", "spec": "Spesialis Mood", "rating": 5.0, "img": "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda", "status": "Online" },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7F8),
      appBar: AppBar(
        title: const Text('Daftar Psikolog', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF2D6A6A),
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(24),
        itemCount: doctors.length,
        separatorBuilder: (context, index) => const SizedBox(height: 16),
        itemBuilder: (context, index) {
          final doc = doctors[index];
          bool isOnline = doc["status"] == "Online";
          return FadeInRight(
            delay: Duration(milliseconds: 100 * index),
            child: Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(28),
                side: BorderSide(color: Colors.black.withOpacity(0.05)),
              ),
              child: InkWell(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Berhasil diklik! Menuju halaman...')));
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => ChatScreen(doctor: doc)),
                  );
                },
                borderRadius: BorderRadius.circular(28),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Row(
                    children: [
                       Stack(
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: const Color(0xFF2D6A6A).withOpacity(0.1),
                            backgroundImage: NetworkImage(doc["img"]),
                          ),
                          Positioned(
                            right: 0,
                            bottom: 0,
                            child: Container(
                              width: 14,
                              height: 14,
                              decoration: BoxDecoration(
                                color: isOnline ? Colors.green : Colors.grey,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 20),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(doc["name"], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            Text(doc["spec"], style: TextStyle(color: Colors.black.withOpacity(0.4), fontSize: 12)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.star_rounded, color: Colors.orange, size: 16),
                                const SizedBox(width: 4),
                                Text(doc["rating"].toString(), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const Icon(LucideIcons.chevronRight, color: Colors.grey, size: 20),
                    ],
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
