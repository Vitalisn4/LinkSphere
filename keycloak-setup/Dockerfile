FROM quay.io/keycloak/keycloak:26.3.1 as builder 
    
EXPOSE 8080
    
# This is the correct production start command
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start"]