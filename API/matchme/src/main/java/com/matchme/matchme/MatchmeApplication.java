package com.matchme.matchme;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.SQLException;

@SpringBootApplication
public class MatchmeApplication {
    
    @Autowired
    private DataSource dataSource;
    
    @PostConstruct
    public void logDbUrl() {
        try {
            System.out.println("DATABASE CONNECTION URL: " + 
                dataSource.getConnection().getMetaData().getURL());
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        SpringApplication.run(MatchmeApplication.class, args);
    }
}