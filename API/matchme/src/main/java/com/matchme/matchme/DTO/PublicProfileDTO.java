package com.matchme.matchme.DTO;

import java.util.List;

public record PublicProfileDTO(
    String name,
    String profilePictureUrl,
    String aboutMe,
    String region,
    List<String> favoriteGames,
    List<String> favoriteGenres,
    List<String> platforms,
    List<String> availability,
    List<String> gamesLookingForPartner,
    List<String> otherKeywords
) {}
