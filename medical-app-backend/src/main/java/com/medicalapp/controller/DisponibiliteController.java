// src/main/java/com/medicalapp/controller/DisponibiliteController.java
package com.medicalapp.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicalapp.entity.Disponibilite;
import com.medicalapp.entity.User;
import com.medicalapp.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public class DisponibiliteController {

    @Autowired
    private UserService userService;

    // Ajouter une disponibilité (pour les médecins connectés)
    @PostMapping("/disponibilites")
    public ResponseEntity<Disponibilite> addDisponibilite(@RequestBody Disponibilite disponibilite) {
        Disponibilite savedDisponibilite = userService.addDisponibilite(disponibilite);
        return ResponseEntity.ok(savedDisponibilite);
    }

    // Récupérer les disponibilités d’un médecin
    @GetMapping("/disponibilites/{medecinId}")
    public ResponseEntity<List<Disponibilite>> getDisponibilitesByMedecinId(@PathVariable Long medecinId) {
        List<Disponibilite> disponibilites = userService.getDisponibilitesByMedecinId(medecinId);
        return ResponseEntity.ok(disponibilites);
    }

    @GetMapping("/all-disponibilites/{medecinId}")
    public ResponseEntity<List<Disponibilite>> getAllDisponibilitesByMedecinId(@PathVariable Long medecinId) {
        List<Disponibilite> disponibilites = userService.getAllDisponibilitesByMedecinId(medecinId);
        return ResponseEntity.ok(disponibilites);
    }

    @PutMapping("/disponibilites/{disponibiliteId}")
    public ResponseEntity<Disponibilite> updateDisponibilite(
            @PathVariable Long disponibiliteId,
            @RequestBody Disponibilite disponibilite,
            Principal principal) {
        User user = userService.findByEmail(principal.getName());
        if (!"medecin".equals(user.getRole())) {
            throw new RuntimeException("Seuls les médecins peuvent modifier des disponibilités");
        }
        Disponibilite updatedDisponibilite = userService.updateDisponibilite(disponibiliteId, disponibilite, user.getId());
        return ResponseEntity.ok(updatedDisponibilite);
    }

    @DeleteMapping("/disponibilites/{disponibiliteId}")
    public ResponseEntity<Void> deleteDisponibilite(@PathVariable Long disponibiliteId, Principal principal) {
        User user = userService.findByEmail(principal.getName());
        if (!"medecin".equals(user.getRole())) {
            throw new RuntimeException("Seuls les médecins peuvent supprimer des disponibilités");
        }
        userService.deleteDisponibilite(disponibiliteId, user.getId());
        return ResponseEntity.noContent().build();
    }

    // Mettre à jour la liste des médecins avec leurs disponibilités
    @GetMapping("/disponibilites/doctors")
    public ResponseEntity<List<User>> getDoctors() {
        List<User> doctors = userService.getDoctors();
        // Charger les disponibilités pour chaque médecin
        doctors.forEach(doctor -> doctor.setDisponibilites(userService.getDisponibilitesByMedecinId(doctor.getId())));
        return ResponseEntity.ok(doctors);
    }

}
