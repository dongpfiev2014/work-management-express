import nodemailer from "nodemailer";

export const sendMessagePortfolio = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: `${process.env.GMAIL_ID}`,
        pass: `${process.env.GMAIL_APP_PASSWORD}`,
      },
    });

    const mailOptions = {
      from: `Work Management Team <noreply@workmanagement.com>`,
      to: `dongpfiev2014@gmail.com`, // Địa chỉ email của bạn (admin)
      subject: "New Message from Client",
      html: `
          <p>Dear Admin,</p>
          <br>
          <p>You have received a new message from a client.</p>
          <p><strong>Client's Name:</strong> ${name}</p>
          <p><strong>Email Address:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <br>
          <p>Best regards,</p>
          <p>Work Management Team</p>
        `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        // console.log("Error sending email:", error);
        throw new Error("Failed to send message");
      } else {
        // console.log("Reset email sent:", info.response);
        return res.status(200).send({
          message: `Email sent!!`,
          success: true,
        });
      }
    });
  } catch (error) {
    res.status(error.status || 500).send({
      message: error.message || "Internal Server Error",
      success: false,
      data: null,
    });
  }
};
