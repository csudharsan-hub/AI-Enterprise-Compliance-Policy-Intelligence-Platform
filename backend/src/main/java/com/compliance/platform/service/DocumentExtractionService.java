package com.compliance.platform.service;

import com.compliance.platform.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentExtractionService {

    /**
     * Extract text from any supported file type.
     */
    public String extractFromFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("No file provided or file is empty.");
        }

        String filename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase() : "";

        try {
            if (filename.endsWith(".pdf")) {
                return extractFromPDF(file.getInputStream());
            } else if (filename.endsWith(".docx")) {
                return extractFromDOCX(file.getInputStream());
            } else if (filename.endsWith(".txt")) {
                return extractFromTXT(file.getInputStream());
            } else {
                throw new BusinessException(
                        "Unsupported file type. Allowed: PDF, DOCX, TXT",
                        HttpStatus.UNSUPPORTED_MEDIA_TYPE);
            }
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("File extraction failed for {}: {}", filename, e.getMessage(), e);
            throw new BusinessException("Failed to extract text from file: " + e.getMessage());
        }
    }

    /**
     * Extract text from PDF.
     */
    private String extractFromPDF(InputStream inputStream) throws IOException {
        try (PDDocument doc = Loader.loadPDF(inputStream.readAllBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc).trim();
            if (text.length() < 10) {
                throw new BusinessException(
                        "Could not extract text from this PDF. It may be image-based or scanned.");
            }
            return text;
        }
    }

    /**
     * Extract text from DOCX.
     */
    private String extractFromDOCX(InputStream inputStream) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
            String text = extractor.getText().trim();
            if (text.length() < 10) {
                throw new BusinessException("Could not extract text from this DOCX file.");
            }
            return text;
        }
    }

    /**
     * Extract text from TXT.
     */
    private String extractFromTXT(InputStream inputStream) throws IOException {
        String text = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8).trim();
        if (text.length() < 10) {
            throw new BusinessException("The text file appears to be empty.");
        }
        return text;
    }

    /**
     * Fetch and extract text from a URL.
     */
    public UrlExtractionResult extractFromURL(String urlStr) {
        // Validate URL
        URI uri;
        try {
            uri = new URI(urlStr);
            if (!uri.getScheme().equals("http") && !uri.getScheme().equals("https")) {
                throw new BusinessException("Only HTTP and HTTPS URLs are supported.");
            }
        } catch (Exception e) {
            throw new BusinessException("Invalid URL format: " + urlStr);
        }

        // Block private/local IPs (SSRF prevention)
        String host = uri.getHost();
        if (host == null || host.equals("localhost") || host.startsWith("127.") ||
                host.startsWith("10.") || host.startsWith("192.168.") || host.equals("0.0.0.0")) {
            throw new BusinessException("Fetching from internal/private addresses is not allowed.");
        }

        try {
            Document doc = Jsoup.connect(urlStr)
                    .userAgent("Mozilla/5.0 (compatible; ComplianceBot/1.0)")
                    .timeout(15000)
                    .maxBodySize(5 * 1024 * 1024)
                    .get();

            String pageTitle = doc.title();

            // Remove noisy tags
            doc.select("script, style, nav, header, footer, aside, noscript, iframe").remove();

            // Try content-specific selectors first
            String text = "";
            for (String selector : new String[]{"main", "article",
                    "[class*='terms']", "[class*='policy']", "[class*='legal']",
                    "[class*='content']", "[id*='terms']", "[id*='policy']", "body"}) {
                org.jsoup.nodes.Element el = doc.selectFirst(selector);
                if (el != null && el.text().trim().length() > 200) {
                    text = el.text();
                    break;
                }
            }

            if (text.isBlank()) text = doc.body().text();

            text = text.replaceAll("\\s{2,}", " ").replaceAll("\\n{3,}", "\n\n").trim();

            if (text.length() < 50) {
                throw new BusinessException(
                        "Could not extract sufficient text from this URL. The page may require JavaScript.");
            }

            return new UrlExtractionResult(text, pageTitle);

        } catch (BusinessException e) {
            throw e;
        } catch (org.jsoup.HttpStatusException e) {
            throw new BusinessException("URL returned HTTP " + e.getStatusCode() + ". Access denied or page not found.");
        } catch (java.net.SocketTimeoutException e) {
            throw new BusinessException("Request timed out. The server did not respond in time.");
        } catch (Exception e) {
            log.error("URL extraction failed for {}: {}", urlStr, e.getMessage());
            throw new BusinessException("Failed to fetch URL: " + e.getMessage());
        }
    }

    public record UrlExtractionResult(String text, String pageTitle) {}
}
