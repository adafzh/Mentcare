import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  CameraController? _controller;
  bool _isCameraInitialized = false;
  bool _isScanning = false;
  bool _isBusy = false;
  String _statusText = "Arahkan wajah ke kamera";
  
  final FaceDetector _faceDetector = FaceDetector(
    options: FaceDetectorOptions(
      enableClassification: true,
      performanceMode: FaceDetectorMode.fast,
    ),
  );

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    final cameras = await availableCameras();
    final frontCamera = cameras.firstWhere(
      (camera) => camera.lensDirection == CameraLensDirection.front,
    );

    _controller = CameraController(
      frontCamera,
      ResolutionPreset.medium,
      enableAudio: false,
    );

    try {
      await _controller!.initialize();
      
      // Mulai stream gambar jika inisialisasi berhasil
      _controller!.startImageStream((CameraImage image) {
        if (_isScanning) {
          _processCameraImage(image);
        }
      });

      setState(() {
        _isCameraInitialized = true;
        _statusText = "Arahkan wajah ke kamera";
      });
    } catch (e) {
      debugPrint("Camera Error: $e");
      setState(() {
        if (e.toString().contains("permissionDenied")) {
          _statusText = "Izin kamera ditolak";
        } else {
          _statusText = "Gagal memuat kamera";
        }
      });
    }
  }

  Future<void> _processCameraImage(CameraImage image) async {
    if (_isBusy) return;
    _isBusy = true;

    try {
      final inputImage = _inputImageFromCameraImage(image);
      if (inputImage == null) return;

      final faces = await _faceDetector.processImage(inputImage);

      if (mounted) {
        setState(() {
          if (faces.isNotEmpty) {
            _statusText = "Wajah Terdeteksi - Menganalisis...";
          } else {
            _statusText = "Arahkan wajah ke kamera";
          }
        });
      }
    } catch (e) {
      debugPrint("Error processing image: $e");
    } finally {
      _isBusy = false;
    }
  }

  InputImage? _inputImageFromCameraImage(CameraImage image) {
    if (_controller == null) return null;

    // Ambil deskripsi kamera untuk menentukan rotasi
    final camera = _controller!.description;
    final sensorOrientation = camera.sensorOrientation;
    
    // Tentukan rotasi input image
    InputImageRotation? rotation;
    if (sensorOrientation == 90) {
      rotation = InputImageRotation.rotation90deg;
    } else if (sensorOrientation == 180) {
      rotation = InputImageRotation.rotation180deg;
    } else if (sensorOrientation == 270) {
      rotation = InputImageRotation.rotation270deg;
    } else {
      rotation = InputImageRotation.rotation0deg;
    }

    // Tentukan format gambar (YUV420 lebih umum di Android, BGRA8888 di iOS)
    final format = InputImageFormatValue.fromRawValue(image.format.raw);
    if (format == null) return null;

    // Bangun metadata gambar
    final plane = image.planes.first;

    return InputImage.fromBytes(
      bytes: plane.bytes,
      metadata: InputImageMetadata(
        size: Size(image.width.toDouble(), image.height.toDouble()),
        rotation: rotation,
        format: format,
        bytesPerRow: plane.bytesPerRow,
      ),
    );
  }

  @override
  void dispose() {
    _controller?.stopImageStream();
    _controller?.dispose();
    _faceDetector.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. Camera Feed
          if (_isCameraInitialized)
            SizedBox.expand(
              child: FittedBox(
                fit: BoxFit.cover,
                child: SizedBox(
                  width: _controller!.value.previewSize?.height ?? 1,
                  height: _controller!.value.previewSize?.width ?? 1,
                  child: CameraPreview(_controller!),
                ),
              ),
            )
          else
            const Center(child: CircularProgressIndicator(color: Colors.white)),

          // 2. Scan Overlay (Face Detection Frame)
          _buildScanOverlay(),

          // 3. Status Bar
          Positioned(
            top: 120,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _statusText.contains("Terdeteksi") ? LucideIcons.checkCircle : LucideIcons.user,
                      color: _statusText.contains("Terdeteksi") ? Colors.greenAccent : Colors.white,
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _statusText,
                      style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 4. UI Content (Questions & Feedback)
          _buildBottomUI(),

          // 4. Back Button
          Positioned(
            top: 60,
            left: 24,
            child: Material(
              color: Colors.white.withOpacity(0.2),
              shape: const CircleBorder(),
              child: IconButton(
                icon: const Icon(LucideIcons.arrowLeft, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScanOverlay() {
    return Center(
      child: FadeIn(
        duration: const Duration(seconds: 2),
        infinite: _isScanning,
        child: Container(
          width: 250,
          height: 350,
          decoration: BoxDecoration(
            border: Border.all(color: _isScanning ? const Color(0xFF2D6A6A) : Colors.white, width: 2),
            borderRadius: BorderRadius.circular(150),
          ),
        ),
      ),
    );
  }

  Widget _buildBottomUI() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: SlideInUp(
        child: Container(
          padding: const EdgeInsets.all(32),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(40)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Posisi Wajah di Tengah',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2D6A6A)),
              ),
              const SizedBox(height: 8),
              Text(
                'Kami sedang menganalisis ekspresi mikro dan tingkat fokus matamu.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.black.withOpacity(0.4)),
              ),
              const SizedBox(height: 32),
              
              // Questionnaire Simulation Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F7F8),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: [
                    const Text(
                      'Seberapa cemas perasaanmu saat ini?',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: List.generate(5, (index) => _ratingButton(index + 1)),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              ElevatedButton(
                onPressed: () => setState(() => _isScanning = !_isScanning),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF2D6A6A),
                  minimumSize: const Size(double.infinity, 60),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                child: Text(
                  _isScanning ? 'Membatalkan...' : 'Mulai Analisis',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _ratingButton(int value) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Rating $value dipilih'), duration: const Duration(milliseconds: 500)),
          );
        },
        borderRadius: BorderRadius.circular(10),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: Colors.black.withOpacity(0.05)),
          ),
          child: Center(
            child: Text(
              value.toString(),
              style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF2D6A6A)),
            ),
          ),
        ),
      ),
    );
  }
}
