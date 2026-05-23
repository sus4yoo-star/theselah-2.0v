"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const APP_ID = "selah";

export type FeedbackKind = "feedback" | "inquiry";

// Self-contained copy (no i18n.ts changes needed).
type FbCopy = {
  menu: string;
  title: string;
  sub: string;
  placeholder: string;
  emailPlaceholder: string;
  send: string;
  sending: string;
  thanks: string;
  error: string;
};

function fbCopy(lang: string, kind: FeedbackKind): FbCopy {
  const feedbackMap: Record<string, FbCopy> = {
    ko: {
      menu: "의견 남기기",
      title: "셀라는 어떠셨나요?",
      sub: "더 따뜻한 동행이 될 수 있도록, 칭찬이나 개선점을 들려주세요 😊",
      placeholder: "마음에 드신 점이나 아쉬운 점을 자유롭게 적어주세요…",
      emailPlaceholder: "",
      send: "보내기",
      sending: "보내는 중…",
      thanks: "소중한 마음 고맙습니다 🌿 더 따뜻한 셀라가 되겠습니다.",
      error: "잠시 후 다시 시도해 주세요.",
    },
    en: {
      menu: "Feedback",
      title: "How was SELAH for you?",
      sub: "Help us become a warmer companion — share a kind word or what could be better 😊",
      placeholder: "Tell us what you liked or what we could improve…",
      emailPlaceholder: "",
      send: "Send",
      sending: "Sending…",
      thanks: "Thank you for sharing 🌿 We'll keep growing warmer.",
      error: "Please try again in a moment.",
    },
    th: {
      menu: "ส่งความคิดเห็น",
      title: "SELAH เป็นอย่างไรบ้าง?",
      sub: "ช่วยให้เราอบอุ่นยิ่งขึ้น บอกคำชมหรือสิ่งที่ควรปรับปรุงได้เลย 😊",
      placeholder: "บอกสิ่งที่คุณชอบหรือสิ่งที่เราควรปรับปรุง…",
      emailPlaceholder: "",
      send: "ส่ง",
      sending: "กำลังส่ง…",
      thanks: "ขอบคุณที่แบ่งปัน 🌿 เราจะอบอุ่นยิ่งขึ้น",
      error: "โปรดลองอีกครั้งในอีกสักครู่",
    },
    es: {
      menu: "Comentarios",
      title: "¿Cómo te fue con SELAH?",
      sub: "Ayúdanos a ser una compañía más cálida: comparte un elogio o algo a mejorar 😊",
      placeholder: "Cuéntanos qué te gustó o qué podríamos mejorar…",
      emailPlaceholder: "",
      send: "Enviar",
      sending: "Enviando…",
      thanks: "Gracias por compartir 🌿 Seguiremos creciendo con calidez.",
      error: "Inténtalo de nuevo en un momento.",
    },
    pt: {
      menu: "Comentários",
      title: "Como foi o SELAH para você?",
      sub: "Ajude-nos a ser uma companhia mais acolhedora: deixe um elogio ou o que melhorar 😊",
      placeholder: "Conte o que você gostou ou o que podemos melhorar…",
      emailPlaceholder: "",
      send: "Enviar",
      sending: "Enviando…",
      thanks: "Obrigado por compartilhar 🌿 Vamos ficar ainda mais acolhedores.",
      error: "Tente novamente em instantes.",
    },
    hi: {
      menu: "प्रतिक्रिया",
      title: "SELAH आपको कैसा लगा?",
      sub: "हमें और गर्मजोश बनने में मदद करें — तारीफ़ या सुधार बताइए 😊",
      placeholder: "जो अच्छा लगा या जो बेहतर हो सकता है, लिखें…",
      emailPlaceholder: "",
      send: "भेजें",
      sending: "भेजा जा रहा है…",
      thanks: "साझा करने के लिए धन्यवाद 🌿 हम और गर्मजोश बनेंगे।",
      error: "कृपया थोड़ी देर बाद पुनः प्रयास करें।",
    },
    zh: {
      menu: "反馈",
      title: "SELAH 用得还好吗？",
      sub: "帮助我们成为更温暖的陪伴——说说赞美或可改进之处 😊",
      placeholder: "告诉我们你喜欢的或可以改进的地方…",
      emailPlaceholder: "",
      send: "发送",
      sending: "发送中…",
      thanks: "谢谢你的分享 🌿 我们会更温暖。",
      error: "请稍后再试。",
    },
    ja: {
      menu: "ご意見",
      title: "SELAH はいかがでしたか?",
      sub: "より温かい伴走者になるために、良かった点や改善点をお聞かせください 😊",
      placeholder: "良かった点や改善できる点を自由にお書きください…",
      emailPlaceholder: "",
      send: "送信",
      sending: "送信中…",
      thanks: "お気持ちをありがとうございます 🌿 より温かくなれるよう努めます。",
      error: "しばらくしてから再度お試しください。",
    },
    "zh-TW": {
      menu: "意見回饋",
      title: "SELAH 使用得還好嗎?",
      sub: "幫助我們成為更溫暖的陪伴 — 說說讚美或可改進之處 😊",
      placeholder: "告訴我們你喜歡的或可以改進的地方…",
      emailPlaceholder: "",
      send: "送出",
      sending: "送出中…",
      thanks: "謝謝你的分享 🌿 我們會更溫暖。",
      error: "請稍後再試。",
    },
    fr: {
      menu: "Avis",
      title: "Comment était SELAH pour vous ?",
      sub: "Aidez-nous à être un compagnon plus chaleureux — partagez un compliment ou ce qui pourrait être amélioré 😊",
      placeholder: "Dites-nous ce que vous avez aimé ou ce que nous pourrions améliorer…",
      emailPlaceholder: "",
      send: "Envoyer",
      sending: "Envoi…",
      thanks: "Merci pour votre partage 🌿 Nous continuerons à devenir plus chaleureux.",
      error: "Veuillez réessayer dans un instant.",
    },
    de: {
      menu: "Feedback",
      title: "Wie war SELAH für dich?",
      sub: "Hilf uns, ein wärmerer Begleiter zu sein — teile ein nettes Wort oder Verbesserungsvorschläge 😊",
      placeholder: "Sag uns, was dir gefallen hat oder was wir verbessern könnten…",
      emailPlaceholder: "",
      send: "Senden",
      sending: "Sende…",
      thanks: "Danke fürs Teilen 🌿 Wir werden weiter wachsen und wärmer werden.",
      error: "Bitte versuche es gleich noch einmal.",
    },
    it: {
      menu: "Feedback",
      title: "Com'è stato SELAH per te?",
      sub: "Aiutaci a essere un compagno più caloroso: condividi un complimento o cosa migliorare 😊",
      placeholder: "Raccontaci cosa ti è piaciuto o cosa potremmo migliorare…",
      emailPlaceholder: "",
      send: "Invia",
      sending: "Invio…",
      thanks: "Grazie per la condivisione 🌿 Continueremo a crescere con calore.",
      error: "Riprova tra un momento, per favore.",
    },
    nl: {
      menu: "Feedback",
      title: "Hoe was SELAH voor jou?",
      sub: "Help ons een warmere metgezel te worden — deel een compliment of wat beter kan 😊",
      placeholder: "Vertel ons wat je leuk vond of wat we kunnen verbeteren…",
      emailPlaceholder: "",
      send: "Verzenden",
      sending: "Verzenden…",
      thanks: "Bedankt voor het delen 🌿 We blijven warmer worden.",
      error: "Probeer het zo opnieuw.",
    },
    ru: {
      menu: "Отзыв",
      title: "Как тебе SELAH?",
      sub: "Помоги нам стать теплее — поделись похвалой или тем, что можно улучшить 😊",
      placeholder: "Расскажи, что понравилось или что мы могли бы улучшить…",
      emailPlaceholder: "",
      send: "Отправить",
      sending: "Отправка…",
      thanks: "Спасибо за обратную связь 🌿 Мы будем теплее.",
      error: "Попробуй ещё раз через минуту.",
    },
    uk: {
      menu: "Відгук",
      title: "Як тобі SELAH?",
      sub: "Допоможи нам стати теплішими — поділись похвалою або тим, що можна покращити 😊",
      placeholder: "Розкажи, що сподобалось або що ми могли б покращити…",
      emailPlaceholder: "",
      send: "Надіслати",
      sending: "Надсилання…",
      thanks: "Дякуємо за відгук 🌿 Ми будемо теплішими.",
      error: "Спробуй ще раз за хвилину.",
    },
    pl: {
      menu: "Opinia",
      title: "Jak SELAH się sprawdził?",
      sub: "Pomóż nam być cieplejszym towarzyszem — podziel się pochwałą lub tym, co można poprawić 😊",
      placeholder: "Napisz, co Ci się podobało lub co możemy poprawić…",
      emailPlaceholder: "",
      send: "Wyślij",
      sending: "Wysyłanie…",
      thanks: "Dziękujemy za podzielenie się 🌿 Będziemy cieplejsi.",
      error: "Spróbuj ponownie za chwilę.",
    },
    cs: {
      menu: "Zpětná vazba",
      title: "Jaký byl SELAH?",
      sub: "Pomoz nám být vřelejší — podělí se o pochvalu nebo to, co můžeme zlepšit 😊",
      placeholder: "Řekni nám, co se ti líbilo nebo co můžeme zlepšit…",
      emailPlaceholder: "",
      send: "Odeslat",
      sending: "Odesílání…",
      thanks: "Děkujeme za sdílení 🌿 Budeme vřelejší.",
      error: "Zkus to za chvíli znovu.",
    },
    hu: {
      menu: "Visszajelzés",
      title: "Milyen volt a SELAH?",
      sub: "Segíts, hogy melegebb társ legyünk — oszd meg a dicséretet vagy mit fejleszthetnénk 😊",
      placeholder: "Mondd el, mi tetszett vagy mit fejleszthetnénk…",
      emailPlaceholder: "",
      send: "Küldés",
      sending: "Küldés…",
      thanks: "Köszönjük a megosztást 🌿 Melegebbé válunk.",
      error: "Próbáld újra egy pillanat múlva.",
    },
    ro: {
      menu: "Feedback",
      title: "Cum a fost SELAH pentru tine?",
      sub: "Ajută-ne să fim un companion mai cald — împărtășește o laudă sau ce putem îmbunătăți 😊",
      placeholder: "Spune-ne ce ți-a plăcut sau ce am putea îmbunătăți…",
      emailPlaceholder: "",
      send: "Trimite",
      sending: "Se trimite…",
      thanks: "Mulțumim pentru împărtășire 🌿 Vom deveni mai calzi.",
      error: "Te rugăm să încerci din nou într-o clipă.",
    },
    tr: {
      menu: "Geri Bildirim",
      title: "SELAH sizin için nasıldı?",
      sub: "Daha sıcak bir refakatçi olmamıza yardım edin — övgü veya iyileştirme önerilerinizi paylaşın 😊",
      placeholder: "Beğendiğiniz veya iyileştirebileceğimiz şeyleri yazın…",
      emailPlaceholder: "",
      send: "Gönder",
      sending: "Gönderiliyor…",
      thanks: "Paylaşımınız için teşekkürler 🌿 Daha sıcak olmaya devam edeceğiz.",
      error: "Lütfen birazdan tekrar deneyin.",
    },
    vi: {
      menu: "Phản hồi",
      title: "Bạn thấy SELAH thế nào?",
      sub: "Hãy giúp chúng tôi trở thành người bạn đồng hành ấm áp hơn — chia sẻ lời khen hoặc điều có thể cải thiện 😊",
      placeholder: "Hãy cho chúng tôi biết bạn thích điều gì hoặc chúng tôi có thể cải thiện điều gì…",
      emailPlaceholder: "",
      send: "Gửi",
      sending: "Đang gửi…",
      thanks: "Cảm ơn bạn đã chia sẻ 🌿 Chúng tôi sẽ tiếp tục trở nên ấm áp hơn.",
      error: "Vui lòng thử lại sau giây lát.",
    },
    id: {
      menu: "Masukan",
      title: "Bagaimana SELAH menurutmu?",
      sub: "Bantu kami menjadi pendamping yang lebih hangat — bagikan pujian atau apa yang bisa diperbaiki 😊",
      placeholder: "Ceritakan apa yang kamu suka atau apa yang bisa kami perbaiki…",
      emailPlaceholder: "",
      send: "Kirim",
      sending: "Mengirim…",
      thanks: "Terima kasih sudah berbagi 🌿 Kami akan terus menjadi lebih hangat.",
      error: "Silakan coba lagi sebentar.",
    },
    ms: {
      menu: "Maklum Balas",
      title: "Bagaimana SELAH pada anda?",
      sub: "Bantu kami menjadi teman yang lebih hangat — kongsikan pujian atau apa yang boleh diperbaiki 😊",
      placeholder: "Beritahu kami apa yang anda suka atau apa yang boleh diperbaiki…",
      emailPlaceholder: "",
      send: "Hantar",
      sending: "Menghantar…",
      thanks: "Terima kasih atas perkongsian 🌿 Kami akan terus menjadi lebih hangat.",
      error: "Sila cuba lagi sebentar.",
    },
    tl: {
      menu: "Puna",
      title: "Kumusta ang SELAH sa iyo?",
      sub: "Tulungan mo kaming maging mas mainit na kasama — magbahagi ng papuri o kung ano ang puwedeng pahusayin 😊",
      placeholder: "Sabihin sa amin kung ano ang nagustuhan mo o kung ano ang puwede naming pahusayin…",
      emailPlaceholder: "",
      send: "Ipadala",
      sending: "Ipinapadala…",
      thanks: "Salamat sa pagbabahagi 🌿 Magiging mas mainit pa kami.",
      error: "Subukan muli mamaya.",
    },
    bn: {
      menu: "মতামত",
      title: "SELAH আপনার কাছে কেমন লাগল?",
      sub: "আমাদের আরও উষ্ণ সঙ্গী হতে সাহায্য করুন — প্রশংসা বা উন্নতির পরামর্শ দিন 😊",
      placeholder: "আপনার যা ভালো লেগেছে বা আমরা কী উন্নত করতে পারি, লিখুন…",
      emailPlaceholder: "",
      send: "পাঠান",
      sending: "পাঠানো হচ্ছে…",
      thanks: "ভাগ করে নেওয়ার জন্য ধন্যবাদ 🌿 আমরা আরও উষ্ণ হব।",
      error: "অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    },
    ta: {
      menu: "கருத்து",
      title: "SELAH உங்களுக்கு எப்படி இருந்தது?",
      sub: "மிக அன்பான துணையாக மாற எங்களுக்கு உதவுங்கள் — பாராட்டு அல்லது மேம்படுத்த வேண்டியதைப் பகிருங்கள் 😊",
      placeholder: "உங்களுக்குப் பிடித்தது அல்லது மேம்படுத்தலாம் என நினைப்பதைச் சொல்லுங்கள்…",
      emailPlaceholder: "",
      send: "அனுப்பு",
      sending: "அனுப்புகிறது…",
      thanks: "பகிர்ந்ததற்கு நன்றி 🌿 நாங்கள் இன்னும் அன்பானவராக மாறுவோம்.",
      error: "சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
    },
    te: {
      menu: "అభిప్రాయం",
      title: "SELAH మీకు ఎలా అనిపించింది?",
      sub: "మరింత వెచ్చని తోడుగా మారడానికి సహాయపడండి — ప్రశంసలు లేదా మెరుగుపరచగలిగే విషయాలను చెప్పండి 😊",
      placeholder: "మీకు నచ్చింది లేదా మెరుగుపరచగలిగే విషయాలను చెప్పండి…",
      emailPlaceholder: "",
      send: "పంపు",
      sending: "పంపుతోంది…",
      thanks: "పంచుకున్నందుకు ధన్యవాదాలు 🌿 మరింత వెచ్చగా అవుతాం.",
      error: "దయచేసి కొంత సేపటిలో మళ్ళీ ప్రయత్నించండి.",
    },
    ar: {
      menu: "ملاحظات",
      title: "كيف كان SELAH بالنسبة لك؟",
      sub: "ساعدنا لنكون رفيقًا أدفأ — شارك إطراءً أو ما يمكن تحسينه 😊",
      placeholder: "أخبرنا بما أعجبك أو ما يمكننا تحسينه…",
      emailPlaceholder: "",
      send: "إرسال",
      sending: "جاري الإرسال…",
      thanks: "شكرًا لمشاركتك 🌿 سنواصل النمو لنصبح أدفأ.",
      error: "يرجى المحاولة مرة أخرى بعد لحظة.",
    },
    fa: {
      menu: "بازخورد",
      title: "SELAH برایت چطور بود؟",
      sub: "کمکمان کن همراهی گرم‌تری باشیم — تعریف یا پیشنهاد بهبود را به اشتراک بگذار 😊",
      placeholder: "بگو چه چیزی را دوست داشتی یا چه چیزی را می‌توانیم بهتر کنیم…",
      emailPlaceholder: "",
      send: "ارسال",
      sending: "در حال ارسال…",
      thanks: "ممنون از اشتراک‌گذاری 🌿 ما گرم‌تر می‌شویم.",
      error: "لطفاً کمی بعد دوباره تلاش کن.",
    },
    sw: {
      menu: "Maoni",
      title: "SELAH ulikuwaje kwako?",
      sub: "Tusaidie kuwa mwenzi mwenye joto zaidi — shiriki sifa au kile tunachoweza kuboresha 😊",
      placeholder: "Tuambie ulichopenda au tunachoweza kuboresha…",
      emailPlaceholder: "",
      send: "Tuma",
      sending: "Inatuma…",
      thanks: "Asante kwa kushiriki 🌿 Tutaendelea kuwa wenye joto zaidi.",
      error: "Tafadhali jaribu tena baada ya muda mfupi.",
    },
  };

  const inquiryMap: Record<string, FbCopy> = {
    ko: {
      menu: "문의하기",
      title: "무엇이든 물어보세요",
      sub: "셀라를 사용하시면서 궁금하거나 불편한 점이 있으신가요? 알려주시면 빠르게 답변드리겠습니다.",
      placeholder: "문의하실 내용을 자유롭게 적어주세요…",
      emailPlaceholder: "답변받을 이메일 (선택)",
      send: "보내기",
      sending: "보내는 중…",
      thanks: "문의 주셔서 감사합니다 🙏 빠른 시일 내에 답변드릴게요.",
      error: "잠시 후 다시 시도해 주세요.",
    },
    en: {
      menu: "Contact",
      title: "Ask us anything",
      sub: "Have a question or run into something tricky? Tell us and we'll get back to you.",
      placeholder: "Tell us what you'd like to ask…",
      emailPlaceholder: "Reply email (optional)",
      send: "Send",
      sending: "Sending…",
      thanks: "Thanks for reaching out 🙏 We'll get back to you soon.",
      error: "Please try again in a moment.",
    },
    th: {
      menu: "ติดต่อเรา",
      title: "ถามอะไรก็ได้",
      sub: "มีคำถามหรือปัญหาในการใช้งานไหม? บอกเรามา แล้วเราจะรีบตอบกลับ",
      placeholder: "พิมพ์คำถามของคุณที่นี่…",
      emailPlaceholder: "อีเมลสำหรับรับคำตอบ (ไม่บังคับ)",
      send: "ส่ง",
      sending: "กำลังส่ง…",
      thanks: "ขอบคุณที่ติดต่อเรา 🙏 เราจะตอบกลับโดยเร็ว",
      error: "โปรดลองอีกครั้งในอีกสักครู่",
    },
    es: {
      menu: "Contacto",
      title: "Pregúntanos lo que quieras",
      sub: "¿Tienes una pregunta o algo no funciona? Cuéntanos y te responderemos pronto.",
      placeholder: "Escribe tu pregunta aquí…",
      emailPlaceholder: "Email para responder (opcional)",
      send: "Enviar",
      sending: "Enviando…",
      thanks: "Gracias por escribirnos 🙏 Te responderemos pronto.",
      error: "Inténtalo de nuevo en un momento.",
    },
    pt: {
      menu: "Contato",
      title: "Pergunte o que quiser",
      sub: "Tem uma dúvida ou algo não funcionou? Conte para a gente e responderemos em breve.",
      placeholder: "Escreva sua pergunta aqui…",
      emailPlaceholder: "Email para resposta (opcional)",
      send: "Enviar",
      sending: "Enviando…",
      thanks: "Obrigado por nos contatar 🙏 Responderemos em breve.",
      error: "Tente novamente em instantes.",
    },
    hi: {
      menu: "संपर्क करें",
      title: "कुछ भी पूछें",
      sub: "कोई सवाल या समस्या है? बताइए, हम जल्द जवाब देंगे।",
      placeholder: "अपना सवाल यहाँ लिखें…",
      emailPlaceholder: "जवाब के लिए ईमेल (वैकल्पिक)",
      send: "भेजें",
      sending: "भेजा जा रहा है…",
      thanks: "संपर्क के लिए धन्यवाद 🙏 हम जल्द उत्तर देंगे।",
      error: "कृपया थोड़ी देर बाद पुनः प्रयास करें।",
    },
    zh: {
      menu: "联系我们",
      title: "随时来问",
      sub: "有问题或遇到困难？告诉我们，我们会尽快回复。",
      placeholder: "请在这里写下您的问题…",
      emailPlaceholder: "回复邮箱（选填）",
      send: "发送",
      sending: "发送中…",
      thanks: "感谢您的联系 🙏 我们会尽快回复。",
      error: "请稍后再试。",
    },
    ja: {
      menu: "お問い合わせ",
      title: "なんでも聞いてください",
      sub: "ご質問や不具合がありますか? お知らせいただければ、すぐにお返事します。",
      placeholder: "お問い合わせ内容を自由にお書きください…",
      emailPlaceholder: "ご返信用メール (任意)",
      send: "送信",
      sending: "送信中…",
      thanks: "お問い合わせありがとうございます 🙏 すぐにお返事いたします。",
      error: "しばらくしてから再度お試しください。",
    },
    "zh-TW": {
      menu: "聯絡我們",
      title: "隨時來問",
      sub: "有問題或遇到困難？告訴我們，我們會盡快回覆。",
      placeholder: "請在這裡寫下您的問題…",
      emailPlaceholder: "回覆信箱（選填）",
      send: "送出",
      sending: "送出中…",
      thanks: "感謝您的聯絡 🙏 我們會盡快回覆。",
      error: "請稍後再試。",
    },
    fr: {
      menu: "Contact",
      title: "Posez-nous une question",
      sub: "Une question ou un problème ? Dites-le-nous, nous vous répondrons rapidement.",
      placeholder: "Écrivez votre question ici…",
      emailPlaceholder: "Email de réponse (facultatif)",
      send: "Envoyer",
      sending: "Envoi…",
      thanks: "Merci de nous avoir contactés 🙏 Nous reviendrons vers vous rapidement.",
      error: "Veuillez réessayer dans un instant.",
    },
    de: {
      menu: "Kontakt",
      title: "Frag uns alles",
      sub: "Hast du eine Frage oder ist etwas nicht in Ordnung? Sag uns Bescheid, wir melden uns zurück.",
      placeholder: "Schreibe deine Frage hier…",
      emailPlaceholder: "Antwort-E-Mail (optional)",
      send: "Senden",
      sending: "Sende…",
      thanks: "Danke, dass du dich gemeldet hast 🙏 Wir melden uns bald.",
      error: "Bitte versuche es gleich noch einmal.",
    },
    it: {
      menu: "Contatti",
      title: "Chiedici qualsiasi cosa",
      sub: "Hai una domanda o un problema? Faccelo sapere, ti risponderemo presto.",
      placeholder: "Scrivi qui la tua domanda…",
      emailPlaceholder: "Email per la risposta (opzionale)",
      send: "Invia",
      sending: "Invio…",
      thanks: "Grazie per averci contattato 🙏 Ti risponderemo presto.",
      error: "Riprova tra un momento, per favore.",
    },
    nl: {
      menu: "Contact",
      title: "Stel ons gerust een vraag",
      sub: "Heb je een vraag of werkt iets niet? Laat het ons weten, we reageren snel.",
      placeholder: "Schrijf je vraag hier…",
      emailPlaceholder: "Antwoord-e-mail (optioneel)",
      send: "Verzenden",
      sending: "Verzenden…",
      thanks: "Bedankt voor je bericht 🙏 We komen er snel op terug.",
      error: "Probeer het zo opnieuw.",
    },
    ru: {
      menu: "Связаться",
      title: "Спроси нас о чём угодно",
      sub: "Есть вопрос или что-то не работает? Напиши нам, мы скоро ответим.",
      placeholder: "Напиши свой вопрос здесь…",
      emailPlaceholder: "Email для ответа (необязательно)",
      send: "Отправить",
      sending: "Отправка…",
      thanks: "Спасибо, что написал 🙏 Скоро ответим.",
      error: "Попробуй ещё раз через минуту.",
    },
    uk: {
      menu: "Зв'язатись",
      title: "Запитай нас про що завгодно",
      sub: "Маєш питання або щось не працює? Напиши нам, ми скоро відповімо.",
      placeholder: "Напиши своє запитання тут…",
      emailPlaceholder: "Email для відповіді (необов'язково)",
      send: "Надіслати",
      sending: "Надсилання…",
      thanks: "Дякуємо, що написав 🙏 Скоро відповімо.",
      error: "Спробуй ще раз за хвилину.",
    },
    pl: {
      menu: "Kontakt",
      title: "Zapytaj nas o cokolwiek",
      sub: "Masz pytanie lub coś nie działa? Daj nam znać, szybko odpowiemy.",
      placeholder: "Napisz tu swoje pytanie…",
      emailPlaceholder: "Email do odpowiedzi (opcjonalnie)",
      send: "Wyślij",
      sending: "Wysyłanie…",
      thanks: "Dziękujemy za kontakt 🙏 Szybko odpowiemy.",
      error: "Spróbuj ponownie za chwilę.",
    },
    cs: {
      menu: "Kontakt",
      title: "Zeptej se nás na cokoli",
      sub: "Máš otázku nebo něco nefunguje? Napiš nám, brzy odpovíme.",
      placeholder: "Napiš svou otázku sem…",
      emailPlaceholder: "Email pro odpověď (volitelné)",
      send: "Odeslat",
      sending: "Odesílání…",
      thanks: "Děkujeme za zprávu 🙏 Brzy odpovíme.",
      error: "Zkus to za chvíli znovu.",
    },
    hu: {
      menu: "Kapcsolat",
      title: "Kérdezz bármit",
      sub: "Van kérdésed vagy valami nem működik? Írd meg, hamarosan válaszolunk.",
      placeholder: "Írd ide a kérdésed…",
      emailPlaceholder: "Válasz email (opcionális)",
      send: "Küldés",
      sending: "Küldés…",
      thanks: "Köszönjük, hogy írtál 🙏 Hamarosan válaszolunk.",
      error: "Próbáld újra egy pillanat múlva.",
    },
    ro: {
      menu: "Contact",
      title: "Întreabă-ne orice",
      sub: "Ai o întrebare sau ceva nu funcționează? Spune-ne, îți răspundem repede.",
      placeholder: "Scrie aici întrebarea ta…",
      emailPlaceholder: "Email de răspuns (opțional)",
      send: "Trimite",
      sending: "Se trimite…",
      thanks: "Mulțumim că ne-ai contactat 🙏 Îți răspundem repede.",
      error: "Te rugăm să încerci din nou într-o clipă.",
    },
    tr: {
      menu: "İletişim",
      title: "Bize her şeyi sorabilirsiniz",
      sub: "Bir sorunuz veya sorununuz mu var? Bize bildirin, hızla cevap verelim.",
      placeholder: "Sorunuzu buraya yazın…",
      emailPlaceholder: "Yanıt için e-posta (isteğe bağlı)",
      send: "Gönder",
      sending: "Gönderiliyor…",
      thanks: "Bize ulaştığınız için teşekkürler 🙏 Yakında dönüş yapacağız.",
      error: "Lütfen birazdan tekrar deneyin.",
    },
    vi: {
      menu: "Liên hệ",
      title: "Hỏi chúng tôi bất cứ điều gì",
      sub: "Bạn có câu hỏi hoặc gặp sự cố? Hãy cho chúng tôi biết, chúng tôi sẽ phản hồi sớm.",
      placeholder: "Viết câu hỏi của bạn ở đây…",
      emailPlaceholder: "Email để nhận phản hồi (tùy chọn)",
      send: "Gửi",
      sending: "Đang gửi…",
      thanks: "Cảm ơn bạn đã liên hệ 🙏 Chúng tôi sẽ phản hồi sớm.",
      error: "Vui lòng thử lại sau giây lát.",
    },
    id: {
      menu: "Kontak",
      title: "Tanyakan apa saja",
      sub: "Ada pertanyaan atau menemui kendala? Beri tahu kami, kami akan segera membalas.",
      placeholder: "Tulis pertanyaanmu di sini…",
      emailPlaceholder: "Email untuk balasan (opsional)",
      send: "Kirim",
      sending: "Mengirim…",
      thanks: "Terima kasih sudah menghubungi 🙏 Kami akan segera membalas.",
      error: "Silakan coba lagi sebentar.",
    },
    ms: {
      menu: "Hubungi Kami",
      title: "Tanya apa sahaja",
      sub: "Ada soalan atau masalah? Beritahu kami, kami akan membalas tidak lama lagi.",
      placeholder: "Tulis soalan anda di sini…",
      emailPlaceholder: "E-mel untuk balasan (pilihan)",
      send: "Hantar",
      sending: "Menghantar…",
      thanks: "Terima kasih kerana menghubungi 🙏 Kami akan membalas tidak lama lagi.",
      error: "Sila cuba lagi sebentar.",
    },
    tl: {
      menu: "Makipag-ugnayan",
      title: "Tanungin kami ng kahit ano",
      sub: "May tanong o problema? Sabihin sa amin, sasagutin namin agad.",
      placeholder: "Isulat ang iyong tanong dito…",
      emailPlaceholder: "Email para sa sagot (opsyonal)",
      send: "Ipadala",
      sending: "Ipinapadala…",
      thanks: "Salamat sa pakikipag-ugnayan 🙏 Sasagutin namin agad.",
      error: "Subukan muli mamaya.",
    },
    bn: {
      menu: "যোগাযোগ",
      title: "যা ইচ্ছা জিজ্ঞাসা করুন",
      sub: "প্রশ্ন বা সমস্যা আছে? আমাদের জানান, দ্রুত উত্তর দেব।",
      placeholder: "এখানে আপনার প্রশ্ন লিখুন…",
      emailPlaceholder: "উত্তরের জন্য ইমেইল (ঐচ্ছিক)",
      send: "পাঠান",
      sending: "পাঠানো হচ্ছে…",
      thanks: "যোগাযোগের জন্য ধন্যবাদ 🙏 শীঘ্রই উত্তর দেব।",
      error: "অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন।",
    },
    ta: {
      menu: "தொடர்பு",
      title: "எதையும் கேளுங்கள்",
      sub: "கேள்வி அல்லது சிக்கல் உள்ளதா? எங்களுக்குச் சொல்லுங்கள், விரைவில் பதிலளிப்போம்.",
      placeholder: "உங்கள் கேள்வியை இங்கே எழுதுங்கள்…",
      emailPlaceholder: "பதிலுக்கான மின்னஞ்சல் (விருப்பத்தேர்வு)",
      send: "அனுப்பு",
      sending: "அனுப்புகிறது…",
      thanks: "தொடர்பு கொண்டதற்கு நன்றி 🙏 விரைவில் பதிலளிப்போம்.",
      error: "சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
    },
    te: {
      menu: "సంప్రదించండి",
      title: "ఏదైనా అడగండి",
      sub: "ప్రశ్న లేదా సమస్య ఉందా? మాకు చెప్పండి, త్వరగా సమాధానం ఇస్తాం.",
      placeholder: "మీ ప్రశ్నను ఇక్కడ రాయండి…",
      emailPlaceholder: "ప్రత్యుత్తరం కోసం ఇమెయిల్ (ఐచ్ఛికం)",
      send: "పంపు",
      sending: "పంపుతోంది…",
      thanks: "సంప్రదించినందుకు ధన్యవాదాలు 🙏 త్వరగా సమాధానం ఇస్తాం.",
      error: "దయచేసి కొంత సేపటిలో మళ్ళీ ప్రయత్నించండి.",
    },
    ar: {
      menu: "تواصل معنا",
      title: "اسألنا أي شيء",
      sub: "هل لديك سؤال أو واجهت مشكلة؟ أخبرنا وسنرد عليك قريبًا.",
      placeholder: "اكتب سؤالك هنا…",
      emailPlaceholder: "البريد الإلكتروني للرد (اختياري)",
      send: "إرسال",
      sending: "جاري الإرسال…",
      thanks: "شكرًا لتواصلك معنا 🙏 سنرد عليك قريبًا.",
      error: "يرجى المحاولة مرة أخرى بعد لحظة.",
    },
    fa: {
      menu: "تماس",
      title: "هر چه دوست داری بپرس",
      sub: "سؤالی داری یا با مشکلی روبرو شده‌ای؟ بگو تا زود پاسخت را بدهیم.",
      placeholder: "سؤالت را اینجا بنویس…",
      emailPlaceholder: "ایمیل برای پاسخ (اختیاری)",
      send: "ارسال",
      sending: "در حال ارسال…",
      thanks: "ممنون که با ما در تماس بودی 🙏 به‌زودی پاسخ می‌دهیم.",
      error: "لطفاً کمی بعد دوباره تلاش کن.",
    },
    sw: {
      menu: "Wasiliana",
      title: "Tuulize chochote",
      sub: "Una swali au umekutana na tatizo? Tuambie, tutajibu hivi karibuni.",
      placeholder: "Andika swali lako hapa…",
      emailPlaceholder: "Barua pepe ya jibu (hiari)",
      send: "Tuma",
      sending: "Inatuma…",
      thanks: "Asante kwa kuwasiliana nasi 🙏 Tutajibu hivi karibuni.",
      error: "Tafadhali jaribu tena baada ya muda mfupi.",
    },
  };

  const map = kind === "inquiry" ? inquiryMap : feedbackMap;
  return map[lang] || map.en;
}

/** Localized menu label for a given kind. */
export function feedbackLabel(lang: string, kind: FeedbackKind = "feedback"): string {
  return fbCopy(lang, kind).menu;
}

export function FeedbackModal({
  open,
  onClose,
  kind = "feedback",
}: {
  open: boolean;
  onClose: () => void;
  kind?: FeedbackKind;
}) {
  const { lang } = useLanguage();
  const [fbText, setFbText] = React.useState("");
  const [replyEmail, setReplyEmail] = React.useState("");
  const [fbStatus, setFbStatus] = React.useState<
    "idle" | "sending" | "done" | "error"
  >("idle");
  const fb = fbCopy(lang, kind);

  const sendFeedback = async () => {
    const message = fbText.trim();
    if (!message || fbStatus === "sending") return;
    if (!isSupabaseConfigured()) {
      setFbStatus("error");
      return;
    }
    setFbStatus("sending");
    try {
      const supabase = createClient();
      let email = "";
      try {
        const { data } = await supabase.auth.getUser();
        email = data.user?.email || "";
      } catch {
        /* not logged in — fine */
      }
      // For inquiries the user may supply a different reply-to address.
      if (kind === "inquiry" && replyEmail.trim()) {
        email = replyEmail.trim();
      }
      // Tag the message itself so entries are distinguishable in Supabase
      // without changing the table schema.
      const tag = kind === "inquiry" ? "[INQUIRY] " : "[FEEDBACK] ";
      const tagged = (tag + message).slice(0, 4000);
      const { error } = await supabase.from("app_feedback").insert({
        app: APP_ID,
        lang,
        email,
        message: tagged,
      });
      if (error) {
        setFbStatus("error");
        return;
      }
      setFbText("");
      setReplyEmail("");
      setFbStatus("done");
    } catch {
      setFbStatus("error");
    }
  };

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Reset transient state whenever the modal is reopened.
  React.useEffect(() => {
    if (open) {
      setFbText("");
      setReplyEmail("");
      setFbStatus("idle");
    }
  }, [open]);

  if (!open) return null;

  const icon = kind === "inquiry" ? "✉️" : "💬";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-selah-gold/20 bg-selah-bg1 shadow-[0_30px_90px_rgba(0,0,0,0.55)] animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-selah-cream3 transition-colors hover:bg-white/5 hover:text-selah-cream"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-7 pb-7 pt-9 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-selah-gold/25 bg-selah-gold/[0.08] text-2xl">
            {icon}
          </div>
          <h2 className="mb-2 font-display text-2xl font-semibold tracking-wide text-selah-gold">
            {fb.title}
          </h2>
          <p className="mx-auto mb-6 max-w-xs text-[14px] leading-relaxed text-selah-cream2">
            {fb.sub}
          </p>

          {fbStatus === "done" ? (
            <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-3 text-[13px] leading-relaxed text-emerald-200">
              {fb.thanks}
            </p>
          ) : (
            <div className="text-left">
              <textarea
                value={fbText}
                onChange={(e) => {
                  setFbText(e.target.value);
                  if (fbStatus === "error") setFbStatus("idle");
                }}
                rows={4}
                maxLength={4000}
                placeholder={fb.placeholder}
                className="w-full resize-none rounded-xl border border-white/10 bg-selah-bg/70 px-3 py-2.5 text-[13px] leading-relaxed text-selah-cream placeholder:text-selah-cream3/60 outline-none transition-colors focus:border-selah-gold/40"
              />
              {kind === "inquiry" && (
                <input
                  type="email"
                  value={replyEmail}
                  onChange={(e) => setReplyEmail(e.target.value)}
                  placeholder={fb.emailPlaceholder}
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-selah-bg/70 px-3 py-2.5 text-[13px] text-selah-cream placeholder:text-selah-cream3/60 outline-none transition-colors focus:border-selah-gold/40"
                />
              )}
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-selah-cream3">
                  {fbStatus === "error" ? fb.error : ""}
                </span>
                <button
                  onClick={sendFeedback}
                  disabled={!fbText.trim() || fbStatus === "sending"}
                  className={cn(
                    "rounded-xl px-4 py-2 text-[13px] font-medium transition-colors",
                    !fbText.trim() || fbStatus === "sending"
                      ? "cursor-not-allowed border border-white/10 text-selah-cream3"
                      : "bg-selah-gold text-selah-bg hover:opacity-90"
                  )}
                >
                  {fbStatus === "sending" ? fb.sending : fb.send}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
