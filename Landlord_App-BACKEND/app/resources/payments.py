from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Payment, Property, User, db
from app.schemas.payment import PaymentSchema, PaymentCreateSchema
from app.utils.mpesa import PayHeroClient
from app.utils.email import send_payment_confirmation
from datetime import datetime
import uuid
from marshmallow import ValidationError

class PaymentList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        if user.role == 'landlord':
            # Get payments for landlord's properties
            payments = Payment.query.join(Property).filter(Property.landlord_id == user.id).all()
        elif user.role == 'tenant':
            payments = Payment.query.filter_by(tenant_id=user.id).all()
        else:
            payments = Payment.query.all()
        
        return {'payments': [payment.to_dict() for payment in payments]}, 200

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        schema = PaymentCreateSchema()
        try:
            data = schema.load(request.json)
        except ValidationError as err:
            return {'errors': err.messages}, 400
        
        property = Property.query.get_or_404(data['property_id'])
        
        # Verify tenant can pay for this property
        if user.role == 'tenant' and property.tenant_id != user.id:
            return {'error': 'You can only pay for your assigned property'}, 403
        
        payment = Payment(
            amount=data['amount'],
            payment_date=datetime.utcnow(),
            payment_method=data.get('payment_method', 'mpesa'),
            property_id=data['property_id'],
            tenant_id=user.id,
            reference=str(uuid.uuid4()),
            phone_number=data.get('phone_number')
        )
        
        db.session.add(payment)
        db.session.commit()
        
        # Process M-Pesa payment using PayHero
        if payment.payment_method.value == 'mpesa' and payment.phone_number:
            payhero = PayHeroClient()
            result = payhero.initiate_stk_push(
                payment.phone_number,
                payment.amount,
                payment.reference
            )
            
            if result['success'] and 'CheckoutRequestID' in result['data']:
                payment.mpesa_checkout_id = result['data']['CheckoutRequestID']
                db.session.commit()
            else:
                payment.status = 'failed'
                db.session.commit()
                return {'error': result.get('error', 'Payment initiation failed')}, 400
        
        return {'payment': payment.to_dict()}, 201

class PaymentDetail(Resource):
    @jwt_required()
    def get(self, payment_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        payment = Payment.query.get_or_404(payment_id)
        
        # Check access permissions
        if user.role == 'tenant' and payment.tenant_id != user.id:
            return {'error': 'Access denied'}, 403
        elif user.role == 'landlord' and payment.property.landlord_id != user.id:
            return {'error': 'Access denied'}, 403
        
        return {'payment': payment.to_dict()}, 200
    
    @jwt_required()
    def put(self, payment_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        payment = Payment.query.get_or_404(payment_id)
        
        # Only landlords can update payment status
        if user.role != 'landlord' or payment.property.landlord_id != user.id:
            return {'error': 'Only property owner can update payment status'}, 403
        
        data = request.json
        if 'status' in data:
            payment.status = data['status']
            
            # Send confirmation email if payment is completed
            if payment.status.value == 'completed':
                send_payment_confirmation(payment)
        
        db.session.commit()
        return {'payment': payment.to_dict()}, 200

class PaymentCallback(Resource):
    def post(self):
        """PayHero callback endpoint"""
        data = request.json
        
        if data and 'response' in data:
            response = data['response']
            checkout_id = response.get('CheckoutRequestID')
            
            payment = Payment.query.filter_by(mpesa_checkout_id=checkout_id).first()
            if payment:
                if response.get('ResultCode') == '0':
                    payment.status = 'completed'
                    # Store M-Pesa receipt number if available
                    if 'MpesaReceiptNumber' in response:
                        payment.reference = response['MpesaReceiptNumber']
                    send_payment_confirmation(payment)
                else:
                    payment.status = 'failed'
                
                db.session.commit()
        
        return {'status': 'success', 'message': 'Callback processed'}, 200