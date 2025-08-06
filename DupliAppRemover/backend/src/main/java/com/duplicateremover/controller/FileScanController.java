package com.duplicateremover.controller;

import com.duplicateremover.model.ScanResult;
import com.duplicateremover.service.FileScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class FileScanController {

    @Autowired
    private FileScanService fileScanService;

    @PostMapping("/scan")
    public ResponseEntity<?> startScan(@RequestBody Map<String, String> request) {
        try {
            String directory = request.get("directory");
            if (directory == null || directory.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Directory path is required");
            }

            String scanId = fileScanService.startScan(directory);
            return ResponseEntity.ok(Map.of("scanId", scanId, "status", "STARTED"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/scan/{scanId}")
    public ResponseEntity<?> getScanResult(@PathVariable String scanId) {
        ScanResult result = fileScanService.getScanResult(scanId);
        if (result == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/scans")
    public ResponseEntity<List<ScanResult>> getAllScans() {
        List<ScanResult> results = fileScanService.getAllScanResults();
        return ResponseEntity.ok(results);
    }

    @DeleteMapping("/duplicates/{scanId}")
    public ResponseEntity<?> deleteDuplicates(
            @PathVariable String scanId,
            @RequestBody Map<String, List<String>> request) {
        
        List<String> filePaths = request.get("filePaths");
        if (filePaths == null || filePaths.isEmpty()) {
            return ResponseEntity.badRequest().body("No file paths provided");
        }

        boolean success = fileScanService.deleteDuplicateFiles(scanId, filePaths);
        return ResponseEntity.ok(Map.of("success", success, "deletedCount", filePaths.size()));
    }

    @PostMapping("/validate-directory")
    public ResponseEntity<?> validateDirectory(@RequestBody Map<String, String> request) {
        try {
            String directory = request.get("directory");
            if (directory == null || directory.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("valid", false, "message", "Directory path is required"));
            }

            boolean exists = Files.exists(Paths.get(directory));
            boolean isDirectory = exists && Files.isDirectory(Paths.get(directory));
            boolean readable = exists && Files.isReadable(Paths.get(directory));

            if (!exists) {
                return ResponseEntity.ok(Map.of("valid", false, "message", "Directory does not exist"));
            }
            if (!isDirectory) {
                return ResponseEntity.ok(Map.of("valid", false, "message", "Path is not a directory"));
            }
            if (!readable) {
                return ResponseEntity.ok(Map.of("valid", false, "message", "Directory is not readable"));
            }

            return ResponseEntity.ok(Map.of("valid", true, "message", "Directory is valid and accessible"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", false, "message", "Error validating directory: " + e.getMessage()));
        }
    }

    @GetMapping("/recent-directories")
    public ResponseEntity<?> getRecentDirectories() {
        List<String> recentDirectories = fileScanService.getRecentDirectories();
        return ResponseEntity.ok(Map.of("directories", recentDirectories));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }
}