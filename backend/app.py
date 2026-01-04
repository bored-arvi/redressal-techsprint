from flask import Flask, send_from_directory, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config
from database import db
from routes.auth import auth
from routes.topics import topics
from routes.posts import posts
from routes.moderation import moderation
from routes.ai_endpoints import ai_routes  # Make sure AI routes are imported
from dotenv import load_dotenv
import traceback
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='static')
app.config.from_object(Config)

# ==================== FIX: Configure CORS properly ====================
# Remove duplicate CORS calls, use this single configuration:
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

db.init_app(app)

# Configure JWT
jwt = JWTManager(app)

# Handle JWT errors
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token', 'message': str(error)}), 422

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Missing token', 'message': str(error)}), 401

# Global error handler
@app.errorhandler(Exception)
def handle_error(e):
    app.logger.error(f"Error: {str(e)}")
    app.logger.error(traceback.format_exc())
    return jsonify({'error': str(e)}), 500

# ==================== Register Blueprints ====================
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(topics, url_prefix="/api")
app.register_blueprint(posts, url_prefix="/api")
app.register_blueprint(moderation, url_prefix="/api")

# ==================== CRITICAL: Register AI routes ====================
# Make sure AI routes are registered
try:
    app.register_blueprint(ai_routes, url_prefix="/api")
    print("  AI routes registered successfully")
except Exception as e:
    print(f"    Warning: Failed to register AI routes: {e}")
    # Create a dummy AI blueprint if it doesn't exist
    from flask import Blueprint
    ai_dummy = Blueprint("ai", __name__)
    @ai_dummy.route("/ai/sentiment-timeline/<int:topic_id>")
    def dummy_sentiment(topic_id):
        return jsonify({"timeline": [], "error": "AI routes not fully configured"})
    app.register_blueprint(ai_dummy, url_prefix="/api")

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/health')
def health():
    """Health check endpoint"""
    gemini_configured = bool(os.getenv('GEMINI_API_KEY'))
    return jsonify({
        'status': 'healthy',
        'gemini_api_configured': gemini_configured,
        'endpoints': {
            'auth': ['/auth/login', '/auth/register', '/auth/me'],
            'topics': ['/api/topics', '/api/topics/<id>'],
            'ai': ['/api/ai/sentiment-timeline/<id>', '/api/ai/summary/<id>', '/api/ai/similar/<id>', '/api/ai/predictions/<id>']
        }
    })

# ==================== Add OPTIONS handler for preflight requests ====================
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # Check for API key
    if not os.getenv('GEMINI_API_KEY'):
        print("\n    WARNING: GEMINI_API_KEY not set!")
        print("Please set it in your .env file or environment variables.")
        print("Get your API key from: https://aistudio.google.com/app/apikey\n")
    
    print("\n" + "="*60)
    print("  Redressal Backend Starting...")
    print("="*60)
    print(f"  Frontend URL: http://localhost:5173")
    print(f"  Backend URL: http://localhost:5000")
    print(f"  Health check: http://localhost:5000/health")
    print(f"  AI Endpoints: http://localhost:5000/api/ai/sentiment-timeline/1")
    print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)