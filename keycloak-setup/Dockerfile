# ---- Build Stage ----
    FROM quay.io/keycloak/keycloak:26.3.1 as builder

    WORKDIR /opt/keycloak
    
    # You can include your theme here if needed:
    # COPY ./themes /opt/keycloak/themes
    
    RUN /opt/keycloak/bin/kc.sh build
    
    # ---- Runtime Stage ----
    FROM quay.io/keycloak/keycloak:26.3.1
    
    COPY --from=builder /opt/keycloak/ /opt/keycloak/
    
    # Optional: copy realm.json if you are importing a realm
    # COPY ./realm-export.json /opt/keycloak/data/import/ 
    
    EXPOSE 8080
    
    # This is the correct production start command
    ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]
    