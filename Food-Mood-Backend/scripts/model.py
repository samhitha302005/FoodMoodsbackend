import sys
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter

def vectorize_dish(dish_genome):
    return np.array([dish_genome[k] for k in sorted(dish_genome.keys())])

def main():
    try:
        payload = json.load(sys.stdin)
        liked_names = payload["liked_dishes"]
        disliked_names = payload["disliked_dishes"]
        past_names = payload["past_orders"]
        all_dishes = payload["all_dishes"]
        print(past_names, file=sys.stderr)
        print(liked_names, file=sys.stderr)
        print(disliked_names, file=sys.stderr)

        dish_vectors = {name: vectorize_dish(genome) for name, genome in all_dishes.items()}
        
        # Build preference vector
        def average_vectors(names):
            vectors = [dish_vectors[name] for name in names if name in dish_vectors]
            return np.mean(vectors, axis=0) if vectors else np.zeros(len(next(iter(dish_vectors.values()))))
        
        def weighted_average_vectors(names):
            count = Counter(names)
            vectors = []
            total_weight = 0
            for name, freq in count.items():
                if name in dish_vectors:
                    vectors.append(dish_vectors[name] * freq)
                    total_weight += freq
            return np.sum(vectors, axis=0) / total_weight if total_weight > 0 else np.zeros(len(next(iter(dish_vectors.values()))))

        liked_vector = average_vectors(liked_names)
        past_vector = average_vectors(past_names)
        disliked_vector = weighted_average_vectors(disliked_names)

        # Final preference = liked + past - disliked
        preference_vector = liked_vector + past_vector - 0.5 * disliked_vector

        # Score all dishes
        scores = {}
        for name, vec in dish_vectors.items():
            if name in disliked_names:
                continue 
            score = cosine_similarity([preference_vector], [vec])[0][0]
            scores[name] = score

        # Sort and return top 10 recommendations
        top_dishes = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_10 = [name for name, _ in top_dishes[:10]]
        print(top_10, file=sys.stderr)

        print(json.dumps(top_10))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)

if __name__ == "__main__":
    main()

