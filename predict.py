import sys
import json
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

class_labels = [
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

CONFIDENCE_THRESHOLD = 0.9  # Adjust as needed (e.g., 0.7 = 70%)

try:
    model = load_model('model.h5')
    img_path = sys.argv[1]

    img = image.load_img(img_path, target_size=(128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    pred = model.predict(img_array)
    predicted_probs = pred[0]
    predicted_class = np.argmax(predicted_probs)
    confidence = predicted_probs[predicted_class]

    if confidence < CONFIDENCE_THRESHOLD:
        # Low confidence — possibly wrong image
        print(json.dumps({ "class": "The uploaded image may not be a tomato leaf. Please upload a valid tomato plant image." }))
    else:
        predicted_label = class_labels[predicted_class]
        print(json.dumps({ "class": predicted_label, "confidence": float(confidence) }))

except Exception as e:
    print(json.dumps({ "error": str(e) }))
    sys.exit(1)

