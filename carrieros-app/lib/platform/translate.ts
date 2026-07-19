import type { PlatformLanguage } from "@/lib/platform/types";
import { LANGUAGE_LABELS } from "@/lib/platform/types";

export type TranslateDemoKind = "chat" | "document" | "job" | "invoice";

const SAMPLES: Record<TranslateDemoKind, string> = {
  chat: "Driver: Running 45 minutes late to the Dallas pickup. Can we update the broker?",
  document: "Proof of Delivery — Load LD-10482. Received in good order. Consignee: Apex Foods.",
  job: "Hiring: CDL-A reefer driver. $0.62/mile. Home weekly. Must have 2 years experience.",
  invoice: "Invoice INV-2201 · Amount due $4,850.00 · Net 30 · Broker: Horizon Logistics",
};

/** Deterministic demo translations — not a live MT engine. */
const DEMO_TRANSLATIONS: Record<
  Exclude<PlatformLanguage, "en">,
  Record<TranslateDemoKind, string>
> = {
  es: {
    chat: "Conductor: Llego 45 minutos tarde a la recogida en Dallas. ¿Podemos avisar al broker?",
    document:
      "Prueba de entrega — Carga LD-10482. Recibido en buen estado. Consignatario: Apex Foods.",
    job: "Contratación: conductor CDL-A reefer. $0.62/milla. Casa semanal. Se requieren 2 años de experiencia.",
    invoice:
      "Factura INV-2201 · Importe $4,850.00 · Neto 30 · Broker: Horizon Logistics",
  },
  fr: {
    chat: "Chauffeur : 45 minutes de retard pour le ramassage à Dallas. Pouvons-nous prévenir le courtier ?",
    document:
      "Preuve de livraison — Charge LD-10482. Reçu en bon état. Destinataire : Apex Foods.",
    job: "Embauche : chauffeur CDL-A frigo. 0,62 $/mille. Retour à la maison chaque semaine. 2 ans d'expérience requis.",
    invoice:
      "Facture INV-2201 · Montant 4 850,00 $ · Net 30 · Courtier : Horizon Logistics",
  },
  pt: {
    chat: "Motorista: Atraso de 45 minutos na coleta em Dallas. Podemos avisar o corretor?",
    document:
      "Comprovante de entrega — Carga LD-10482. Recebido em bom estado. Consignatário: Apex Foods.",
    job: "Contratação: motorista CDL-A reefer. $0,62/milha. Casa semanal. 2 anos de experiência.",
    invoice:
      "Fatura INV-2201 · Valor $4.850,00 · Net 30 · Corretor: Horizon Logistics",
  },
  hi: {
    chat: "ड्राइवर: डलास पिकअप में 45 मिनट देर। क्या हम ब्रोकर को अपडेट कर सकते हैं?",
    document: "डिलीवरी प्रमाण — लोड LD-10482। अच्छी स्थिति में प्राप्त। कंसाइनी: Apex Foods।",
    job: "भर्ती: CDL-A रीफर ड्राइवर। $0.62/मील। साप्ताहिक घर। 2 वर्ष अनुभव आवश्यक।",
    invoice: "इनवॉइस INV-2201 · राशि $4,850.00 · Net 30 · ब्रोकर: Horizon Logistics",
  },
  pl: {
    chat: "Kierowca: 45 minut spóźnienia na odbiór w Dallas. Czy możemy powiadomić brokera?",
    document:
      "Potwierdzenie dostawy — Ładunek LD-10482. Odebrano w dobrym stanie. Odbiorca: Apex Foods.",
    job: "Rekrutacja: kierowca CDL-A reefer. 0,62 $/mila. Dom co tydzień. Wymagane 2 lata doświadczenia.",
    invoice:
      "Faktura INV-2201 · Kwota 4 850,00 $ · Net 30 · Broker: Horizon Logistics",
  },
  ru: {
    chat: "Водитель: Опоздание на 45 минут на погрузку в Далласе. Можем сообщить брокеру?",
    document:
      "Подтверждение доставки — Рейс LD-10482. Получено в хорошем состоянии. Грузополучатель: Apex Foods.",
    job: "Вакансия: водитель CDL-A рефрижератор. $0.62/миля. Домой еженедельно. Нужен опыт 2 года.",
    invoice:
      "Счёт INV-2201 · Сумма $4,850.00 · Net 30 · Брокер: Horizon Logistics",
  },
  zh: {
    chat: "司机：达拉斯提货晚到45分钟。我们能通知经纪人吗？",
    document: "交货证明 — 运单 LD-10482。完好签收。收货方：Apex Foods。",
    job: "招聘：CDL-A冷藏车司机。每英里$0.62。每周回家。需2年经验。",
    invoice: "发票 INV-2201 · 应付 $4,850.00 · Net 30 · 经纪人：Horizon Logistics",
  },
};

export function getTranslateSample(kind: TranslateDemoKind): string {
  return SAMPLES[kind];
}

export function translateDemoSample(
  kind: TranslateDemoKind,
  language: PlatformLanguage,
): { source: string; translated: string; languageLabel: string; engineNote: string } {
  const source = SAMPLES[kind];
  if (language === "en") {
    return {
      source,
      translated: source,
      languageLabel: LANGUAGE_LABELS.en,
      engineNote: "Source language — no translation applied.",
    };
  }

  return {
    source,
    translated: DEMO_TRANSLATIONS[language][kind],
    languageLabel: LANGUAGE_LABELS[language],
    engineNote:
      "Alph-style demo translation (local samples). Soft-wired preference only — not a live MT service.",
  };
}
