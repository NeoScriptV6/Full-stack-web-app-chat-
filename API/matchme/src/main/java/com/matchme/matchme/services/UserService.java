package com.matchme.matchme.services;

import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Autowired
    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public User registerUser(String name, String email, String rawPassword) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }

        if (userRepository.existsByName(name)) {
            throw new IllegalArgumentException("Username already in use");
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        User user = new User(
            java.util.UUID.randomUUID().toString(),
            name,
            email,
            hashedPassword,
            null, // profilePictureUrl
            null, // aboutMe
            null, // region
            new ArrayList<>(), // favoriteGames
            new ArrayList<>(), // favoriteGenres
            new ArrayList<>(), // platforms
            new ArrayList<>(), // availability
            new ArrayList<>(), // gamesLookingForPartner
            new ArrayList<>(),  // otherKeywords
            new ArrayList<>(), // friends
            false // searchEnabled
        );
        return userRepository.save(user);
    }

    public User authenticate(String email, String rawPassword) {
        User user = userRepository.findByEmail(email);
        System.out.println("Login attempt for: " + email);
        if (user == null) {
            System.out.println("User not found");
            throw new IllegalArgumentException("Invalid email or password");
        }
        System.out.println("Stored hash: " + user.getPassword());
        System.out.println("Raw password: " + rawPassword);
        System.out.println("Password matches: " + passwordEncoder.matches(rawPassword, user.getPassword()));
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return user;
    }
}