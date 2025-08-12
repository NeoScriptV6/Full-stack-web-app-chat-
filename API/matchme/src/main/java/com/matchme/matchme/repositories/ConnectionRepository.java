package com.matchme.matchme.repositories;

import com.matchme.matchme.entities.Connection;
import com.matchme.matchme.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    List<Connection> findByRequesterOrRecipient(User requester, User recipient);
    List<Connection> findByRecipientAndStatus(User recipient, Connection.Status status);
    Optional<Connection> findByRequesterAndRecipient(User requester, User recipient);
    List<Connection> findByRequesterAndStatus(User requester, Connection.Status status);

    @Query("SELECT COUNT(c) > 0 FROM Connection c WHERE " +
           "((c.requester = :user1 AND c.recipient = :user2) OR (c.requester = :user2 AND c.recipient = :user1)) " +
           "AND c.status NOT IN ('DECLINED', 'DISCONNECTED')")
    boolean existsByUsersAndNotDeclined(@Param("user1") User user1, @Param("user2") User user2);

    void deleteByRequesterOrRecipient(User requester, User recipient);
}