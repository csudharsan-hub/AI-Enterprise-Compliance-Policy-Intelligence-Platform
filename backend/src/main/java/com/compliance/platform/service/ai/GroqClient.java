package com.compliance.platform.service.ai;

import com.compliance.platform.config.AppProperties;
import com.compliance.platform.exception.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class GroqClient {

    private final WebClient webClient;
    private final AppProperties appProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Send a chat completion request to Groq and return raw JSON string response.
     */
    public String chat(String systemPrompt, String userPrompt) {
        AppProperties.Groq groq = appProperties.getGroq();

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", groq.getModel());
        requestBody.put("max_tokens", groq.getMaxTokens());
        requestBody.put("temperature", groq.getTemperature());
        requestBody.put("stream", false);

        ArrayNode messages = requestBody.putArray("messages");

        ObjectNode systemMsg = messages.addObject();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);

        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", userPrompt);

        int maxRetries = 3;
        int attempt = 0;
        while (true) {
            try {
                attempt++;
                String responseBody = webClient.post()
                        .uri(groq.getBaseUrl() + "/chat/completions")
                        .header("Authorization", "Bearer " + groq.getApiKey())
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestBody.toString())
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(Duration.ofSeconds(90))
                        .block();

                JsonNode root = objectMapper.readTree(responseBody);
                String content = root.path("choices").get(0)
                        .path("message").path("content").asText();

                return cleanJsonResponse(content);

            } catch (WebClientResponseException e) {
                log.error("Groq API error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());

                String errorDetails = e.getResponseBodyAsString();
                String parsedMessage = "Unknown error";

                try {
                    if (errorDetails != null && !errorDetails.isBlank()) {
                        JsonNode errRoot = objectMapper.readTree(errorDetails);
                        JsonNode errNode = errRoot.path("error");
                        if (!errNode.isMissingNode()) {
                            parsedMessage = errNode.path("message").asText("Unknown error");
                            String code = errNode.path("code").asText("");
                            if ("model_decommissioned".equals(code) || parsedMessage.contains("decommissioned")) {
                                parsedMessage = "The configured AI model is decommissioned. Please update GROQ_MODEL.";
                            }
                        } else {
                            parsedMessage = errorDetails;
                        }
                    } else {
                        parsedMessage = e.getMessage();
                    }
                } catch (Exception parseEx) {
                    parsedMessage = errorDetails != null && !errorDetails.isBlank() ? errorDetails : e.getMessage();
                }

                if (e.getStatusCode().value() == 400) {
                    throw new BusinessException(
                            "Invalid request to AI provider: " + parsedMessage,
                            HttpStatus.BAD_REQUEST);
                }
                if (e.getStatusCode().value() == 401) {
                    throw new BusinessException(
                            "Invalid Groq API key. Please check your configuration.",
                            HttpStatus.INTERNAL_SERVER_ERROR);
                }
                if (e.getStatusCode().value() == 429) {
                    if (attempt < maxRetries) {
                        int waitSeconds = attempt * 15;
                        log.warn("Groq rate limit hit. Retrying in {}s (attempt {}/{})",
                                waitSeconds, attempt, maxRetries);
                        try {
                            Thread.sleep(waitSeconds * 1000L);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                        }
                        continue;
                    }
                    throw new BusinessException(
                            "Groq API rate limit reached. Please wait a moment and try again.",
                            HttpStatus.TOO_MANY_REQUESTS);
                }
                if (e.getStatusCode().is5xxServerError()) {
                    throw new BusinessException(
                            "AI provider is currently unavailable (" + e.getStatusCode().value()
                                    + "). Please try again later.",
                            HttpStatus.SERVICE_UNAVAILABLE);
                }

                throw new BusinessException(
                        "AI service error: " + e.getStatusCode().value() + " - " + parsedMessage,
                        HttpStatus.INTERNAL_SERVER_ERROR);
            } catch (org.springframework.web.reactive.function.client.WebClientRequestException e) {
                if (e.getCause() instanceof java.util.concurrent.TimeoutException
                        || e.getCause() instanceof io.netty.handler.timeout.ReadTimeoutException) {
                    log.error("Groq client timeout", e);
                    throw new BusinessException(
                            "AI service timeout. The provider took too long to respond.",
                            HttpStatus.GATEWAY_TIMEOUT);
                }
                log.error("Groq client error: {}", e.getMessage(), e);
                throw new BusinessException(
                        "Failed to connect to AI service: " + e.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            } catch (Exception e) {
                log.error("Groq client error: {}", e.getMessage(), e);
                throw new BusinessException(
                        "Failed to connect to AI service: " + e.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    /**
     * Strip markdown fences if model returned them despite instructions.
     */
    private String cleanJsonResponse(String content) {
        if (content == null)
            return "{}";
        String cleaned = content.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceFirst("^```(?:json)?\\s*", "");
            cleaned = cleaned.replaceFirst("\\s*```$", "");
        }
        int first = cleaned.indexOf('{');
        int last = cleaned.lastIndexOf('}');
        if (first >= 0 && last > first) {
            return cleaned.substring(first, last + 1);
        }
        return cleaned;
    }
}
