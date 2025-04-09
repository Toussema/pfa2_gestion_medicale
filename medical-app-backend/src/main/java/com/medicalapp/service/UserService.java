package com.medicalapp.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.medicalapp.entity.Disponibilite;
import com.medicalapp.entity.User;
import com.medicalapp.repository.DisponibiliteRepository;
import com.medicalapp.repository.UserRepository;


@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private DisponibiliteRepository disponibiliteRepository;

    public User registerUser(User user) {
        logger.info("Attempting to register user with email: {}", user.getEmail());
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("User already exists with email: {}", user.getEmail());
            throw new RuntimeException("Utilisateur déjà existant");
        }
        logger.info("Encoding password for email: {}", user.getEmail());
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        logger.info("User saved successfully: id={}, email={}", savedUser.getId(), savedUser.getEmail());
        return savedUser;
    }

    public User findByEmail(String email) {
        logger.info("Searching for user with email: {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("No user found with email: {}", email);
                    return new RuntimeException("Utilisateur non trouvé");
                });
    }

    public List<User> getDoctors() {
        return userRepository.findByRole("medecin");
    }


    public List<Disponibilite> getDisponibilitesByMedecinId(Long medecinId) {
        return disponibiliteRepository.findByMedecinId(medecinId);
    }

    public Disponibilite addDisponibilite(Disponibilite disponibilite) {
        return disponibiliteRepository.save(disponibilite);
    }
}