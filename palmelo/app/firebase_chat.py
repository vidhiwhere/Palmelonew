import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("firebase_key.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://palmelo-aa37d-default-rtdb.firebaseio.com'
})

def send_message(sender, message, is_sos=False):
    ref = db.reference('messages')
    ref.push({
        'sender': sender,
        'message': message,
        'sos': is_sos,
        'timestamp': {'.sv': 'timestamp'}
    })

def get_messages():
    ref = db.reference('messages')
    data = ref.order_by_child('timestamp').limit_to_last(30).get()
    if not data:
        return []
    return list(data.values())