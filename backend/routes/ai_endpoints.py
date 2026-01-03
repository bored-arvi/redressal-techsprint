# routes/ai_endpoints.py - AI-powered API endpoints

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Topic, Post, SentimentHistory
from database import db
from services.ai_service import ai_service
from datetime import datetime

ai_routes = Blueprint("ai", __name__)

# ==================== SENTIMENT TIMELINE ====================

@ai_routes.route("/ai/sentiment-timeline/<int:topic_id>")
@jwt_required()
def get_sentiment_timeline(topic_id):
    """Get sentiment history over time for a topic"""
    try:
        topic = Topic.query.get_or_404(topic_id)
        timeline = ai_service.get_sentiment_timeline(topic_id)
        
        return jsonify({
            "topic_id": topic_id,
            "topic_title": topic.title,
            "timeline": timeline,
            "current_sentiment": topic.sentiment_score
        }), 200
    except Exception as e:
        print(f"Error getting sentiment timeline: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== AI SUMMARY ====================

@ai_routes.route("/ai/summary/<int:topic_id>")
@jwt_required()
def get_ai_summary(topic_id):
    """Generate AI summary of topic discussion"""
    try:
        topic = Topic.query.get_or_404(topic_id)
        posts = Post.query.filter_by(topic_id=topic_id)\
            .order_by(Post.created_at.desc()).all()
        
        summary = ai_service.summarize_discussion(topic.title, posts)
        
        # Store summary in database
        from models import AISummary
        ai_summary = AISummary(
            topic_id=topic_id,
            summary=summary
        )
        db.session.add(ai_summary)
        db.session.commit()
        
        return jsonify({
            "topic_id": topic_id,
            "summary": summary,
            "post_count": len(posts),
            "generated_at": datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        print(f"Error generating summary: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== SIMILAR TOPICS ====================

@ai_routes.route("/ai/similar/<int:topic_id>")
@jwt_required()
def get_similar_topics(topic_id):
    """Find topics similar to the given topic"""
    try:
        limit = request.args.get('limit', 5, type=int)
        similar = ai_service.find_similar_topics(topic_id, limit=limit)
        
        return jsonify({
            "topic_id": topic_id,
            "similar_topics": similar
        }), 200
    except Exception as e:
        print(f"Error finding similar topics: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== DUPLICATE DETECTION ====================

@ai_routes.route("/ai/duplicates/<int:topic_id>")
@jwt_required()
def detect_duplicates(topic_id):
    """Detect potential duplicate topics"""
    try:
        threshold = request.args.get('threshold', 0.85, type=float)
        duplicates = ai_service.detect_duplicates(topic_id, threshold=threshold)
        
        return jsonify({
            "topic_id": topic_id,
            "potential_duplicates": duplicates,
            "count": len(duplicates)
        }), 200
    except Exception as e:
        print(f"Error detecting duplicates: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== AUTO-TAGGING ====================

@ai_routes.route("/ai/auto-tag", methods=["POST"])
@jwt_required()
def auto_tag():
    """Generate AI-powered tag suggestions"""
    try:
        data = request.json
        title = data.get('title', '')
        content = data.get('content', '')
        
        tags = ai_service.suggest_tags(title, content)
        
        return jsonify({
            "suggested_tags": tags
        }), 200
    except Exception as e:
        print(f"Error suggesting tags: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== PREDICTIVE ANALYTICS ====================

@ai_routes.route("/ai/predictions/<int:topic_id>")
@jwt_required()
def get_predictions(topic_id):
    """Get AI predictions for topic escalation"""
    try:
        topic = Topic.query.get_or_404(topic_id)
        predictions = ai_service.predict_escalation_risk(topic)
        
        return jsonify({
            "topic_id": topic_id,
            "predictions": predictions
        }), 200
    except Exception as e:
        print(f"Error getting predictions: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== SEMANTIC SEARCH ====================

@ai_routes.route("/ai/search", methods=["POST"])
@jwt_required()
def semantic_search():
    """Perform AI-powered semantic search"""
    try:
        data = request.json
        query = data.get('query', '')
        limit = data.get('limit', 10)
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
        
        # Get all topics
        all_topics = Topic.query.all()
        results = ai_service.semantic_search(query, all_topics, limit=limit)
        
        topics_data = [{
            "id": t.id,
            "title": t.title,
            "tags": t.tags.split(',') if t.tags else [],
            "sentiment_score": t.sentiment_score,
            "created_at": t.created_at.isoformat()
        } for t in results]
        
        return jsonify({
            "query": query,
            "results": topics_data,
            "count": len(topics_data)
        }), 200
    except Exception as e:
        print(f"Error in semantic search: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== ANALYTICS OVERVIEW ====================

@ai_routes.route("/ai/analytics/overview")
@jwt_required()
def get_analytics_overview():
    """Get platform-wide AI-powered analytics"""
    try:
        time_period = request.args.get('period', '7d')
        insights = ai_service.generate_insights(time_period=time_period)
        
        return jsonify({
            "period": time_period,
            "insights": insights
        }), 200
    except Exception as e:
        print(f"Error generating analytics: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== TOPIC CLUSTERING ====================

@ai_routes.route("/ai/clusters")
@jwt_required()
def get_topic_clusters():
    """Get clustered topics for visualization"""
    try:
        # Get all topics
        topics = Topic.query.all()
        
        # Simple clustering by tags for now
        clusters = {}
        for topic in topics:
            tags = topic.tags.split(',') if topic.tags else ['uncategorized']
            primary_tag = tags[0].strip()
            
            if primary_tag not in clusters:
                clusters[primary_tag] = []
            
            clusters[primary_tag].append({
                "id": topic.id,
                "title": topic.title,
                "sentiment_score": topic.sentiment_score
            })
        
        # Convert to list format
        cluster_list = [{
            "name": tag,
            "topics": topics_in_cluster
        } for tag, topics_in_cluster in clusters.items()]
        
        return jsonify({
            "clusters": cluster_list,
            "total_clusters": len(cluster_list)
        }), 200
    except Exception as e:
        print(f"Error getting clusters: {e}")
        return jsonify({"error": str(e)}), 500


# ==================== REAL-TIME SENTIMENT ANALYSIS ====================

@ai_routes.route("/ai/analyze-text", methods=["POST"])
@jwt_required()
def analyze_text():
    """Analyze sentiment of arbitrary text in real-time"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        analysis = ai_service.analyze_sentiment(text)
        
        return jsonify({
            "text": text[:100] + "..." if len(text) > 100 else text,
            "analysis": analysis
        }), 200
    except Exception as e:
        print(f"Error analyzing text: {e}")
        return jsonify({"error": str(e)}), 500