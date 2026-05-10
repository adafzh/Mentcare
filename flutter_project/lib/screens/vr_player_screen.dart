import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';

class VrPlayerScreen extends StatefulWidget {
  final String title;
  final String imageUrl;

  const VrPlayerScreen({
    super.key,
    required this.title,
    required this.imageUrl,
  });

  @override
  State<VrPlayerScreen> createState() => _VrPlayerScreenState();
}

class _VrPlayerScreenState extends State<VrPlayerScreen> {
  final TransformationController _transformationController = TransformationController();

  @override
  void initState() {
    super.initState();
    // Center the view initially for a better panoramic feeling
    _transformationController.value = Matrix4.identity()..translate(-200.0, 0.0);
  }

  @override
  void dispose() {
    _transformationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Simulated 360 viewer using InteractiveViewer
          SizedBox.expand(
            child: InteractiveViewer(
              transformationController: _transformationController,
              boundaryMargin: const EdgeInsets.all(double.infinity),
              minScale: 0.1,
              maxScale: 4.0,
              child: Image.network(
                widget.imageUrl,
                height: double.infinity,
                fit: BoxFit.fitHeight,
              ),
            ),
          ),

          // Top Info Gradient
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              height: 120,
              padding: const EdgeInsets.fromLTRB(24, 60, 24, 0),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.black.withOpacity(0.6), Colors.transparent],
                ),
              ),
              child: FadeInDown(
                child: Row(
                  children: [
                    const Icon(Icons.vrpano, color: Colors.white, size: 24),
                    const SizedBox(width: 12),
                    Text(
                      widget.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Exit Button
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: FadeInUp(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: FloatingActionButton.extended(
                    onPressed: () => Navigator.pop(context),
                    backgroundColor: Colors.white.withOpacity(0.9),
                    foregroundColor: const Color(0xFF086E71),
                    icon: const Icon(LucideIcons.x),
                    label: const Text('Selesai Relaksasi', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ),
            ),
          ),

          // Instruction Overlay (Fades out)
          FadeIn(
            duration: const Duration(seconds: 2),
            child: Center(
              child: IgnorePointer(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(LucideIcons.move, color: Colors.white, size: 40),
                      SizedBox(height: 12),
                      Text(
                        "Geser untuk melihat sekeliling",
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ).animate(delay: const Duration(seconds: 3)).fadeOut(),
        ],
      ),
    );
  }
}
