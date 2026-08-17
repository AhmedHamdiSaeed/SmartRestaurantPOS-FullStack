package com.smartpos.auth.model;

import com.smartpos.auth.model.enums.UserRole;
import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    private String id;

    @Column(nullable = true, length = 36)
    private String tenantId;

    @Column(unique = true, nullable = false)
    @NotBlank
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = true)
    private String email;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    private String name;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    private String branch;
    private String avatar;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID().toString();
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
