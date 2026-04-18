package com.inventory.module.domain;

import com.inventory.module.security.UserRole;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User Entity representing a user in the system.
 * Each user belongs to a tenant and has a role.
 */
@Entity
@Table(name = "users",
    indexes = {
        @Index(name = "idx_user_tenant", columnList = "tenant_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_uuid", columnNames = "uuid"),
        @UniqueConstraint(name = "uk_user_email", columnNames = "email")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    /**
     * Public-facing UUID for user identification.
     */
    @Column(name = "uuid", nullable = false, updatable = false, unique = true, length = 36)
    private String uuid;

    /**
     * User's name.
     */
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /**
     * User's email - unique per tenant.
     */
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    /**
     * Password (hashed).
     */
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    /**
     * Tenant ID this user belongs to.
     */
    @Column(name = "tenant_id", nullable = false, length = 36)
    private String tenantId;

    /**
     * User role in the system.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private UserRole role = UserRole.STANDARD;

    /**
     * Whether the user is active.
     */
    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Creation timestamp.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Last update timestamp.
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID().toString();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}