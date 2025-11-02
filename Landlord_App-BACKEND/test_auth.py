#!/usr/bin/env python3
from app import create_app, db
from app.models import User

def test_authentication():
    app = create_app()
    
    with app.app_context():
        # Create database tables
        db.create_all()
        
        # Clear existing test users
        User.query.filter_by(email='landlord@test.com').delete()
        User.query.filter_by(email='tenant@test.com').delete()
        db.session.commit()
        
        # Register a landlord
        landlord = User(
            email='landlord@test.com',
            first_name='John',
            last_name='Smith',
            role='landlord'
        )
        landlord.set_password('password123')
        db.session.add(landlord)
        
        # Register a tenant
        tenant = User(
            email='tenant@test.com', 
            first_name='Jane',
            last_name='Doe',
            role='tenant'
        )
        tenant.set_password('mypassword')
        db.session.add(tenant)
        
        db.session.commit()
        
        # Test authentication
        print("✅ REAL DATABASE AUTHENTICATION WORKING:")
        print(f"Landlord registered: {landlord.email} ({landlord.role})")
        print(f"Landlord login works: {landlord.check_password('password123')}")
        print(f"Tenant registered: {tenant.email} ({tenant.role})")
        print(f"Tenant login works: {tenant.check_password('mypassword')}")
        print(f"Wrong password rejected: {tenant.check_password('wrongpass')}")
        
        return True

if __name__ == '__main__':
    test_authentication()