# router.py
# Phase 1: Vector-Based Persona Matching System

from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

class BotRouter:
    def __init__(self):
        # Embedding model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

        # Bot personas
        self.bots = {
            "bot_a": "I believe AI and crypto will solve all human problems. I am highly optimistic about technology, Elon Musk, and space exploration.",
            "bot_b": "I believe tech monopolies are destroying society. I am highly critical of AI, social media, and billionaires. I value privacy and nature.",
            "bot_c": "I strictly care about markets, interest rates, trading algorithms, and making money. I think in ROI and finance terms."
        }

        self.bot_ids = list(self.bots.keys())

        # Create embeddings
        self.embeddings = self.model.encode(list(self.bots.values()))

        # Normalize (important for cosine similarity via inner product)
        self.embeddings = np.array(self.embeddings).astype("float32")
        faiss.normalize_L2(self.embeddings)

        # FAISS index
        self.index = faiss.IndexFlatIP(self.embeddings.shape[1])
        self.index.add(self.embeddings)

    def route_post_to_bots(self, post_content: str, threshold: float = 0.85):
        """
        Returns bots whose persona matches the post above threshold
        """

        # Embed incoming post
        query_vec = self.model.encode([post_content])
        query_vec = np.array(query_vec).astype("float32")
        faiss.normalize_L2(query_vec)

        # Search similarity
        scores, indices = self.index.search(query_vec, k=3)

        matched_bots = []

        for score, idx in zip(scores[0], indices[0]):
            if score >= threshold:
                matched_bots.append({
                    "bot_id": self.bot_ids[idx],
                    "score": float(score)
                })

        return matched_bots


# ------------------ TEST ------------------
if __name__ == "__main__":
    router = BotRouter()

    post = "OpenAI just released a model that can replace junior developers"

    result = router.route_post_to_bots(post)

    print("\nMatched Bots:")
    for r in result:
        print(r)