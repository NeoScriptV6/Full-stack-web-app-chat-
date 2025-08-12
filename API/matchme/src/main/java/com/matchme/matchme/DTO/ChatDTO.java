package com.matchme.matchme.DTO;

import java.util.stream.Collectors;
import java.util.List;
import com.matchme.matchme.entities.Chat;
import com.matchme.matchme.entities.User;

public class ChatDTO {
    private Long id;
    private List<String> userIds;

    public ChatDTO(Chat chat) {
        this.id = chat.getId();
        this.userIds = chat.getUsers().stream()
                            .map(User::getId)
                            .collect(Collectors.toList());
    }

    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public List<String> getUserIds() {
        return userIds;
    }
    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }

}
