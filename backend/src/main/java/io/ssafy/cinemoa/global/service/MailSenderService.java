package io.ssafy.cinemoa.global.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailSenderService {
    private final JavaMailSender mailSender;

    @Async
    public CompletableFuture<Void> sendTextMail(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, false); // false = 일반 텍스트 모드

            mailSender.send(message);

            return CompletableFuture.completedFuture(null);
        } catch (MailException | MessagingException e) {
            log.error("메일 전송에 실패했습니다! : {}. Error: {}", subject, e.getMessage(), e);
            return CompletableFuture.failedFuture(e);
        }
    }
}
