const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize'); 
const xss = require("xss");

exports.register = async (req, res) => {
  try {
    let { 
        name, surname, email, password, role, 
        brandName, tc_no, category, phone,
        instagram, website, twitter, facebook, youtube, linkedin 
    } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Şifre en az 6 karakter olmalıdır." });
    }

    name = xss(name?.trim());
    surname = xss(surname?.trim());
    email = xss(email?.trim().toLowerCase());

    if (brandName) brandName = xss(brandName.trim());
    if (tc_no) tc_no = xss(tc_no.trim());
    if (category) category = xss(category.trim());
    if (phone) phone = xss(phone.trim());

    const allowedRoles = ["buyer", "seller"];
    const userRole = allowedRoles.includes(role) ? role : "buyer";

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Bu e-posta adresi zaten kullanılıyor.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let logoPath = null;
    let profilePath = null;

    if (req.files) {
      if (req.files["logo"]) {
        logoPath = req.files["logo"][0].path.replace(/\\/g, "/"); 
      }
      if (req.files["profileImage"]) {
        profilePath = req.files["profileImage"][0].path.replace(/\\/g, "/");
      }
    }

    const newUser = await User.create({
      name,
      surname,
      email,
      password: hashedPassword,
      role: userRole, 
      brandName,
      tc_no,
      category,
      phone,
      logoUrl: logoPath,
      profileImage: profilePath,
      instagram: instagram ? xss(instagram) : null,
      website: website ? xss(website) : null,
      twitter: twitter ? xss(twitter) : null,
      facebook: facebook ? xss(facebook) : null,
      youtube: youtube ? xss(youtube) : null,
      linkedin: linkedin ? xss(linkedin) : null,
      isApproved: false, 
      isBanned: false,
      failedLoginAttempts: 0
    });

    res.status(201).json({
      success: true,
      message: "Kayıt başarıyla oluşturuldu!",
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Kayıt Hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası oluştu." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email ? email.trim().toLowerCase() : "";

    const user = await User.findOne({ where: { email: cleanEmail } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Kullanıcı bulunamadı." });
    }


    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.lockUntil - new Date()) / 1000 / 60
      );
      return res.status(429).json({
        success: false,
        message: `Çok fazla hatalı deneme. Hesabınız geçici olarak kilitlendi. Lütfen ${remainingTime} dakika sonra tekrar deneyin.`,
      });
    }


    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();
        return res.status(429).json({
          success: false,
          message:
            "Çok fazla hatalı giriş denemesi yaptınız. Hesabınız 15 dakika süreyle kilitlendi.",
        });
      }

      await user.save();
      const remainingAttempts = 5 - user.failedLoginAttempts;
      
      return res.status(401).json({
        success: false,
        message: `Hatalı şifre. (Kalan Hakkınız: ${remainingAttempts})`,
      });
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastActiveAt = new Date(); 
    await user.save();

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Hesabınız erişime kapatılmıştır. (Yasaklı Hesap)",
      });
    }

    if (user.role === "seller" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message:
          "Hesabınız henüz onaylanmadı. Lütfen yönetici onayı bekleyin.",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Giriş başarılı!",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error("Login Hatası:", error);
    res.status(500).json({ success: false, message: "Sunucu hatası." });
  }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email, role } = req.body;
        const cleanEmail = email ? email.trim().toLowerCase() : "";

        const whereClause = { email: cleanEmail };
        if (role) {
            whereClause.role = role; 
        }

        const user = await User.findOne({ where: whereClause });
        if (!user) {
            return res.status(404).json({ message: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı." });
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, 
            port: process.env.EMAIL_PORT, 
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // NOT: Buradaki URL geliştirme ortamı için. Canlıya alırken .env'den çekmek daha güvenlidir.
        // Örn: const resetUrl = `${process.env.CLIENT_URL}/sifre-sifirla.html?token=${token}`;
        const resetUrl = `http://127.0.0.1:5501/sifre-sifirla.html?token=${token}`;

        const mailOptions = {
            from: '"Siftah Destek Ekibi" <destek@siftahapp.com>',
            to: user.email,
            subject: 'Siftah Şifre Sıfırlama Talebi',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #000;">Siftah</h2>
                    </div>
                    <h3>Merhaba ${xss(user.name)},</h3>
                    <p>Hesabınız için bir şifre sıfırlama talebi aldık.</p>
                    <p>Aşağıdaki butona tıklayarak şifrenizi yenileyebilirsiniz:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #0f172a; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Şifremi Sıfırla</a>
                    </div>
                    <p style="font-size: 12px; color: #666;">Bu link 1 saat süreyle geçerlidir.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 11px; color: #999; text-align: center;">
                        © 2026 Siftah App. Bu bir otomatik mesajdır, lütfen cevaplamayınız. Keyifli alışverişler dileriz.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: "Sıfırlama bağlantısı e-posta adresinize gönderildi." });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Sunucu hatası, mail gönderilemedi." });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // Şifre uzunluk kontrolü burada da olmalı
        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalıdır." });
        }

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() } 
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({ success: true, message: "Şifreniz başarıyla güncellendi." });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Sunucu hatası, şifre güncellenemedi." });
    }
};



exports.changePassword = async (req, res) => {
    try {
        const userId = req.userData.userId;
        const { currentPassword, newPassword } = req.body;

        // Yeni şifre uzunluk kontrolü
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Yeni şifre en az 6 karakter olmalıdır." });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mevcut şifreniz hatalı." });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Şifre başarıyla değiştirildi." });

    } catch (error) {
        console.error("Şifre Değiştirme Hatası:", error);
        res.status(500).json({ message: "Sunucu hatası." });
    }
};