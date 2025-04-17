// src/main/java/com/medicalapp/controller/ProfileController.java
package com.medicalapp.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.medicalapp.entity.User;
import com.medicalapp.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<User> getProfile(Principal principal) {
        String email = principal.getName();
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(
            @RequestParam String email,
            @RequestParam String password,
            @RequestBody User updatedUser) {
        User user = userService.updateUser(email, password, updatedUser);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteProfile(
            @RequestParam String email,
            @RequestParam String password) {
        userService.deleteUser(email, password);
        return ResponseEntity.noContent().build();
    }
}