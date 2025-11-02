from .base import BaseModel, db
import enum

class MaintenanceStatus(enum.Enum):
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'

class MaintenancePriority(enum.Enum):
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    URGENT = 'urgent'

class MaintenanceRequest(BaseModel):
    __tablename__ = 'maintenance_requests'
    
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(20), default='medium')
    status = db.Column(db.String(20), default='pending')
    
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    property = db.relationship('Property', backref='maintenance_requests')
    tenant = db.relationship('User', backref='maintenance_requests')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'status': self.status,
            'property_id': self.property_id,
            'tenant_id': self.tenant_id,
            'property': self.property.to_dict() if self.property else None,
            'tenant': self.tenant.to_dict() if self.tenant else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }