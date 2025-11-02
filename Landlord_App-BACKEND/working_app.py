# PropManager Backend - Main Application File
# This is the core Flask application that handles:
# - User authentication (landlord and tenant login/registration)
# - Property management (CRUD operations)
# - Payment processing via M-Pesa STK Push
# - Real-time chat messaging between landlords and tenants
# - Database models for users, properties, payments, and messages

# Import Flask framework and extensions
from flask import Flask, request, jsonify
from flask_cors import CORS  # Enable Cross-Origin Resource Sharing for frontend communication
from flask_sqlalchemy import SQLAlchemy  # ORM for database operations
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity  # JWT authentication
from flask_socketio import SocketIO, emit, join_room, leave_room  # Real-time WebSocket communication
from werkzeug.security import generate_password_hash, check_password_hash  # Password hashing for security
from datetime import datetime
import os
from dotenv import load_dotenv  # Load environment variables from .env file
import sys
sys.path.append('.')
from mpesa_direct import MpesaClient  # M-Pesa payment integration

# Load environment variables (API keys, secrets, etc.)
load_dotenv()

# Initialize Flask application
app = Flask(__name__)

# Application configuration
app.config['SECRET_KEY'] = 'dev-secret-key'  # Secret key for session management
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key'  # Secret key for JWT token generation
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///landlord_system.db'  # SQLite database file location
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable modification tracking to save resources

# Initialize extensions
db = SQLAlchemy(app)  # Database ORM
jwt = JWTManager(app)  # JWT authentication manager
socketio = SocketIO(app, cors_allowed_origins="*")  # WebSocket for real-time features
CORS(app, origins='*', supports_credentials=True)  # Enable CORS for all origins (frontend can access API)

# ============================================
# DATABASE MODELS
# ============================================

# User Model - Stores both landlords and tenants
# System allows: 1 landlord and up to 15 tenants
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique user ID
    email = db.Column(db.String(120), unique=True, nullable=False)  # Email for login (must be unique)
    password_hash = db.Column(db.String(255), nullable=False)  # Hashed password (never store plain text)
    first_name = db.Column(db.String(50), nullable=False)  # User's first name
    last_name = db.Column(db.String(50), nullable=False)  # User's last name
    phone_number = db.Column(db.String(20))  # Phone number for M-Pesa payments
    house_number = db.Column(db.String(20), unique=True)  # House/unit number (required for tenants, unique)
    role = db.Column(db.String(20), default='tenant')  # User role: 'landlord' or 'tenant'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Account creation timestamp
    
    # Hash password before storing (security best practice)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    # Verify password during login
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    # Convert user object to dictionary for JSON responses
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

# Property Model - Stores rental properties managed by landlord
class Property(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique property ID
    landlord_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Owner of the property
    name = db.Column(db.String(200), nullable=False)  # Property name/title
    address = db.Column(db.String(500), nullable=False)  # Physical address
    rent_amount = db.Column(db.Float, nullable=False)  # Monthly rent (currently fixed at KES 20,000)
    description = db.Column(db.Text)  # Property description/details
    image_url = db.Column(db.String(500))  # Property image URL
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # Property creation timestamp
    
    # Relationship: Link property to its landlord
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

# Payment Model - Stores rent payment transactions via M-Pesa
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique payment ID
    tenant_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Tenant making payment
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False)  # Property being paid for
    amount = db.Column(db.Float, nullable=False)  # Payment amount (KES 20,000)
    payment_method = db.Column(db.String(50), default='mpesa')  # Payment method (M-Pesa STK Push)
    transaction_id = db.Column(db.String(100))  # M-Pesa transaction/checkout ID
    status = db.Column(db.String(20), default='pending')  # Status: pending, completed, or failed
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)  # Payment timestamp
    phone_number = db.Column(db.String(20))  # Phone number used for M-Pesa payment
    
    # Relationships: Link payment to tenant and property
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

# Message Model - Stores chat messages between landlord and tenants
# Uses polling (every 2 seconds) for real-time updates instead of WebSockets
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique message ID
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # User who sent the message
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # User receiving the message
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'))  # Related property (optional)
    content = db.Column(db.Text, nullable=False)  # Message text content
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # When message was sent
    read = db.Column(db.Boolean, default=False)  # Whether message has been read
    
    # Relationships: Link message to sender, receiver, and property
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

# ============================================
# AUTHENTICATION ROUTES
# ============================================

# User Registration Endpoint
# POST /api/auth/register
# Registers new landlord or tenant accounts with validation:
# - Only 1 landlord allowed in the system
# - Maximum 15 tenants allowed
# - House numbers must be unique for tenants
@app.route('/api/auth/register', methods=['POST'])
def register():
    # Extract registration data from request
    data = request.get_json()
    
    # Parse user input (support both camelCase and snake_case)
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName') or data.get('first_name', 'User')
    last_name = data.get('lastName') or data.get('last_name', 'Name')
    phone_number = data.get('phone_number') or data.get('phoneNumber')
    house_number = data.get('house_number') or data.get('houseNumber')
    role = data.get('role', 'tenant')  # Default to tenant if not specified
    
    # Validate required fields
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    
    # LANDLORD LIMIT: Only 1 landlord allowed in the system
    if role == 'landlord':
        landlord_count = User.query.filter_by(role='landlord').count()
        if landlord_count >= 1:
            return {'error': 'A landlord account already exists. Only one landlord is allowed.'}, 403
    
    # TENANT VALIDATIONS
    if role == 'tenant':
        # House number is required for tenants
        if not house_number:
            return {'error': 'House number is required for tenants'}, 400
        
        # House number must be unique (no duplicate assignments)
        if User.query.filter_by(house_number=house_number).first():
            return {'error': 'House number already assigned to another tenant'}, 409
        
        # TENANT LIMIT: Maximum 15 tenants allowed
        tenant_count = User.query.filter_by(role='tenant').count()
        if tenant_count >= 15:
            return {'error': 'Maximum tenant limit (15) reached. No more tenants can register.'}, 403
    
    # Check if email already exists
    if User.query.filter_by(email=email).first():
        return {'error': 'User already exists'}, 409
    
    # Create new user account
    user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        house_number=house_number if role == 'tenant' else None,  # Only tenants have house numbers
        role=role
    )
    user.set_password(password)  # Hash password before storing
    
    # Save user to database
    db.session.add(user)
    db.session.commit()
    
    # Generate JWT token for automatic login after registration
    token = create_access_token(identity=str(user.id))
    
    # Return success response with token and user data
    return {
        'success': True,
        'token': token,
        'user': user.to_dict()
    }, 201

# User Login Endpoint
# POST /api/auth/login
# Authenticates user with email and password, returns JWT token
@app.route('/api/auth/login', methods=['POST'])
def login():
    # Extract login credentials
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    # Validate required fields
    if not email or not password:
        return {'error': 'Email and password required'}, 400
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    # Verify user exists and password is correct
    if not user or not user.check_password(password):
        return {'error': 'Invalid credentials'}, 401
    
    # Generate JWT token (expires after 15 minutes)
    token = create_access_token(identity=str(user.id))
    
    # Return success response with token and user data
    return {
        'success': True,
        'token': token,
        'user': user.to_dict()
    }, 200

# ============================================
# PROPERTY ROUTES (Full CRUD)
# ============================================

# List Properties & Create New Property
# GET /api/properties - List all properties (landlord sees their own, tenants see all)
# POST /api/properties - Create new property (landlord only)
@app.route('/api/properties', methods=['GET', 'POST'])
@jwt_required()  # Requires valid JWT token
def properties():
    # Get current user from JWT token
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # GET: Retrieve properties list
    if request.method == 'GET':
        if user.role == 'landlord':
            # Landlord sees only their own properties
            properties = Property.query.filter_by(landlord_id=user_id).all()
        else:
            # Tenants see all available properties
            properties = Property.query.all()
        return {'properties': [p.to_dict() for p in properties]}, 200
    
    # POST: Create new property (landlord only)
    elif request.method == 'POST':
        # Only landlords can create properties
        if user.role != 'landlord':
            return {'error': 'Only landlords can create properties'}, 403
        
        # Extract property data from request
        data = request.get_json()
        property = Property(
            landlord_id=user_id,
            name=data['name'],
            address=data['address'],
            rent_amount=data['rent_amount'],  # Currently fixed at KES 20,000
            description=data.get('description', ''),
            image_url=data.get('image_url', '')
        )
        
        # Save property to database
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

# ============================================
# PAYMENT ROUTES (M-Pesa Integration)
# ============================================

# List Payments & Initiate New Payment
# GET /api/payments - List all payments (landlord sees all, tenant sees their own)
# POST /api/payments - Initiate M-Pesa STK Push payment (tenant only)
@app.route('/api/payments', methods=['GET', 'POST'])
@jwt_required()  # Requires valid JWT token
def payments():
    # Get current user from JWT token
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # GET: Retrieve payment history
    if request.method == 'GET':
        if user.role == 'landlord':
            # Landlord sees all payments for their properties
            payments = Payment.query.join(Property).filter(Property.landlord_id == user_id).all()
        else:
            # Tenant sees only their own payments
            payments = Payment.query.filter_by(tenant_id=user_id).all()
        return {'payments': [p.to_dict() for p in payments]}, 200
    
    # POST: Initiate new payment via M-Pesa STK Push
    elif request.method == 'POST':
        try:
            # Extract payment data
            data = request.get_json()
            
            # Create payment record (initially pending)
            payment = Payment(
                tenant_id=user_id,
                property_id=data['property_id'],
                amount=data['amount'],  # KES 20,000 (fixed rent amount)
                phone_number=data.get('phone_number'),
                transaction_id=f'TXN_{datetime.now().strftime("%Y%m%d%H%M%S")}'
            )
            
            # Save payment to database
            db.session.add(payment)
            db.session.commit()
            
            # Send M-Pesa STK Push to tenant's phone
            # This prompts the user to enter their M-Pesa PIN
            mpesa_client = MpesaClient()
            stk_response = mpesa_client.stk_push(
                phone_number=data['phone_number'],
                amount=int(data['amount']),
                account_reference=f"Rent-{payment.property_id}"
            )
            
            # Update payment status based on STK Push response
            if stk_response.get('ResponseCode') == '0':
                payment.status = 'pending'  # Waiting for user to enter PIN
                payment.transaction_id = stk_response.get('CheckoutRequestID')
            else:
                payment.status = 'failed'  # STK Push failed
            
            db.session.commit()
        except Exception as e:
            return {'error': str(e)}, 422
        
        # Return success response
        return {
            'payment': payment.to_dict(),
            'message': 'STK Push sent to your phone. Please enter your M-Pesa PIN to complete payment.'
        }, 201

# ============================================
# USER ROUTES
# ============================================

# Get All Tenants (Landlord Only)
# GET /api/users - Returns list of all tenants with their details
# Used in landlord dashboard to display tenant information modal
@app.route('/api/users', methods=['GET'])
@jwt_required()  # Requires valid JWT token
def get_users():
    # Get current user from JWT token
    user_id = int(get_jwt_identity())
    current_user = User.query.get(user_id)
    
    # Only landlords can view tenant list
    if current_user.role == 'landlord':
        # Fetch all tenants (excludes landlord)
        users = User.query.filter_by(role='tenant').all()
        return {'users': [user.to_dict() for user in users]}, 200
    else:
        return {'error': 'Access denied'}, 403

# Get Tenant Count (Landlord Only)
# GET /api/users/count - Returns current tenant count and maximum limit
# Used in landlord dashboard to show "X/15 tenants"
@app.route('/api/users/count', methods=['GET'])
@jwt_required()  # Requires valid JWT token
def get_tenant_count():
    # Get current user from JWT token
    user_id = int(get_jwt_identity())
    current_user = User.query.get(user_id)
    
    # Only landlords can view tenant count
    if current_user.role == 'landlord':
        tenant_count = User.query.filter_by(role='tenant').count()
        return {'count': tenant_count, 'max': 15}, 200
    else:
        return {'error': 'Access denied'}, 403

# ============================================
# MESSAGE ROUTES (Real-time Chat)
# ============================================

# Get Messages for Property
# GET /api/messages/<property_id> - Retrieves chat history for a property
# Returns messages where current user is sender or receiver
# Frontend polls this endpoint every 2 seconds for real-time updates
@app.route('/api/messages/<int:property_id>', methods=['GET'])
@jwt_required()  # Requires valid JWT token
def get_messages(property_id):
    try:
        # Get current user from JWT token
        user_id = int(get_jwt_identity())
        
        # Fetch messages where user is sender OR receiver
        messages = Message.query.filter_by(property_id=property_id).filter(
            (Message.sender_id == user_id) | (Message.receiver_id == user_id)
        ).order_by(Message.timestamp).all()  # Ordered by time (oldest first)
        
        return {'messages': [m.to_dict() for m in messages]}, 200
    except Exception as e:
        return {'error': str(e)}, 422

# Send New Message
# POST /api/messages - Sends a new chat message
# Used by both landlord and tenants to communicate
@app.route('/api/messages', methods=['POST'])
@jwt_required()  # Requires valid JWT token
def send_message():
    # Get current user from JWT token
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Create new message
    message = Message(
        sender_id=user_id,
        receiver_id=data['receiver_id'],
        property_id=data.get('property_id'),
        content=data['content']
    )
    
    # Save message to database
    db.session.add(message)
    db.session.commit()
    
    return {'message': message.to_dict()}, 201

# ============================================
# M-PESA CALLBACK ROUTE
# ============================================

# M-Pesa Payment Callback
# POST /api/mpesa/callback - Receives payment status from M-Pesa
# Called by M-Pesa servers after user completes/cancels payment
# Updates payment status and notifies landlord via WebSocket
@app.route('/api/mpesa/callback', methods=['POST'])
def mpesa_callback():
    # Extract callback data from M-Pesa
    data = request.get_json()
    
    # Parse M-Pesa response
    result_code = data['Body']['stkCallback']['ResultCode']  # 0 = success, other = failed
    checkout_request_id = data['Body']['stkCallback']['CheckoutRequestID']  # Transaction ID
    
    # Find payment record by checkout request ID
    payment = Payment.query.filter_by(transaction_id=checkout_request_id).first()
    
    if payment:
        if result_code == 0:  # Payment successful
            payment.status = 'completed'
            
            # Send real-time notification to landlord via WebSocket
            socketio.emit('payment_notification', {
                'tenant_name': f"{payment.tenant.first_name} {payment.tenant.last_name}",
                'amount': float(payment.amount),
                'property_id': payment.property_id,
                'transaction_id': payment.transaction_id,
                'message': f"{payment.tenant.first_name} {payment.tenant.last_name} paid KSh {payment.amount:,.2f}"
            }, room='landlords')
        else:  # Payment failed or cancelled
            payment.status = 'failed'
        
        # Update payment status in database
        db.session.commit()
    
    # Acknowledge receipt to M-Pesa
    return {'ResultCode': 0, 'ResultDesc': 'Success'}, 200

# Health Check Endpoint
# GET /health - Simple endpoint to verify server is running
@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

# ============================================
# SOCKET.IO EVENTS (Real-time Features)
# Note: Currently using polling instead of WebSockets for reliability
# ============================================

# Client Connected Event
@socketio.on('connect')
def handle_connect():
    print('Client connected')

# Landlord Joins Notification Room
# Landlords join this room to receive real-time payment notifications
@socketio.on('join_landlord_room')
def handle_join_landlord_room():
    join_room('landlords')
    emit('status', {'msg': 'Joined landlord notifications'})

# Client Disconnected Event
@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

# User Joins Chat Room for Property
@socketio.on('join_chat')
def handle_join_chat(data):
    room = f"property_{data['property_id']}"
    join_room(room)
    emit('status', {'msg': f"User joined chat for property {data['property_id']}"}, room=room)

# Send Message via WebSocket
# Alternative to REST API for sending messages
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
    
    # Broadcast message to all users in the property chat room
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

# ============================================
# APPLICATION STARTUP
# ============================================

if __name__ == '__main__':
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Start Flask server with Socket.IO support
    # Runs on http://0.0.0.0:5000 (accessible from any network interface)
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, allow_unsafe_werkzeug=True)