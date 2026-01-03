# models.py - Complete models with AI features

from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Topic(db.Model):
    __tablename__ = 'topics'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    tags = db.Column(db.String(255))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Sentiment tracking
    sentiment_score = db.Column(db.Integer, default=0)
    sentiment_count = db.Column(db.Integer, default=0)
    positive_count = db.Column(db.Integer, default=0)
    negative_count = db.Column(db.Integer, default=0)
    distilled_points = db.Column(db.Text, default="")
    
    # Poll fields
    has_poll = db.Column(db.Boolean, default=False)
    poll_question = db.Column(db.String(500))
    
    # Moderation fields
    status = db.Column(db.String(20), default='active')
    priority = db.Column(db.String(20), default='normal')
    
    # Relationships
    posts = db.relationship('Post', backref='topic', lazy=True, cascade='all, delete-orphan')
    poll_options = db.relationship('PollOption', backref='topic', lazy=True, cascade='all, delete-orphan')
    sentiment_history = db.relationship('SentimentHistory', backref='topic', lazy=True, cascade='all, delete-orphan')
    summaries = db.relationship('AISummary', backref='topic', lazy=True, cascade='all, delete-orphan')

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    key_points = db.Column(db.Text)
    sentiment = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PollOption(db.Model):
    __tablename__ = 'poll_options'
    
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    option_text = db.Column(db.String(255), nullable=False)
    vote_count = db.Column(db.Integer, default=0)
    
    votes = db.relationship('PollVote', backref='option', lazy=True, cascade='all, delete-orphan')

class PollVote(db.Model):
    __tablename__ = 'poll_votes'
    
    id = db.Column(db.Integer, primary_key=True)
    option_id = db.Column(db.Integer, db.ForeignKey('poll_options.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        db.UniqueConstraint('option_id', 'user_id', name='unique_vote'),
    )

# ==================== AI-RELATED MODELS ====================

class SentimentHistory(db.Model):
    """Track sentiment changes over time"""
    __tablename__ = 'sentiment_history'
    
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    sentiment_score = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)

class AISummary(db.Model):
    """Store AI-generated summaries"""
    __tablename__ = 'ai_summaries'
    
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

class TopicCluster(db.Model):
    """Store topic clusters for visualization"""
    __tablename__ = 'topic_clusters'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    topics = db.relationship('ClusterTopic', backref='cluster', lazy=True)

class ClusterTopic(db.Model):
    """Many-to-many relationship between clusters and topics"""
    __tablename__ = 'cluster_topics'
    
    cluster_id = db.Column(db.Integer, db.ForeignKey('topic_clusters.id'), primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), primary_key=True)
    similarity_score = db.Column(db.Float)

class DuplicateCandidate(db.Model):
    """Store detected duplicate topics"""
    __tablename__ = 'duplicate_candidates'
    
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    duplicate_of = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    similarity_score = db.Column(db.Float, nullable=False)
    detected_at = db.Column(db.DateTime, default=datetime.utcnow)

class PredictionScore(db.Model):
    """Store AI predictions for topics"""
    __tablename__ = 'prediction_scores'
    
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('topics.id'), nullable=False)
    escalation_risk = db.Column(db.Float)  # 0-1 score
    predicted_resolution_time = db.Column(db.Integer)  # in hours
    confidence = db.Column(db.Float)  # 0-1 score
    created_at = db.Column(db.DateTime, default=datetime.utcnow)