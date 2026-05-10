import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';
import 'vr_player_screen.dart';

class VrListScreen extends StatelessWidget {
  const VrListScreen({super.key});

  final List<Map<String, String>> vrVideos = const [
    {
      "title": "Hutan Pinus Pagi",
      "duration": "5 Menit",
      "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800",
      "panorama": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000"
    },
    {
      "title": "Ombak Senja Bali",
      "duration": "8 Menit",
      "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
      "panorama": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000"
    },
    {
      "title": "Pegunungan Salju",
      "duration": "10 Menit",
      "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
      "panorama": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000"
    },
    {
      "title": "Taman Zen Jepang",
      "duration": "6 Menit",
      "image": "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=800",
      "panorama": "https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=2000"
    }
  ];

  @override
  Widget build(BuildContext context) {
    // Dynamic column count based on width
    final double width = MediaQuery.of(context).size.width;
    final int crossAxisCount = width > 900 ? 4 : (width > 600 ? 3 : 2);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F8F7),
      appBar: AppBar(
        title: const Text('VR Relaksasi', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF086E71),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: GridView.builder(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            childAspectRatio: 0.8,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: vrVideos.length,
          itemBuilder: (context, index) {
            final video = vrVideos[index];
            return FadeInUp(
              delay: Duration(milliseconds: 100 * index),
              child: _buildVrCard(context, video),
            );
          },
        ),
      ),
    );
  }

  Widget _buildVrCard(BuildContext context, Map<String, String> video) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(24),
      elevation: 2,
      shadowColor: Colors.black.withOpacity(0.05),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => VrPlayerScreen(
                title: video["title"]!,
                imageUrl: video["panorama"]!,
              ),
            ),
          );
        },
        borderRadius: BorderRadius.circular(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              flex: 3,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: Image.network(
                  video["image"]!,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      video["title"]!,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(LucideIcons.clock, size: 12, color: Colors.black45),
                        const SizedBox(width: 4),
                        Text(
                          video["duration"]!,
                          style: const TextStyle(color: Colors.black45, fontSize: 11),
                        ),
                        const Spacer(),
                        const Icon(Icons.vrpano, size: 16, color: Color(0xFF086E71)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
