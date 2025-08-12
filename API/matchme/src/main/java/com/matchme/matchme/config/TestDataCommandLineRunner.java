/* package com.matchme.matchme.config;

import com.matchme.matchme.services.TestDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.generate-test-data", havingValue = "true")
public class TestDataCommandLineRunner implements CommandLineRunner {

    private final TestDataService testDataService;

    @Autowired
    public TestDataCommandLineRunner(TestDataService testDataService) {
        this.testDataService = testDataService;
    }

    @Override
    public void run(String... args) {
        System.out.println("Generating test data...");
        int count = testDataService.generateUsers(100);
        System.out.println("Created " + count + " test users");
    }
}

*/