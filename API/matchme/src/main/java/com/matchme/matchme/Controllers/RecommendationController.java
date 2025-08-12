package com.matchme.matchme.controllers;

import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.UserRepository;
import com.matchme.matchme.repositories.DismissedRecommendationRepository;
import com.matchme.matchme.services.RecommendationService;
import com.matchme.matchme.entities.DismissedRecommendation;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    private final UserRepository userRepository;
    private final RecommendationService recommendationService;
    private final DismissedRecommendationRepository dismissedRepo;

    public RecommendationController(UserRepository userRepository, RecommendationService recommendationService, DismissedRecommendationRepository dismissedRepo) {
        this.userRepository = userRepository;
        this.recommendationService = recommendationService;
        this.dismissedRepo = dismissedRepo;
    }

    @GetMapping
    public Map<String, List<String>> getRecommendations(Authentication authentication) {
        if (authentication == null) {
            return Map.of("error_unauthorized", List.of(""));
        };
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        List<String> recommendations = recommendationService.getRecommendations(user);
        return Map.of("recommendations", recommendations);
    }

    @PostMapping("/dismiss/{dismissedId}")
    public void dismissRecommendation(@PathVariable String dismissedId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        User dismissedUser = userRepository.findById(dismissedId).orElseThrow();
        if (!dismissedRepo.existsByUserAndDismissedUser(user, dismissedUser)) {
            dismissedRepo.save(new DismissedRecommendation(null, user, dismissedUser));
        }
    }
}
