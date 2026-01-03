from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Topic, PollOption, Post
from database import db

topics = Blueprint("topics", __name__)

@topics.route("/topics", methods=["POST"])
@jwt_required()
def create_topic():
    try:
        # Identity is now just the user_id as string
        user_id = int(get_jwt_identity())
        
        data = request.json
        
        topic = Topic(
            title=data["title"],
            tags=",".join(data.get("tags", [])),
            created_by=user_id,
            has_poll=data.get("has_poll", False),
            poll_question=data.get("poll_question")
        )
        
        db.session.add(topic)
        db.session.flush()
        
        if topic.has_poll and data.get("poll_options"):
            for option_text in data["poll_options"]:
                if option_text.strip():
                    option = PollOption(topic_id=topic.id, option_text=option_text)
                    db.session.add(option)
        
        db.session.commit()
        
        return jsonify({"topic_id": topic.id}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating topic: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@topics.route("/topics", methods=["GET"])
@jwt_required()
def list_topics():
    try:
        # Just verify token is valid
        get_jwt_identity()
        
        topics_list = Topic.query.order_by(Topic.created_at.desc()).all()
        
        return jsonify([{
            "id": t.id,
            "title": t.title,
            "tags": t.tags.split(",") if t.tags else [],
            "sentiment_score": t.sentiment_score,
            "positive_count": t.positive_count,
            "negative_count": t.negative_count,
            "has_poll": t.has_poll,
            "status": t.status,
            "priority": t.priority,
            "created_at": t.created_at.isoformat()
        } for t in topics_list]), 200
    except Exception as e:
        print(f"Error listing topics: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@topics.route("/topics/<int:topic_id>", methods=["GET"])
@jwt_required()
def get_topic(topic_id):
    try:
        # Just verify token is valid
        get_jwt_identity()
        
        topic = Topic.query.get_or_404(topic_id)
        posts = Post.query.filter_by(topic_id=topic_id).order_by(Post.created_at.desc()).all()
        
        poll_data = None
        if topic.has_poll:
            options = PollOption.query.filter_by(topic_id=topic_id).all()
            poll_data = {
                "question": topic.poll_question,
                "options": [{
                    "id": opt.id,
                    "text": opt.option_text,
                    "votes": opt.vote_count
                } for opt in options]
            }
        
        return jsonify({
            "id": topic.id,
            "title": topic.title,
            "tags": topic.tags.split(",") if topic.tags else [],
            "sentiment_score": topic.sentiment_score,
            "positive_count": topic.positive_count,
            "negative_count": topic.negative_count,
            "distilled_points": topic.distilled_points,
            "poll": poll_data,
            "posts": [{
                "id": p.id,
                "content": p.content,
                "sentiment": p.sentiment,
                "created_at": p.created_at.isoformat()
            } for p in posts]
        }), 200
    except Exception as e:
        print(f"Error getting topic: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500