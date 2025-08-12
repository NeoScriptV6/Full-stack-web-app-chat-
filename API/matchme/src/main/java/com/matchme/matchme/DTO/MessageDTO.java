package com.matchme.matchme.DTO;

import com.matchme.matchme.entities.Message;

public class MessageDTO {
    private Long id;
    private String content;
    private String senderId;
    private Long chatId;
    private String dateTime;
    private boolean read;

    public MessageDTO(Message message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.senderId = message.getSenderId(); 
        this.chatId = message.getChat().getId();
        this.dateTime = message.getDateTime().toString();
        this.read = message.isRead(); 
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public String getSenderId() {
        return senderId;
    }
    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }
    public Long getChatId() {
        return chatId;
    }
    public void setChatId(Long chatId) {
        this.chatId = chatId;
    }
    public String getDateTime() {
        return dateTime;
    }
    public void setDateTime(String timestamp) {
        this.dateTime = dateTime;
    }

    public boolean isRead() {
        return read;
    }
    public void setRead(boolean read) {
        this.read = read;
    }

}