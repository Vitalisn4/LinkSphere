 # ---- Build Stage ----
FROM quay.io/keycloak/keycloak:latest AS builder 

WORKDIR /opt/keycloak

# Build Keycloak with the current config
RUN /opt/keycloak/bin/kc.sh build

# ---- Runtime Stage ----
FROM quay.io/keycloak/keycloak:latest

COPY --from=builder /opt/keycloak/ /opt/keycloak/

EXPOSE 8080

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev"]