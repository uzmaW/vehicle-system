package com.inventory.module.config;

import com.inventory.module.security.TenantContext;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

/**
 * Aspect to enable Hibernate tenant filter for all repository operations.
 * 
 * This ensures that every database query automatically includes the tenant
 * discriminator, preventing cross-tenant data leakage at the ORM level.
 * 
 * The filter is enabled before any repository method executes and applies
 * to all entities annotated with @Filter(name = "tenantFilter").
 */
@Slf4j
@Aspect
@Component
public class TenantAwareRepositoryAspect {

    private static final String TENANT_FILTER_NAME = "tenantFilter";
    private static final String TENANT_PARAM_NAME = "tenantId";

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Enables the tenant filter before any repository operation.
     * This applies to all methods in repository interfaces.
     * 
     * Note: Native SQL queries (used by admin endpoints) naturally bypass
     * Hibernate filters, so the GLOBAL_ADMIN count queries are unaffected
     * by this filter without needing explicit disabling.
     */
    @Before("execution(* com.inventory.module.repositories..*.*(..))")
    public void enableTenantFilter() {
        String tenantId = TenantContext.getTenantId();
        
        if (tenantId != null) {
            Session session = entityManager.unwrap(Session.class);
            
            // enableFilter() is idempotent — returns existing filter if already enabled
            log.debug("Enabling tenant filter for tenant: {}", tenantId);
            session.enableFilter(TENANT_FILTER_NAME)
                   .setParameter(TENANT_PARAM_NAME, tenantId);
        } else {
            log.warn("No tenant context set - tenant filter not enabled");
        }
    }
}