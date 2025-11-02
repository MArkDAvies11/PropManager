import requests
import base64
import os
from datetime import datetime
import json

class PayHeroClient:
    def __init__(self):
        self.api_username = os.environ.get('PAYHERO_USERNAME', '')
        self.api_password = os.environ.get('PAYHERO_PASSWORD', '')
        self.channel_id = 615  # M-Pesa channel ID
        self.callback_url = os.environ.get('PAYHERO_CALLBACK_URL', 'http://localhost:5000/api/payments/callback')
        self.api_url = 'https://backend.payhero.co.ke/api/v2/payments'
    
    def generate_auth_token(self):
        credentials = f"{self.api_username}:{self.api_password}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return f'Basic {encoded_credentials}'
    
    def initiate_stk_push(self, phone_number, amount, external_reference):
        auth_token = self.generate_auth_token()
        
        payload = {
            "amount": float(amount),
            "phone_number": phone_number,
            "channel_id": self.channel_id,
            "provider": "m-pesa",
            "external_reference": external_reference,
            "callback_url": self.callback_url
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': auth_token
        }
        
        try:
            response = requests.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                return {
                    'success': True,
                    'data': response.json()
                }
            else:
                return {
                    'success': False,
                    'error': f'HTTP {response.status_code}: {response.text}'
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f'Request failed: {str(e)}'
            }
