from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_socketio import SocketIO, emit, join_room, leave_room
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv
import sys
sys.path.append('.')
from mpesa_direct import MpesaClient

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///landlord_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, origins='*', supports_credentials=True)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(20))
    house_number = db.Column(db.String(20), unique=True)
    role = db.Column(db.String(20), default='tenant')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone_number': self.phone_number,
            'house_number': self.house_number,
            'role': self.role
        }

class Property(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    landlord_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    rent_amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    landlord = db.relationship('User', backref='properties')
    
    def to_dict(self):
        return {
            'id': self.id,
            'landlord_id': self.landlord_id,
            'name': self.name,
            'address': self.address,
            'rent_amount': self.rent_amount,
            'description': self.description,
            'image_url': self.image_url,
            'landlord': self.landlord.to_dict() if self.landlord else None
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tenant_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), default='mpesa')
    transaction_id = db.Column(db.String(100))
    status = db.Column(db.String(20), default='pending')
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    phone_number = db.Column(db.String(20))
    
    tenant = db.relationship('User', backref='payments')
    property = db.relationship('Property', backref='payments')
    
    def to_dict(self):
        return {
            'id': self.id,
            'tenant_id': self.tenant_id,
            'property_id': self.property_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'phone_number': self.phone_number,
            'tenant': self.tenant.to_dict() if self.tenant else None,
            'property': self.property.to_dict() if self.property else None
        }

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'))
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)
    
    sender = db.relationship('User', foreign_keys=[sender_id])
    receiver = db.relationship('User', foreign_keys=[receiver_id])
    property = db.relationship('Property')
    
    def to_dict(self):
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'receiver_id': self.receiver_id,
            'property_id': self.property_id,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'read': self.read,
            'sender': self.sender.to_dict() if self.sender else None
        }

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName') or data.get('first_name', 'User')
    last_name = data.get('lastName') or data.get('last_name', 'Name')
    phone_number = data.get('phone_number') or data.get('phoneNumber')
    house_number = data.get('house_number') or data.get('houseNumber')
    role = data.get('role', 'tenant')
    
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    
    if role == 'landlord':
        landlord_count = User.query.filter_by(role='landlord').count()
        if landlord_count >= 1:
            return {'error': 'A landlord account already exists. Only one landlord is allowed.'}, 403
    
    if role == 'tenant':
        if not house_number:
            return {'error': 'House number is required for tenants'}, 400
        
        if User.query.filter_by(house_number=house_number).first():
            return {'error': 'House number already assigned to another tenant'}, 409
        
        tenant_count = User.query.filter_by(role='tenant').count()
        if tenant_count >= 15:
            return {'error': 'Maximum tenant limit (15) reached. No more tenants can register.'}, 403
    
    if User.query.filter_by(email=email).first():
        return {'error': 'User already exists'}, 409
    
    user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        house_number=house_number if role == 'tenant' else None,
        role=role
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    token = create_access_token(identity=str(user.id))
    
    return {
        'success': True,
        'token': token,
        'user': user.to_dict()
    }, 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return {'error': 'Invalid credentials'}, 401
    
    token = create_access_token(identity=str(user.id))
    
    return {
        'success': True,
        'token': token,
        'user': user.to_dict()
    }, 200

# Property Routes (Full CRUD)
@app.route('/api/properties', methods=['GET', 'POST'])
@jwt_required()
def properties():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if request.method == 'GET':
        if user.role == 'landlord':
            properties = Property.query.filter_by(landlord_id=user_id).all()
        else:
            properties = Property.query.all()
        return {'properties': [p.to_dict() for p in properties]}, 200
    
    elif request.method == 'POST':
        if user.role != 'landlord':
            return {'error': 'Only landlords can create properties'}, 403
        
        data = request.get_json()
        property = Property(
            landlord_id=user_id,
            name=data['name'],
            address=data['address'],
            rent_amount=data['rent_amount'],
            description=data.get('description', ''),
            image_url=data.get('image_url', '')
        )
        
        db.session.add(property)
        db.session.commit()
        
        return {'property': property.to_dict()}, 201

@app.route('/api/properties/<int:property_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def property_detail(property_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    property = Property.query.get_or_404(property_id)
    
    if request.method == 'GET':
        return {'property': property.to_dict()}, 200
    
    elif request.method == 'PUT':
        if user.role != 'landlord' or property.landlord_id != user_id:
            return {'error': 'Access denied'}, 403
        
        data = request.get_json()
        property.name = data.get('name', property.name)
        property.address = data.get('address', property.address)
        property.rent_amount = data.get('rent_amount', property.rent_amount)
        property.description = data.get('description', property.description)
        property.image_url = data.get('image_url', property.image_url)
        
        db.session.commit()
        return {'property': property.to_dict()}, 200
    
    elif request.method == 'DELETE':
        if user.role != 'landlord' or property.landlord_id != user_id:
            return {'error': 'Access denied'}, 403
        
        db.session.delete(property)
        db.session.commit()
        return {'message': 'Property deleted'}, 200

# Payment Routes
@app.route('/api/payments', methods=['GET', 'POST'])
@jwt_required()
def payments():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if request.method == 'GET':
        if user.role == 'landlord':
            payments = Payment.query.join(Property).filter(Property.landlord_id == user_id).all()
        else:
            payments = Payment.query.filter_by(tenant_id=user_id).all()
        return {'payments': [p.to_dict() for p in payments]}, 200
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            payment = Payment(
                tenant_id=user_id,
                property_id=data['property_id'],
                amount=data['amount'],
                phone_number=data.get('phone_number'),
                transaction_id=f'TXN_{datetime.now().strftime("%Y%m%d%H%M%S")}'
            )
            
            db.session.add(payment)
            db.session.commit()
            
            # Send real STK Push
            mpesa_client = MpesaClient()
            stk_response = mpesa_client.stk_push(
                phone_number=data['phone_number'],
                amount=int(data['amount']),
                account_reference=f"Rent-{payment.property_id}"
            )
            
            if stk_response.get('ResponseCode') == '0':
                payment.status = 'pending'
                payment.transaction_id = stk_response.get('CheckoutRequestID')
            else:
                payment.status = 'failed'
            
            db.session.commit()
        except Exception as e:
            return {'error': str(e)}, 422
        
        return {
            'payment': payment.to_dict(),
            'message': 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete payment.'
        }, 201

# User Routes
@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    user_id = int(get_jwt_identity())
    current_user = User.query.get(user_id)
    
    if current_user.role == 'landlord':
        # Landlords can see all tenants
        users = User.query.filter_by(role='tenant').all()
        return {'users': [user.to_dict() for user in users]}, 200
    else:
        return {'error': 'Access denied'}, 403

@app.route('/api/users/count', methods=['GET'])
@jwt_required()
def get_tenant_count():
    user_id = int(get_jwt_identity())
    current_user = User.query.get(user_id)
    
    if current_user.role == 'landlord':
        tenant_count = User.query.filter_by(role='tenant').count()
        return {'count': tenant_count, 'max': 15}, 200
    else:
        return {'error': 'Access denied'}, 403

# Message Routes
@app.route('/api/messages/<int:property_id>', methods=['GET'])
@jwt_required()
def get_messages(property_id):
    try:
        user_id = int(get_jwt_identity())
        messages = Message.query.filter_by(property_id=property_id).filter(
            (Message.sender_id == user_id) | (Message.receiver_id == user_id)
        ).order_by(Message.timestamp).all()
        
        return {'messages': [m.to_dict() for m in messages]}, 200
    except Exception as e:
        return {'error': str(e)}, 422

@app.route('/api/messages', methods=['POST'])
@jwt_required()
def send_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    message = Message(
        sender_id=user_id,
        receiver_id=data['receiver_id'],
        property_id=data.get('property_id'),
        content=data['content']
    )
    
    db.session.add(message)
    db.session.commit()
    
    return {'message': message.to_dict()}, 201

@app.route('/api/mpesa/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    
    # Extract callback data
    result_code = data['Body']['stkCallback']['ResultCode']
    checkout_request_id = data['Body']['stkCallback']['CheckoutRequestID']
    
    # Find payment by checkout request ID
    payment = Payment.query.filter_by(transaction_id=checkout_request_id).first()
    
    if payment:
        if result_code == 0:  # Success
            payment.status = 'completed'
            
            # Send notification to landlord
            socketio.emit('payment_notification', {
                'tenant_name': f"{payment.tenant.first_name} {payment.tenant.last_name}",
                'amount': float(payment.amount),
                'property_id': payment.property_id,
                'transaction_id': payment.transaction_id,
                'message': f"{payment.tenant.first_name} {payment.tenant.last_name} paid KSh {payment.amount:,.2f}"
            }, room='landlords')
        else:
            payment.status = 'failed'
        
        db.session.commit()
    
    return {'ResultCode': 0, 'ResultDesc': 'Success'}, 200

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

# Socket.IO Events for Real-time Chat
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('join_landlord_room')
def handle_join_landlord_room():
    join_room('landlords')
    emit('status', {'msg': 'Joined landlord notifications'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_chat')
def handle_join_chat(data):
    room = f"property_{data['property_id']}"
    join_room(room)
    emit('status', {'msg': f"User joined chat for property {data['property_id']}"}, room=room)

@socketio.on('send_message')
def handle_send_message(data):
    # Save message to database
    message = Message(
        sender_id=data['sender_id'],
        receiver_id=data['receiver_id'],
        property_id=data.get('property_id'),
        content=data['content']
    )
    db.session.add(message)
    db.session.commit()
    
    # Emit to room
    room = f"property_{data['property_id']}"
    emit('new_message', {
        'id': message.id,
        'sender_id': message.sender_id,
        'receiver_id': message.receiver_id,
        'property_id': message.property_id,
        'content': message.content,
        'timestamp': message.timestamp.isoformat(),
        'sender': message.sender.to_dict() if message.sender else None
    }, room=room)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)