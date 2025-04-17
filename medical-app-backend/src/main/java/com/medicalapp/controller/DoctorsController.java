// src/main/java/com/medicalapp/controller/DoctorsController.java
package com.medicalapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.medicalapp.entity.User;
import com.medicalapp.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api")
public class DoctorsController {

    @Autowired
    private UserService userService;

    @GetMapping("/all-doctors")
    public ResponseEntity<List<User>> getAllDoctors() {
        List<User> doctors = userService.getDoctors();
        return ResponseEntity.ok(doctors);
    }
}