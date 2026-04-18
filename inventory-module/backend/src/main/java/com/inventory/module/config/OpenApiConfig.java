package com.inventory.module.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI inventoryOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Inventory Module API")
                        .description("Multi-tenant Inventory Management Module API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Inventory Team")
                                .email("support@inventory.local")))
                .schemaRequirement("X-Tenant-Id", new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.HEADER)
                        .name("X-Tenant-Id")
                        .description("Tenant UUID (required for tenant-scoped endpoints)"))
                .schemaRequirement("X-User-Id", new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.HEADER)
                        .name("X-User-Id")
                        .description("User ID (required for all endpoints)"))
                .schemaRequirement("X-User-Role", new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.HEADER)
                        .name("X-User-Role")
                        .description("User role: STANDARD, TENANT_ADMIN, or GLOBAL_ADMIN"))
                .addSecurityItem(new SecurityRequirement()
                        .addList("X-Tenant-Id")
                        .addList("X-User-Id")
                        .addList("X-User-Role"));
    }
}