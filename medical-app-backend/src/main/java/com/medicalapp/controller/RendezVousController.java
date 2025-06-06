// src/main/java/com/medicalapp/controller/RendezVousController.java
package com.medicalapp.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.medicalapp.entity.RendezVous;
import com.medicalapp.entity.User;
import com.medicalapp.service.UserService;
import com.medicalapp.entity.Notification;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public class RendezVousController {

    @Autowired
    private UserService userService;

    @PostMapping("/rendez-vous")
    public ResponseEntity<RendezVous> prendreRendezVous(
            @RequestParam Long medecinId,
            @RequestParam Long disponibiliteId,
            Principal principal) {
        String email = principal.getName();
        User patient = userService.findByEmail(email);
        RendezVous rendezVous = userService.prendreRendezVous(patient.getId(), medecinId, disponibiliteId);
        return ResponseEntity.ok(rendezVous);
    }

    @GetMapping("/rendez-vous/patient")
    public ResponseEntity<List<RendezVous>> getPatientRendezVous(Principal principal) {
        String email = principal.getName();
        User patient = userService.findByEmail(email);
        List<RendezVous> rendezVous = userService.getRendezVousByPatientId(patient.getId());
        return ResponseEntity.ok(rendezVous);
    }

    @GetMapping("/rendez-vous/medecin")
    public ResponseEntity<List<RendezVous>> getMedecinRendezVous(Principal principal) {
        String email = principal.getName();
        User medecin = userService.findByEmail(email);
        List<RendezVous> rendezVous = userService.getRendezVousByMedecinId(medecin.getId());
        return ResponseEntity.ok(rendezVous);
    }

    @PutMapping("/rendez-vous/{id}")
    public ResponseEntity<RendezVous> updateRendezVous(
            @PathVariable Long id,
            @RequestParam String statut) {
        RendezVous.StatutRendezVous nouveauStatut = RendezVous.StatutRendezVous.valueOf(statut.toUpperCase());
        RendezVous updatedRendezVous = userService.updateRendezVous(id, nouveauStatut);
        return ResponseEntity.ok(updatedRendezVous);
    }
     @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(userService.getNotificationsByUserId(user.getId()));
    }

    @GetMapping("/notifications/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(userService.getUnreadNotificationsByUserId(user.getId()));
    }
 @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable Long id,
            Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        userService.markNotificationAsRead(id, user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/notifications/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        userService.deleteNotification(id, user.getId());
        return ResponseEntity.noContent().build();
    }

}