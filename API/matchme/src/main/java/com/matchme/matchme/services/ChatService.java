package com.matchme.matchme.services;

import com.matchme.matchme.entities.Chat;
import com.matchme.matchme.entities.Message;
import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.ChatRepository;
import com.matchme.matchme.repositories.MessageRepository;
import com.matchme.matchme.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(ChatRepository chatRepository, MessageRepository messageRepository, UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public Chat createChat(List<String> userIds) {
        List<User> users = userRepository.findAllById(userIds);
        Chat chat = new Chat(users);
        return chatRepository.save(chat);
    }

    public List<Chat> getChatsForUser(String userId) {
        return chatRepository.findByUsers_IdOrderByLastMessageTimestampDesc(userId);
    }

    public Page<Message> getMessagesPage(Long chatId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        return messageRepository.findByChat_Id(chatId, pageable);
    }

    public Message getLastMessage(Long chatId) {
        return messageRepository.findTopByChat_IdOrderByTimestampDesc(chatId);
    }

    public Message sendMessage(Long chatId, String senderId, String content) {
        Chat chat = chatRepository.findById(chatId).orElseThrow();
        Message message = new Message(chat, senderId, content, false);
        return messageRepository.save(message);
    }

    public Message markMessageAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        return messageRepository.save(message);
    }
}
