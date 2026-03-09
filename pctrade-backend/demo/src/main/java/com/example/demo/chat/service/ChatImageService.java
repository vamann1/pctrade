package com.example.demo.chat.service;

import com.example.demo.marketplace.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ChatImageService {

    private final MinioService minioService;

    public String uploadChatImage(MultipartFile file) throws Exception {
        return minioService.uploadImage(file);
    }
}