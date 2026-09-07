import { Resend } from "resend";
import { welcomeTemplate } from "./email-templates/welcome";
import { paymentSuccessTemplate } from "./email-templates/payment-success";
import { passwordResetTemplate } from "./email-templates/password-reset";

const resend = new Resend(process.env.RESEND_API_KEY);

export const emails = {
  welcome: async (to: string, name: string) => {
    await resend.emails.send({
      from: "StarPress <noreply@starpress.app>",
      to,
      subject: "Welcome to StarPress!",
      html: welcomeTemplate(name),
    });
  },

  paymentSuccess: async (to: string, plan: string) => {
    await resend.emails.send({
      from: "StarPress <billing@starpress.app>",
      to,
      subject: `You're now on ${plan}!`,
      html: paymentSuccessTemplate(plan),
    });
  },

  passwordReset: async (to: string, resetUrl: string) => {
    await resend.emails.send({
      from: "StarPress <noreply@starpress.app>",
      to,
      subject: "Reset your password",
      html: passwordResetTemplate(resetUrl),
    });
  },
};
