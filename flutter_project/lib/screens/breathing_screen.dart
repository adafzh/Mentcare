import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:lucide_icons/lucide_icons.dart';

class BreathingScreen extends StatefulWidget {
  const BreathingScreen({super.key});

  @override
  State<BreathingScreen> createState() => _BreathingScreenState();
}

class _BreathingScreenState extends State<BreathingScreen> {
  String _step = "Tarik Napas";
  double _scale = 1.0;
  bool _isActive = false;

  void _startBreathing() async {
    setState(() => _isActive = true);
    while (_isActive) {
      if (!mounted) break;
      
      // Inhale
      setState(() {
         _step = "Tarik Napas";
         _scale = 1.6;
      });
      await Future.delayed(const Duration(seconds: 4));
      
      // Hold
      if (!_isActive) break;
      setState(() => _step = "Tahan");
      await Future.delayed(const Duration(seconds: 4));
      
      // Exhale
      if (!_isActive) break;
      setState(() {
        _step = "Buang Napas";
        _scale = 1.0;
      });
      await Future.delayed(const Duration(seconds: 8));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF2D6A6A),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                   Material(
                    color: Colors.transparent,
                    child: IconButton(
                      icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                ],
              ),
            ),
            
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    _step.toUpperCase(),
                    style: const TextStyle(
                      color: Colors.white, 
                      fontSize: 12, 
                      fontWeight: FontWeight.w900, 
                      letterSpacing: 8
                    ),
                  ),
                  const SizedBox(height: 80),
                  
                  // Pulse Animation Circle
                  AnimatedContainer(
                    duration: Duration(seconds: _step == "Tarik Napas" ? 4 : (_step == "Tahan" ? 0 : 8)),
                    width: 200 * _scale,
                    height: 200 * _scale,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white.withOpacity(0.2), width: 2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.white.withOpacity(0.1),
                          blurRadius: 40,
                          spreadRadius: 20,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.wind, color: Colors.white, size: 32),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 80),
                  if (!_isActive)
                    FadeInUp(
                      child: ElevatedButton(
                        onPressed: _startBreathing,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF2D6A6A),
                          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(40)),
                        ),
                        child: const Text('Mulai Relaksasi', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    )
                  else
                    const Text(
                      'Fokus pada titik ini dan biarkan tubuhmu tenang.',
                      style: TextStyle(color: Colors.white70, fontSize: 12),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
