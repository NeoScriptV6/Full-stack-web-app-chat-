package com.matchme.matchme.DTO;

public class UserProfileDTO {
    private String aboutMe;
    private String id;
    public UserProfileDTO() {}
    public UserProfileDTO(String aboutMe, String id) {
         this.aboutMe = aboutMe;
         this.id = id;
    }

    public String getAboutMe() { return aboutMe; }
    public void setAboutMe(String aboutMe) { this.aboutMe = aboutMe; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
}