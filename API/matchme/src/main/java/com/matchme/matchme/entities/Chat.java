package com.matchme.matchme.entities;

import jakarta.persistence.*;
import java.util.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
@Entity
@Table(name = "chat")
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany
    @JsonIgnore
    @JoinTable(
        name = "chat_users",
        joinColumns = @JoinColumn(name = "chat_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Message> messages = new ArrayList<>();

    //Later:  createdAt, etc.

    public Chat() {}

    public Chat(List<User> users) {
        this.users = users;
    }

    public Long getId() { return id; }
    public List<User> getUsers() { return users; }
    public void setUsers(List<User> users) { this.users = users; }
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
}