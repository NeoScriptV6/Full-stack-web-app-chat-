package com.matchme.matchme.services;

import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.UserRepository;
import com.matchme.matchme.repositories.ConnectionRepository;
import com.matchme.matchme.repositories.DismissedRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class TestDataService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConnectionRepository connectionRepository;
    private final DismissedRecommendationRepository dismissedRecommendationRepository;

    @Autowired
    public TestDataService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        ConnectionRepository connectionRepository,
        DismissedRecommendationRepository dismissedRecommendationRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.connectionRepository = connectionRepository;
        this.dismissedRecommendationRepository = dismissedRecommendationRepository;
    }

    // Game data for random generation
    private final List<String> regions = Arrays.asList("North America", "Europe", "Asia", "South America",
            "Australia", "Africa", "Eastern Europe", "Western Europe", "Southeast Asia", "Middle East");

    private final List<String> games = Arrays.asList("Fortnite", "League of Legends", "Counter-Strike",
            "Dota 2", "Overwatch", "Call of Duty: Warzone", "Minecraft", "Valorant", "Apex Legends",
            "Among Us", "Rocket League", "Rainbow Six Siege", "World of Warcraft", "Rust", "GTA V",
            "FIFA 23", "NBA 2K23", "Destiny 2", "Cyberpunk 2077", "Elden Ring", "Animal Crossing",
            "Stardew Valley", "Genshin Impact", "Fall Guys", "Sea of Thieves", "Phasmophobia");

    private final List<String> genres = Arrays.asList("FPS", "MOBA", "RPG", "Simulation", "Strategy",
            "Sports", "Racing", "Puzzle", "Adventure", "Platformer", "Fighting", "Survival", "Horror",
            "Battle Royale", "MMO", "Open World", "Sandbox", "Card Game", "Roguelike", "Visual Novel");

    private final List<String> platforms = Arrays.asList("PC", "PlayStation", "Xbox", "Nintendo Switch",
            "Mobile", "Steam", "Epic Games", "Origin", "Battle.net");

    private final List<String> availabilities = Arrays.asList("Weekday Mornings", "Weekday Afternoons",
            "Weekday Evenings", "Weekend Mornings", "Weekend Afternoons", "Weekend Evenings", "Late Night");

    private final List<String> keywords = Arrays.asList("Casual", "Competitive", "Friendly", "Voice Chat",
            "No Voice Chat", "Beginner", "Intermediate", "Advanced", "Chill", "Serious", "Achievement Hunter",
            "Speedrunner", "Streamer", "Content Creator", "Team Player", "Solo Player", "Coach", "Student");

    private final List<String> firstNames = Arrays.asList("Alex", "Jordan", "Taylor", "Casey", "Sam", "Riley",
            "Morgan", "Jamie", "Avery", "Quinn", "Blake", "Cameron", "Hayden", "Reese", "Finley", "Charlie",
            "Dakota", "Phoenix", "Robin", "Parker", "Max", "Drew", "Skyler", "River", "Arin", "Kai", "Ash", "Lee", "Nova");

    private final List<String> lastNames = Arrays.asList("Smith", "Johnson", "Williams", "Brown", "Jones",
            "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson",
            "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris");

    /**
     * Generates and saves a specified number of random users
     * @param count Number of users to generate (minimum 1)
     * @return Number of users actually created
     */
    @Transactional
    public int generateUsers(int count) {
        System.out.println("Starting to generate " + count + " test users...");
        int created = 0;

        for (int i = 0; i < count; i++) {
            String firstName = getRandomElement(firstNames);
            String lastName = getRandomElement(lastNames);
            String username = firstName + lastName + ThreadLocalRandom.current().nextInt(10, 1000);
            String email = UUID.randomUUID().toString() + "@example.com";

            // Skip if email already exists
            if (userRepository.existsByEmail(email)) {
                continue;
            }

            // Create a random user
            User user = new User(
                UUID.randomUUID().toString(),
                firstName + " " + lastName,
                email,
                passwordEncoder.encode("password123"),
                null, // No profile picture
                generateRandomAboutMe(),
                getRandomElement(regions),
                getRandomSublist(games, 1, 5),
                getRandomSublist(genres, 1, 4),
                getRandomSublist(platforms, 1, 3),
                getRandomSublist(availabilities, 1, 4),
                getRandomSublist(games, 0, 3), 
                getRandomSublist(keywords, 0, 5),
                new ArrayList<>(), 
                true 
            );

            try {
                userRepository.save(user);
                System.out.println("User created successfully: " + email + ", password: password123");
                created++;
                if (created % 10 == 0) {
                    System.out.println("Created " + created + " users so far");
                }
            } catch (Exception e) {
                System.err.println("Failed to create user: " + email + " - " + e.getMessage());
            }
        }

        System.out.println("Finished generating users. Created: " + created);
        return created;
    }

    /**
     * Deletes all test users (those with @example.com emails)
     * @return Number of users deleted
     */
    @Transactional
    public int deleteTestUsers() {
    List<User> testUsers = userRepository.findAll().stream()
            .filter(user -> user.getEmail().endsWith("@example.com"))
            .collect(Collectors.toList());

    // Delete connections where requester or recipient is a test user
    for (User user : testUsers) {
        connectionRepository.deleteByRequesterOrRecipient(user, user);
    }

    // Delete dismissed recommendations where user or dismissedUser is a test user
    for (User user : testUsers) {
        dismissedRecommendationRepository.deleteByUser(user);
        dismissedRecommendationRepository.deleteByDismissedUser(user);
    }


    int count = testUsers.size();
    userRepository.deleteAll(testUsers);
    return count;
}


    private <T> T getRandomElement(List<T> list) {
        return list.get(ThreadLocalRandom.current().nextInt(list.size()));
    }


    private <T> List<T> getRandomSublist(List<T> list, int minSize, int maxSize) {

        int size = ThreadLocalRandom.current().nextInt(minSize, Math.min(maxSize + 1, list.size() + 1));

        List<T> shuffled = new ArrayList<>(list);
        Collections.shuffle(shuffled);
        return shuffled.subList(0, size);
    }

    // Generate a random about me text
    private String generateRandomAboutMe() {
        List<String> aboutMeTemplates = Arrays.asList(
            "Hi there! I'm a passionate gamer looking for friends to play with. I love [GENRE] games and I'm particularly good at [GAME].",
            "Gamer by day, gamer by night. Always looking for new gaming buddies who enjoy [GENRE] games like me.",
            "I've been gaming since I was a kid. My favorite games are [GAME] and anything in the [GENRE] genre.",
            "Just here to have fun and make new gaming connections. Hit me up if you want to play [GAME] together!",
            "Competitive player looking for teammates who take gaming seriously. I mainly play [GAME].",
            "Casual gamer here! Not too concerned about winning, just want to have fun playing [GENRE] games.",
            "Streaming is my passion! I play [GAME] most days on my channel and would love to collaborate.",
            "I'm new to gaming but learning fast. Looking for patient people to play [GAME] with.",
            "Gaming is my escape. I particularly enjoy [GENRE] games that let me forget about the real world for a while."
        );

        String template = getRandomElement(aboutMeTemplates);
        String game = getRandomElement(games);
        String genre = getRandomElement(genres);

        return template.replace("[GAME]", game).replace("[GENRE]", genre);
    }
}