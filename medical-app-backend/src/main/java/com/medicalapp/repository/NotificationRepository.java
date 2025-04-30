
// src/main/java/com/medicalapp/repository/NotificationRepository.java
package com.medicalapp.repository;

import com.medicalapp.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserId(Long userId);
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
}
