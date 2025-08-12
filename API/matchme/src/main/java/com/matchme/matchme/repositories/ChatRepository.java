package com.matchme.matchme.repositories;

import com.matchme.matchme.entities.Chat;
import com.matchme.matchme.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByUsers_Id(String userId);
    
    @Query("SELECT c FROM Chat c LEFT JOIN c.messages m JOIN c.users u WHERE u.id = :userId GROUP BY c.id ORDER BY MAX(m.timestamp) DESC NULLS LAST")
    List<Chat> findByUsers_IdOrderByLastMessageTimestampDesc(@Param("userId") String userId);
}
