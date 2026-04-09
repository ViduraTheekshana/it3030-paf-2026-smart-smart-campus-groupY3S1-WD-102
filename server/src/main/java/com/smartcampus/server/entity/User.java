package com.smartcampus.server.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

// TODO: replace this with actual entity
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String email;

    private String role;
}
