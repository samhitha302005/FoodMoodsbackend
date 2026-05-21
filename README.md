# FoodMood Backend

FoodMood is a personalized food recommendation system designed to suggest dishes to users based on their past orders, liked or disliked dishes, and their taste preferences. The recommendation algorithm uses **content-based filtering** with **dish genome data** to generate personalized recommendations.

### Key Features:

* **Authentication**: JWT token-based authentication for secure access to user-specific data.
* **User Preferences**: Users can like or dislike dishes, which influences their future dish recommendations.
* **Dish Recommendations**: Personalized dish recommendations based on the user’s history (past orders and preferences).
* **Restaurant & Dish Data**: View restaurants and dishes, including pricing and availability. The dataset includes **10 restaurants** and **15 unique dishes** per restaurant. Each dish is characterized by **25 genome attributes** such as **spiciness, sweetness, saltiness**, etc.
* **Python Integration**: A Python script runs inside a Docker container to process content-based recommendations using dish genome data. This allows machine learning models to generate recommendations by analyzing dish characteristics.

### Dish Genome Data

Each dish is described by the following genome attributes, with values ranging from **0.1 to 1.0**: 

```json
"genome_data": {
  "spiciness": 0.9,
  "sweetness": 0.2,
  "sourness": 0.3,
  "saltiness": 0.6,
  "bitterness": 0.1,
  "umami": 0.8,
  "crunchiness": 0.1,
  "creaminess": 0.4,
  "chewiness": 0.6,
  "juiciness": 0.5,
  "hotness": 0.9,
  "oiliness": 0.7,
  "smokiness": 0.2,
  "charredness": 0.1,
  "herbaceous": 0.4,
  "garlicky": 0.7,
  "oniony": 0.6,
  "citrusy": 0.2,
  "fermented": 0.2, 
  "meatiness": 0.9,
  "seafoodiness": 0.0,
  "vegetal": 0.4,
  "dairiness": 0.1,
  "carb_rich": 0.3,
  "nutty": 0.1
}
```

### Setup Instructions

Follow these steps to set up the backend locally:

#### 1. Clone the repository:

```bash
git clone https://github.com/samhitha302005/FoodMoodsbackend
cd Food-Mood-Backend
```

#### 2. Install dependencies:

```bash
npm install
```
#### 3. Environment Variables:

Create a `.env` file in the root directory with the following variables:

```
OPENAI_API_KEY='your-openai-api-key'
MONGO_URI='your-mongo-atlas-uri'
JWT_SECRET='your-jwt-secret'
PORT=8000
```

#### 4. Data Loading:

Before running the application, you need to populate the database with restaurant and dish data.

1. **Load Dishes and Restaurants**: The `dishes.json` and `restaurants.json` files located in the `data/` folder contain the dish and restaurant information.

2. **Create Dish Availability**: After loading the dishes and restaurants, you need to create the `DishAvailability` table.

Run the following commands to load the initial data:

```bash
cd scripts
node createStrictDishAvailability.js
```

#### 5. Start the Application:

Once the data is loaded, start the app by running:

```bash
npm start
```

The backend will be available at `http://localhost:8000` (or the port specified in `.env`).

### API Endpoints

Here are the key API endpoints:

* `GET /api/` – Welcome message.
* `POST /api/users/register` – Register a new user.
* `POST /api/users/login` – Login a user (returns JWT token).
* `GET /api/users/profile` – Fetch user profile (protected).
* `POST /api/users/pastorders` – Add a past order (protected).
* `GET /api/users/recommendations` – Get personalized dish recommendations (protected).
* `POST /api/users/likeddishes` – Like a dish (protected).
* `POST /api/users/dislikeddishes` – Dislike a dish (protected).

#### **Restaurant & Dish Management**:

* `GET /api/restaurants` – Get all restaurants.
* `GET /api/restaurants/:id` – Get a restaurant by ID.
* `GET /api/dishes` – Get all dishes.
* `GET /api/dishes/:id` – Get a dish by ID.

#### **Cart Management**:

* `POST /api/cart` – Add an item to the cart (protected).
* `GET /api/cart` – View the user's cart (protected).
* `DELETE /api/cart/:dishId/:restaurantId` – Remove an item from the cart (protected).

#### **Dish Availability**:

* `GET /api/dish-availability` – Get all dish availability records.
* `GET /api/dish-availability/dish/:dishId` – Get restaurants where a specific dish is available.
* `GET /api/dish-availability/restaurant/:restaurantId` – Get all dishes available at a specific restaurant.
* `POST /api/dish-availability` – Create a new dish availability record.
* `DELETE /api/dish-availability/:id` – Delete a dish availability record.

### Docker Deployment

To deploy using Docker, follow these steps:

1. Build the Docker container:

```bash
docker build -t foodmood-backend .
```

2. Run the Docker container:

```bash
docker run -p 8000:8000 foodmood-backend
```

### Notes:

* **Dish Genome Data**: Each dish has **25 genome attributes** (e.g., spiciness, saltiness, sweetness) that help generate personalized recommendations.

* **Python Integration**: The dish recommendation engine runs as a Python service in Docker. It uses the **dish genome data** to generate dish recommendations using machine learning algorithms. The Python scripts will analyze user preferences, liked/disliked dishes, and past orders to suggest the most relevant dishes.

* **MongoDB Atlas**: The application uses **MongoDB Atlas** for storing restaurant data, dish data, user data, and dish availability.

### Live URL

You can access the deployed backend at:
<a href="https://foodmoodsbackend.onrender.com/api" target="_blank">FoodMood API</a>

