import logger from "../../../config/logger.js";

export const otpEmailTemplate = ( fullName, otp ) => {
  const safeName = fullName || "Customer";
  // logger.info(" Generating OTP email template for:", safeName, otp);
  return `
    <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 25px; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="text-align: center; padding-bottom: 15px;">
          <h2 style="margin:0; color:#1d3557; font-size: 28px;">E-KART</h2>
          <p style="margin:0; font-size: 14px; color:#6c757d;">Secure Verification</p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

        <!-- Greeting -->
        <p style="font-size: 16px; color: #333; margin-bottom: 10px;">
          Hello <strong>${safeName}</strong>,
        </p>

        <!-- Message -->
        <p style="font-size: 15px; color: #444; line-height: 1.6;">
          Your One-Time Password (OTP) for continuing with your E-KART account verification is:
        </p>

        <!-- OTP Box -->
        <div style="text-align: center; margin: 25px 0;">
          <span style="
            font-size: 34px;
            letter-spacing: 6px;
            font-weight: bold;
            color: #e63946;
            display: inline-block;
            padding: 12px 20px;
            border-radius: 8px;
            background: #fceff0;
            border: 1px solid #f5d7da;
          ">
            ${otp}
          </span>
        </div>

        <!-- Validity -->
        <p style="font-size: 14px; color: #555;">
          This OTP is valid for <strong>10 minutes</strong>.  
          Please do not share it with anyone for your security.
        </p>

        <!-- Warning Box -->
        <div style="
          background: #fff3cd;
          padding: 12px 15px;
          border-left: 4px solid #ffca2c;
          border-radius: 5px;
          margin: 20px 0;
          color: #856404;
          font-size: 14px;
        ">
          ⚠️ If you did not request this OTP, someone else may be trying to access your account.
          Please ignore this email or reset your password.
        </div>

        <!-- Footer -->
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />

        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 10px;">
          © ${new Date().getFullYear()} E-KART. All Rights Reserved.<br/>
          This is an automated email — please do not reply.
        </p>

      </div>
    </div>
  `;
};
