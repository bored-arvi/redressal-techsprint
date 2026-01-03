# services/ai_service.py - Main AI orchestration service

import google.generativeai as genai
import os
from datetime import datetime, timedelta
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Configure Gemini
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

class AIService:
    """Comprehensive AI service for the platform"""
    
    def __init__(self):
        self.embedding_cache = {}
        self.summary_cache = {}
    
    # ==================== SENTIMENT ANALYSIS ====================
    
    def analyze_sentiment(self, text):
        """Analyze sentiment of a single text"""
        prompt = f"""Analyze the sentiment of this text. Respond with ONLY a JSON object:
{{
  "sentiment": "positive" | "negative" | "neutral",
  "score": <number from -1 to 1>,
  "confidence": <number from 0 to 1>,
  "key_emotion": "angry" | "sad" | "happy" | "frustrated" | "satisfied" | "neutral"
}}

Text: "{text}"

Respond with ONLY the JSON, no other text."""

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Clean response
            text = text.replace('```json', '').replace('```', '').strip()
            
            data = json.loads(text)
            return {
                'sentiment': data.get('sentiment', 'neutral'),
                'score': float(data.get('score', 0)),
                'confidence': float(data.get('confidence', 0.5)),
                'emotion': data.get('key_emotion', 'neutral')
            }
        except Exception as e:
            print(f"Sentiment analysis error: {e}")
            return {
                'sentiment': 'neutral',
                'score': 0,
                'confidence': 0,
                'emotion': 'neutral'
            }
    
    def get_sentiment_timeline(self, topic_id):
        """Get sentiment history for a topic"""
        from models import SentimentHistory
        from database import db
        
        history = SentimentHistory.query.filter_by(topic_id=topic_id)\
            .order_by(SentimentHistory.timestamp.asc()).all()
        
        return [{
            'timestamp': h.timestamp.isoformat(),
            'score': h.sentiment_score,
            'moving_avg': self._calculate_moving_average(history, h.timestamp)
        } for h in history]
    
    def _calculate_moving_average(self, history, current_time, window_hours=24):
        """Calculate moving average of sentiment"""
        start_time = current_time - timedelta(hours=window_hours)
        recent = [h.sentiment_score for h in history 
                 if h.timestamp >= start_time and h.timestamp <= current_time]
        return sum(recent) / len(recent) if recent else 0
    
    # ==================== SUMMARIZATION ====================
    
    def summarize_discussion(self, topic_title, posts):
        """Generate AI summary of a topic discussion"""
        cache_key = f"summary_{hash(topic_title + str(len(posts)))}"
        
        if cache_key in self.summary_cache:
            return self.summary_cache[cache_key]
        
        # Limit to most recent/relevant posts
        post_texts = [p.content for p in posts[:50]]  # Latest 50 posts
        combined = "\n".join(post_texts)
        
        prompt = f"""Summarize this discussion thread in 3-4 concise sentences.
Topic: {topic_title}

Posts:
{combined}

Summary:"""

        try:
            response = model.generate_content(prompt)
            summary = response.text.strip()
            self.summary_cache[cache_key] = summary
            return summary
        except Exception as e:
            print(f"Summarization error: {e}")
            return "Unable to generate summary at this time."
    
    # ==================== TOPIC CLUSTERING ====================
    
    def get_topic_embedding(self, text):
        """Get embedding vector for text"""
        cache_key = hash(text)
        
        if cache_key in self.embedding_cache:
            return self.embedding_cache[cache_key]
        
        try:
            # Use Gemini's embedding API or a simpler approach
            # For now, we'll use a simple hashing approach
            # In production, use proper embeddings
            embedding = self._simple_embedding(text)
            self.embedding_cache[cache_key] = embedding
            return embedding
        except Exception as e:
            print(f"Embedding error: {e}")
            return None
    
    def _simple_embedding(self, text):
        """Simple text embedding (replace with proper embeddings in production)"""
        # This is a placeholder - use sentence-transformers or OpenAI embeddings
        words = text.lower().split()
        # Create a simple frequency-based embedding
        vocab_size = 1000
        embedding = np.zeros(vocab_size)
        for word in words:
            idx = hash(word) % vocab_size
            embedding[idx] += 1
        return embedding / (np.linalg.norm(embedding) + 1e-10)
    
    def find_similar_topics(self, topic_id, limit=5):
        """Find topics similar to the given topic"""
        from models import Topic
        
        target_topic = Topic.query.get(topic_id)
        if not target_topic:
            return []
        
        target_text = f"{target_topic.title} {target_topic.distilled_points}"
        target_embedding = self.get_topic_embedding(target_text)
        
        if target_embedding is None:
            return []
        
        # Get all other topics
        all_topics = Topic.query.filter(Topic.id != topic_id).all()
        similarities = []
        
        for topic in all_topics:
            topic_text = f"{topic.title} {topic.distilled_points}"
            embedding = self.get_topic_embedding(topic_text)
            
            if embedding is not None:
                similarity = cosine_similarity(
                    target_embedding.reshape(1, -1),
                    embedding.reshape(1, -1)
                )[0][0]
                
                similarities.append({
                    'topic_id': topic.id,
                    'title': topic.title,
                    'similarity': float(similarity),
                    'tags': topic.tags.split(',') if topic.tags else []
                })
        
        # Sort by similarity and return top N
        similarities.sort(key=lambda x: x['similarity'], reverse=True)
        return similarities[:limit]
    
    # ==================== DUPLICATE DETECTION ====================
    
    def detect_duplicates(self, topic_id, threshold=0.85):
        """Detect potential duplicate topics"""
        similar = self.find_similar_topics(topic_id, limit=10)
        duplicates = [s for s in similar if s['similarity'] >= threshold]
        return duplicates
    
    # ==================== AUTO-TAGGING ====================
    
    def suggest_tags(self, title, content):
        """AI-powered tag suggestions"""
        prompt = f"""Based on this topic, suggest 3-5 relevant tags.
Title: {title}
Content: {content}

Respond with ONLY a JSON array of tags: ["tag1", "tag2", "tag3"]
Tags should be single words or short phrases, lowercase."""

        try:
            response = model.generate_content(prompt)
            text = response.text.strip()
            text = text.replace('```json', '').replace('```', '').strip()
            tags = json.loads(text)
            return tags[:5]  # Max 5 tags
        except Exception as e:
            print(f"Tag suggestion error: {e}")
            return []
    
    # ==================== PREDICTIVE ANALYTICS ====================
    
    def predict_escalation_risk(self, topic):
        """Predict if a topic will escalate (0-1 score)"""
        # Factors that indicate escalation risk:
        factors = {
            'sentiment': min(abs(topic.sentiment_score) / 10, 1.0),  # Higher absolute sentiment = risk
            'velocity': self._calculate_velocity(topic),  # Rate of new posts
            'negative_ratio': topic.negative_count / max(topic.sentiment_count, 1),
            'recency': self._recency_score(topic.created_at)
        }
        
        # Weighted average
        weights = {'sentiment': 0.3, 'velocity': 0.3, 'negative_ratio': 0.3, 'recency': 0.1}
        risk_score = sum(factors[k] * weights[k] for k in factors)
        
        return {
            'risk_score': min(risk_score, 1.0),
            'risk_level': self._get_risk_level(risk_score),
            'factors': factors
        }
    
    def _calculate_velocity(self, topic):
        """Calculate posting velocity (posts per hour)"""
        from models import Post
        from datetime import datetime, timedelta
        
        recent_posts = Post.query.filter(
            Post.topic_id == topic.id,
            Post.created_at >= datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        return min(recent_posts / 24, 1.0)  # Normalize to 0-1
    
    def _recency_score(self, created_at):
        """Score based on how recent the topic is"""
        age_hours = (datetime.utcnow() - created_at).total_seconds() / 3600
        return max(0, 1 - (age_hours / (7 * 24)))  # Decay over a week
    
    def _get_risk_level(self, score):
        """Convert score to risk level"""
        if score >= 0.75:
            return 'critical'
        elif score >= 0.5:
            return 'high'
        elif score >= 0.25:
            return 'medium'
        else:
            return 'low'
    
    # ==================== SEARCH ====================
    
    def semantic_search(self, query, topics, limit=10):
        """Semantic search across topics"""
        query_embedding = self.get_topic_embedding(query)
        
        if query_embedding is None:
            # Fallback to keyword search
            return [t for t in topics if query.lower() in t.title.lower()][:limit]
        
        results = []
        for topic in topics:
            topic_text = f"{topic.title} {topic.distilled_points}"
            embedding = self.get_topic_embedding(topic_text)
            
            if embedding is not None:
                similarity = cosine_similarity(
                    query_embedding.reshape(1, -1),
                    embedding.reshape(1, -1)
                )[0][0]
                
                results.append({
                    'topic': topic,
                    'relevance': float(similarity)
                })
        
        results.sort(key=lambda x: x['relevance'], reverse=True)
        return [r['topic'] for r in results[:limit]]
    
    # ==================== ANALYTICS ====================
    
    def generate_insights(self, time_period='7d'):
        """Generate platform-wide insights"""
        from models import Topic, Post
        from database import db
        from datetime import datetime, timedelta
        
        # Calculate time range
        if time_period == '7d':
            start_date = datetime.utcnow() - timedelta(days=7)
        elif time_period == '30d':
            start_date = datetime.utcnow() - timedelta(days=30)
        else:
            start_date = datetime.utcnow() - timedelta(days=1)
        
        # Get stats
        total_topics = Topic.query.filter(Topic.created_at >= start_date).count()
        total_posts = Post.query.filter(Post.created_at >= start_date).count()
        
        avg_sentiment = db.session.query(db.func.avg(Topic.sentiment_score))\
            .filter(Topic.created_at >= start_date).scalar() or 0
        
        resolved_count = Topic.query.filter(
            Topic.created_at >= start_date,
            Topic.status == 'resolved'
        ).count()
        
        resolution_rate = (resolved_count / total_topics * 100) if total_topics > 0 else 0
        
        return {
            'total_topics': total_topics,
            'total_posts': total_posts,
            'avg_sentiment': round(float(avg_sentiment), 2),
            'resolution_rate': round(resolution_rate, 1),
            'resolved_count': resolved_count,
            'active_discussions': total_topics - resolved_count
        }

# Global instance
ai_service = AIService()