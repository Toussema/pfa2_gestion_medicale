// src/main/java/com/medicalapp/controller/DocumentController.java
package com.medicalapp.controller;

import java.io.IOException;
import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.medicalapp.entity.Document;
import com.medicalapp.entity.RendezVous;
import com.medicalapp.entity.User;
import com.medicalapp.repository.DocumentRepository;
import com.medicalapp.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private UserService userService;

    @Autowired
    private DocumentRepository documentRepository;


    @PostMapping("/upload")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("rendezVousId") Long rendezVousId,
            @RequestParam("file") MultipartFile file,
            Principal principal) throws IOException {
        String email = principal.getName();
        User sender = userService.findByEmail(email);
        Document document = userService.uploadDocument(
            rendezVousId,
            sender.getId(),
            file.getOriginalFilename(),
            file.getContentType(),
            file.getBytes()
        );
        return ResponseEntity.ok(document);
    }

    @GetMapping("/rendez-vous/{rendezVousId}")
    public ResponseEntity<List<Document>> getDocuments(
            @PathVariable Long rendezVousId,
            Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        List<Document> documents = userService.getDocumentsByRendezVousId(rendezVousId);
        // Vérifier que l'utilisateur est lié au rendez-vous
        RendezVous rendezVous = documents.get(0).getRendezVous(); // Supposons qu'il y a au moins un document
        if (!user.getId().equals(rendezVous.getPatient().getId()) && 
                !user.getId().equals(rendezVous.getMedecin().getId())) {
            throw new RuntimeException("Accès non autorisé aux documents de ce rendez-vous.");
        } else {
        }
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/download/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long documentId,
            Principal principal) {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document non trouvé"));
        User user = userService.findByEmail(principal.getName());
        RendezVous rendezVous = document.getRendezVous();
        if (!user.getId().equals(rendezVous.getPatient().getId()) && 
            !user.getId().equals(rendezVous.getMedecin().getId())) {
            throw new RuntimeException("Accès non autorisé au document.");
        }
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getFileName() + "\"")
            .contentType(MediaType.parseMediaType(document.getFileType()))
            .body(document.getFileData());
    }

    @PutMapping("/consult/{documentId}")
    public ResponseEntity<Document> markAsConsulted(
            @PathVariable Long documentId,
            Principal principal) {
        User user = userService.findByEmail(principal.getName());
        Document document = userService.markDocumentAsConsulted(documentId, user.getId());
        return ResponseEntity.ok(document);
    }

    @PutMapping("/remarks/{documentId}")
    public ResponseEntity<Document> addRemarks(
            @PathVariable Long documentId,
            @RequestParam("remarks") String remarks,
            Principal principal) {
        User user = userService.findByEmail(principal.getName());
        Document document = userService.addRemarksToDocument(documentId, user.getId(), remarks);
        return ResponseEntity.ok(document);
    }
}