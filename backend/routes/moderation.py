# routes/moderation.py - Complete with action endpoints

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from models import Topic
from database import db
from ai.gemini import moderator_reasoning

moderation = Blueprint("moderation", __name__)

@moderation.route("/moderation/topic/<int:topic_id>")
@jwt_required()
def moderate(topic_id):
    """Get AI moderation insights for a topic"""
    try:
        # Get role from JWT claims
        claims = get_jwt()
        user_role = claims.get("role", "user")
        
        if user_role not in ["moderator", "admin"]:
            return jsonify({"error": "forbidden"}), 403
        
        topic = Topic.query.get_or_404(topic_id)
        
        ai_view = moderator_reasoning(
            topic.distilled_points,
            topic.sentiment_score,
            topic.tags
        )
        
        return jsonify({
            "topic": topic.title,
            "sentiment_score": topic.sentiment_score,
            "negative_posts": topic.negative_count,
            "positive_posts": topic.positive_count,
            "ai_suggestions": ai_view
        })
    except Exception as e:
        print(f"Error in moderation: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@moderation.route("/moderation/topic/<int:topic_id>/priority", methods=["POST"])
@jwt_required()
def set_priority(topic_id):
    """Mark a topic as high priority"""
    try:
        claims = get_jwt()
        user_role = claims.get("role", "user")
        
        if user_role not in ["moderator", "admin"]:
            return jsonify({"error": "forbidden"}), 403
        
        topic = Topic.query.get_or_404(topic_id)
        topic.priority = "high"
        db.session.commit()
        
        return jsonify({
            "message": "Topic marked as high priority",
            "topic_id": topic_id,
            "priority": topic.priority
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error setting priority: {e}")
        return jsonify({"error": str(e)}), 500


@moderation.route("/moderation/topic/<int:topic_id>/resolve", methods=["POST"])
@jwt_required()
def resolve_topic(topic_id):
    """Mark a topic as resolved"""
    try:
        claims = get_jwt()
        user_role = claims.get("role", "user")
        
        if user_role not in ["moderator", "admin"]:
            return jsonify({"error": "forbidden"}), 403
        
        topic = Topic.query.get_or_404(topic_id)
        topic.status = "resolved"
        db.session.commit()
        
        return jsonify({
            "message": "Topic marked as resolved",
            "topic_id": topic_id,
            "status": topic.status
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error resolving topic: {e}")
        return jsonify({"error": str(e)}), 500


@moderation.route("/moderation/topic/<int:topic_id>/escalate", methods=["POST"])
@jwt_required()
def escalate_topic(topic_id):
    """Escalate a topic to admin"""
    try:
        claims = get_jwt()
        user_role = claims.get("role", "user")
        
        if user_role not in ["moderator", "admin"]:
            return jsonify({"error": "forbidden"}), 403
        
        topic = Topic.query.get_or_404(topic_id)
        topic.priority = "critical"
        # You could also add an 'escalated' boolean field if you want
        db.session.commit()
        
        return jsonify({
            "message": "Topic escalated to admin",
            "topic_id": topic_id,
            "priority": topic.priority
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error escalating topic: {e}")
        return jsonify({"error": str(e)}), 500


@moderation.route("/moderation/topic/<int:topic_id>/archive", methods=["POST"])
@jwt_required()
def archive_topic(topic_id):
    """Archive a topic"""
    try:
        claims = get_jwt()
        user_role = claims.get("role", "user")
        
        if user_role not in ["moderator", "admin"]:
            return jsonify({"error": "forbidden"}), 403
        
        topic = Topic.query.get_or_404(topic_id)
        topic.status = "archived"
        db.session.commit()
        
        return jsonify({
            "message": "Topic archived",
            "topic_id": topic_id,
            "status": topic.status
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error archiving topic: {e}")
        return jsonify({"error": str(e)}), 500