package com.matchme.matchme.DTO;

public class ChatMessageDTO {
    private String chatId;
    private String content;
    private String senderId;
    // private String dateTime;
    private MessageType type; // not being used

    public enum MessageType {
        fromBlue, fromRed
    }

    public ChatMessageDTO() {}

    public ChatMessageDTO(String content, String senderId, MessageType type) {
        this.content = content;
        this.senderId = senderId;
        this.type = type;
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

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getChatId() {
        return chatId;
    }

    public void setChatId(String chatId) {
        this.chatId = chatId;
    }
    
    // public String getDateTime() {
    //     return dateTime;
    // }
    // public void setDateTime(String dateTime) {
    //     this.dateTime = dateTime;
    // }
}
