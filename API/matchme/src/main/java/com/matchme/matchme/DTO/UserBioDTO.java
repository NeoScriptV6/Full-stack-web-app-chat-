package com.matchme.matchme.DTO;


import java.util.List;

public class UserBioDTO {
    private String region;
    private List<String> favoriteGames;
    private List<String> favoriteGenres;
    private List<String> platforms;
    private List<String> availability;
    private List<String> gamesLookingForPartner;
    private List<String> otherKeywords;
    private String id;
  

    public UserBioDTO() {}
    public UserBioDTO(String region, List<String> favoriteGames, List<String> favoriteGenres, List<String> platforms, List<String> availability, List<String> gamesLookingForPartner, String id) {
        this.region = region;
        this.favoriteGames = favoriteGames;
        this.favoriteGenres = favoriteGenres;
        this.platforms = platforms;
        this.availability = availability;
        this.gamesLookingForPartner = gamesLookingForPartner;
        this.id = id;
    }
    public void setOtherKeywords(List<String> otherKeywords) {
        this.otherKeywords = otherKeywords;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public List<String> getFavoriteGames() {
        return favoriteGames;
    }

    public void setFavoriteGames(List<String> favoriteGames) {
        this.favoriteGames = favoriteGames;
    }

    public List<String> getFavoriteGenres() {
        return favoriteGenres;
    }

    public void setFavoriteGenres(List<String> favoriteGenres) {
        this.favoriteGenres = favoriteGenres;
    }


    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public List<String> getAvailability() {
        return availability;
    }

    public void setAvailability(List<String> availability) {
        this.availability = availability;
    }

    public List<String> getGamesLookingForPartner() {
        return gamesLookingForPartner;
    }

    public void setGamesLookingForPartner(List<String> gamesLookingForPartner) {
        this.gamesLookingForPartner = gamesLookingForPartner;
    }

    public List<String> getOtherKeywords() {
        return otherKeywords;
    }

    public String getId(){
        return id;
    }

    public void setId(String id){
        this.id = id;
    }
}