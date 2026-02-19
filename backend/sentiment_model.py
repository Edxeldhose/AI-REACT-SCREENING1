"""
Sentiment Analysis Model Module
================================
This module implements a sentiment analysis model using:
- CountVectorizer for text feature extraction
- Multinomial Naive Bayes classifier

The model is trained on a sample dataset containing Positive, Negative, and Neutral sentiments.
"""

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import pickle
import os

# Sample training dataset for sentiment analysis
# Each tuple contains (text, sentiment_label)
SAMPLE_DATASET = [
    # Positive samples
    ("I love this product! It's amazing and works perfectly.", "Positive"),
    ("Excellent service! Very satisfied with my experience.", "Positive"),
    ("Great quality and fast delivery. Highly recommended!", "Positive"),
    ("This is fantastic! Best purchase I've ever made.", "Positive"),
    ("Wonderful experience! Will definitely come back.", "Positive"),
    ("Absolutely love it! Five stars!", "Positive"),
    ("Perfect! Everything I expected and more.", "Positive"),
    ("Outstanding quality! Very happy customer.", "Positive"),
    ("Superb! This exceeded all my expectations.", "Positive"),
    ("Brilliant! I'm so glad I bought this.", "Positive"),
    ("Very good product, works as expected.", "Positive"),
    ("Happy with my purchase, thanks!", "Positive"),
    ("Impressive quality and great value.", "Positive"),
    ("I'm satisfied with this product.", "Positive"),
    ("Nice work! Keep it up.", "Positive"),
    
    # Negative samples
    ("Terrible experience! Complete waste of money.", "Negative"),
    ("Very disappointed with this product. Poor quality.", "Negative"),
    ("Awful! Don't buy this, it's a scam.", "Negative"),
    ("Horrible service! Never coming back again.", "Negative"),
    ("This is the worst product I've ever purchased.", "Negative"),
    ("Absolutely terrible! Stay away from this.", "Negative"),
    ("Poor quality and bad customer service.", "Negative"),
    ("Waste of money! Very unsatisfied.", "Negative"),
    ("Disappointed! Not what I expected at all.", "Negative"),
    ("Bad experience overall. Would not recommend.", "Negative"),
    ("This product broke after one week!", "Negative"),
    ("Very poor quality, cheap materials.", "Negative"),
    ("I hate this product! Total disappointment.", "Negative"),
    ("Regret buying this. Waste of time and money.", "Negative"),
    ("Not worth the price. Very misleading.", "Negative"),
    
    # Neutral samples
    ("The product is okay, nothing special.", "Neutral"),
    ("Average quality for the price.", "Neutral"),
    ("It works but could be better.", "Neutral"),
    ("Not bad, not great. Just okay.", "Neutral"),
    ("The product arrived on time.", "Neutral"),
    ("It meets basic expectations.", "Neutral"),
    ("Standard quality, nothing exceptional.", "Neutral"),
    ("The product functions as described.", "Neutral"),
    ("Fair quality for everyday use.", "Neutral"),
    ("It's acceptable for the price range.", "Neutral"),
    ("Ordinary product, does the job.", "Neutral"),
    ("Nothing remarkable to mention.", "Neutral"),
    ("The item is decent enough.", "Neutral"),
    ("It's fine for casual use.", "Neutral"),
    ("Middle of the road quality.", "Neutral"),
]

class SentimentAnalyzer:
    """
    A sentiment analysis class that uses CountVectorizer and Multinomial Naive Bayes.
    """
    
    def __init__(self):
        """Initialize the sentiment analyzer with a pipeline."""
        self.pipeline = Pipeline([
            ('vectorizer', CountVectorizer(
                lowercase=True,
                stop_words='english',
                ngram_range=(1, 2),  # Use unigrams and bigrams
                max_features=5000
            )),
            ('classifier', MultinomialNB(alpha=1.0))
        ])
        self.is_trained = False
        self.model_path = 'sentiment_model.pkl'
    
    def train(self, data=None):
        """
        Train the sentiment analysis model.
        
        Args:
            data: Optional list of (text, label) tuples. 
                  Uses SAMPLE_DATASET if not provided.
        
        Returns:
            Training accuracy score
        """
        if data is None:
            data = SAMPLE_DATASET
        
        # Separate texts and labels
        texts = [item[0] for item in data]
        labels = [item[1] for item in data]
        
        # Train the pipeline
        self.pipeline.fit(texts, labels)
        self.is_trained = True
        
        # Calculate and return training accuracy
        accuracy = self.pipeline.score(texts, labels)
        return accuracy
    
    def predict(self, text):
        """
        Predict the sentiment of a given text.
        
        Args:
            text: String text to analyze
            
        Returns:
            Predicted sentiment label ('Positive', 'Negative', or 'Neutral')
        """
        if not self.is_trained:
            self.train()
        
        # Handle empty or None text
        if not text or not isinstance(text, str):
            return "Neutral"
        
        prediction = self.pipeline.predict([text])
        return prediction[0]
    
    def predict_proba(self, text):
        """
        Get probability estimates for each sentiment class.
        
        Args:
            text: String text to analyze
            
        Returns:
            Dictionary with probabilities for each sentiment
        """
        if not self.is_trained:
            self.train()
        
        if not text or not isinstance(text, str):
            return {"Positive": 0.33, "Negative": 0.33, "Neutral": 0.34}
        
        proba = self.pipeline.predict_proba([text])[0]
        classes = self.pipeline.classes_
        
        return {cls: float(prob) for cls, prob in zip(classes, proba)}
    
    def save_model(self, path=None):
        """
        Save the trained model to a file.
        
        Args:
            path: Optional path for saving. Uses self.model_path if not provided.
        """
        if path is None:
            path = self.model_path
        
        with open(path, 'wb') as f:
            pickle.dump(self.pipeline, f)
    
    def load_model(self, path=None):
        """
        Load a trained model from a file.
        
        Args:
            path: Optional path for loading. Uses self.model_path if not provided.
            
        Returns:
            Boolean indicating if loading was successful
        """
        if path is None:
            path = self.model_path
        
        if os.path.exists(path):
            with open(path, 'rb') as f:
                self.pipeline = pickle.load(f)
            self.is_trained = True
            return True
        return False


# Create a global instance for easy import
sentiment_analyzer = SentimentAnalyzer()


def initialize_model():
    """
    Initialize the sentiment model.
    First tries to load from file, then trains if needed.
    """
    # Try to load existing model
    if sentiment_analyzer.load_model():
        print("Loaded existing sentiment model from file.")
    else:
        # Train new model
        accuracy = sentiment_analyzer.train()
        print(f"Trained new sentiment model with accuracy: {accuracy:.2%}")
        # Save the model
        sentiment_analyzer.save_model()
        print("Saved sentiment model to file.")


if __name__ == "__main__":
    # Test the sentiment analyzer
    print("Testing Sentiment Analyzer...")
    print("-" * 50)
    
    initialize_model()
    
    # Test cases
    test_texts = [
        "This is an amazing product!",
        "Terrible experience, waste of money.",
        "The product is okay, nothing special.",
        "I'm very happy with my purchase!",
        "Bad quality, not recommended.",
    ]
    
    print("\nTest Predictions:")
    print("-" * 50)
    for text in test_texts:
        sentiment = sentiment_analyzer.predict(text)
        proba = sentiment_analyzer.predict_proba(text)
        print(f"Text: '{text}'")
        print(f"Sentiment: {sentiment}")
        print(f"Probabilities: {proba}")
        print("-" * 50)
