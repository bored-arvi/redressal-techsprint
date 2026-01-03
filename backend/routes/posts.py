from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Topic, Post, PollOption, PollVote
from database import db
from ai.gemini import analyze_post

posts = Blueprint("posts", __name__)

def update_topic(topic, analysis):
    key_points = analysis.get('key_points', '')
    if key_points:
        topic.distilled_points += f"\n• {key_points}"
    topic.sentiment_count += 1
    
    if analysis["sentiment"] == "negative":
        topic.sentiment_score -= 1
        topic.negative_count += 1
    elif analysis["sentiment"] == "positive":
        topic.sentiment_score += 1
        topic.positive_count += 1

@posts.route("/posts", methods=["POST"])
@jwt_required()
def add_post():
    try:
        # Identity is now just the user_id as string
        user_id = int(get_jwt_identity())
        
        data = request.json
        
        topic = Topic.query.get_or_404(data["topic_id"])
        
        analysis = analyze_post(data["content"])
        
        post = Post(
            topic_id=topic.id,
            author_id=user_id,
            content=data["content"],
            key_points=analysis.get("key_points", ""),
            sentiment=analysis.get("sentiment", "neutral")
        )
        
        update_topic(topic, analysis)
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            "message": "post analyzed and stored",
            "sentiment": analysis.get("sentiment"),
            "post_id": post.id
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error adding post: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@posts.route("/poll/vote", methods=["POST"])
@jwt_required()
def vote_poll():
    try:
        # Identity is now just the user_id as string
        user_id = int(get_jwt_identity())
        
        data = request.json
        
        option = PollOption.query.get_or_404(data["option_id"])
        
        # Check if user already voted on this topic
        existing_vote = PollVote.query.join(PollOption).filter(
            PollOption.topic_id == option.topic_id,
            PollVote.user_id == user_id
        ).first()
        
        if existing_vote:
            return jsonify({"error": "already voted"}), 400
        
        vote = PollVote(option_id=option.id, user_id=user_id)
        option.vote_count += 1
        
        db.session.add(vote)
        db.session.commit()
        
        return jsonify({"message": "vote recorded"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error voting: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500