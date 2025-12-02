import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST, // servidor SMTP
      port: parseInt(process.env.EMAIL_ṔORT ?? '2525', 587),
      secure: false, // use SSL ou TLS (para ambientes de produção,
      // certifique-se de usar "true" se o SMTP suportar SSL)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const mailOptions = {
      from: `"No reply" <${process.env.EMAIL_FROM}>`, // quem tá enviando
      to, // destinatário
      subject, // assunto
      text: content, // conteúdo do e-mail em texto simpls
      // Se precisar enviar html, adicionar a propriedade:
      // html: '<b>HTML content</b>
    };

    await this.transporter.sendMail(mailOptions);
  }
}
