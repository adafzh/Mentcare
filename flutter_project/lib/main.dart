import 'package:flutter/material.dart';
import 'package:mentcare/screens/splash_screen.dart';
import 'package:provider/provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MentCareApp());
}

class MentCareApp extends StatelessWidget {
  const MentCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Definisi warna teks kostum
    const Color textPrimary = Color(0xFF1A3D3D); // Biru Gelap
    const Color textSecondary = Color(0xFF4A4A4A); // Abu-abu Gelap

    return MaterialApp(
      title: 'MentCare',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        // Set fontFamily secara global
        fontFamily: 'TT Commons',
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2D6A6A),
          primary: const Color(0xFF2D6A6A),
          secondary: const Color(0xFF76ABAE),
          background: const Color(0xFFF9F9F9),
        ),
        // Konfigurasi TextTheme menggunakan TT Commons
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: textPrimary,
          ),
          titleLarge: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: textPrimary,
          ),
          bodyMedium: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: textSecondary,
          ),
          labelLarge: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: textPrimary,
          ),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
