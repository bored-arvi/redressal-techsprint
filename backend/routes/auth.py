from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import User
from database import db

auth = Blueprint("auth", __name__)

@auth.route("/register", methods=["POST"])
def register():
    data = request.json
    
    # Check if user already exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "User already exists"}), 400
    
    user = User(
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role=data.get("role", "user")
    )
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "registered"}), 201


@auth.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()

    if not user or not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "invalid credentials"}), 401

    # Simplified - just use user_id as string
    # Store additional claims separately
    additional_claims = {"role": user.role, "email": user.email}
    token = create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims
    )
    
    return jsonify({
        "access_token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    })


@auth.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current user info from token"""
    from flask_jwt_extended import get_jwt
    
    user_id = get_jwt_identity()
    claims = get_jwt()
    
    return jsonify({
        "id": user_id,
        "role": claims.get("role"),
        "email": claims.get("email")
    })


@auth.route("/debug/token", methods=["GET"])
@jwt_required()
def debug_token():
    from flask_jwt_extended import get_jwt
    
    identity = get_jwt_identity()
    claims = get_jwt()
    
    return jsonify({
        "identity": identity,
        "claims": claims,
        "type": str(type(identity))
    })