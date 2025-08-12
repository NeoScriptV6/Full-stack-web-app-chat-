package com.matchme.matchme.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Column;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "app_user")
public class User {
    enum BioDataType{
        REGION,
        FAVORITE_GAMES,
        FAVORITE_GENRES,
        PLATFORMS,
        AVALABILITY,
        GAMES_LOOKING_FOR_PARTNER, 
        OTHER_KEYWORDS
    }

    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private String profilePictureUrl;
    private String aboutMe; 
    private String region;

    @ElementCollection
    private List<String> favoriteGames;

    @ElementCollection
    private List<String> favoriteGenres;

    @ElementCollection
    private List<String> platforms;

    @ElementCollection
    private List<String> availability;

    @ElementCollection
    private List<String> gamesLookingForPartner;

    @ElementCollection
    private List<String> otherKeywords;

    
    private List<String> friends = new ArrayList<>();   


    @Column(nullable = false)
    private boolean searchEnabled = true; 
    
    public User() {}

    public User(String id, String name, String email, String password, String profilePictureUrl, 
                String aboutMe, String region, List<String> favoriteGames, List<String> favoriteGenres, 
                List<String> platforms, List<String> availability, List<String> gamesLookingForPartner, 
                List<String> otherKeywords, List<String> friends, boolean searchEnabled) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.profilePictureUrl = profilePictureUrl;
        this.aboutMe = aboutMe;
        this.region = region;
        this.favoriteGames = favoriteGames;
        this.favoriteGenres = favoriteGenres;
        this.platforms = platforms;
        this.availability = availability;
        this.gamesLookingForPartner = gamesLookingForPartner;
        this.otherKeywords = otherKeywords;
        this.friends = friends;
        this.searchEnabled = searchEnabled;
    }

    public List<String> getFriends() {
        return friends;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }
    public String getPassword() {
        return password;
    }

    public String getProfilePictureUrl() { 
       return profilePictureUrl;
    }

    public String getAboutMe() {
        return aboutMe;
    }

    public String getRegion() {
        return region;
    }

    public List<String> getFavoriteGames() {
        return favoriteGames;
    }

    public List<String> getFavoriteGenres() {
        return favoriteGenres;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public List<String> getAvailability() {
        return availability;
    }

    public List<String> getGamesLookingForPartner() {
        return gamesLookingForPartner;
    }

    public List<String> getOtherKeywords() {
        return otherKeywords;
    }

    public boolean isSearchEnabled() {
        return searchEnabled;
    }



    public void setFriends(List<String> friends) {
        this.friends = friends;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public void setAboutMe(String aboutMe) {
        this.aboutMe = aboutMe;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public void setFavoriteGames(List<String> favoriteGames) {
        this.favoriteGames = favoriteGames;
    }

    public void setFavoriteGenres(List<String> favoriteGenres) {
        this.favoriteGenres = favoriteGenres;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public void setAvailability(List<String> availability) {
        this.availability = availability;
    }

    public void setGamesLookingForPartner(List<String> gamesLookingForPartner) {
        this.gamesLookingForPartner = gamesLookingForPartner;
    }

    public void setOtherKeywords(List<String> otherKeywords) {
        this.otherKeywords = otherKeywords;
    }

    
    public void setSearchEnabled(boolean searchEnabled) {
        this.searchEnabled = searchEnabled;
    }

}