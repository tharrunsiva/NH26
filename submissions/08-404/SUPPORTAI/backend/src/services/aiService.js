const OpenAI = require("openai");

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const festivalContexts = {
  diwali:
    "Diwali season can increase fulfillment traffic and courier delays, so I have factored that into the guidance.",
  pongal:
    "Pongal holiday schedules sometimes affect regional delivery routes, so I have factored that into the guidance."
};

function detectLanguage(text = "") {
  const normalized = text.toLowerCase();
  if (/[\u0900-\u097f]/.test(text)) return "Hindi";
  if (/[\u0b80-\u0bff]/.test(text)) return "Tamil";
  if (/(enna|unga|vandila|seri|illa|inga|epdi)/i.test(normalized)) return "Tanglish";
  return "English";
}

function detectCategory(text = "") {
  const normalized = text.toLowerCase();
  if (/(refund|payment|charged|upi|card|billing|invoice)/i.test(normalized)) return "Billing";
  if (/(app|login|website|bug|error|technical|otp)/i.test(normalized)) return "Technical";
  return "Delivery";
}

function detectSeverity(text = "") {
  const normalized = text.toLowerCase();
  if (
    /(fraud|stolen|missing|not received|damaged|broken|scam|wrong item|delivered but not received)/i.test(
      normalized
    )
  ) {
    return "HIGH";
  }

  if (/(delay|late|reschedule|stuck|pending|cancel|replacement)/i.test(normalized)) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildIncidentAnalysis(message, orderContext = {}) {
  const normalized = message.toLowerCase();
  const timeline = [
    { label: "Ordered", status: "done", date: orderContext.orderedAt || "2026-03-18" },
    { label: "Shipped", status: "done", date: orderContext.shippedAt || "2026-03-19" },
    {
      label: "Out for delivery",
      status: "done",
      date: orderContext.outForDeliveryAt || "2026-03-21"
    },
    { label: "Delivered", status: "issue", date: orderContext.deliveredAt || "2026-03-22" }
  ];

  if (/(delivered but not received|marked delivered|not received)/i.test(normalized)) {
    return {
      issue: "Possible delivery scan mismatch",
      explanation:
        "It appears your package may have been incorrectly marked delivered because of a logistics scanning issue during the final handoff.",
      timeline
    };
  }

  if (/(delay|late|stuck|not moving)/i.test(normalized)) {
    return {
      issue: "Transit delay",
      explanation:
        "The package is likely delayed in the line-haul or local hub stage. This usually happens when the shipment misses a sorting window or vehicle route.",
      timeline: timeline.map((item, index) =>
        index < 2 ? item : { ...item, status: index === 2 ? "current" : "pending" }
      )
    };
  }

  if (/(payment|refund|charged)/i.test(normalized)) {
    return {
      issue: "Payment reconciliation issue",
      explanation:
        "The order appears to need payment reconciliation. This can happen when the payment gateway authorizes the amount but the merchant status does not update in time.",
      timeline: []
    };
  }

  return {
    issue: "General support request",
    explanation:
      "I analyzed the complaint details and this looks like a standard support request that may be resolved with shipping or account verification.",
    timeline
  };
}

function translateResponse(language, englishText, learningMode) {
  const mapped =
    {
      Hindi: { primary: `Hindi: ${englishText}`, secondary: `English: ${englishText}` },
      Tamil: { primary: `Tamil: ${englishText}`, secondary: `English: ${englishText}` },
      Tanglish: { primary: `Tanglish: ${englishText}`, secondary: `English: ${englishText}` },
      English: { primary: englishText, secondary: null }
    }[language] || { primary: englishText, secondary: null };

  if (learningMode && mapped.secondary) {
    return `${mapped.primary}\n${mapped.secondary}`;
  }

  return mapped.primary;
}

function buildHeuristicResponse({ message, language, category, severity, learningMode, incident }) {
  const normalized = message.toLowerCase();
  const festivalKey = Object.keys(festivalContexts).find((key) => normalized.includes(key));
  const festivalNote = festivalKey ? ` ${festivalContexts[festivalKey]}` : "";

  let response =
    "I checked the issue details and I can guide you through the next best action right away.";

  if (category === "Billing") {
    response =
      "I can help verify the payment status, refund window, and whether the charge is only an authorization hold.";
  }

  if (category === "Delivery") {
    response = `${incident.explanation} I recommend confirming the delivery address, nearby drop-off spot, and courier contact status.`;
  }

  if (category === "Technical") {
    response =
      "This looks like a technical support issue. Please confirm the exact screen or step where the error appears so I can narrow it down.";
  }

  if (severity === "HIGH") {
    response += " Because the risk level is high, I am also preparing this case for human review.";
  }

  return translateResponse(language, `${response}${festivalNote}`, learningMode);
}

async function analyzeWithOpenAI(payload) {
  const completion = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You are an AI support triage assistant. Analyze the complaint, infer language, category, severity, whether resolved, and return strict JSON only."
          }
        ]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: JSON.stringify(payload) }]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "support_triage",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            response: { type: "string" },
            category: { type: "string", enum: ["Billing", "Technical", "Delivery"] },
            severity: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            resolved: { type: "boolean" },
            language: { type: "string" }
          },
          required: ["response", "category", "severity", "resolved", "language"]
        }
      }
    }
  });

  return JSON.parse(completion.output_text);
}

async function processSupportMessage({
  message,
  transcript = [],
  orderContext = {},
  learningMode = false
}) {
  const language = detectLanguage(message);
  const category = detectCategory(message);
  const severity = detectSeverity(message);
  const incident = buildIncidentAnalysis(message, orderContext);

  const fallbackResult = {
    response: buildHeuristicResponse({
      message,
      language,
      category,
      severity,
      learningMode,
      incident
    }),
    category,
    severity,
    resolved: severity === "LOW" && category !== "Technical",
    language
  };

  let result = fallbackResult;

  if (client) {
    try {
      result = await analyzeWithOpenAI({
        message,
        transcript,
        orderContext,
        learningMode,
        incident,
        supportedLanguages: ["English", "Hindi", "Tamil", "Tanglish"]
      });
    } catch (error) {
      result = {
        ...fallbackResult,
        response: `${fallbackResult.response}\n\nNote: OpenAI is currently unavailable or out of quota, so I used the built-in support flow.`
      };
    }
  }

  return { ...result, incident };
}

module.exports = { processSupportMessage };
