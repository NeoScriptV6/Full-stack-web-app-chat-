package com.matchme.matchme.controllers;

import com.matchme.matchme.services.UserService;
import com.matchme.matchme.entities.User;
import org.springframework.web.bind.annotation.*;
import com.matchme.matchme.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.name(), request.email(), request.password());
            return new UserResponse(user.getId(), user.getName(), user.getEmail());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userService.authenticate(request.email(), request.password());

        String token = JwtUtil.generateToken(user.getEmail());
        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail());
    }

    public record RegisterRequest(String name, String email, String password) {}

    public record UserResponse(String id, String name, String email) {}

    public record LoginRequest(String email, String password) {}
    public record LoginResponse(String token, String id, String name, String email) {}
}
