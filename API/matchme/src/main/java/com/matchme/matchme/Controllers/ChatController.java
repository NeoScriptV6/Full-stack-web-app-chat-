package com.matchme.matchme.controllers;

import com.matchme.matchme.DTO.ChatDTO;
import com.matchme.matchme.DTO.ChatMessageDTO;
import com.matchme.matchme.DTO.MessageDTO; // WHY 2 DTOS.....
import com.matchme.matchme.entities.Chat;
import com.matchme.matchme.entities.Message;
import com.matchme.matchme.entities.User;
import com.matchme.matchme.services.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // WebSocket STOMP handler
    @MessageMapping("/chats/send")
    public void handleWebSocketMessage(@Payload ChatMessageDTO messageDTO) {
        if (messageDTO.getChatId() == null || messageDTO.getChatId().isEmpty()) {
            throw new IllegalArgumentException("chatId is required and cannot be empty");
        }
        Long chatId = Long.parseLong(messageDTO.getChatId());
        String senderId = messageDTO.getSenderId();
        String content = messageDTO.getContent();


        Message savedMessage = chatService.sendMessage(chatId, senderId, content );

      
        MessageDTO responseDto = new MessageDTO(savedMessage);

        messagingTemplate.convertAndSend("/topic/chat/" + chatId, responseDto);
    }


    @PostMapping("/create")
    public Chat createChat(@RequestBody Map<String, List<String>> body) {
        List<String> userIds = body.get("userIds");
        return chatService.createChat(userIds);
    }

    @GetMapping("/user/{userId}")
    public List<ChatDTO> getChats(@PathVariable String userId) {
        List<Chat> chats = chatService.getChatsForUser(userId);
        return chats.stream()
                    .map(ChatDTO::new)
                    .collect(Collectors.toList());
    }
    @GetMapping("/{chatId}/messages")
    public Page<MessageDTO> getMessages(
        @PathVariable String chatId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Page<Message> messagePage = chatService.getMessagesPage(Long.parseLong(chatId), page, size);
        return new PageImpl<>(
            messagePage.getContent().stream().map(MessageDTO::new).collect(Collectors.toList()),
            PageRequest.of(page, size),
            messagePage.getTotalElements()
        );
    }

    @GetMapping("/{chatId}/lastMessage")
    public Message getLastMessage(@PathVariable String chatId) {
        // User user = userRepository.findById(id).orElse(null);
        // if (!isOwner(authentication, user)) return ResponseEntity.status(403).build();

        return chatService.getLastMessage(Long.parseLong(chatId));

    }
    // FALLBACK TO HTTPS (NONSTOMP)
    @PostMapping("/{chatId}/send")
    public Message sendMessage(@PathVariable String chatId, @RequestBody Map<String, String> body) {
        if (chatId == null || chatId.isEmpty()) {
            throw new IllegalArgumentException("chatId is required and cannot be empty");
        }
        Long chatIdLong = Long.parseLong(chatId);
        String senderId = body.get("senderId");
        String content = body.get("content");

        Message message = chatService.sendMessage(chatIdLong, senderId, content);
        messagingTemplate.convertAndSend("/topic/chat/" + message.getChat().getId().toString(), new MessageDTO(message));

        return message;
    }

    @PutMapping("/messages/{messageId}/read")
        public ResponseEntity<Void> markMessageAsRead(@PathVariable Long messageId) {
    

        Message message = chatService.markMessageAsRead(messageId);
        messagingTemplate.convertAndSend("/topic/chat/" + message.getChat().getId().toString(), new MessageDTO(message));
        return ResponseEntity.ok().build();
    }
}
