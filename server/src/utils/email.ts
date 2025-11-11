import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,          // use TLS port
  secure: false,      // false for TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // 16-digit App Password
  },
  tls: {
    rejectUnauthorized: false, // allows connection in some cloud environments
  },
});

transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send emails');
  }
});

export const sendVerificationEmail = async (email: string, code: string) => {
  try {
    const mailOptions = {
      from: {
        name: 'Calendar App',
        address: process.env.EMAIL_USER as string
      },
      to: email,
      subject: 'Verify your Email - Calendar App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px;">Email Verification</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Hello!</p>
            <p style="font-size: 16px; color: #333;">Welcome to Calendar App. Please verify your email address using the code below:</p>
            
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #667eea;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 3px;">${code}</span>
            </div>
            
            <p style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}/verify?code=${code}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This verification code will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
    return result;
  } catch (error: any) {
    console.error('❌ Error sending verification email:', error);
    throw new Error(`Failed to send verification email: ${error?.message || 'Unknown error'}`);
  }
};

export const sendForgotpasswordEmail = async (email: string, code: string) => {
  try {
    const mailOptions = {
      from: {
        name: 'Calendar App',
        address: process.env.EMAIL_USER as string
      },
      to: email,
      subject: 'Password Reset - Calendar App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; text-align: center; color: white; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9; border-radius: 10px; margin-top: 20px;">
            <p style="font-size: 16px; color: #333;">Hello!</p>
            <p style="font-size: 16px; color: #333;">You requested a password reset. Use the code below to reset your password:</p>
            
            <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px dashed #ff6b6b;">
              <span style="font-size: 32px; font-weight: bold; color: #ff6b6b; letter-spacing: 3px;">${code}</span>
            </div>
            
            <p style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL}/reset-password?code=${code}" 
                 style="background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Reset Password
              </a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This reset code will expire in 10 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
    return result;
  } catch (error: any) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error(`Failed to send password reset email: ${error?.message || 'Unknown error'}`);
  }
};