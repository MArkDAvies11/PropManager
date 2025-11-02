#!/usr/bin/env python3
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User

def create_database():
    app = create_app()
    
    with app.app_context():
        # Create all tables
        db.create_all()
        print("✅ Database tables created")
        
        # Create test users
        landlord = User(
            email='landlord@test.com',
            first_name='John', 
            last_name='Smith',
            role='landlord'
        )
        landlord.set_password('password123')
        
        tenant = User(
            email='tenant@test.com',
            first_name='Jane',
            last_name='Doe', 
            role='tenant'
        )
        tenant.set_password('mypassword')
        
        db.session.add(landlord)
        db.session.add(tenant)
        db.session.commit()
        
        print("✅ Test users created")
        print(f"Landlord: {landlord.email} - Password: password123")
        print(f"Tenant: {tenant.email} - Password: mypassword")
        
        # Test authentication
        test_landlord = User.query.filter_by(email='landlord@test.com').first()
        test_tenant = User.query.filter_by(email='tenant@test.com').first()
        
        print("\n✅ AUTHENTICATION TEST:")
        print(f"Landlord login works: {test_landlord.check_password('password123')}")
        print(f"Tenant login works: {test_tenant.check_password('mypassword')}")
        print(f"Wrong password fails: {test_tenant.check_password('wrong')}")

if __name__ == '__main__':
    create_database()