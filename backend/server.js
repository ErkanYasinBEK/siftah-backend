const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp"); 
const { connectDB, sequelize } = require("./config/db");

const Product = require("./models/Product");
const User = require("./models/user");
const Favorite = require("./models/Favorite");
const Message = require("./models/Message");
const AdminLog = require("./models/AdminLog");
const Review = require("./models/Review");
const Story = require("./models/Story");
const StoryLike = require("./models/StoryLike");
const Order = require("./models/Order");
require("./models/Follow");

Message.belongsTo(User, { as: "sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });
User.hasMany(Message, { as: "sentMessages", foreignKey: "senderId" });
User.hasMany(Message, { as: "receivedMessages", foreignKey: "receiverId" });

User.hasMany(Story, { foreignKey: "sellerId", onDelete: "CASCADE" });
Story.belongsTo(User, { foreignKey: "sellerId" });

AdminLog.belongsTo(User, { as: 'admin', foreignKey: 'adminId' });
User.hasMany(AdminLog, { foreignKey: 'adminId' });

User.hasMany(StoryLike, { foreignKey: "userId" });
StoryLike.belongsTo(User, { foreignKey: "userId" });
Story.hasMany(StoryLike, { foreignKey: "storyId" });
StoryLike.belongsTo(Story, { foreignKey: "storyId" });

User.hasMany(Order, { as: "Sales", foreignKey: "sellerId" });
User.hasMany(Order, { as: "Purchases", foreignKey: "buyerId" });
Order.belongsTo(User, { as: "Seller", foreignKey: "sellerId" });
Order.belongsTo(User, { as: "Buyer", foreignKey: "buyerId" });
Product.hasMany(Order, { foreignKey: "productId" });
Order.belongsTo(Product, { foreignKey: "productId" });

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const messageRoutes = require("./routes/messageRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const storyRoutes = require("./routes/storyRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes"); 

dotenv.config();
const app = express();


app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

const allowedOrigins = [
    "http://127.0.0.1:5500",     
    "http://localhost:5500",    
    "http://127.0.0.1:5501",   
    "http://localhost:5501",   
    "http://127.0.0.1:5502",     
    "http://localhost:5502",    
    "http://localhost:3000",     
    "https://siftahapp.com",      
    "https://www.siftahapp.com"   
];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy: Bu domaine izin yok!'));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: "10kb" })); 

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 200, 
    message: "Çok fazla istek gönderdiniz, lütfen 15 dakika sonra tekrar deneyin."
});
app.use("/api", limiter);

app.use(hpp());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/favorites", favoriteRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes); 

connectDB();

const syncDB = async () => {
  try {
    sequelize.sync({ alter: true }).then(() => {
      console.log("✅ Veritabanı tabloları güncellendi/oluşturuldu.");
    });
  } catch (error) {
    console.error("❌ Tablo Hatası:", error);
  }
};
syncDB();

app.get("/", (req, res) => {
  res.send("Siftah Backend Çalışıyor! 🛡️ (Secured)");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor!`);
});