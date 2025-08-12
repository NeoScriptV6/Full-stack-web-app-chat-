package com.matchme.matchme.services;

import com.matchme.matchme.entities.Connection;
import com.matchme.matchme.entities.User;
import com.matchme.matchme.repositories.ConnectionRepository;
import com.matchme.matchme.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConnectionService {
    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;

    public ConnectionService(ConnectionRepository connectionRepository, UserRepository userRepository) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
    }

    public Connection sendRequest(String requesterId, String recipientId) {
        User requester = userRepository.findById(requesterId).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();
        if (connectionRepository.findByRequesterAndRecipient(requester, recipient).isPresent()) {
            throw new IllegalStateException("Request already exists");
        }
        Connection connection = new Connection(null, requester, recipient, Connection.Status.PENDING);
        return connectionRepository.save(connection);
    }

    public Connection respondToRequest(Long connectionId, boolean accept) {
        Connection connection = connectionRepository.findById(connectionId).orElseThrow();
        connection.setStatus(accept ? Connection.Status.ACCEPTED : Connection.Status.REJECTED);
        return connectionRepository.save(connection);
    }

    public List<Connection> getUserConnections(User user) {
        return connectionRepository.findByRequesterOrRecipient(user, user)
                .stream()
                .filter(c -> c.getStatus() == Connection.Status.ACCEPTED)
                .toList();
    }

    public List<Connection> getPendingRequests(User user) {
        return connectionRepository.findByRecipientAndStatus(user, Connection.Status.PENDING);
    }

    public boolean areConnected(User a, User b) {
        return connectionRepository.findByRequesterAndRecipient(a, b)
                .filter(c -> c.getStatus() == Connection.Status.ACCEPTED)
                .isPresent()
            || connectionRepository.findByRequesterAndRecipient(b, a)
                .filter(c -> c.getStatus() == Connection.Status.ACCEPTED)
                .isPresent();
    }

    public boolean hasPendingRequest(User a, User b) {
        return connectionRepository.findByRequesterAndRecipient(a, b)
                .filter(c -> c.getStatus() == Connection.Status.PENDING)
                .isPresent();
    }

    public List<Connection> getOutboundRequests(User user) {
        return connectionRepository.findByRequesterAndStatus(user, Connection.Status.PENDING);
    }

    public boolean disconnectUsers(User user1, User user2) {
        Optional<Connection> connection1 = connectionRepository.findByRequesterAndRecipient(user1, user2);
        Optional<Connection> connection2 = connectionRepository.findByRequesterAndRecipient(user2, user1);
        
        boolean disconnected = false;
        
        if (connection1.isPresent()) {
            connectionRepository.delete(connection1.get());
            disconnected = true;
        }
        
        if (connection2.isPresent()) {
            connectionRepository.delete(connection2.get());
            disconnected = true;
        }
        
        return disconnected;
    }
}