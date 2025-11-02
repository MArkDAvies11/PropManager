from flask_restful import Resource, reqparse
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User, db, UserSchema
from marshmallow import ValidationError

user_schema = UserSchema()

class RegisterResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('email', required=True, help='Email is required')
        self.parser.add_argument('password', required=True, help='Password is required')
        self.parser.add_argument('first_name', required=True)
        self.parser.add_argument('last_name', required=True)
        self.parser.add_argument('phone_number')
        self.parser.add_argument('role', choices=['landlord', 'tenant'], default='tenant')
    
    def post(self):
        try:
            args = self.parser.parse_args()
            
            if User.query.filter_by(email=args['email']).first():
                return {'error': 'User already exists'}, 409
            
            user = User(
                email=args['email'],
                first_name=args['first_name'],
                last_name=args['last_name'],
                phone_number=args.get('phone_number'),
                role=args['role']
            )
            user.set_password(args['password'])
            
            db.session.add(user)
            db.session.commit()
            
            token = create_access_token(identity=str(user.id))
            
            return {
                'success': True,
                'token': token,
                'user': user_schema.dump(user)
            }, 201
            
        except ValidationError as err:
            return {'errors': err.messages}, 400

class LoginResource(Resource):
    def __init__(self):
        self.parser = reqparse.RequestParser()
        self.parser.add_argument('email', required=True)
        self.parser.add_argument('password', required=True)
    
    def post(self):
        args = self.parser.parse_args()
        
        user = User.query.filter_by(email=args['email']).first()
        
        if not user or not user.check_password(args['password']):
            return {'error': 'Invalid credentials'}, 401
        
        token = create_access_token(identity=str(user.id))
        
        return {
            'success': True,
            'token': token,
            'user': user_schema.dump(user)
        }, 200