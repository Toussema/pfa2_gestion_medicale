# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from imblearn.over_sampling import SMOTE  # Pour équilibrage des classes
import seaborn as sns
import matplotlib.pyplot as plt
import pickle
import logging

# Configuration du logging pour tracer les erreurs et informations
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

try:
    # Chargement des données
    logging.info("Chargement du fichier CSV...")
    df = pd.read_csv("C:/Users/21620/pfa2_gestion_medicale/diabete_prediction_backend/diabetes_prediction_dataset (4).csv")

    # Réduction à 50 000 lignes
    df = df.sample(n=50000, random_state=42)
    logging.info(f"Données chargées avec {len(df)} lignes.")

    # 1. Nettoyage des données
    # Vérification des valeurs manquantes
    logging.info("Vérification des valeurs manquantes...")
    if df.isnull().sum().sum() > 0:
        logging.warning("Valeurs manquantes détectées. Suppression des lignes concernées.")
        df = df.dropna()

    # Vérification des outliers pour les colonnes numériques
    def remove_outliers(df, column):
        Q1 = df[column].quantile(0.25)
        Q3 = df[column].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]
        return df

    numeric_cols = ['age', 'bmi', 'HbA1c_level', 'blood_glucose_level']
    logging.info("Suppression des outliers pour les colonnes numériques...")
    for col in numeric_cols:
        df = remove_outliers(df, col)
    logging.info(f"Données après suppression des outliers : {len(df)} lignes.")

    # 2. Encodage des colonnes catégoriques
    label_encoder_gender = LabelEncoder()
    label_encoder_smoking = LabelEncoder()
    df['gender'] = label_encoder_gender.fit_transform(df['gender'])
    df['smoking_history'] = label_encoder_smoking.fit_transform(df['smoking_history'])

    # 3. Séparation features X et cible y
    X = df.drop('diabetes', axis=1)
    y = df['diabetes']

    # Vérification de l'équilibre des classes
    logging.info("Distribution des classes :")
    logging.info(y.value_counts())
    if y.value_counts().min() / y.value_counts().max() < 0.3:  # Seuil pour déséquilibre
        logging.info("Classes déséquilibrées. Application de SMOTE...")
        smote = SMOTE(random_state=42)
        X, y = smote.fit_resample(X, y)
        logging.info("Classes équilibrées avec SMOTE.")

    # 4. Split train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 5. Normalisation
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # 6. Optimisation des hyperparamètres avec GridSearchCV
    logging.info("Optimisation des hyperparamètres avec GridSearchCV...")
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [None, 10, 20],
        'min_samples_split': [2, 5]
    }
    model = RandomForestClassifier(random_state=42)
    grid_search = GridSearchCV(model, param_grid, cv=5, scoring='f1', n_jobs=-1)
    grid_search.fit(X_train_scaled, y_train)
    model = grid_search.best_estimator_
    logging.info(f"Meilleurs hyperparamètres : {grid_search.best_params_}")

    # 7. Validation croisée
    logging.info("Évaluation avec validation croisée...")
    cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='f1')
    logging.info(f"Scores de validation croisée (F1) : {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # 8. Prédictions sur l'ensemble de test
    y_pred = model.predict(X_test_scaled)

    # 9. Évaluation
    logging.info("Évaluation du modèle sur l'ensemble de test...")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print(classification_report(y_test, y_pred))

    # Affichage de la matrice de confusion
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(6, 4))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title("Matrice de confusion")
    plt.xlabel("Prédit")
    plt.ylabel("Réel")
    plt.show()

    # 10. Sauvegarde du modèle, des LabelEncoders et du StandardScaler
    logging.info("Sauvegarde des artefacts...")
    with open("random_forest_model.pkl", "wb") as f:
        pickle.dump(model, f)
    with open("label_encoder_gender.pkl", "wb") as f:
        pickle.dump(label_encoder_gender, f)
    with open("label_encoder_smoking.pkl", "wb") as f:
        pickle.dump(label_encoder_smoking, f)
    with open("scaler.pkl", "wb") as f:
        pickle.dump(scaler, f)
    logging.info("Artefacts sauvegardés avec succès.")

except Exception as e:
    logging.error(f"Erreur lors de l'exécution : {str(e)}")
    raise