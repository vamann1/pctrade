package com.example.demo.chat.controller;

import com.example.demo.chat.dto.MessageRequest;
import com.example.demo.chat.dto.MessageResponse;
import com.example.demo.chat.service.ChatImageService;
import com.example.demo.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatImageService chatImageService;

    @PostMapping("/send")
    public ResponseEntity<MessageResponse> send(
            @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(chatService.sendMessage(request, userDetails.getUsername()));
    }

    @GetMapping("/history/{userId1}/{userId2}")
    public ResponseEntity<List<MessageResponse>> getHistory(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        return ResponseEntity.ok(chatService.getHistory(userId1, userId2));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) throws Exception {
        String url = chatImageService.uploadChatImage(file);
        return ResponseEntity.ok(Map.of("imageUrl", url));
    }

    @MessageMapping("/chat.send")
    public void sendWebSocket(@Payload MessageRequest request, Principal principal) {
        chatService.sendMessage(request, principal.getName());
    }
}