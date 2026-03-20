import pandas as pd
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle

print("Loading data...")
df = pd.read_csv("data/gestures.csv")
print(f"Total samples: {len(df)}")
print(f"Gestures: {list(df['label'].unique())}")

X = df.drop("label", axis=1)
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print("\nTraining model...")
model = SVC(kernel="rbf", probability=True, C=10, gamma='scale')
model.fit(X_train, y_train)

preds = model.predict(X_test)
acc = accuracy_score(y_test, preds)
print(f"\n✅ Accuracy: {acc * 100:.2f}%")
print(classification_report(y_test, preds))

with open("models/gesture_model.pkl", "wb") as f:
    pickle.dump(model, f)
print("✅ Model saved!")