package com.compliance.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class CompliancePlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(CompliancePlatformApplication.class, args);
        System.out.println("""

  ╔══════════════════════════════════════════════════════════╗
  ║   AI Enterprise Compliance Platform                      ║
  ║   Version: 1.0.0  |  Port: 5000                         ║
  ║   Status:  RUNNING                                       ║
  ╚══════════════════════════════════════════════════════════╝
        """);
    }
}
