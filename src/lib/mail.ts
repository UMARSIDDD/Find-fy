import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const link = `http://localhost:3000/verify-email?token=${token}`;
  return resend.emails.send({
    from: "testing@resend.dev",
    to: email,
    subject: "Verification email",
    html: `<h1>Verify your Email Address</h1>
    <p>We have sent you an email with a verification link. Please click on the link to verify your email address.</p>
      <a href="${link}">Verfiy Email</a>
      `,
  });
}
export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `http://localhost:3000/reset-password?token=${token}`;

  return resend.emails.send({
      from: 'testing@resend.dev',
      to: email,
      subject: 'Reset your password',
      html: `
          <h1>You have requested to reset your password</h1>
          <p>Click the link below to reset password</p>
          <a href="${link}">Reset password</a>
      `
  })
}
