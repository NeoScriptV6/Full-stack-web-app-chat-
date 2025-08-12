package com.matchme.matchme.controllers;

import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.UserRepository;
import com.matchme.matchme.services.ConnectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.matchme.matchme.DTO.UserBasicDTO;
import com.matchme.matchme.DTO.UserProfileDTO;
import com.matchme.matchme.DTO.UserBioDTO;
import com.matchme.matchme.DTO.PublicProfileDTO;
import java.util.List;
import java.util.Map;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import java.net.MalformedURLException;
import java.util.UUID;
import java.lang.String;

@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ConnectionService connectionService;

    // This function makis it so only allow access if the authenticated user matches the requested id

    private boolean isOwner(Authentication auth, User user) {
        return user != null && auth != null && user.getEmail().equals(auth.getName());
    }

   
    @GetMapping("/users")
    private boolean canViewProfile(Authentication auth, User targetUser) {
        if (auth == null || targetUser == null) return false;
        String requesterId = auth.getName();
        if (targetUser.getEmail().equals(requesterId)) return true; // owner
        User requester = userRepository.findByEmail(requesterId);
        if (requester == null) return false;

        return connectionService.areConnected(requester, targetUser) ||
               connectionService.hasPendingRequest(requester, targetUser) ||
               connectionService.hasPendingRequest(targetUser, requester);
    }

    @GetMapping("/me")
    public ResponseEntity<UserBasicDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(404).build();
        User user = userRepository.findByEmail(authentication.getName());
        if (user == null) return ResponseEntity.status(404).build();
        return ResponseEntity.ok(new UserBasicDTO(user.getName(), user.getProfilePictureUrl(), user.getId()));
    }
    @GetMapping("/me/profile")
    public ResponseEntity<UserProfileDTO> getCurrentUserProfile(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(404).build();
        User user = userRepository.findByEmail(authentication.getName());
        if (user == null) return ResponseEntity.status(404).build();
        UserProfileDTO dto = new UserProfileDTO();
        dto.setAboutMe(user.getAboutMe());
        dto.setId(user.getId());
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/me/bio")
    public ResponseEntity<UserBioDTO> getCurrentUserBio(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(404).build();
        User user = userRepository.findByEmail(authentication.getName());
        if (user == null) return ResponseEntity.status(404).build();
        UserBioDTO dto = new UserBioDTO();
        dto.setRegion(user.getRegion());
        dto.setFavoriteGames(user.getFavoriteGames());
        dto.setFavoriteGenres(user.getFavoriteGenres());
        dto.setPlatforms(user.getPlatforms());
        dto.setAvailability(user.getAvailability());
        dto.setGamesLookingForPartner(user.getGamesLookingForPartner());  
        dto.setOtherKeywords(user.getOtherKeywords());
        dto.setId(user.getId());
        return ResponseEntity.ok(dto);
    }  

    @GetMapping("/users/{id}")
    public ResponseEntity<UserBasicDTO> getUserBasic(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();

        return ResponseEntity.ok(new UserBasicDTO(user.getName(), user.getProfilePictureUrl(), user.getId()));
    }


    @GetMapping("/users/{id}/profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();
        UserProfileDTO dto = new UserProfileDTO();
        dto.setAboutMe(user.getAboutMe());
        dto.setId(user.getId());
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/users/{id}/profile-picture")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable String id) {
        try {
            Path filePath = Paths.get(userRepository.findById(id).orElse(null).getProfilePictureUrl());

            
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG) 
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {         
            return ResponseEntity.notFound().build();                  
        }
    }


    @GetMapping("/users/{id}/profile-completed")
    public ResponseEntity<Boolean> isProfileCompleted(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();
        boolean isCompleted = user.getRegion() != null && !user.getRegion().isEmpty() &&
                              !user.getFavoriteGames().isEmpty() &&
                              !user.getFavoriteGenres().isEmpty() &&
                              !user.getPlatforms().isEmpty() &&
                              !user.getAvailability().isEmpty();
        return ResponseEntity.ok(isCompleted);


    }


    @GetMapping("/users/{id}/bio")
    public ResponseEntity<UserBioDTO> getUserBio(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();
        UserBioDTO dto = new UserBioDTO();
        dto.setRegion(user.getRegion());
        dto.setFavoriteGames(user.getFavoriteGames());
        dto.setFavoriteGenres(user.getFavoriteGenres());
        dto.setPlatforms(user.getPlatforms());
        dto.setAvailability(user.getAvailability());
        dto.setGamesLookingForPartner(user.getGamesLookingForPartner());
        dto.setOtherKeywords(user.getOtherKeywords());
        dto.setId(user.getId());
        return ResponseEntity.ok(dto);
    }

    // An extra feature that allows some users to search one another


    @PutMapping("/users/{id}/profile")
    public ResponseEntity<?> updateAboutMe(@PathVariable String id, @RequestBody UserProfileDTO dto, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();
        user.setAboutMe(dto.getAboutMe());
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/bio")
    public ResponseEntity<?> updateBio(@PathVariable String id, @RequestBody UserBioDTO dto, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();
        user.setRegion(dto.getRegion());
        user.setFavoriteGames(dto.getFavoriteGames());
        user.setFavoriteGenres(dto.getFavoriteGenres());
        user.setPlatforms(dto.getPlatforms());
        user.setAvailability(dto.getAvailability());
        user.setGamesLookingForPartner(dto.getGamesLookingForPartner());
        user.setOtherKeywords(dto.getOtherKeywords());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/bio/{field}")
    public ResponseEntity<?> updateBioField(@PathVariable String id, @PathVariable String field, @RequestBody List<String> value, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();
        switch (field) {
            case "favoriteGames" -> user.setFavoriteGames(value);
            case "favoriteGenres" -> user.setFavoriteGenres(value);
            case "platforms" -> user.setPlatforms(value);
            case "availability" -> user.setAvailability(value);
            case "gamesLookingForPartner" -> user.setGamesLookingForPartner(value);
            case "otherKeywords" -> user.setOtherKeywords(value);
            case "region" -> user.setRegion(value.isEmpty() ? null : value.get(0));
            default -> { return ResponseEntity.badRequest().build(); }
        }
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/users/{id}/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable String id, @RequestParam("profilePicture") MultipartFile file, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();


        String directory = "uploads/profile-pictures/";
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(directory, fileName);

        try {
            Files.createDirectories(filePath.getParent());
            Files.write(filePath, file.getBytes());

            user.setProfilePictureUrl(filePath.toString());
            userRepository.save(user);

            return ResponseEntity.ok().body(Map.of("profilePictureUrl", filePath.toString()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to save file");
        }
    }

    @PutMapping("/users/{id}/remove-profile-picture")
    public ResponseEntity<?> removeProfilePicture(@PathVariable String id, Authentication authentication) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        if (!isOwner(authentication, user)) return ResponseEntity.status(404).build();

        try {
     
            String profilePicturePath = user.getProfilePictureUrl();
            if (profilePicturePath != null && !profilePicturePath.isEmpty()) {
                Path filePath = Paths.get(profilePicturePath);
                Files.deleteIfExists(filePath); 
            }

   
            user.setProfilePictureUrl(null);
            userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Profile picture removed successfully"));
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to remove profile picture");
        }
    }

    @GetMapping("/users/{id}/public-profile")
    public ResponseEntity<PublicProfileDTO> getPublicProfile(@PathVariable String id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.status(404).build();
        PublicProfileDTO dto = new PublicProfileDTO(
            user.getName(),
            user.getProfilePictureUrl(),
            user.getAboutMe(),
            user.getRegion(),
            user.getFavoriteGames(),
            user.getFavoriteGenres(),
            user.getPlatforms(),
            user.getAvailability(),
            user.getGamesLookingForPartner(),
            user.getOtherKeywords()
        );
        return ResponseEntity.ok(dto);
    }
}