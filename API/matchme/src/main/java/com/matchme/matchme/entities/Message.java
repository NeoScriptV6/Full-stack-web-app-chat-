package com.matchme.matchme.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;
@Entity
@Table(name = "message")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonBackReference
    private Chat chat;

    private String senderId;

    private String content;

    private LocalDateTime timestamp = LocalDateTime.now();
    private boolean read = false;


    public Message() {}

    public Message(Chat chat, String senderId, String content, boolean read) {
        this.chat = chat;
        this.senderId = senderId;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.read = read;
       
    }

    public Long getId() { return id; }
    public Chat getChat() { return chat; }
    public void setChat(Chat chat) { this.chat = chat; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }

    public LocalDateTime getDateTime() { return timestamp; }
    public void getDateTime(LocalDateTime timestamp) { this.timestamp = timestamp; }
}