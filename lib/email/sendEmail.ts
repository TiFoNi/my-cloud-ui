import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

type SendEmailProps = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html,
    });

    return data;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}
