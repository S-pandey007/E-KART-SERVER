export const forgotPasswordTemplate = ({ fullName, otp }) => {
  const safeName = fullName || "Customer";

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color:#333;">
      <h2 style="color: #2c3e50;">Password Reset Request</h2>

      <p style="font-size: 16px;">
        Hello <strong>${safeName}</strong>,
      </p>

      <p style="font-size: 15px;">
        We received a request to reset your password for your <strong>E-KART</strong> account.
      </p>

      <p style="font-size: 15px; margin-top:20px;">
        Please use the following One-Time Password (OTP) to reset your password:
      </p>

      <div style="background:#f5f5f5; padding:15px; text-align:center; margin:20px 0;">
        <h1 style="letter-spacing: 5px; color:#e67e22;">${otp}</h1>
      </div>

      <p style="font-size: 14px; color: #555;">
        This OTP is valid for <strong>10 minutes</strong>.
        Do not share it with anyone.
      </p>

      <p style="font-size: 14px; margin-top: 25px;">
        If this was not you, please ignore this email. Your account is safe.
      </p>

      <hr style="border:0; border-top:1px solid #ddd; margin-top:30px;">

      <p style="font-size: 12px; color: #888;">
        © ${new Date().getFullYear()} E-KART. All rights reserved.
      </p>
    </div>
  `;
};
