const express = require("express");
const router = express.Router();
const { Op } = require("sequelize"); 
const Message = require("../models/Message");
const User = require("../models/user");
const checkAuth = require("../middleware/auth");

Message.sync({ alter: true });

const updateResponseRate = async (userId) => {
  try {
    const incomingMessages = await Message.findAll({
      where: { receiverId: userId },
      attributes: ['senderId'],
      group: ['senderId']
    });
    
    const uniqueCustomers = incomingMessages.length; 

    if (uniqueCustomers === 0) return; 

    let repliedCount = 0;

    for (const msg of incomingMessages) {
        const customerId = msg.senderId;
        const reply = await Message.findOne({
            where: {
                senderId: userId,
                receiverId: customerId
            }
        });
        if (reply) repliedCount++;
    }

    const rate = Math.round((repliedCount / uniqueCustomers) * 100);
    await User.update({ responseRate: rate }, { where: { id: userId } });
    
    console.log(`MsgRoute: Kullanıcı (ID: ${userId}) Yanıt Oranı Güncellendi: %${rate}`);

  } catch (error) {
    console.error("Yanıt oranı güncellenemedi:", error);
  }
};

router.post("/send", checkAuth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.userData.userId; 

    if (!content || !receiverId) {
      return res.status(400).json({ message: "Eksik bilgi." });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
    });

    updateResponseRate(senderId);
    updateResponseRate(receiverId);

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Mesaj Gönderme Hatası:", error);
    res.status(500).json({ message: "Mesaj gönderilemedi." });
  }
});

router.get("/conversation/:otherUserId", checkAuth, async (req, res) => {
  try {
    const myId = req.userData.userId;
    const otherId = req.params.otherUserId;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { 
            senderId: myId, 
            receiverId: otherId,
            deletedBySender: false 
          },
          { 
            senderId: otherId, 
            receiverId: myId,
            deletedByReceiver: false 
          },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Sohbet Hatası:", error);
    res.status(500).json({ message: "Sohbet yüklenemedi." });
  }
});


router.get("/conversations", checkAuth, async (req, res) => {
  try {
    const currentUserId = req.userData.userId;
    const allMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, deletedBySender: false },
          { receiverId: currentUserId, deletedByReceiver: false }
        ],
      },
      order: [["createdAt", "DESC"]], 
    });

    const conversationsMap = new Map();

    for (const msg of allMessages) {
      const sId = Number(msg.senderId);
      const rId = Number(msg.receiverId);
      const myIdNum = Number(currentUserId);

      const otherUserId = sId === myIdNum ? rId : sId;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          otherUserId: otherUserId,
          lastMessage: msg.content,
          time: msg.createdAt,
          lastMessageSenderId: sId, 
          unreadCount: 0 
        });
      }

      if (msg.receiverId === myIdNum && !msg.isRead && !msg.deletedByReceiver) {
          const conv = conversationsMap.get(otherUserId);
          conv.unreadCount += 1;
      }
    }

    const conversationList = [];

    for (const [id, data] of conversationsMap) {
      const user = await User.findByPk(id, {
        attributes: ["id", "name", "surname", "brandName", "logoUrl", "role", "profileImage", "lastActiveAt"],
      });

      if (user) {
        conversationList.push({
          user: user, 
          lastMessage: data.lastMessage,
          lastMessageSenderId: data.lastMessageSenderId,
          time: data.time,
          unreadCount: data.unreadCount, 
        });
      }
    }

    res.status(200).json(conversationList);
  } catch (error) {
    console.error("Liste Hatası:", error);
    res.status(500).json({ message: "Liste yüklenemedi." });
  }
});

router.delete("/conversation/:targetUserId", checkAuth, async (req, res) => {
    try {
      const myId = req.userData.userId;
      const targetId = req.params.targetUserId;
  
      await Message.update(
        { deletedBySender: true },
        { 
          where: { 
            senderId: myId, 
            receiverId: targetId 
          } 
        }
      );

      await Message.update(
        { deletedByReceiver: true },
        { 
          where: { 
            senderId: targetId, 
            receiverId: myId 
          } 
        }
      );
  
      res.status(200).json({ message: "Sohbet başarıyla silindi." });

    } catch (error) {
      console.error("Sohbet Silme Hatası:", error);
      res.status(500).json({ message: "Sohbet silinemedi." });
    }
  });

router.put("/mark-read/:senderId", checkAuth, async (req, res) => {
  try {
    const myId = req.userData.userId;
    const senderId = req.params.senderId; 

    await Message.update(
      { isRead: true },
      { 
        where: { 
          senderId: senderId, 
          receiverId: myId, 
          isRead: false 
        } 
      }
    );

    res.status(200).json({ message: "Mesajlar okundu işaretlendi." });
  } catch (error) {
    console.error("Okundu İşaretleme Hatası:", error);
    res.status(500).json({ message: "İşlem başarısız." });
  }
});


module.exports = router;
