import pandas as pd
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import pickle

# Load data
df = pd.read_csv("data/gestures.csv")
X = df.drop("label", axis=1)
y = df["label"]

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
model = SVC(kernel="rbf", probability=True)
model.fit(X_train, y_train)

# Test accuracy
preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"Accuracy: {acc * 100:.2f}%")

# Save model
with open("models/gesture_model.pkl", "wb") as f:
    pickle.dump(model, f)

print("Model saved to models/gesture_model.pkl!")