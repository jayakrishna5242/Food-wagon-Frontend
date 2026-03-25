import { Restaurant, MenuItem, Offer } from './types';

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name: "Burger King",
    imageUrl: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "25-30 mins",
    costForTwo: "₹400 for two",
    cuisines: ["Burgers", "American", "Fast Food"],
    location: "Connaught Place",
    city: "Delhi",
    isPureVeg: false,
    isNew: true,
    aggregatedDiscountInfo: {
      header: "50% OFF",
      subHeader: "UPTO ₹100"
    }
  },
  {
    id: 2,
    name: "Pizza Hut",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "30-35 mins",
    costForTwo: "₹600 for two",
    cuisines: ["Pizzas", "Italian"],
    location: "Sector 18",
    city: "Noida",
    isPureVeg: false,
    aggregatedDiscountInfo: {
      header: "FREE ITEM",
      subHeader: "ON ORDERS ABOVE ₹500"
    }
  },
  {
    id: 3,
    name: "Haldiram's",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "20-25 mins",
    costForTwo: "₹300 for two",
    cuisines: ["Sweets", "North Indian", "Street Food"],
    location: "Chandni Chowk",
    city: "Delhi",
    isPureVeg: true,
    isNew: true
  },
  {
    id: 4,
    name: "Subway",
    imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=1976&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "15-20 mins",
    costForTwo: "₹350 for two",
    cuisines: ["Salads", "Healthy Food", "Fast Food"],
    location: "Cyber City",
    city: "Gurugram",
    isPureVeg: false
  },
  {
    id: 5,
    name: "Starbucks",
    imageUrl: "https://images.unsplash.com/photo-1544787210-228394c3d3e0?q=80&w=2044&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "10-15 mins",
    costForTwo: "₹700 for two",
    cuisines: ["Coffee", "Beverages", "Desserts"],
    location: "Khan Market",
    city: "Delhi",
    isPureVeg: true
  },
  {
    id: 6,
    name: "Wow! Momo",
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c170db76?q=80&w=2070&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "20-30 mins",
    costForTwo: "₹250 for two",
    cuisines: ["Tibetan", "Chinese", "Fast Food"],
    location: "Lajpat Nagar",
    city: "Delhi",
    isPureVeg: false
  },
  {
    id: 7,
    name: "KFC",
    imageUrl: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?q=80&w=2067&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "25-35 mins",
    costForTwo: "₹500 for two",
    cuisines: ["Burgers", "Biryani", "Fast Food"],
    location: "Vasant Kunj",
    city: "Delhi",
    isPureVeg: false,
    aggregatedDiscountInfo: {
      header: "20% OFF",
      subHeader: "UPTO ₹120"
    }
  },
  {
    id: 8,
    name: "Bikanervala",
    imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1974&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "20-30 mins",
    costForTwo: "₹400 for two",
    cuisines: ["North Indian", "Sweets", "Street Food"],
    location: "Rajouri Garden",
    city: "Delhi",
    isPureVeg: true
  },
  {
    id: 9,
    name: "Leon's Burgers & Wings",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "25-35 mins",
    costForTwo: "₹500 for two",
    cuisines: ["Burgers", "American", "Fast Food"],
    location: "Indiranagar",
    city: "Bangalore",
    isPureVeg: false,
    aggregatedDiscountInfo: {
      header: "40% OFF",
      subHeader: "UPTO ₹80"
    }
  },
  {
    id: 10,
    name: "The Rameshwaram Cafe",
    imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=1974&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "15-20 mins",
    costForTwo: "₹250 for two",
    cuisines: ["South Indian", "Street Food"],
    location: "Brookefield",
    city: "Bangalore",
    isPureVeg: true,
    isNew: true
  },
  {
    id: 11,
    name: "Paradise Biryani",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=2020&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "30-40 mins",
    costForTwo: "₹600 for two",
    cuisines: ["Biryani", "Hyderabadi", "Mughlai"],
    location: "Secunderabad",
    city: "Hyderabad",
    isPureVeg: false
  },
  {
    id: 12,
    name: "Bademiya",
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop",
    rating: 0,
    deliveryTime: "20-30 mins",
    costForTwo: "₹800 for two",
    cuisines: ["North Indian", "Mughlai", "Kebabs"],
    location: "Colaba",
    city: "Mumbai",
    isPureVeg: false
  }
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: 101,
    name: "Whopper Burger",
    description: "Our signature flame-grilled beef patty topped with juicy tomatoes, fresh lettuce, creamy mayonnaise, ketchup, crunchy pickles, and sliced white onions on a soft sesame seed bun.",
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
    isVeg: false,
    category: "Burgers",
    restaurantId: 1,
    inStock: true
  },
  {
    id: 102,
    name: "Veg Whopper",
    description: "A flame-grilled plant-based patty topped with juicy tomatoes, fresh lettuce, creamy mayonnaise, ketchup, crunchy pickles, and sliced white onions on a soft sesame seed bun.",
    price: 169,
    imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop",
    isVeg: true,
    category: "Burgers",
    restaurantId: 1,
    inStock: true
  },
  {
    id: 103,
    name: "Chicken Fries",
    description: "Crispy, golden-brown chicken fries seasoned with a blend of savory spices.",
    price: 129,
    imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=2073&auto=format&fit=crop",
    isVeg: false,
    category: "Sides",
    restaurantId: 1,
    inStock: true
  },
  {
    id: 201,
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil.",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=2070&auto=format&fit=crop",
    isVeg: true,
    category: "Pizzas",
    restaurantId: 2,
    inStock: true
  },
  {
    id: 202,
    name: "Pepperoni Feast",
    description: "Loaded with pepperoni and extra mozzarella cheese.",
    price: 499,
    imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=2080&auto=format&fit=crop",
    isVeg: false,
    category: "Pizzas",
    restaurantId: 2,
    inStock: true
  },
  {
    id: 301,
    name: "Chole Bhature",
    description: "A classic Punjabi dish consisting of spicy chickpeas served with deep-fried bread.",
    price: 150,
    imageUrl: "https://images.unsplash.com/photo-1626132646529-500637532537?q=80&w=2070&auto=format&fit=crop",
    isVeg: true,
    category: "Main Course",
    restaurantId: 3,
    inStock: true
  },
  {
    id: 302,
    name: "Gulab Jamun",
    description: "Soft, melt-in-your-mouth milk solids dumplings soaked in rose-flavored sugar syrup.",
    price: 80,
    imageUrl: "https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=2070&auto=format&fit=crop",
    isVeg: true,
    category: "Desserts",
    restaurantId: 3,
    inStock: true
  },
  {
    id: 401,
    name: "Veggie Delite Sub",
    description: "A fresh and crunchy sub with your choice of vegetables and sauces.",
    price: 210,
    imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c170db76?q=80&w=2070&auto=format&fit=crop",
    isVeg: true,
    category: "Subs",
    restaurantId: 4,
    inStock: true
  },
  {
    id: 501,
    name: "Java Chip Frappuccino",
    description: "A delicious blend of coffee, milk, and chocolate chips.",
    price: 345,
    imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1974&auto=format&fit=crop",
    isVeg: true,
    category: "Frappuccino",
    restaurantId: 5,
    inStock: true
  },
  {
    id: 701,
    name: "Zinger Burger",
    description: "Our signature spicy chicken burger.",
    price: 189,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
    isVeg: false,
    category: "Burgers",
    restaurantId: 7,
    inStock: true
  },
  {
    id: 801,
    name: "Paneer Tikka",
    description: "Marinated paneer cubes grilled to perfection.",
    price: 280,
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=2017&auto=format&fit=crop",
    isVeg: true,
    category: "Starters",
    restaurantId: 8,
    inStock: true
  },
  {
    id: 901,
    name: "Leon's Classic Burger",
    description: "Juicy chicken patty with secret sauce.",
    price: 249,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
    isVeg: false,
    category: "Burgers",
    restaurantId: 9,
    inStock: true
  },
  {
    id: 902,
    name: "Peri Peri Chicken Wings",
    description: "Spicy and tangy chicken wings grilled to perfection.",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=2070&auto=format&fit=crop",
    isVeg: false,
    category: "Wings",
    restaurantId: 9,
    inStock: true
  },
  {
    id: 1001,
    name: "Ghee Podi Idli",
    description: "Soft idlis tossed in spicy podi and generous amount of ghee.",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921?q=80&w=1974&auto=format&fit=crop",
    isVeg: true,
    category: "Breakfast",
    restaurantId: 10,
    inStock: true
  },
  {
    id: 1002,
    name: "Open Butter Masala Dosa",
    description: "Crispy dosa with a thick layer of butter and spicy chutney podi.",
    price: 150,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=2070&auto=format&fit=crop",
    isVeg: true,
    category: "Dosa",
    restaurantId: 10,
    inStock: true
  },
  {
    id: 1101,
    name: "Special Mutton Biryani",
    description: "Authentic Hyderabadi mutton biryani served with salan and raita.",
    price: 450,
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=2020&auto=format&fit=crop",
    isVeg: false,
    category: "Biryani",
    restaurantId: 11,
    inStock: true
  },
  {
    id: 1102,
    name: "Chicken 65",
    description: "Spicy, deep-fried chicken pieces with curry leaves and green chilies.",
    price: 320,
    imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?q=80&w=1974&auto=format&fit=crop",
    isVeg: false,
    category: "Starters",
    restaurantId: 11,
    inStock: true
  },
  {
    id: 1201,
    name: "Chicken Seekh Kebab",
    description: "Minced chicken skewers grilled over charcoal.",
    price: 380,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop",
    isVeg: false,
    category: "Kebabs",
    restaurantId: 12,
    inStock: true
  },
  {
    id: 1202,
    name: "Mutton Boti Kebab",
    description: "Tender pieces of mutton marinated in spices and grilled.",
    price: 420,
    imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=2070&auto=format&fit=crop",
    isVeg: false,
    category: "Kebabs",
    restaurantId: 12,
    inStock: true
  }
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: "OFFER50",
    code: "WELCOME50",
    description: "50% OFF up to ₹100 on your first order",
    discountType: "PERCENTAGE",
    discountValue: 50,
    minOrderValue: 200
  },
  {
    id: "OFFER100",
    code: "SAVE100",
    description: "Flat ₹100 OFF on orders above ₹500",
    discountType: "FIXED",
    discountValue: 100,
    minOrderValue: 500
  },
  {
    id: "OFFER20",
    code: "FOODIE20",
    description: "20% OFF up to ₹150",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 300
  }
];
