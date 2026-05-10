import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:animate_do/animate_do.dart';

class ChatScreen extends StatefulWidget {
  final Map<String, dynamic> doctor;

  const ChatScreen({super.key, required this.doctor});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, dynamic>> _messages = [
    {
      "text": "Halo! Saya dr. Sarah. Ada yang bisa saya bantu terkait kondisi kesehatan mental Anda hari ini?",
      "isMe": false,
      "time": "10:00"
    }
  ];

  void _sendMessage() {
    if (_controller.text.isEmpty) return;
    
    setState(() {
      _messages.add({
        "text": _controller.text,
        "isMe": true,
        "time": "10:05",
      });
      _controller.clear();
    });

    // Simulasi balasan otomatis (Mock)
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _messages.add({
            "text": "Terima kasih sudah berbagi. Mari kita bahas lebih lanjut mengenai perasaan Anda tersebut.",
            "isMe": false,
            "time": "10:07",
          });
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7F8),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF2D6A6A),
        leadingWidth: 40,
        title: Row(
          children: [
            CircleAvatar(
              radius: 18,
              backgroundImage: NetworkImage(widget.doctor["img"]),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.doctor["name"],
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF2D3250)),
                  ),
                  Text(
                    "Online",
                    style: TextStyle(fontSize: 10, color: Colors.green.shade600, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(LucideIcons.phone, size: 20)),
          IconButton(onPressed: () {}, icon: const Icon(LucideIcons.video, size: 20)),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(20),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildChatBubble(msg);
              },
            ),
          ),
          _buildMessageInput(),
        ],
      ),
    );
  }

  Widget _buildChatBubble(Map<String, dynamic> msg) {
    bool isMe = msg["isMe"];
    return FadeInUp(
      duration: const Duration(milliseconds: 300),
      child: Align(
        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Container(
          margin: const EdgeInsets.only(bottom: 16),
          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: isMe ? const Color(0xFF2D6A6A) : Colors.white,
            borderRadius: BorderRadius.only(
              topLeft: const Radius.circular(20),
              topRight: const Radius.circular(20),
              bottomLeft: Radius.circular(isMe ? 20 : 0),
              bottomRight: Radius.circular(isMe ? 0 : 20),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 10,
                offset: const Offset(0, 4),
              )
            ],
          ),
          child: Column(
            crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
            children: [
              Text(
                msg["text"],
                style: TextStyle(
                  color: isMe ? Colors.white : const Color(0xFF2D3250),
                  fontSize: 13,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                msg["time"],
                style: TextStyle(
                  color: isMe ? Colors.white.withOpacity(0.6) : Colors.black.withOpacity(0.3),
                  fontSize: 9,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMessageInput() {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F7F8),
                borderRadius: BorderRadius.circular(20),
              ),
              child: TextField(
                controller: _controller,
                decoration: const InputDecoration(
                  hintText: "Ketik pesan Anda...",
                  border: InputBorder.none,
                  hintStyle: TextStyle(fontSize: 13),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: const BoxDecoration(
                color: Color(0xFF2D6A6A),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.send, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
