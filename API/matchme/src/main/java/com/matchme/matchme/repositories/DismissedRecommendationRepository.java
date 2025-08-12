package com.matchme.matchme.repositories;

import com.matchme.matchme.entities.DismissedRecommendation;
import com.matchme.matchme.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DismissedRecommendationRepository extends JpaRepository<DismissedRecommendation, Long> {
    List<DismissedRecommendation> findByUser(User user);
    boolean existsByUserAndDismissedUser(User user, User dismissedUser);
    void deleteByUser(User user);
    void deleteByDismissedUser(User dismissedUser);
}
