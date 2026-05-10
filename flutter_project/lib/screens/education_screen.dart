import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';

class EducationScreen extends StatefulWidget {
  const EducationScreen({super.key});

  @override
  State<EducationScreen> createState() => _EducationScreenState();
}

class _EducationScreenState extends State<EducationScreen> {
  final List<String> categories = ["Populer", "Kecemasan", "Meditasi", "Sosial", "Akademik"];
  int activeIndex = 0;

  final List<Map<String, dynamic>> articles = [
    { "title": "Mengenal Panic Attack", "time": "5 Menit", "cat": "Kecemasan", "img": "https://images.unsplash.com/photo-1474418397713-7dedd4d61396?auto=format&fit=crop&q=80&w=400" },
    { "title": "Teknik Grounding 5-4-3-2-1", "time": "3 Menit", "cat": "Meditasi", "img": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400" },
    { "title": "Lawan Overthinking", "time": "4 Menit", "cat": "Kecemasan", "img": "https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=400" },
    { "title": "Mengatur Stres Ujian", "time": "6 Menit", "cat": "Akademik", "img": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=400" },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7F8),
      appBar: AppBar(
        title: const Text('Pusat Edukasi', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF2D6A6A),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildCategoryFilter(),
          Expanded(child: _buildArticleList()),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.black.withOpacity(0.05)),
        ),
        child: const TextField(
          decoration: InputDecoration(
            icon: Icon(LucideIcons.search, size: 20, color: Colors.grey),
            hintText: 'Cari topik...',
            border: InputBorder.none,
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryFilter() {
    return SizedBox(
      height: 45,
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        itemBuilder: (context, index) {
          bool isActive = activeIndex == index;
          return Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                setState(() => activeIndex = index);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Filter: ${categories[index]}'), duration: const Duration(milliseconds: 500)),
                );
              },
              borderRadius: BorderRadius.circular(20),
              child: Container(
                margin: const EdgeInsets.only(right: 12),
                padding: const EdgeInsets.symmetric(horizontal: 24),
                decoration: BoxDecoration(
                  color: isActive ? Colors.orange : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.black.withOpacity(0.05)),
                ),
                child: Center(
                  child: Text(
                    categories[index],
                    style: TextStyle(
                      color: isActive ? Colors.white : Colors.grey,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildArticleList() {
    return ListView.separated(
      padding: const EdgeInsets.all(24),
      itemCount: articles.length,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final art = articles[index];
        return FadeInUp(
          delay: Duration(milliseconds: 100 * index),
          child: Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
            child: InkWell(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Membaca: ${art["title"]}'), duration: const Duration(seconds: 1)),
                );
              },
              borderRadius: BorderRadius.circular(24),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(art["img"], width: 80, height: 80, fit: BoxShape.cover),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            art["cat"].toUpperCase(),
                            style: const TextStyle(color: Color(0xFF2D6A6A), fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                          ),
                          const SizedBox(height: 4),
                          Text(art["title"], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(LucideIcons.clock, size: 12, color: Colors.grey),
                              const SizedBox(width: 4),
                              Text(art["time"], style: const TextStyle(color: Colors.grey, fontSize: 10)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
