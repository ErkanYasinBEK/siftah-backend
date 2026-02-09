const Message = require('../models/Message');
const User = require('../models/user');
const { Op } = require('sequelize');

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.userData.userId; 
        const { receiverId, content } = req.body; 

        const newMessage = await Message.create({
            senderId,
            receiverId,
            content
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Mesaj gönderilemedi." });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const myId = req.userData.userId;
        const otherUserId = req.params.userId;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId: myId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: myId }
                ]
            },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Sohbet yüklenemedi." });
    }
};

// 3. KONUŞTUĞUM KİŞİLERİ GETİR (GÜÇLENDİRİLMİŞ VERSİYON)
exports.getConversations = async (req, res) => {
    try {
        const myId = req.userData.userId;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [{ senderId: myId }, { receiverId: myId }]
            },
            include: [
                { 
                    model: User, 
                    as: 'Sender', 
                    attributes: ['id', 'name', 'surname', 'brandName', 'logoUrl', 'profileImage', 'role'], 
                    required: false 
                },
                { 
                    model: User, 
                    as: 'Receiver', 
                    attributes: ['id', 'name', 'surname', 'brandName', 'logoUrl', 'profileImage', 'role'], 
                    required: false 
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const usersMap = new Map(); 

        messages.forEach(msg => {
            let otherUser = null;
            
            if (msg.senderId === myId) {
                otherUser = msg.Receiver;
            } else {
                otherUser = msg.Sender;
            }

            if (otherUser && !usersMap.has(otherUser.id)) {
                usersMap.set(otherUser.id, {
                    user: otherUser,
                    lastMessage: msg.content,
                    time: msg.createdAt
                });
            }
        });

        const conversations = Array.from(usersMap.values());
        res.status(200).json(conversations);

    } catch (error) {
        console.error("Conversations Error:", error);
        res.status(500).json({ message: "Liste yüklenemedi." });
    }
};