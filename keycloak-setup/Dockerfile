# ---- Build Stage ----
FROM quay.io/keycloak/keycloak:26.3.1 AS builder

WORKDIR /opt/keycloak

# (Optional) Enable health and metrics support by default
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# (Optional) Set DB vendor as default (can be overridden by env)
ENV KC_DB=postgres

# Build Keycloak for production
RUN /opt/keycloak/bin/kc.sh build

# ---- Runtime Stage ----
FROM quay.io/keycloak/keycloak:26.3.1

COPY --from=builder /opt/keycloak/ /opt/keycloak/

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]