# ai/gemini.py - Improved version with concise responses

import google.generativeai as genai
import os

# Configure Gemini API
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

def analyze_post(content):
    """Analyze a single post for sentiment and key points"""
    prompt = f"""Analyze this community post and extract:
1. Sentiment (positive/negative/neutral)
2. Key point (one sentence summary)

Post: "{content}"

Respond in this exact format:
Sentiment: [positive/negative/neutral]
Key Point: [one sentence]"""
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Parse response
        lines = text.split('\n')
        sentiment = 'neutral'
        key_points = ''
        
        for line in lines:
            if line.startswith('Sentiment:'):
                sentiment = line.split(':', 1)[1].strip().lower()
            elif line.startswith('Key Point:'):
                key_points = line.split(':', 1)[1].strip()
        
        return {
            'sentiment': sentiment,
            'key_points': key_points
        }
    except Exception as e:
        print(f"Error analyzing post: {e}")
        return {
            'sentiment': 'neutral',
            'key_points': ''
        }


def moderator_reasoning(distilled_points, sentiment_score, tags):
    """Generate concise moderation recommendations"""
    
    # Parse tags
    tags_list = tags.split(',') if tags else []
    tags_str = ', '.join(tags_list) if tags_list else 'None'
    
    # Determine sentiment category
    if sentiment_score >= 5:
        sentiment_cat = "Very Positive"
    elif sentiment_score > 0:
        sentiment_cat = "Positive"
    elif sentiment_score == 0:
        sentiment_cat = "Neutral"
    elif sentiment_score > -5:
        sentiment_cat = "Negative"
    else:
        sentiment_cat = "Very Negative"
    
    prompt = f"""You are a community moderator AI. Analyze this topic and provide CONCISE, actionable recommendations.

Topic Details:
- Sentiment Score: {sentiment_score} ({sentiment_cat})
- Tags: {tags_str}
- Key Points from Discussion:
{distilled_points or "No discussion yet"}

Provide a brief analysis in this format:

### Summary
[2-3 sentences about the topic's current state]

### Key Concerns
- [List 2-3 main concerns, if any]
- [Or state "No major concerns" if positive]

### Recommended Actions
1. [Specific action item]
2. [Specific action item]
3. [Specific action item]

Keep it concise and actionable. Focus on what moderators need to know and do."""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating moderation reasoning: {e}")
        return f"""### Summary
Unable to generate AI analysis at this time.

### Current Status
- Sentiment Score: {sentiment_score}
- Category: {sentiment_cat}
- Tags: {tags_str}

### Recommended Actions
1. Review topic manually
2. Monitor for updates
3. Engage with community if needed"""