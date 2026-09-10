package com.compliance.platform.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Groq groq = new Groq();
    private Upload upload = new Upload();
    private Cors cors = new Cors();
    private WebClientProps webclient = new WebClientProps();

    @Data
    public static class Jwt {
        private String secret;
        private long expiration = 604800000L; // 7 days
    }

    @Data
    public static class Groq {
        private String apiKey;
        private String baseUrl = "https://api.groq.com/openai/v1";
        private String model = "llama-3.3-70b-versatile";
        private int maxTokens = 4096;
        private double temperature = 0.1;
    }

    @Data
    public static class Upload {
        private String dir = "./uploads";
    }

    @Data
    public static class Cors {
        private String allowedOrigins = "http://localhost:3000";
    }

    @Data
    public static class WebClientProps {
        private int timeout = 60;
    }
}
