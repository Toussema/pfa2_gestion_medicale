package com.medicalapp.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.medicalapp.entity.Disponibilite;
import com.medicalapp.entity.Document;
import com.medicalapp.entity.RendezVous;
import com.medicalapp.entity.User;
import com.medicalapp.repository.DisponibiliteRepository;
import com.medicalapp.repository.DocumentRepository;
import com.medicalapp.repository.RendezVousRepository;
import com.medicalapp.repository.UserRepository;
import com.medicalapp.entity.Notification;
import com.medicalapp.repository.NotificationRepository;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private DisponibiliteRepository disponibiliteRepository;

    @Autowired
    private RendezVousRepository RendezVousRepository;

    @Autowired
    private DocumentRepository documentRepository;
      @Autowired
    private NotificationRepository notificationRepository;

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
        List<User> doctors = userRepository.findByRole("medecin");
        doctors.forEach(doctor -> 
            doctor.setDisponibilites(
                doctor.getDisponibilites().stream()
                    .filter(disp -> disp.getEstDisponible())
                    .toList()
            )
        );
        return doctors; // Retourne tous les médecins, même ceux sans disponibilités
    }


    public List<Disponibilite> getDisponibilitesByMedecinId(Long medecinId) {
        return disponibiliteRepository.findByMedecinIdAndEstDisponibleTrue(medecinId); // Seulement disponibles
    }

    public List<Disponibilite> getAllDisponibilitesByMedecinId(Long medecinId) {
        return disponibiliteRepository.findByMedecinId(medecinId);
    }
    public Disponibilite addDisponibilite(Disponibilite disponibilite) {
        return disponibiliteRepository.save(disponibilite);
    }

    public Disponibilite updateDisponibilite(Long disponibiliteId, Disponibilite updatedDisponibilite, Long medecinId) {
        Disponibilite disponibilite = disponibiliteRepository.findById(disponibiliteId)
            .orElseThrow(() -> new RuntimeException("Disponibilité non trouvée"));
        
        // Vérifier que la disponibilité appartient au médecin
        if (!disponibilite.getMedecin().getId().equals(medecinId)) {
            throw new RuntimeException("Accès non autorisé à cette disponibilité");
        }
        
        // Vérifier que la disponibilité est disponible
        if (!disponibilite.getEstDisponible()) {
            throw new RuntimeException("Cette disponibilité n’est pas modifiable");
        }
        
        // Vérifier qu’elle n’est pas associée à un rendez-vous
        if (RendezVousRepository.findByDisponibiliteId(disponibiliteId).isPresent()) {
            throw new RuntimeException("Cette disponibilité est associée à un rendez-vous");
        }

        // Mettre à jour les champs
        disponibilite.setJour(updatedDisponibilite.getJour());
        disponibilite.setHeureDebut(updatedDisponibilite.getHeureDebut());
        disponibilite.setHeureFin(updatedDisponibilite.getHeureFin());
        return disponibiliteRepository.save(disponibilite);
    }

    public void deleteDisponibilite(Long disponibiliteId, Long medecinId) {
        Disponibilite disponibilite = disponibiliteRepository.findById(disponibiliteId)
            .orElseThrow(() -> new RuntimeException("Disponibilité non trouvée"));
        
        // Vérifier que la disponibilité appartient au médecin
        if (!disponibilite.getMedecin().getId().equals(medecinId)) {
            throw new RuntimeException("Accès non autorisé à cette disponibilité");
        }
        
        // Vérifier que la disponibilité est disponible
        if (!disponibilite.getEstDisponible()) {
            throw new RuntimeException("Cette disponibilité ne peut pas être supprimée");
        }
        
        // Vérifier qu’elle n’est pas associée à un rendez-vous
        if (RendezVousRepository.findByDisponibiliteId(disponibiliteId).isPresent()) {
            throw new RuntimeException("Cette disponibilité est associée à un rendez-vous");
        }

        disponibiliteRepository.delete(disponibilite);
    }


    public RendezVous prendreRendezVous(Long patientId, Long medecinId, Long disponibiliteId) {
        User patient = userRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        User medecin = userRepository.findById(medecinId)
            .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));
        Disponibilite disponibilite = disponibiliteRepository.findById(disponibiliteId)
            .orElseThrow(() -> new RuntimeException("Disponibilité non trouvée"));

        RendezVous rendezVous = new RendezVous();
        rendezVous.setPatient(patient);
        rendezVous.setMedecin(medecin);
        rendezVous.setDisponibilite(disponibilite);
        rendezVous.setDatePrise(LocalDateTime.now());
        rendezVous.setStatut(RendezVous.StatutRendezVous.EN_ATTENTE);

        RendezVous savedRendezVous = RendezVousRepository.save(rendezVous);

        // Créer une notification pour le médecin
        String message = String.format(
            "Le patient %s a pris un rendez-vous le %s de %s à %s.",
            patient.getName(),
            disponibilite.getJour(),
            disponibilite.getHeureDebut(),
            disponibilite.getHeureFin()
        );
        Notification notification = new Notification(medecinId, message);
        notificationRepository.save(notification);
        logger.info("Notification créée pour le médecin {}: {}", medecinId, message);

        return savedRendezVous;
    }

    public List<RendezVous> getRendezVousByPatientId(Long patientId) {
        return RendezVousRepository.findByPatientId(patientId);
    }

    public List<RendezVous> getRendezVousByMedecinId(Long medecinId) {
        return RendezVousRepository.findByMedecinId(medecinId);
    }

 public RendezVous updateRendezVous(Long rendezVousId, RendezVous.StatutRendezVous nouveauStatut) {
        RendezVous rendezVous = RendezVousRepository.findById(rendezVousId)
            .orElseThrow(() -> new RuntimeException("Rendez-vous not found with id: " + rendezVousId));

        // Mettre à jour le statut
        rendezVous.setStatut(nouveauStatut);
        RendezVousRepository.save(rendezVous);

        // Si le statut est CONFIRME ou ANNULE, envoyer une notification au patient
        if (nouveauStatut == RendezVous.StatutRendezVous.CONFIRME || nouveauStatut == RendezVous.StatutRendezVous.ANNULE) {
            Long patientId = rendezVous.getPatient().getId();
            String message = String.format(
                "Votre rendez-vous avec le Dr %s le %s de %s à %s a été %s.",
                rendezVous.getMedecin().getName(),
                rendezVous.getDisponibilite().getJour(),
                rendezVous.getDisponibilite().getHeureDebut(),
                rendezVous.getDisponibilite().getHeureFin(),
                nouveauStatut == RendezVous.StatutRendezVous.CONFIRME ? "confirmé" : "annulé"
            );
            createNotification(patientId, message);
        }

        return rendezVous;
    }

    public User updateUser(String email, String password, User updatedUser) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }
        // Mettre à jour uniquement les champs modifiables
        if (updatedUser.getName() != null) user.setName(updatedUser.getName());
        if (updatedUser.getAdresse() != null) user.setAdresse(updatedUser.getAdresse());
        if (updatedUser.getTel() != null) user.setTel(updatedUser.getTel());
        if (updatedUser.getGsm() != null) user.setGsm(updatedUser.getGsm());
        if (updatedUser.getSpecialite() != null && "medecin".equals(user.getRole())) {
            user.setSpecialite(updatedUser.getSpecialite());
        }
        return userRepository.save(user);
    }

    public void deleteUser(String email, String password) {
        User user = findByEmail(email);
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }
        userRepository.delete(user);
    }

    public Document uploadDocument(Long rendezVousId, Long senderId, String fileName, String fileType, byte[] fileData) {
        RendezVous rendezVous = RendezVousRepository.findById(rendezVousId)
            .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        if (rendezVous.getStatut() != RendezVous.StatutRendezVous.CONFIRME) {
            throw new RuntimeException("Le rendez-vous doit être confirmé pour envoyer des documents.");
        }
        User sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (!sender.getId().equals(rendezVous.getPatient().getId()) && 
            !sender.getId().equals(rendezVous.getMedecin().getId())) {
            throw new RuntimeException("Seul le patient ou le médecin du rendez-vous peut envoyer des documents.");
        }

        Document document = new Document();
        document.setRendezVous(rendezVous);
        document.setSender(sender);
        document.setFileName(fileName);
        document.setFileType(fileType);
        document.setFileData(fileData);
        return documentRepository.save(document);
    }

    public List<Document> getDocumentsByRendezVousId(Long rendezVousId) {
        return documentRepository.findByRendezVousId(rendezVousId);
    }

    public Document markDocumentAsConsulted(Long documentId, Long userId) {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document non trouvé"));
        RendezVous rendezVous = document.getRendezVous();
        if (!userId.equals(rendezVous.getPatient().getId()) && 
            !userId.equals(rendezVous.getMedecin().getId())) {
            throw new RuntimeException("Accès non autorisé au document.");
        }
        document.setConsulted(true);
        return documentRepository.save(document);
    }

    public Document addRemarksToDocument(Long documentId, Long userId, String remarks) {
        Document document = documentRepository.findById(documentId)
            .orElseThrow(() -> new RuntimeException("Document non trouvé"));
        RendezVous rendezVous = document.getRendezVous();
        if (!userId.equals(rendezVous.getPatient().getId()) && 
            !userId.equals(rendezVous.getMedecin().getId())) {
            throw new RuntimeException("Accès non autorisé au document.");
        }
        document.setRemarks(remarks);
        return documentRepository.save(document);
    }
     public Long findUserIdByUsername(String username) {
        logger.info("Searching for user ID with username (email): {}", username);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> {
                    logger.warn("No user found with username (email): {}", username);
                    return new RuntimeException("Utilisateur non trouvé");
                });
        logger.info("Found user ID: {} for username (email): {}", user.getId(), username);
        return user.getId();
    }
    public List<Notification> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    public List<Notification> getUnreadNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    public void markNotificationAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only mark your own notifications as read");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own notifications");
        }
        notificationRepository.delete(notification);
    }
   public void createNotification(Long userId, String message) {
        Notification notification = new Notification(userId, message);
        notificationRepository.save(notification);
    }
}