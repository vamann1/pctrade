package com.example.demo.chat.service;

import com.example.demo.auth.entity.User;
import com.example.demo.auth.repository.UserRepository;
import com.example.demo.chat.dto.MessageRequest;
import com.example.demo.chat.dto.MessageResponse;
import com.example.demo.chat.entity.Message;
import com.example.demo.chat.repository.MessageRepository;
import com.example.demo.marketplace.entity.Listing;
import com.example.demo.marketplace.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageResponse sendMessage(MessageRequest request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setType(request.getType());
        message.setContent(request.getContent());
        message.setImageUrl(request.getImageUrl());
        message.setOfferAmount(request.getOfferAmount());
        message.setCreatedAt(LocalDateTime.now());

        if (request.getListingId() != null) {
            Listing listing = listingRepository.findById(request.getListingId())
                    .orElseThrow(() -> new RuntimeException("Listing not found"));
            message.setListing(listing);
        }

        Message saved = messageRepository.save(message);
        MessageResponse response = toResponse(saved);

        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/messages",
                response
        );

        return response;
    }

    public List<MessageResponse> getHistory(Long userId1, Long userId2) {
        return messageRepository
                .findBySenderIdAndReceiverIdOrderByCreatedAtAsc(userId1, userId2)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private MessageResponse toResponse(Message m) {
        MessageResponse r = new MessageResponse();
        r.setId(m.getId());
        r.setSenderUsername(m.getSender().getUsername());
        r.setReceiverUsername(m.getReceiver().getUsername());
        r.setType(m.getType());
        r.setContent(m.getContent());
        r.setImageUrl(m.getImageUrl());
        r.setOfferAmount(m.getOfferAmount());
        r.setCreatedAt(m.getCreatedAt());
        if (m.getListing() != null) {
            r.setListingId(m.getListing().getId());
        }
        return r;
    }
}