from flask_restful import Resource
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import MaintenanceRequest, Property, User, db

class MaintenanceRequestList(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        if user.role == 'landlord':
            # Get maintenance requests for landlord's properties
            requests = MaintenanceRequest.query.join(Property).filter(Property.landlord_id == user.id).all()
        elif user.role == 'tenant':
            requests = MaintenanceRequest.query.filter_by(tenant_id=user.id).all()
        else:
            requests = MaintenanceRequest.query.all()
        
        return {'maintenance_requests': [req.to_dict() for req in requests]}, 200

    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        data = request.json
        property = Property.query.get_or_404(data['property_id'])
        
        # Verify tenant can create request for this property
        if user.role == 'tenant' and property.tenant_id != user.id:
            return {'error': 'You can only create requests for your assigned property'}, 403
        
        maintenance_request = MaintenanceRequest(
            title=data['title'],
            description=data['description'],
            priority=data.get('priority', 'medium'),
            property_id=data['property_id'],
            tenant_id=user.id
        )
        
        db.session.add(maintenance_request)
        db.session.commit()
        
        return {'maintenance_request': maintenance_request.to_dict()}, 201

class MaintenanceRequestDetail(Resource):
    @jwt_required()
    def get(self, request_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        maintenance_request = MaintenanceRequest.query.get_or_404(request_id)
        
        # Check access permissions
        if user.role == 'tenant' and maintenance_request.tenant_id != user.id:
            return {'error': 'Access denied'}, 403
        elif user.role == 'landlord' and maintenance_request.property.landlord_id != user.id:
            return {'error': 'Access denied'}, 403
        
        return {'maintenance_request': maintenance_request.to_dict()}, 200
    
    @jwt_required()
    def put(self, request_id):
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        maintenance_request = MaintenanceRequest.query.get_or_404(request_id)
        
        # Only landlords can update status
        if user.role != 'landlord' or maintenance_request.property.landlord_id != user.id:
            return {'error': 'Only property owner can update request status'}, 403
        
        data = request.json
        if 'status' in data:
            maintenance_request.status = data['status']
        
        db.session.commit()
        return {'maintenance_request': maintenance_request.to_dict()}, 200