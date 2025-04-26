# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
import pickle
import pandas as pd
import numpy as np
import logging

app = Flask(__name__)

# Configuration du logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Charger le modèle, les LabelEncoders et le StandardScaler
try:
    with open("random_forest_model.pkl", "rb") as f:
        model = pickle.load(f)
    with open("label_encoder_gender.pkl", "rb") as f:
        label_encoder_gender = pickle.load(f)
    with open("label_encoder_smoking.pkl", "rb") as f:
        label_encoder_smoking = pickle.load(f)
    with open("scaler.pkl", "rb") as f:
        scaler = pickle.load(f)
    logging.info("Modèle et artefacts chargés avec succès.")
except Exception as e:
    logging.error(f"Erreur lors du chargement des artefacts : {str(e)}")
    exit(1)

# Définir les colonnes attendues
columns = ['gender', 'age', 'hypertension', 'heart_disease', 'smoking_history', 'bmi', 'HbA1c_level', 'blood_glucose_level']

# Fonction de validation des données d'entrée
def validate_input(data):
    # Vérification des colonnes manquantes
    for col in columns:
        if col not in data:
            return False, f"Colonne manquante : {col}"
    
    # Validation des catégories pour gender
    valid_genders = list(label_encoder_gender.classes_)
    if data['gender'] not in valid_genders:
        return False, f"Valeur invalide pour gender : {data['gender']}. Valeurs attendues : {valid_genders}"
    
    # Validation des catégories pour smoking_history
    valid_smoking = list(label_encoder_smoking.classes_)
    if data['smoking_history'] not in valid_smoking:
        return False, f"Valeur invalide pour smoking_history : {data['smoking_history']}. Valeurs attendues : {valid_smoking}"
    
    # Validation des colonnes numériques
    numeric_cols = ['age', 'bmi', 'HbA1c_level', 'blood_glucose_level']
    for col in numeric_cols:
        try:
            value = float(data[col])
            if value < 0:
                return False, f"Valeur négative non autorisée pour {col} : {value}"
            # Plages réalistes (ajustez selon votre dataset)
            if col == 'age' and (value < 0 or value > 120):
                return False, f"Valeur hors plage pour age : {value}"
            if col == 'bmi' and (value < 10 or value > 60):
                return False, f"Valeur hors plage pour bmi : {value}"
            if col == 'HbA1c_level' and (value < 0 or value > 15):
                return False, f"Valeur hors plage pour HbA1c_level : {value}"
            if col == 'blood_glucose_level' and (value < 0 or value > 500):
                return False, f"Valeur hors plage pour blood_glucose_level : {value}"
        except (ValueError, TypeError):
            return False, f"Valeur non numérique pour {col} : {data[col]}"
    
    # Validation des colonnes binaires
    binary_cols = ['hypertension', 'heart_disease']
    for col in binary_cols:
        if data[col] not in [0, 1]:
            return False, f"Valeur invalide pour {col} : {data[col]}. Valeurs attendues : [0, 1]"
    
    return True, ""

@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Recevoir les données du patient
        data = request.get_json()
        logging.info(f"Données reçues : {data}")

        # Valider les données
        is_valid, error_message = validate_input(data)
        if not is_valid:
            logging.warning(f"Erreur de validation : {error_message}")
            return jsonify({"error": error_message}), 400

        # Créer un DataFrame à partir des données
        df = pd.DataFrame([data], columns=columns)

        # Encoder les colonnes catégoriques
        df['gender'] = label_encoder_gender.transform(df['gender'])
        df['smoking_history'] = label_encoder_smoking.transform(df['smoking_history'])

        # Normaliser les données
        df_scaled = scaler.transform(df)

        # Faire une prédiction
        probability = model.predict_proba(df_scaled)[0][1]  # Probabilité de la classe 1 (diabète)
        logging.info(f"Prédiction effectuée : probabilité = {probability:.4f}")

        return jsonify({"probability": probability})

    except Exception as e:
        logging.error(f"Erreur lors de la prédiction : {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route("/docs", methods=["GET"])
def docs():
    """Documentation de l'API"""
    doc = {
        "endpoint": "/predict",
        "method": "POST",
        "description": "Prédit la probabilité de diabète pour un patient.",
        "expected_columns": columns,
        "gender_values": list(label_encoder_gender.classes_),
        "smoking_history_values": list(label_encoder_smoking.classes_),
        "numeric_ranges": {
            "age": "[0, 120]",
            "bmi": "[10, 60]",
            "HbA1c_level": "[0, 15]",
            "blood_glucose_level": "[0, 500]"
        },
        "binary_columns": ["hypertension", "heart_disease"],
        "binary_values": "[0, 1]"
    }
    return jsonify(doc)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)