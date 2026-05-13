package com.inventory.module.config;

import com.inventory.module.domain.Tenant;
import com.inventory.module.domain.User;
import com.inventory.module.repositories.TenantRepository;
import com.inventory.module.repositories.UserRepository;
import com.inventory.module.security.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Initializes system data on application startup.
 *
 * Creates the PLATFORM tenant for GLOBAL_ADMIN users and optionally
 * seeds a default global admin user.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    public static final String PLATFORM_TENANT_UUID = "00000000-0000-0000-0000-000000000000";
    public static final String PLATFORM_TENANT_NAME = "PLATFORM";

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("!test")
    public CommandLineRunner initializeData() {
        return args -> {
            createPlatformTenantIfNotExists();
            createDefaultGlobalAdminIfNotExists();
        };
    }

    private void createPlatformTenantIfNotExists() {
        if (!tenantRepository.existsByUuid(PLATFORM_TENANT_UUID)) {
            log.info("Creating PLATFORM tenant for GLOBAL_ADMIN users...");
            Tenant platformTenant = Tenant.builder()
                    .uuid(PLATFORM_TENANT_UUID)
                    .name(PLATFORM_TENANT_NAME)
                    .email("platform@system.local")
                    .active(true)
                    .build();
            tenantRepository.save(platformTenant);
            log.info("PLATFORM tenant created successfully");
        } else {
            log.debug("PLATFORM tenant already exists");
        }
    }

    private void createDefaultGlobalAdminIfNotExists() {
        // Check if any GLOBAL_ADMIN exists
        var globalAdmins = userRepository.findByRole(UserRole.GLOBAL_ADMIN);
        if (globalAdmins.isEmpty()) {
            log.info("Creating default GLOBAL_ADMIN user...");
            User globalAdmin = User.builder()
                    .uuid(java.util.UUID.randomUUID().toString())
                    .name("Global Admin")
                    .email("globaladmin@system.local")
                    .password(passwordEncoder.encode("globaladmin123"))
                    .tenantId(PLATFORM_TENANT_UUID)
                    .role(UserRole.GLOBAL_ADMIN)
                    .active(true)
                    .build();
            userRepository.save(globalAdmin);
            log.info("Default GLOBAL_ADMIN created: globaladmin@system.local / globaladmin123 (hashed)");
        } else {
            log.debug("GLOBAL_ADMIN users already exist");
        }
    }
}
