from flask import Flask, render_template, request, jsonify
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from collections import Counter
from bs4 import BeautifulSoup
import requests
import re
from sklearn.feature_extraction.text import TfidfVectorizer

app = Flask(__name__)

# Download required NLTK data
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')

def get_keyword_importance(topic):
    """
    Analyze keywords for a given topic and return their importance scores.
    The size of bubbles will be determined by TF-IDF scores and frequency.
    """
    # Simulate searching for relevant content
    search_url = f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}"
    try:
        response = requests.get(search_url)
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text()
    except:
        text = topic  # Fallback to just the topic if request fails

    # Clean and tokenize text
    text = re.sub(r'[^\w\s]', '', text.lower())
    tokens = word_tokenize(text)
    
    # Remove stopwords and non-nouns
    stop_words = set(stopwords.words('english'))
    tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    
    # Get word frequency
    word_freq = Counter(tokens)
    
    # Calculate TF-IDF scores
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([' '.join(tokens)])
    feature_names = vectorizer.get_feature_names_out()
    
    # Combine frequency and TF-IDF for final importance score
    keywords = []
    for word, freq in word_freq.most_common(30):  # Get top 30 keywords
        if word in feature_names:
            tfidf_score = tfidf_matrix[0, vectorizer.vocabulary_[word]]
            importance = freq * tfidf_score
            keywords.append({
                'text': word,
                'size': float(importance) * 1000  # Scale for visualization
            })
    
    return keywords

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    topic = request.json.get('topic', '')
    if not topic:
        return jsonify({'error': 'No topic provided'}), 400
    
    keywords = get_keyword_importance(topic)
    return jsonify(keywords)

if __name__ == '__main__':
    app.run(debug=True)
