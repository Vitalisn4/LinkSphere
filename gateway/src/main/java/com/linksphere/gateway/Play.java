package com.linksphere.gateway;

import org.springframework.stereotype.Component;

@Component
public class Play {
    
    public void greet(String name) {
        System.out.println("Hello " + name + "!, Welcome to Linksphere Gateway!");
    }
}
