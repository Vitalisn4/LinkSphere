package com.linksphere.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class GatewayApplication {

	public static void main(String[] args) {
		ApplicationContext context = SpringApplication.run(GatewayApplication.class, args);
		Play obj = context.getBean(Play.class);
		obj.greet("Nkwenti");
	}

}
