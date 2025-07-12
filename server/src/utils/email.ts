import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email:string, code:string) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: email,
    subject: 'Verify your Email',
    html: `
      <p>Hello,</p>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>Or click to verify: <a href="${process.env.FRONTEND_URL}/verify?code=${code}">Verify Email</a></p>
    `,
  });
}
export const sendForgotpasswordEmail = async (email:string, code:string) => {
  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: email,
    subject: 'Verify your Email',
    html: `
      <p>Hello,</p>
      <p>Your forgotpassword code is: <strong>${code}</strong></p>
      <p>Or click to verify: <a href="${process.env.FRONTEND_URL}/verify?code=${code}">Verify Email</a></p>
    `,
  });
}