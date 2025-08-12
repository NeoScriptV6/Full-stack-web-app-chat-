package com.matchme.matchme.repositories;

import com.matchme.matchme.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.ArrayList;
import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByEmail(String email);
    boolean existsByName(String name);
    User findByEmail(String email);
   
    List<User> findBySearchEnabledTrue();
}
