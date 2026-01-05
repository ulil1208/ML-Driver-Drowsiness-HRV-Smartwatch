from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
from collections import deque

WINDOW_SIZE = 10
hr_buffer   = deque(maxlen=WINDOW_SIZE)
temp_buffer = deque(maxlen=WINDOW_SIZE)

# ----------------------------------
# Load Model
# ----------------------------------
MODEL_PATH = "model/decision_tree_model.pkl"
model = joblib.load(MODEL_PATH)

# ----------------------------------
# Inisialisasi Flask
# ----------------------------------
app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Driver Drowsiness Detection API is running."})


# ----------------------------------
# Endpoint Prediksi
# ----------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # ===============================
        # Ambil input dari request
        # ===============================
        Heart_Rate   = request.form.get("Heart_Rate", type=float)
        Steps_Taken  = request.form.get("Steps_Taken", type=float)
        Temperature  = request.form.get("Temperature", type=float)

        # Validasi input wajib
        if Heart_Rate is None or Steps_Taken is None or Temperature is None:
            return jsonify({
                "error": "Missing feature. Required: Heart_Rate, Steps_Taken, Temperature"
            }), 400

        # ===============================
        # Simpan ke buffer (rolling)
        # ===============================
        hr_buffer.append(Heart_Rate)
        temp_buffer.append(Temperature)

        # Pastikan data cukup untuk rolling window
        if len(hr_buffer) < WINDOW_SIZE or len(temp_buffer) < WINDOW_SIZE:
            return jsonify({
                "message": "Data belum cukup untuk prediksi",
                "current_hr_buffer": len(hr_buffer),
                "current_temp_buffer": len(temp_buffer)
            }), 202

        # ===============================
        # Hitung fitur rolling
        # ===============================
        HR_mean   = np.mean(hr_buffer)
        HR_std    = np.std(hr_buffer)

        Temp_mean = np.mean(temp_buffer)
        Temp_std  = np.std(temp_buffer)

        # ===============================
        # Susunan fitur HARUS sama
        # dengan saat training
        # ===============================
        features = np.array([[
            Heart_Rate,
            Steps_Taken,
            Temperature,
            HR_mean,
            HR_std,
            Temp_mean,
            Temp_std
        ]])

        # ===============================
        # Prediksi
        # ===============================
        prediction = model.predict(features)[0]

        label_map = {
            0: "Kondisi kantuk (fatigue tinggi)",
            1: "Kondisi tidak kantuk (waspada)"
        }

        try:
            proba = model.predict_proba(features).tolist()
        except:
            proba = None

        return jsonify({
            "Heart_Rate": Heart_Rate,
            "Steps_Taken": Steps_Taken,
            "Temperature": Temperature,
            "HR_mean": HR_mean,
            "HR_std": HR_std,
            "Temp_mean": Temp_mean,
            "Temp_std": Temp_std,
            "prediction": int(prediction),
            "label": label_map[int(prediction)],
            "probabilities": proba
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
