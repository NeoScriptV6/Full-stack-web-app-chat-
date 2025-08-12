package com.matchme.matchme.DTO;

public class UserBasicDTO {
    private String name;
    private String profilePictureUrl;
    private String id;
    // Default constructor
    public UserBasicDTO() {}

    // Constructor with fields
    public UserBasicDTO(String name, String profilePictureUrl, String id) {
        this.name = name;
        this.profilePictureUrl = profilePictureUrl;
        this.id = id;
    }


    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getId(){
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}