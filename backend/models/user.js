const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("buyer", "seller", "admin"),
      defaultValue: "buyer",
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0, 
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true, 
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tc_no: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brandName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instagram: { type: DataTypes.STRING, allowNull: true },
    website: { type: DataTypes.STRING, allowNull: true },
    twitter: { type: DataTypes.STRING, allowNull: true },
    facebook: { type: DataTypes.STRING, allowNull: true },
    youtube: { type: DataTypes.STRING, allowNull: true },
    linkedin: { type: DataTypes.STRING, allowNull: true },

    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBanned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    badges: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    averageRating: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    responseRate: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },

    story: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    siftahNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    featuredProductId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isUpdatePending: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    storyImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    pendingName: { type: DataTypes.STRING, allowNull: true },
    pendingSurname: { type: DataTypes.STRING, allowNull: true },
    pendingBrandName: { type: DataTypes.STRING, allowNull: true },
    pendingProfileImage: { type: DataTypes.STRING, allowNull: true },
    pendingLogoUrl: { type: DataTypes.STRING, allowNull: true },

    pendingCoverImage: { type: DataTypes.STRING, allowNull: true },
    pendingStoryImage: { type: DataTypes.STRING, allowNull: true },
    pendingSiftahNote: { type: DataTypes.STRING, allowNull: true },
    pendingFeaturedProductId: { type: DataTypes.INTEGER, allowNull: true },

    pendingInstagram: { type: DataTypes.STRING, allowNull: true },
    pendingWebsite: { type: DataTypes.STRING, allowNull: true },
    pendingTwitter: { type: DataTypes.STRING, allowNull: true },
    pendingFacebook: { type: DataTypes.STRING, allowNull: true },
    pendingYoutube: { type: DataTypes.STRING, allowNull: true },
    pendingLinkedin: { type: DataTypes.STRING, allowNull: true },
  },
  {
    timestamps: true,
  }
);

module.exports = User;