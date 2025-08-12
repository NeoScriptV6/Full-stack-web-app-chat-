package com.matchme.matchme.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "connection")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Connection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User requester; // The user who sent the request

    @ManyToOne
    private User recipient; // The user who received the request

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}
