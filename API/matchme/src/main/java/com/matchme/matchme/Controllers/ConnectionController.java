package com.matchme.matchme.controllers;

import com.matchme.matchme.entities.Connection;
import com.matchme.matchme.entities.DismissedRecommendation;
import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.DismissedRecommendationRepository;
import com.matchme.matchme.repositories.UserRepository;
import com.matchme.matchme.services.ConnectionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/connections")
public class ConnectionController {
    private final ConnectionService connectionService;
    private final UserRepository userRepository;
    private final DismissedRecommendationRepository dismissedRecommendationRepository;

    public ConnectionController(ConnectionService connectionService, UserRepository userRepository, DismissedRecommendationRepository dismissedRecommendationRepository) {
        this.connectionService = connectionService;
        this.userRepository = userRepository;
        this.dismissedRecommendationRepository = dismissedRecommendationRepository;
    }

    // Send a connection request
    @PostMapping("/request/{recipientId}")
    public Map<String, Object> sendRequest(@PathVariable String recipientId, Authentication authentication) {
        String email = authentication.getName();
        User requester = userRepository.findByEmail(email);
        if (requester == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found: " + email);
        }
        Connection connection = connectionService.sendRequest(requester.getId(), recipientId);
        return Map.of("connectionId", connection.getId(), "status", connection.getStatus());
    }

    // Accept or reject a connection request
    @PostMapping("/respond/{connectionId}")
    public Map<String, Object> respondToRequest(@PathVariable Long connectionId, @RequestParam boolean accept) {
        Connection connection = connectionService.respondToRequest(connectionId, accept);
        return Map.of("connectionId", connection.getId(), "status", connection.getStatus());
    }

    // List all accepted connections (returns only user IDs)
    @GetMapping
    public Map<String, List<String>> getConnections(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        List<String> ids = connectionService.getUserConnections(user).stream()
                .map(c -> c.getRequester().getId().equals(user.getId()) ? c.getRecipient().getId() : c.getRequester().getId())
                .toList();
        return Map.of("connections", ids);
    }

    // List all pending requests for the authenticated user
    @GetMapping("/pending")
    public List<Map<String, Object>> getPendingRequests(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        return connectionService.getPendingRequests(user).stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("connectionId", c.getId());
                    map.put("from", c.getRequester().getId());
                    map.put("status", c.getStatus());
                    return map;
                })
                .toList();
    }

    // List all outbound (sent, pending) requests for the authenticated user
    @GetMapping("/outbound")
    public List<Map<String, Object>> getOutboundRequests(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email);
        return connectionService.getOutboundRequests(user).stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("connectionId", c.getId());
                    map.put("to", c.getRecipient().getId());
                    map.put("status", c.getStatus());
                    return map;
                })
                .toList();
    }

    // Disconnect a user
    @PostMapping("/disconnect/{userId}")
    public ResponseEntity<?> disconnectUser(@PathVariable String userId, Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User otherUser = userRepository.findById(userId).orElse(null);
        if (otherUser == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User to disconnect not found");
        }

        boolean disconnected = connectionService.disconnectUsers(currentUser, otherUser);

        if (disconnected) {
             if (!dismissedRecommendationRepository.existsByUserAndDismissedUser(currentUser, otherUser)) {
                dismissedRecommendationRepository.save(new DismissedRecommendation(null, currentUser, otherUser));
            }
            if (!dismissedRecommendationRepository.existsByUserAndDismissedUser(otherUser, currentUser)) {
                dismissedRecommendationRepository.save(new DismissedRecommendation(null, otherUser, currentUser));
            }
            return ResponseEntity.ok(Map.of("message", "Users disconnected successfully"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Users were not connected");
        }
    }
}