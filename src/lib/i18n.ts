import type { LangCode } from "./types";

export const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "th", label: "ไทย" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
  { code: "zh", label: "中文" },
];

export interface Dict {
  tagline: string;
  introTitle: string;
  introDesc: string;
  verseText: string;
  verseRef: string;
  enter: string;
  note: string;
  platform: string;
  bibleOn: string;
  bibleOff: string;
  welcomeTitle: string;
  welcomeDesc: string;
  placeholder: string;
  hint: string;
  send: string;
  examples: string[];
  // sidebar
  newChat: string;
  history: string;
  rename: string;
  delete: string;
  confirmDelete: string;
  noSessions: string;
  // auth
  authTitle: string;
  authDesc: string;
  google: string;
  kakao: string;
  email: string;
  password: string;
  name: string;
  login: string;
  signup: string;
  loggingIn: string;
  signingUp: string;
  logout: string;
  toSignup: string;
  toLogin: string;
  haveAccount: string;
  needAccount: string;
  passwordMin: string;
  invalidEmail: string;
  authConfigMissing: string;
  thinking: string;
  donate: string;
  donateTitle: string;
  donateSub: string;
  donateKakao: string;
  donateKakaoDesc: string;
  donatePaypal: string;
  donatePaypalDesc: string;
  donateBankLabel: string;
  donateBank: string;
  donateAccount: string;
  donateHolder: string;
  donateCopy: string;
  donateCopied: string;
  donateNote: string;
  installTitle: string;
  installDesc: string;
  installButton: string;
  installAndroid: string;
  installIOS: string;
  installLater: string;
  attach: string;
  photoSent: string;
  photoChat: string;
  photoTooLarge: string;
}

const ko: Dict = {
  tagline: "크리스천을 위한 마음 동행, 셀라",
  introTitle: "마음을 나누기 전, 안전한 공간을 준비할게요.",
  introDesc:
    "힘든 순간, 판단하지 않고 함께 걷겠습니다. 하나님의 말씀과 그 원리로 당신 곁에 있겠습니다.",
  verseText:
    "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라",
  verseRef: "마태복음 11:28",
  enter: "셀라 시작하기",
  note: "셀라는 전문 심리상담을 대체하지 않습니다.",
  platform: "AI 마음 동행",
  bibleOn: "말씀 켬",
  bibleOff: "말씀 끔",
  welcomeTitle: "어떤 마음으로 오셨나요?",
  welcomeDesc: "힘든 일이 있으신가요? 마음을 편히 나눠주세요.",
  placeholder: "마음을 나눠주세요…",
  hint: "Enter 전송 · Shift+Enter 줄바꿈",
  send: "보내기",
  examples: [
    "😨 불안하고 두려워요",
    "💔 관계가 힘들어요",
    "😔 외롭고 우울해요",
    "🥹 감사 기도를 드리고 싶어요",
    "✨ 은혜로운 일이 있어요",
    "🙏 기도가 필요해요",
  ],
  newChat: "새 대화",
  history: "대화 기록",
  rename: "이름 변경",
  delete: "삭제",
  confirmDelete: "이 대화를 삭제할까요?",
  noSessions: "아직 대화가 없습니다.",
  authTitle: "마음을 나누기 전, 안전한 공간을 준비할게요.",
  authDesc: "로그인하면 상담 기록과 마음의 여정을 사용자별로 저장합니다.",
  google: "Google로 계속하기",
  kakao: "카카오로 계속하기",
  email: "이메일",
  password: "비밀번호",
  name: "이름 (선택)",
  login: "로그인",
  signup: "회원가입",
  loggingIn: "로그인 중…",
  signingUp: "가입 중…",
  logout: "로그아웃",
  toSignup: "회원가입",
  toLogin: "로그인",
  haveAccount: "이미 계정이 있으신가요?",
  needAccount: "계정이 없으신가요?",
  passwordMin: "비밀번호는 6자 이상이어야 합니다.",
  invalidEmail: "올바른 이메일을 입력해주세요.",
  authConfigMissing:
    "Supabase 설정이 필요합니다. 환경변수를 확인해주세요.",
  thinking: "셀라가 마음을 헤아리는 중…",
  donate: "함께하기",
  donateTitle: "함께하기",
  donateSub:
    "셀라의 사역을 함께해주세요. 여러분의 후원이 더 많은 분들에게 하나님의 위로를 전합니다.",
  donateKakao: "카카오페이로 후원하기",
  donateKakaoDesc: "카카오페이 · 간편 결제",
  donatePaypal: "페이팔로 후원하기",
  donatePaypalDesc: "해외 카드 · 전 세계 어디서나",
  donateBankLabel: "계좌이체",
  donateBank: "은행",
  donateAccount: "계좌번호",
  donateHolder: "예금주",
  donateCopy: "복사",
  donateCopied: "복사됨",
  donateNote:
    "후원금은 셀라 서비스 운영 및 선교에 사용됩니다. 사랑과 기도로 함께해주셔서 감사합니다.",
  installTitle: "셀라를 앱처럼 사용하세요",
  installDesc:
    "홈 화면에 추가하면 앱스토어 없이도 셀라를 앱처럼 바로 열 수 있어요.",
  installButton: "앱으로 설치하기",
  installAndroid:
    "Chrome 메뉴(⋮)를 누르고 ‘홈 화면에 추가’를 선택하세요.",
  installIOS:
    "Safari 하단의 공유 버튼을 누르고 ‘홈 화면에 추가’를 선택하세요.",
  installLater: "다음에",
  attach: "사진 첨부",
  photoSent: "[사진을 보냈어요]",
  photoChat: "사진 상담",
  photoTooLarge: "이미지가 너무 큽니다. 더 작은 사진을 올려주세요.",
};

const en: Dict = {
  tagline: "Selah, before you respond",
  introTitle: "Before you share your heart, we prepare a safe space.",
  introDesc:
    "In hard moments I walk with you without judgment, with God's Word and its wisdom beside you.",
  verseText:
    "Come to me, all who labor and are heavy laden, and I will give you rest.",
  verseRef: "Matthew 11:28",
  enter: "Enter SELAH",
  note: "SELAH does not replace professional counseling.",
  platform: "An AI companion for the heart",
  bibleOn: "Bible On",
  bibleOff: "Bible Off",
  welcomeTitle: "What brings you here today?",
  welcomeDesc: "Is something weighing on you? Share freely.",
  placeholder: "Share your heart…",
  hint: "Enter to send · Shift+Enter for newline",
  send: "Send",
  examples: [
    "😨 I feel anxious and afraid",
    "💔 My relationship hurts",
    "😔 I feel lonely",
    "🥹 I want to give thanks",
    "✨ Something graceful happened",
    "🙏 I need prayer",
  ],
  newChat: "New Chat",
  history: "History",
  rename: "Rename",
  delete: "Delete",
  confirmDelete: "Delete this conversation?",
  noSessions: "No conversations yet.",
  authTitle: "Before you share your heart, we prepare a safe space.",
  authDesc: "Sign in to save your conversations and heart journey securely.",
  google: "Continue with Google",
  kakao: "Continue with Kakao",
  email: "Email",
  password: "Password",
  name: "Name (optional)",
  login: "Log in",
  signup: "Sign up",
  loggingIn: "Signing in…",
  signingUp: "Creating account…",
  logout: "Log out",
  toSignup: "Sign up",
  toLogin: "Log in",
  haveAccount: "Already have an account?",
  needAccount: "Don't have an account?",
  passwordMin: "Password must be at least 6 characters.",
  invalidEmail: "Please enter a valid email.",
  authConfigMissing: "Supabase is not configured. Check your env variables.",
  thinking: "SELAH is reflecting…",
  donate: "Walk with us",
  donateTitle: "Walk with SELAH",
  donateSub:
    "Walk alongside SELAH's ministry. Your support carries God's comfort to more people.",
  donateKakao: "Give with KakaoPay",
  donateKakaoDesc: "KakaoPay · quick payment",
  donatePaypal: "Give with PayPal",
  donatePaypalDesc: "Cards · from anywhere in the world",
  donateBankLabel: "Bank transfer",
  donateBank: "Bank",
  donateAccount: "Account",
  donateHolder: "Holder",
  donateCopy: "Copy",
  donateCopied: "Copied",
  donateNote:
    "Gifts support SELAH's operation and mission. Thank you for walking with us in love and prayer.",
  installTitle: "Use SELAH like an app",
  installDesc:
    "Add SELAH to your home screen to open it like a real app — no app store needed.",
  installButton: "Install as app",
  installAndroid:
    "Open the Chrome menu (⋮) and choose ‘Add to Home screen’.",
  installIOS:
    "Tap the Share button in Safari, then choose ‘Add to Home Screen’.",
  installLater: "Later",
  attach: "Attach photo",
  photoSent: "[Sent a photo]",
  photoChat: "Photo reflection",
  photoTooLarge: "That image is too large. Please attach a smaller photo.",
};

const th: Dict = {
  tagline: "เซลาห์ ก่อนที่คุณจะตอบสนอง",
  introTitle: "ก่อนแบ่งปันหัวใจ เราจะเตรียมพื้นที่ปลอดภัยให้คุณ",
  introDesc:
    "ในช่วงเวลายากลำบาก ฉันจะเดินไปกับคุณโดยไม่ตัดสิน ด้วยพระวจนะของพระเจ้าและสติปัญญาจากพระองค์",
  verseText:
    "บรรดาผู้เหน็ดเหนื่อยและแบกภาระหนัก จงมาหาเรา และเราจะให้ท่านทั้งหลายได้หยุดพัก",
  verseRef: "มัทธิว 11:28",
  enter: "เริ่ม SELAH",
  note: "SELAH ไม่ใช่สิ่งทดแทนการให้คำปรึกษาจากผู้เชี่ยวชาญ",
  platform: "เพื่อนร่วมทางใจด้วย AI",
  bibleOn: "เปิดพระวจนะ",
  bibleOff: "ปิดพระวจนะ",
  welcomeTitle: "วันนี้คุณรู้สึกอย่างไร?",
  welcomeDesc: "มีเรื่องหนักใจอยู่ไหม? แบ่งปันได้อย่างสบายใจ",
  placeholder: "แบ่งปันความรู้สึกของคุณ…",
  hint: "Enter เพื่อส่ง · Shift+Enter ขึ้นบรรทัดใหม่",
  send: "ส่ง",
  examples: [
    "😨 ฉันกังวลและกลัว",
    "💔 ความสัมพันธ์ทำให้ฉันเหนื่อย",
    "😔 ฉันรู้สึกเหงา",
    "😡 ฉันโกรธมาก",
    "😞 ฉันรู้สึกว่าล้มเหลว",
    "🙏 ฉันต้องการคำอธิษฐาน",
  ],
  newChat: "แชทใหม่",
  history: "ประวัติ",
  rename: "เปลี่ยนชื่อ",
  delete: "ลบ",
  confirmDelete: "ลบบทสนทนานี้หรือไม่?",
  noSessions: "ยังไม่มีบทสนทนา",
  authTitle: "ก่อนแบ่งปันหัวใจ เราจะเตรียมพื้นที่ปลอดภัยให้คุณ",
  authDesc: "เข้าสู่ระบบเพื่อบันทึกบทสนทนาและเส้นทางหัวใจของคุณอย่างปลอดภัย",
  google: "ดำเนินการต่อด้วย Google",
  kakao: "ดำเนินการต่อด้วย Kakao",
  email: "อีเมล",
  password: "รหัสผ่าน",
  name: "ชื่อ (ไม่บังคับ)",
  login: "เข้าสู่ระบบ",
  signup: "สมัครสมาชิก",
  loggingIn: "กำลังเข้าสู่ระบบ…",
  signingUp: "กำลังสร้างบัญชี…",
  logout: "ออกจากระบบ",
  toSignup: "สมัครสมาชิก",
  toLogin: "เข้าสู่ระบบ",
  haveAccount: "มีบัญชีอยู่แล้ว?",
  needAccount: "ยังไม่มีบัญชี?",
  passwordMin: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
  invalidEmail: "โปรดกรอกอีเมลที่ถูกต้อง",
  authConfigMissing: "ยังไม่ได้ตั้งค่า Supabase โปรดตรวจสอบตัวแปรสภาพแวดล้อม",
  thinking: "SELAH กำลังใคร่ครวญ…",
  donate: "ร่วมเดินด้วยกัน",
  donateTitle: "ร่วมเดินไปกับ SELAH",
  donateSub:
    "ร่วมเดินไปกับพันธกิจของ SELAH การสนับสนุนของคุณนำการปลอบโยนของพระเจ้าไปสู่ผู้คนมากขึ้น",
  donateKakao: "บริจาคผ่าน KakaoPay",
  donateKakaoDesc: "KakaoPay · ชำระเงินง่าย",
  donatePaypal: "บริจาคผ่าน PayPal",
  donatePaypalDesc: "บัตรต่างประเทศ · จากทั่วโลก",
  donateBankLabel: "โอนผ่านธนาคาร",
  donateBank: "ธนาคาร",
  donateAccount: "เลขบัญชี",
  donateHolder: "ชื่อบัญชี",
  donateCopy: "คัดลอก",
  donateCopied: "คัดลอกแล้ว",
  donateNote:
    "เงินบริจาคใช้สำหรับการดำเนินงานและพันธกิจของ SELAH ขอบคุณที่ร่วมเดินไปด้วยความรักและคำอธิษฐาน",
  installTitle: "ใช้ SELAH เหมือนแอป",
  installDesc:
    "เพิ่ม SELAH ไปที่หน้าจอหลักเพื่อเปิดใช้เหมือนแอปจริง โดยไม่ต้องใช้สโตร์",
  installButton: "ติดตั้งเป็นแอป",
  installAndroid:
    "เปิดเมนู Chrome (⋮) แล้วเลือก ‘เพิ่มไปที่หน้าจอหลัก’",
  installIOS:
    "แตะปุ่มแชร์ใน Safari แล้วเลือก ‘เพิ่มไปที่หน้าจอโฮม’",
  installLater: "ภายหลัง",
  attach: "แนบรูปภาพ",
  photoSent: "[ส่งรูปภาพ]",
  photoChat: "ปรึกษาผ่านรูปภาพ",
  photoTooLarge: "รูปภาพใหญ่เกินไป กรุณาแนบรูปที่เล็กลง",
};

const es: Dict = {
  tagline: "Selah, antes de reaccionar",
  introTitle: "Antes de compartir tu corazón, preparamos un espacio seguro.",
  introDesc:
    "En los momentos difíciles camino contigo sin juzgar, con la Palabra de Dios y su sabiduría a tu lado.",
  verseText:
    "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
  verseRef: "Mateo 11:28",
  enter: "Entrar a SELAH",
  note: "SELAH no reemplaza la consejería profesional.",
  platform: "Un compañero emocional con IA",
  bibleOn: "Biblia Activa",
  bibleOff: "Biblia Inactiva",
  welcomeTitle: "¿Con qué corazón llegas hoy?",
  welcomeDesc: "¿Hay algo que te pesa? Compártelo con libertad.",
  placeholder: "Comparte tu corazón…",
  hint: "Enter para enviar · Shift+Enter para salto de línea",
  send: "Enviar",
  examples: [
    "😨 Siento ansiedad y miedo",
    "💔 Mi relación me duele",
    "😔 Me siento solo/a",
    "😡 Siento mucha ira",
    "😞 Siento que fracasé",
    "🙏 Necesito oración",
  ],
  newChat: "Nuevo chat",
  history: "Historial",
  rename: "Renombrar",
  delete: "Eliminar",
  confirmDelete: "¿Eliminar esta conversación?",
  noSessions: "Aún no hay conversaciones.",
  authTitle: "Antes de compartir tu corazón, preparamos un espacio seguro.",
  authDesc:
    "Inicia sesión para guardar tus conversaciones y tu camino emocional.",
  google: "Continuar con Google",
  kakao: "Continuar con Kakao",
  email: "Correo",
  password: "Contraseña",
  name: "Nombre (opcional)",
  login: "Iniciar sesión",
  signup: "Crear cuenta",
  loggingIn: "Iniciando sesión…",
  signingUp: "Creando cuenta…",
  logout: "Cerrar sesión",
  toSignup: "Crear cuenta",
  toLogin: "Iniciar sesión",
  haveAccount: "¿Ya tienes una cuenta?",
  needAccount: "¿No tienes una cuenta?",
  passwordMin: "La contraseña debe tener al menos 6 caracteres.",
  invalidEmail: "Introduce un correo válido.",
  authConfigMissing:
    "Supabase no está configurado. Revisa tus variables de entorno.",
  thinking: "SELAH está reflexionando…",
  donate: "Caminar juntos",
  donateTitle: "Camina con SELAH",
  donateSub:
    "Camina junto al ministerio de SELAH. Tu apoyo lleva el consuelo de Dios a más personas.",
  donateKakao: "Donar con KakaoPay",
  donateKakaoDesc: "KakaoPay · pago rápido",
  donatePaypal: "Donar con PayPal",
  donatePaypalDesc: "Tarjetas · desde cualquier país",
  donateBankLabel: "Transferencia bancaria",
  donateBank: "Banco",
  donateAccount: "Cuenta",
  donateHolder: "Titular",
  donateCopy: "Copiar",
  donateCopied: "Copiado",
  donateNote:
    "Las donaciones sostienen la operación y misión de SELAH. Gracias por acompañarnos con amor y oración.",
  installTitle: "Usa SELAH como una app",
  installDesc:
    "Añade SELAH a tu pantalla de inicio para abrirlo como una app real, sin tienda.",
  installButton: "Instalar como app",
  installAndroid:
    "Abre el menú de Chrome (⋮) y elige ‘Añadir a pantalla de inicio’.",
  installIOS:
    "Pulsa el botón Compartir en Safari y elige ‘Añadir a pantalla de inicio’.",
  installLater: "Más tarde",
  attach: "Adjuntar foto",
  photoSent: "[Envió una foto]",
  photoChat: "Reflexión con foto",
  photoTooLarge: "Esa imagen es demasiado grande. Adjunta una más pequeña.",
};

const pt: Dict = {
  tagline: "Selah, antes de reagir",
  introTitle: "Antes de compartilhar seu coração, preparamos um espaço seguro.",
  introDesc:
    "Nos momentos difíceis caminho com você sem julgamento, com a Palavra de Deus e sua sabedoria ao seu lado.",
  verseText:
    "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
  verseRef: "Mateus 11:28",
  enter: "Entrar no SELAH",
  note: "SELAH não substitui aconselhamento profissional.",
  platform: "Um companheiro emocional com IA",
  bibleOn: "Bíblia Ativada",
  bibleOff: "Bíblia Desativada",
  welcomeTitle: "Como está o seu coração hoje?",
  welcomeDesc: "Algo está pesando em você? Compartilhe livremente.",
  placeholder: "Compartilhe seu coração…",
  hint: "Enter para enviar · Shift+Enter para nova linha",
  send: "Enviar",
  examples: [
    "😨 Estou ansioso(a) e com medo",
    "💔 Meu relacionamento dói",
    "😔 Sinto-me sozinho(a)",
    "😡 Estou com muita raiva",
    "😞 Sinto que falhei",
    "🙏 Preciso de oração",
  ],
  newChat: "Nova conversa",
  history: "Histórico",
  rename: "Renomear",
  delete: "Excluir",
  confirmDelete: "Excluir esta conversa?",
  noSessions: "Ainda não há conversas.",
  authTitle:
    "Antes de compartilhar seu coração, preparamos um espaço seguro.",
  authDesc:
    "Entre para salvar suas conversas e sua jornada emocional com segurança.",
  google: "Continuar com Google",
  kakao: "Continuar com Kakao",
  email: "E-mail",
  password: "Senha",
  name: "Nome (opcional)",
  login: "Entrar",
  signup: "Criar conta",
  loggingIn: "Entrando…",
  signingUp: "Criando conta…",
  logout: "Sair",
  toSignup: "Criar conta",
  toLogin: "Entrar",
  haveAccount: "Já tem uma conta?",
  needAccount: "Não tem uma conta?",
  passwordMin: "A senha deve ter pelo menos 6 caracteres.",
  invalidEmail: "Digite um e-mail válido.",
  authConfigMissing:
    "Supabase não está configurado. Verifique suas variáveis de ambiente.",
  thinking: "SELAH está refletindo…",
  donate: "Caminhar juntos",
  donateTitle: "Caminhe com o SELAH",
  donateSub:
    "Caminhe ao lado do ministério do SELAH. Seu apoio leva o consolo de Deus a mais pessoas.",
  donateKakao: "Doar com KakaoPay",
  donateKakaoDesc: "KakaoPay · pagamento rápido",
  donatePaypal: "Doar com PayPal",
  donatePaypalDesc: "Cartões · de qualquer lugar do mundo",
  donateBankLabel: "Transferência bancária",
  donateBank: "Banco",
  donateAccount: "Conta",
  donateHolder: "Titular",
  donateCopy: "Copiar",
  donateCopied: "Copiado",
  donateNote:
    "As doações sustentam a operação e missão do SELAH. Obrigado por caminhar conosco com amor e oração.",
  installTitle: "Use o SELAH como um app",
  installDesc:
    "Adicione o SELAH à tela inicial para abri-lo como um app de verdade, sem loja.",
  installButton: "Instalar como app",
  installAndroid:
    "Abra o menu do Chrome (⋮) e escolha ‘Adicionar à tela inicial’.",
  installIOS:
    "Toque no botão Compartilhar no Safari e escolha ‘Adicionar à Tela de Início’.",
  installLater: "Depois",
  attach: "Anexar foto",
  photoSent: "[Enviou uma foto]",
  photoChat: "Reflexão com foto",
  photoTooLarge: "Essa imagem é muito grande. Anexe uma foto menor.",
};

const hi: Dict = {
  tagline: "प्रतिक्रिया देने से पहले, सेलाह",
  introTitle: "अपना मन साझा करने से पहले, हम सुरक्षित स्थान तैयार करते हैं।",
  introDesc:
    "कठिन क्षणों में मैं बिना न्याय किए आपके साथ चलता हूँ, परमेश्वर के वचन और उसकी बुद्धि के साथ।",
  verseText:
    "हे सब परिश्रम करनेवालो और बोझ से दबे लोगो, मेरे पास आओ; मैं तुम्हें विश्राम दूँगा",
  verseRef: "मत्ती 11:28",
  enter: "SELAH में प्रवेश करें",
  note: "SELAH पेशेवर काउंसलिंग का विकल्प नहीं है।",
  platform: "एक AI मन साथी",
  bibleOn: "वचन चालू",
  bibleOff: "वचन बंद",
  welcomeTitle: "आज आपका मन कैसा है?",
  welcomeDesc: "क्या कोई बात आपको भारी लग रही है? खुलकर साझा करें।",
  placeholder: "अपना मन साझा करें…",
  hint: "Enter भेजें · Shift+Enter नई पंक्ति",
  send: "भेजें",
  examples: [
    "😨 मुझे चिंता और डर लग रहा है",
    "💔 रिश्ते से बहुत तकलीफ़ है",
    "😔 मैं अकेला/अकेली महसूस करता/करती हूँ",
    "😡 मुझे बहुत गुस्सा आ रहा है",
    "😞 मुझे लगता है मैं असफल हो गया/गई",
    "🙏 मुझे प्रार्थना चाहिए",
  ],
  newChat: "नई चैट",
  history: "इतिहास",
  rename: "नाम बदलें",
  delete: "हटाएँ",
  confirmDelete: "इस बातचीत को हटाएँ?",
  noSessions: "अभी तक कोई बातचीत नहीं।",
  authTitle: "अपना मन साझा करने से पहले, हम सुरक्षित स्थान तैयार करते हैं।",
  authDesc:
    "अपनी बातचीत और मन की यात्रा सुरक्षित रखने के लिए लॉग इन करें।",
  google: "Google से जारी रखें",
  kakao: "Kakao से जारी रखें",
  email: "ईमेल",
  password: "पासवर्ड",
  name: "नाम (वैकल्पिक)",
  login: "लॉग इन",
  signup: "साइन अप",
  loggingIn: "लॉग इन हो रहा है…",
  signingUp: "खाता बन रहा है…",
  logout: "लॉग आउट",
  toSignup: "साइन अप",
  toLogin: "लॉग इन",
  haveAccount: "क्या आपका पहले से खाता है?",
  needAccount: "क्या आपका खाता नहीं है?",
  passwordMin: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
  invalidEmail: "कृपया सही ईमेल दर्ज करें।",
  authConfigMissing:
    "Supabase कॉन्फ़िगर नहीं है। अपने एनवायरनमेंट वेरिएबल जाँचें।",
  thinking: "SELAH विचार कर रहा है…",
  donate: "साथ चलें",
  donateTitle: "SELAH के साथ चलें",
  donateSub:
    "SELAH की सेवकाई के साथ चलें। आपका सहयोग परमेश्वर की सांत्वना अधिक लोगों तक पहुँचाता है।",
  donateKakao: "KakaoPay से दान करें",
  donateKakaoDesc: "KakaoPay · त्वरित भुगतान",
  donatePaypal: "PayPal से दान करें",
  donatePaypalDesc: "कार्ड · दुनिया में कहीं से भी",
  donateBankLabel: "बैंक ट्रांसफ़र",
  donateBank: "बैंक",
  donateAccount: "खाता",
  donateHolder: "खाताधारक",
  donateCopy: "कॉपी",
  donateCopied: "कॉपी हुआ",
  donateNote:
    "दान SELAH के संचालन और मिशन में उपयोग होता है। प्रेम और प्रार्थना से साथ देने के लिए धन्यवाद।",
  installTitle: "SELAH को ऐप की तरह इस्तेमाल करें",
  installDesc:
    "SELAH को होम स्क्रीन पर जोड़ें और ऐप की तरह सीधे खोलें — किसी स्टोर की ज़रूरत नहीं।",
  installButton: "ऐप के रूप में इंस्टॉल करें",
  installAndroid:
    "Chrome मेनू (⋮) खोलें और ‘होम स्क्रीन पर जोड़ें’ चुनें।",
  installIOS:
    "Safari में Share बटन दबाएँ, फिर ‘Add to Home Screen’ चुनें।",
  installLater: "बाद में",
  attach: "फ़ोटो जोड़ें",
  photoSent: "[एक फ़ोटो भेजी]",
  photoChat: "फ़ोटो पर बातचीत",
  photoTooLarge: "यह छवि बहुत बड़ी है। कृपया छोटी फ़ोटो जोड़ें।",
};

const zh: Dict = {
  tagline: "回应之前，先 Selah",
  introTitle: "在分享你的内心之前，我们先准备一个安全的空间。",
  introDesc:
    "在艰难时刻，我会不评判地陪你同行，以神的话语和其中的智慧陪在你身边。",
  verseText: "凡劳苦担重担的人，可以到我这里来，我就使你们得安息。",
  verseRef: "马太福音 11:28",
  enter: "进入 SELAH",
  note: "SELAH 不能替代专业心理咨询。",
  platform: "AI 心灵同行",
  bibleOn: "圣经开启",
  bibleOff: "圣经关闭",
  welcomeTitle: "今天你的心情如何？",
  welcomeDesc: "有什么让你感到沉重吗？请自在地分享。",
  placeholder: "分享你的心…",
  hint: "Enter 发送 · Shift+Enter 换行",
  send: "发送",
  examples: [
    "😨 我感到焦虑和害怕",
    "💔 关系让我很痛苦",
    "😔 我感到孤独",
    "😡 我很生气",
    "😞 我觉得自己失败了",
    "🙏 我需要祷告",
  ],
  newChat: "新对话",
  history: "历史记录",
  rename: "重命名",
  delete: "删除",
  confirmDelete: "删除这个对话吗？",
  noSessions: "还没有对话。",
  authTitle: "在分享你的内心之前，我们先准备一个安全的空间。",
  authDesc: "登录后可安全保存你的对话和心灵旅程。",
  google: "使用 Google 继续",
  kakao: "使用 Kakao 继续",
  email: "邮箱",
  password: "密码",
  name: "姓名（可选）",
  login: "登录",
  signup: "注册",
  loggingIn: "正在登录…",
  signingUp: "正在创建账户…",
  logout: "退出登录",
  toSignup: "注册",
  toLogin: "登录",
  haveAccount: "已有账户？",
  needAccount: "还没有账户？",
  passwordMin: "密码至少需要 6 个字符。",
  invalidEmail: "请输入有效的邮箱。",
  authConfigMissing: "Supabase 尚未配置。请检查环境变量。",
  thinking: "SELAH 正在思考…",
  donate: "同行",
  donateTitle: "与 SELAH 同行",
  donateSub:
    "与 SELAH 的事工同行。您的支持将神的安慰带给更多的人。",
  donateKakao: "用 KakaoPay 奉献",
  donateKakaoDesc: "KakaoPay · 便捷支付",
  donatePaypal: "用 PayPal 奉献",
  donatePaypalDesc: "国际银行卡 · 全球皆可",
  donateBankLabel: "银行转账",
  donateBank: "银行",
  donateAccount: "账号",
  donateHolder: "户名",
  donateCopy: "复制",
  donateCopied: "已复制",
  donateNote:
    "奉献用于 SELAH 的运营与宣教。感谢您以爱与祷告与我们同行。",
  installTitle: "像 App 一样使用 SELAH",
  installDesc:
    "把 SELAH 添加到主屏幕，无需应用商店即可像 App 一样直接打开。",
  installButton: "安装为 App",
  installAndroid:
    "打开 Chrome 菜单（⋮），选择“添加到主屏幕”。",
  installIOS:
    "在 Safari 点按分享按钮，然后选择“添加到主屏幕”。",
  installLater: "稍后",
  attach: "添加照片",
  photoSent: "[发送了一张照片]",
  photoChat: "照片倾诉",
  photoTooLarge: "图片太大了，请上传较小的照片。",
};

export const DICTS: Record<LangCode, Dict> = { ko, en, th, es, pt, hi, zh };

export function getDict(lang: LangCode): Dict {
  return DICTS[lang] || DICTS.en;
}

const SUPPORTED: LangCode[] = ["ko", "en", "th", "es", "pt", "hi", "zh"];

export function normalizeLang(input?: string | null): LangCode {
  const base = String(input || "en").toLowerCase().split("-")[0];
  if (base === "zh") return "zh";
  return (SUPPORTED.includes(base as LangCode) ? base : "en") as LangCode;
}

/** Heuristic language detection from raw user text. */
export function detectLangFromText(text: string): LangCode | null {
  const t = String(text || "");
  if (/[가-힣]/.test(t)) return "ko";
  if (/[\u0E00-\u0E7F]/.test(t)) return "th";
  if (/[\u0900-\u097F]/.test(t)) return "hi";
  if (/[\u4E00-\u9FFF]/.test(t)) return "zh";
  if (
    /\b(estoy|siento|solo|sola|miedo|ansioso|triste|necesito|ayuda|oración|gracias)\b/i.test(
      t
    )
  )
    return "es";
  if (
    /\b(estou|sinto|sozinho|sozinha|medo|triste|preciso|ajuda|oração|obrigado)\b/i.test(
      t
    )
  )
    return "pt";
  if (/[a-z]/i.test(t)) return "en";
  return null;
}
