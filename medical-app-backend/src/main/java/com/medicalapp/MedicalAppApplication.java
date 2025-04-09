package com.medicalapp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MedicalAppApplication {
    private static final Logger logger = LoggerFactory.getLogger(MedicalAppApplication.class);

    public static void main(String[] args) {
        logger.info("Starting MedicalAppApplication...");
        SpringApplication.run(MedicalAppApplication.class, args);
        logger.info("MedicalAppApplication started successfully.");
    }
}