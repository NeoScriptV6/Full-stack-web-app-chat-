package com.matchme.matchme.repositories;

import com.matchme.matchme.entities.Message;
import com.matchme.matchme.entities.Chat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChat_IdOrderByTimestampAsc(Long chatId);
    Message findTopByChat_IdOrderByTimestampDesc(Long chatId);
    Page<Message> findByChat_Id(Long chatId, Pageable pageable);
}