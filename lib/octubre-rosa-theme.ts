export const OCTUBRE_ROSA_LOGO_SRC = "/octubrelogo.webp";
export const COOP_LOGO_SRC = "/images/logocoopnuevo.png";

/** Activo en octubre (mes 9 en JS). */
export function isOctubreRosaThemeActive(referenceDate = new Date()): boolean {
  return referenceDate.getMonth() === 9;
}

export function getCooperativeLogoSrc(referenceDate = new Date()): string {
  return isOctubreRosaThemeActive(referenceDate)
    ? OCTUBRE_ROSA_LOGO_SRC
    : COOP_LOGO_SRC;
}

export const octubreRosaClasses = {
  headerShell: "border-b border-pink-200/70 shadow-md shadow-pink-100/40",
  logoGlow: "bg-pink-400/15",
  brandTitle: "text-gray-600 group-hover:text-pink-600",
  navLinkHover: "hover:text-pink-600",
  navUnderline: "bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600",

  /** Layout/extra — el degradé rosa vive en `Button variant="octubreRosa"` */
  ctaButton: "font-semibold active:scale-[0.98]",

  mobileMenuButton:
    "from-pink-500/10 via-rose-400/10 to-pink-500/10 hover:from-pink-500/20 hover:via-rose-400/20 hover:to-pink-500/20 border-pink-300/30 hover:border-pink-400/50",
  mobileMenuIcon: "text-pink-600",
  mobileNavHover:
    "hover:from-pink-50 hover:via-rose-50 hover:to-pink-50 hover:text-pink-700",
  mobileNavIconBg: "from-pink-100/80 via-rose-100/80 to-pink-100/80",
  mobileNavIcon: "text-pink-600",
  footerAccentOrb: "bg-pink-400/30",
  footerSectionTitle: "text-pink-200",
  footerLinkHover: "hover:text-pink-200",
  heroOverlay:
    "from-coop-blue/75 via-pink-600/35 via-coop-purple/30 to-rose-500/35",
  heroDecorOrb: "bg-pink-400/40",
  heroBadge:
    "border-pink-200 bg-pink-200/20 text-pink-100 shadow-sm shadow-pink-200/20",
  heroBadgeIcon: "text-pink-300",
  heroTitleAccent:
    "from-pink-200 via-rose-100 to-pink-300 bg-clip-text text-transparent",

  heroSecondaryCta:
    "border-pink-200/50 hover:border-pink-200/80 hover:bg-pink-500/10",
  chatHeader:
    "bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600",
  chatMessagesBg: "from-pink-50/80 via-white to-rose-50/40",
  chatUserBubble:
    "bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 text-white",
  chatBotBubble: "bg-white text-gray-800 border border-pink-100/90 shadow-sm",
  chatQuickAction:
    "border-pink-100 hover:border-pink-300 hover:bg-pink-50/80 group-hover:text-pink-700",
  chatQuickActionIcon: "from-pink-100 to-rose-100 text-pink-600",
} as const;

export function getChatbotWelcomeMessage(octubreRosa: boolean): string {
  if (octubreRosa) {
    return (
      "¡Hola! 👋 Soy el asistente virtual de la **Cooperativa La Dormida**.\n\n" +
      "En **Octubre Rosa** acompañamos la concientización sobre el cáncer de mama. " +
      "La detección temprana y los controles médicos son fundamentales.\n\n" +
      "¿En qué puedo ayudarte? Estoy disponible **24/7**."
    );
  }
  return (
    "¡Hola! 👋 Soy el asistente virtual de la Cooperativa La Dormida y estoy aquí para ayudarte 24/7. ¿En qué puedo asistirte hoy?"
  );
}
