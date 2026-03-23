package com.pctrade.pctrade_backend.controller;

import com.pctrade.pctrade_backend.dto.MessageRequestDto;
import com.pctrade.pctrade_backend.dto.MessageResponseDto;
import com.pctrade.pctrade_backend.model.Listing;
import com.pctrade.pctrade_backend.model.Message;
import com.pctrade.pctrade_backend.model.User;
import com.pctrade.pctrade_backend.repository.ListingRepository;
import com.pctrade.pctrade_backend.repository.MessageRepository;
import com.pctrade.pctrade_backend.repository.UserRepository;
import com.pctrade.pctrade_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final NotificationService notificationService;

    @PostMapping
    public MessageResponseDto sendMessage(@RequestBody MessageRequestDto request) {
        User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Expeditorul nu a fost găsit!"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Destinatarul nu a fost găsit!"));

        Listing listing = listingRepository.findById(request.getListingId())
                .orElseThrow(() -> new RuntimeException("Anunțul nu a fost găsit!"));

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .listing(listing)
                .content(request.getContent())
                .messageType(request.getMessageType() != null ? request.getMessageType() : "text")
                .offeredPrice(request.getOfferedPrice())
                .offerStatus(request.getMessageType() != null && request.getMessageType().equals("price_offer") ? "pending" : null)
                .build();

        Message savedMessage = messageRepository.save(message);

        if (request.getMessageType() != null && request.getMessageType().equals("price_offer")) {
            notificationService.createNotification(
                    receiver,
                    "price_offer",
                    sender.getUsername() + " ți-a făcut o ofertă de " + request.getOfferedPrice() + " RON pentru " + listing.getTitle(),
                    "/messages?listingId=" + listing.getId() + "&sellerId=" + sender.getId()
            );
        } else {
            notificationService.createNotification(
                    receiver,
                    "new_message",
                    sender.getUsername() + " ți-a trimis un mesaj despre " + listing.getTitle(),
                    "/messages?listingId=" + listing.getId() + "&sellerId=" + sender.getId()
            );
        }

        return mapToDto(savedMessage);
    }

    @GetMapping("/conversations/{userId}")
    public List<Map<String, Object>> getConversations(@PathVariable Long userId) {
        List<Message> allMessages = messageRepository.findConversationsByUserId(userId);

        Map<String, Map<String, Object>> conversationsMap = new LinkedHashMap<>();

        for (Message msg : allMessages) {
            Long otherUserId = msg.getSender().getId().equals(userId)
                    ? msg.getReceiver().getId()
                    : msg.getSender().getId();

            String key = msg.getListing().getId() + "_" + otherUserId;

            if (!conversationsMap.containsKey(key)) {
                Map<String, Object> conv = new HashMap<>();
                Map<String, Object> otherUser = new HashMap<>();
                User other = msg.getSender().getId().equals(userId)
                        ? msg.getReceiver()
                        : msg.getSender();

                otherUser.put("id", other.getId());
                otherUser.put("username", other.getUsername());

                Map<String, Object> listing = new HashMap<>();
                listing.put("id", msg.getListing().getId());
                listing.put("title", msg.getListing().getTitle());
                listing.put("price", msg.getListing().getPrice());

                conv.put("key", key);
                conv.put("otherUser", otherUser);
                conv.put("listing", listing);
                conv.put("lastMessage", msg.getContent());
                conv.put("lastMessageTime", msg.getCreatedAt());
                conv.put("listingId", msg.getListing().getId());
                conv.put("otherUserId", other.getId());

                conversationsMap.put(key, conv);
            } else {
                conversationsMap.get(key).put("lastMessage", msg.getContent());
                conversationsMap.get(key).put("lastMessageTime", msg.getCreatedAt());
            }
        }

        return new ArrayList<>(conversationsMap.values());
    }

    @PatchMapping("/{messageId}/offer")
    public MessageResponseDto respondToOffer(
            @PathVariable Long messageId,
            @RequestParam String action) {

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Mesajul nu a fost găsit!"));

        if (action.equals("accept")) {
            message.setOfferStatus("accepted");
        } else {
            message.setOfferStatus("rejected");
        }

        Message savedMessage = messageRepository.save(message);

        notificationService.createNotification(
                message.getSender(),
                action.equals("accept") ? "offer_accepted" : "offer_rejected",
                "Oferta ta de " + message.getOfferedPrice() + " RON a fost " +
                        (action.equals("accept") ? "acceptată" : "respinsă"),
                "/messages?listingId=" + message.getListing().getId() + "&sellerId=" + message.getReceiver().getId()
        );

        return mapToDto(savedMessage);
    }

    @GetMapping("/conversation")
    public List<MessageResponseDto> getConversation(
            @RequestParam Long listingId,
            @RequestParam Long user1Id,
            @RequestParam Long user2Id) {

        List<Message> messages = messageRepository.findConversation(listingId, user1Id, user2Id);

        return messages.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private MessageResponseDto mapToDto(Message message) {
        return MessageResponseDto.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getUsername())
                .content(message.getContent())
                .messageType(message.getMessageType() != null ? message.getMessageType() : "text")
                .offeredPrice(message.getOfferedPrice())
                .offerStatus(message.getOfferStatus())
                .createdAt(message.getCreatedAt())
                .build();
    }
}