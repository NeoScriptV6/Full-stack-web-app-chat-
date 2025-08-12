package com.matchme.matchme.services;

import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.ConnectionRepository;
import com.matchme.matchme.repositories.DismissedRecommendationRepository;
import com.matchme.matchme.repositories.UserRepository;
import com.matchme.matchme.entities.DismissedRecommendation;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    private final UserRepository userRepository;
    private final DismissedRecommendationRepository dismissedRepo;
    private final ConnectionRepository connectionRepository;

    public RecommendationService(
            UserRepository userRepository,
            DismissedRecommendationRepository dismissedRepo,
            ConnectionRepository connectionRepository
    ) {
        this.userRepository = userRepository;
        this.dismissedRepo = dismissedRepo;
        this.connectionRepository = connectionRepository;
    }

    public List<String> getRecommendations(User currentUser) {
        // Skip if profile is not complete
        if (!isProfileComplete(currentUser)) {
            return Collections.emptyList();
        }

        List<User> dismissed = dismissedRepo.findByUser(currentUser)
                .stream().map(DismissedRecommendation::getDismissedUser).collect(Collectors.toList());

        // Get all potential candidates
        List<User> candidates = userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .filter(u -> u.getRegion() != null && u.getRegion().equals(currentUser.getRegion()))
                .filter(u -> !dismissed.contains(u))
                .filter(this::isProfileComplete)
                .filter(u -> !connectionRepository.existsByUsersAndNotDeclined(currentUser, u))
                .collect(Collectors.toList());

        // Score each candidate and create a sorted list
        List<Map.Entry<User, Integer>> scoredCandidates = candidates.stream()
                .map(candidate -> {
                    int score = score(currentUser, candidate);
                    return new AbstractMap.SimpleEntry<>(candidate, score);
                })
                .filter(entry -> entry.getValue() >= 10)
                .sorted(Map.Entry.<User, Integer>comparingByValue().reversed())
                .collect(Collectors.toList());

        // Return top 10 recommendations
        return scoredCandidates.stream()
                .limit(10)
                .map(entry -> entry.getKey().getId())
                .collect(Collectors.toList());
    }

    private int score(User currentUser, User candidate) {
        int points = 0;
        
        // 1. Shared favorite games (highest weight - direct match on specific games)
        if (currentUser.getFavoriteGames() != null && candidate.getFavoriteGames() != null) {
            Set<String> games = new HashSet<>(currentUser.getFavoriteGames());
            games.retainAll(candidate.getFavoriteGames());
            points += games.size() * 10; // 10 points per shared game
            
            // Bonus if they're looking for partners for the same games
            if (currentUser.getGamesLookingForPartner() != null && candidate.getGamesLookingForPartner() != null) {
                Set<String> lookingGames = new HashSet<>(currentUser.getGamesLookingForPartner());
                lookingGames.retainAll(candidate.getGamesLookingForPartner());
                lookingGames.retainAll(games); // Games they both like AND are looking for partners
                points += lookingGames.size() * 15; // Extra 15 points for matching "looking for partner" games
            }
        }
        
        // 2. Shared favorite genres
        if (currentUser.getFavoriteGenres() != null && candidate.getFavoriteGenres() != null) {
            Set<String> genres = new HashSet<>(currentUser.getFavoriteGenres());
            genres.retainAll(candidate.getFavoriteGenres());
            points += genres.size() * 5; // 5 points per shared genre
        }
        
        // 3. Shared platforms - essential for playing together
        if (currentUser.getPlatforms() != null && candidate.getPlatforms() != null) {
            Set<String> platforms = new HashSet<>(currentUser.getPlatforms());
            platforms.retainAll(candidate.getPlatforms());
            points += platforms.size() * 8; // 8 points per shared platform
            
            // If they have no shared platforms, significant penalty
            if (platforms.isEmpty()) {
                points -= 15; // Cannot play together without shared platforms
            }
        }
        
        // 4. Availability match - essential for actually connecting
        if (currentUser.getAvailability() != null && candidate.getAvailability() != null) {
            Set<String> availability = new HashSet<>(currentUser.getAvailability());
            availability.retainAll(candidate.getAvailability());
            points += availability.size() * 7; // 7 points per shared availability slot
            
            // If they have no shared availability, significant penalty
            if (availability.isEmpty()) {
                points -= 20; // Cannot play together without shared time
            }
        }
        
        // 5. Shared keywords/interests
        if (currentUser.getOtherKeywords() != null && candidate.getOtherKeywords() != null) {
            Set<String> keywords = new HashSet<>(currentUser.getOtherKeywords());
            keywords.retainAll(candidate.getOtherKeywords());
            points += keywords.size() * 3; // 3 points per shared keyword
        }
        
        return Math.max(0, points); // Ensure we don't return negative scores
    }

    private boolean isProfileComplete(User user) {
        return  user.getRegion() != null && !user.getRegion().isEmpty()
            && user.getFavoriteGames() != null && !user.getFavoriteGames().isEmpty()
            && user.getFavoriteGenres() != null && !user.getFavoriteGenres().isEmpty()
            && user.getPlatforms() != null && !user.getPlatforms().isEmpty()
            && user.getAvailability() != null && !user.getAvailability().isEmpty();
    }
}