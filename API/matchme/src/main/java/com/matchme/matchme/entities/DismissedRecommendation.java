package com.matchme.matchme.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dismissed_recommendation")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DismissedRecommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user; // The user who dismissed

    @ManyToOne
    private User dismissedUser; // The user who was dismissed
}
