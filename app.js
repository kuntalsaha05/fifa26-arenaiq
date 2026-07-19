/* Application Logic for FIFA 26 ArenaIQ */

// Global State
let appState = {
  role: 'fan',
  currentTab: 'fan-dashboard',
  language: 'en',
  ecoPoints: 0,
  selectedTransit: 'train',
  activeSimScenario: 'reset',
  bookingCounter: 1001,
  incidentCount: 2,
  chartsInitialized: false,
  charts: {
    occupancy: null,
    queue: null,
    yamalRadar: null
  }
};

// HTML Sanitization for XSS Hardening
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Accessibility Keyboard Listeners
function handleMapKeyDown(event, type, name, zone, status) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    if (type === 'zone') {
      selectMapZone(name);
    } else if (type === 'gate') {
      selectMapGate(name);
    } else if (type === 'item') {
      selectMapItem(name, zone, status);
    }
  }
}

function handleTransitKeyDown(event, mode) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectTransitMode(mode);
  }
}

// UI Localizations Dictionary
const translations = {
  en: {
    pageTitle: "Fan Companion",
    liveIndicator: "LIVE MATCHDAY",
    heroMatchStatus: "WORLD CUP FINAL • CHAMPIONSHIP MATCH",
    heroStadiumDesc: "MetLife Stadium • East Rutherford, New Jersey",
    ticketHeaderTitle: "Your Mobile Ticket",
    labelSection: "SECTION",
    labelRow: "ROW",
    labelSeat: "SEAT",
    ticketRecGate: "Recommended Entry: Gate C",
    ticketRecReason: "Shortest current queues (under 5 min wait)",
    ticketScanLabel: "Scan for fast-track gate entry",
    cardAiTitle: "Multilingual AI Assistant",
    cardAiDesc: "Ask our GenAI chatbot about food options, rules, transit, or security. Speaks 5+ languages.",
    btnAiChat: "Chat Now",
    cardMapTitle: "Interactive Stadium Map",
    cardMapDesc: "See live queue times for restrooms and food. Navigate directly to Section 114A.",
    btnMapOpen: "Open Map",
    cardTransitTitle: "Eco-Friendly Transit",
    cardTransitDesc: "Plan carbon-neutral transportation, log your ride, and earn exclusive World Cup digital tokens.",
    btnTransitPlan: "Plan Route",
    suggestedQuestionsTitle: "Suggested Questions",
    prompt1: "Getting here by train",
    prompt2: "Vegan food near Sec 114",
    prompt3: "Restroom queue times",
    prompt4: "Sensory rooms",
    prompt5: "Prohibited items",
    aiDisclaimerText: "FIFA ArenaIQ uses Generative AI to provide real-time multilingual operational support.",
    assistantName: "ArenaIQ Assistant",
    chatWelcomeMsg: "Hello! I am your AI assistant for the FIFA World Cup 2026 at MetLife Stadium. You can ask me anything about stadium gates, food, transport, sustainability, accessibility, or rules in your preferred language. How can I help you today?",
    chatInputFieldPlaceholder: "Type your question here...",
    btnChatSendText: "Send",
    mapMainTitle: "Interactive Stadium Map",
    legendLow: "Low Wait (<5 min)",
    legendMod: "Moderate (5-15 min)",
    legendHigh: "High (>15 min)",
    mapTargetTitle: "Select Area on Map",
    mapLandingDesc: "Click on any gate, zone, restroom, or concession stand in the interactive map to view live capacity metrics, queue lengths, accessibility options, and direct navigation paths.",
    suggestedDestTitle: "Suggested Destinations:",
    navSuggest1: "Navigate to Section 114A via Gate C",
    navSuggest2: "Find nearest restrooms (Zone A)",
    transitPlannerTitle: "Eco-Friendly Transit Planner",
    transitPlannerDesc: "Select your starting area/shuttle node to compute route options and carbon offset achievements.",
    labelOrigin: "Departing From:",
    optNyc: "New York Penn Station (Manhattan)",
    optSec: "Secaucus Junction (NJ Transit)",
    optNwk: "Newark Liberty International Airport",
    optPrk: "Stadium Park & Ride Lot E",
    modeTrainTitle: "NJ Transit Express Train",
    pointsTrain: "+40 Eco Points",
    lblDuration1: "Duration:",
    valDuration1: "22 mins",
    lblImpact1: "CO₂ Impact:",
    valImpact1: "1.2 kg",
    lblSave1: "85% savings",
    modeShuttleTitle: "MetLife Park-and-Ride Shuttle",
    pointsShuttle: "+20 Eco Points",
    lblDuration2: "Duration:",
    valDuration2: "35 mins",
    lblImpact2: "CO₂ Impact:",
    valImpact2: "2.8 kg",
    lblSave2: "65% savings",
    modeCarTitle: "Rideshare / Personal Car",
    pointsCar: "0 Eco Points",
    lblDuration3: "Duration:",
    valDuration3: "48 mins",
    lblImpact3: "CO₂ Impact:",
    valImpact3: "8.4 kg",
    lblSave3: "Baseline",
    btnLogRideText: "Log Sustainable Ride & Claim Eco-Points",
    sustainDashboardTitle: "Sustainability Dashboard",
    lblCo2Saved: "Total CO₂ Saved Today",
    lblUserLevel: "Your Achievement Level",
    ecoRewardsTitle: "Eco Rewards Locked:",
    reward1Title: "Free Soda Refill (Souvenir Cup)",
    lblRewardReq1: "Requires 50 Eco Points (You need",
    lblRewardReq1Diff: "more)",
    reward2Title: "10% Off Match Day Merch",
    lblRewardReq2: "Requires 100 Eco Points (You need",
    lblRewardReq2Diff: "more)",
    ecoTipTitle: "AI Eco-Tip of the Day:",
    ecoTipDesc: "Bringing a reusable water bottle (max 500ml, clear plastic) saves on concession waste. Refill stations are located in Concourses A, B, and D.",
    accessibilityTitle: "Stadium Accessibility Assistance",
    accessibilityDesc: "FIFA 2026 is committed to making the tournament accessible to everyone. Configure your profile below to trigger automated accessibility paths on maps and coordinate staff assistance.",
    accOpt1Title: "Wheelchair Navigation",
    accOpt1Desc: "Highlights ramps, elevators, and wide aisles.",
    accOpt2Title: "Audio Description",
    accOpt2Desc: "Request an audio transmitter for descriptive commentary.",
    accOpt3Title: "Sensory Sensitivity",
    accOpt3Desc: "Request sensory pack (noise-cancelling headphones).",
    accOpt4Title: "Family Assistance",
    accOpt4Desc: "Highlights nursing rooms and stroller check-ins.",
    sensoryBookingTitle: "Sensory Room Booking (MetLife Room 210)",
    lblSensoryTime: "Time Slot:",
    optS1: "19:00 - 19:30 (Pre-match)",
    optS2: "20:15 - 20:45 (Halftime)",
    optS3: "21:00 - 21:30 (Second half)",
    lblSensoryGuests: "Guests:",
    btnSensoryBook: "Book Sensory Room Slot",
    urgentSupportTitle: "Request Urgent Volunteer Support",
    urgentSupportDesc: "Need on-site assistance? Describe your issue below. A nearby accessibility volunteer will be dispatched to your seat position.",
    lblHelpSeat: "Seat / Gate Location:",
    lblHelpDesc: "Describe assistance needed:",
    btnSubmitHelpText: "Submit Assistance Request"
  },
  es: {
    pageTitle: "Asistente del Fan",
    liveIndicator: "DÍA DE PARTIDO EN VIVO",
    heroMatchStatus: "FINAL DE LA COPA MUNDIAL • PARTIDO DE CAMPEONATO",
    heroStadiumDesc: "Estadio MetLife • East Rutherford, Nueva Jersey",
    ticketHeaderTitle: "Tu Boleto Móvil",
    labelSection: "SECCIÓN",
    labelRow: "FILA",
    labelSeat: "ASIENTO",
    ticketRecGate: "Entrada recomendada: Puerta C",
    ticketRecReason: "Filas actuales más cortas (espera menor a 5 min)",
    ticketScanLabel: "Escanea para entrada rápida por puerta",
    cardAiTitle: "Asistente de IA Multilingüe",
    cardAiDesc: "Pregúntale a nuestro chatbot de IA sobre comida, reglas, transporte o seguridad. Habla más de 5 idiomas.",
    btnAiChat: "Chatea Ahora",
    cardMapTitle: "Mapa Interactivo del Estadio",
    cardMapDesc: "Mira tiempos de espera en baños y comida. Navega directo a la Sección 114A.",
    btnMapOpen: "Abrir Mapa",
    cardTransitTitle: "Transporte Ecológico",
    cardTransitDesc: "Planifica transporte sin emisiones, registra tu viaje y gana tokens digitales de la Copa Mundial.",
    btnTransitPlan: "Planear Ruta",
    suggestedQuestionsTitle: "Preguntas Sugeridas",
    prompt1: "Llegar aquí en tren",
    prompt2: "Comida vegana cerca de Sec 114",
    prompt3: "Tiempo de fila en baños",
    prompt4: "Salas sensoriales",
    prompt5: "Objetos prohibidos",
    aiDisclaimerText: "FIFA ArenaIQ usa IA generativa para dar soporte operativo multilingüe en tiempo real.",
    assistantName: "Asistente ArenaIQ",
    chatWelcomeMsg: "¡Hola! Soy tu asistente de IA para la Copa Mundial de la FIFA 2026 en el Estadio MetLife. Pregúntame lo que quieras sobre accesos, comida, transporte, sustentabilidad, accesibilidad o reglas en tu idioma. ¿Cómo te ayudo hoy?",
    chatInputFieldPlaceholder: "Escribe tu pregunta aquí...",
    btnChatSendText: "Enviar",
    mapMainTitle: "Mapa Interactivo del Estadio",
    legendLow: "Espera Baja (<5 min)",
    legendMod: "Moderada (5-15 min)",
    legendHigh: "Alta (>15 min)",
    mapTargetTitle: "Selecciona Área en Mapa",
    mapLandingDesc: "Haz clic en cualquier puerta, zona, baño o puesto de comida en el mapa para ver capacidad, filas, accesibilidad y rutas de navegación.",
    suggestedDestTitle: "Destinos Sugeridos:",
    navSuggest1: "Navegar a Sección 114A por Puerta C",
    navSuggest2: "Buscar baños cercanos (Zona A)",
    transitPlannerTitle: "Planificador de Ruta Ecológico",
    transitPlannerDesc: "Elige tu origen o punto de enlace para calcular rutas y reducción de carbono.",
    labelOrigin: "Partiendo Desde:",
    optNyc: "Estación New York Penn (Manhattan)",
    optSec: "Secaucus Junction (NJ Transit)",
    optNwk: "Aeropuerto Internacional Newark Liberty",
    optPrk: "Estacionamiento Park & Ride Lote E",
    modeTrainTitle: "Tren Expreso NJ Transit",
    pointsTrain: "+40 Puntos Eco",
    lblDuration1: "Duración:",
    valDuration1: "22 mins",
    lblImpact1: "Impacto CO₂:",
    valImpact1: "1.2 kg",
    lblSave1: "85% de ahorro",
    modeShuttleTitle: "Lanzadera Park-and-Ride MetLife",
    pointsShuttle: "+20 Puntos Eco",
    lblDuration2: "Duración:",
    valDuration2: "35 mins",
    lblImpact2: "Impacto CO₂:",
    valImpact2: "2.8 kg",
    lblSave2: "65% de ahorro",
    modeCarTitle: "Viaje compartido / Auto personal",
    pointsCar: "0 Puntos Eco",
    lblDuration3: "Duración:",
    valDuration3: "48 mins",
    lblImpact3: "Impacto CO₂:",
    valImpact3: "8.4 kg",
    lblSave3: "Línea base",
    btnLogRideText: "Registrar viaje ecológico y ganar puntos",
    sustainDashboardTitle: "Panel de Sustentabilidad",
    lblCo2Saved: "Total CO₂ Ahorrado Hoy",
    lblUserLevel: "Tu Nivel de Logro",
    ecoRewardsTitle: "Premios Eco Bloqueados:",
    reward1Title: "Refresco Gratis (Vaso de Recuerdo)",
    lblRewardReq1: "Requiere 50 Puntos (Necesitas",
    lblRewardReq1Diff: "más)",
    reward2Title: "10% Descuento en Tienda Oficial",
    lblRewardReq2: "Requiere 100 Puntos (Necesitas",
    lblRewardReq2Diff: "más)",
    ecoTipTitle: "AI Eco-Consejo del Día:",
    ecoTipDesc: "Llevar botella reutilizable (máx 500ml, plástico transparente) ahorra residuos. Hay estaciones de agua en Concourses A, B y D.",
    accessibilityTitle: "Asistencia de Accesibilidad",
    accessibilityDesc: "La FIFA 2026 se compromete a que el torneo sea accesible para todos. Configura tu perfil para activar rutas accesibles automáticas.",
    accOpt1Title: "Navegación en Silla de Ruedas",
    accOpt1Desc: "Resalta rampas, elevadores y pasillos anchos.",
    accOpt2Title: "Descripción de Audio",
    accOpt2Desc: "Pide un receptor de audio para comentarios descriptivos.",
    accOpt3Title: "Sensibilidad Sensorial",
    accOpt3Desc: "Pide kit sensorial (auriculares reductores de ruido).",
    accOpt4Title: "Asistencia Familiar / Cochecitos",
    accOpt4Desc: "Muestra salas de lactancia y guardado de cochecitos.",
    sensoryBookingTitle: "Reserva de Sala Sensorial (Sala MetLife 210)",
    lblSensoryTime: "Horario:",
    optS1: "19:00 - 19:30 (Antes del juego)",
    optS2: "20:15 - 20:45 (Entretiempo)",
    optS3: "21:00 - 21:30 (Segundo tiempo)",
    lblSensoryGuests: "Invitados:",
    btnSensoryBook: "Reservar Sala Sensorial",
    urgentSupportTitle: "Pedir Asistencia de Voluntario",
    urgentSupportDesc: "¿Necesitas ayuda en el sitio? Describe el problema. Enviaremos un voluntario de accesibilidad cercano a tu asiento.",
    lblHelpSeat: "Ubicación (Asiento/Puerta):",
    lblHelpDesc: "Describe la ayuda necesaria:",
    btnSubmitHelpText: "Enviar Solicitud de Ayuda"
  },
  fr: {
    pageTitle: "Compagnon des Supporters",
    liveIndicator: "JOUR DE MATCH EN DIRECT",
    heroMatchStatus: "FINALE DE LA COPE DU MONDE • MATCH DE CHAMPIONNAT",
    heroStadiumDesc: "Stade MetLife • East Rutherford, New Jersey",
    ticketHeaderTitle: "Votre Billet Mobile",
    labelSection: "SECTION",
    labelRow: "RANGÉE",
    labelSeat: "SIÈGE",
    ticketRecGate: "Entrée conseillée: Porte C",
    ticketRecReason: "Files actuelles les plus courtes (moins de 5 min)",
    ticketScanLabel: "Scannez pour entrée express",
    cardAiTitle: "Assistant IA Multilingue",
    cardAiDesc: "Posez vos questions sur la nourriture, le transport, ou la sécurité à notre chatbot. Parle 5+ langues.",
    btnAiChat: "Discuter Maintenant",
    cardMapTitle: "Carte Interactive du Stade",
    cardMapDesc: "Voir les temps d'attente aux toilettes et buvettes. Aller directement à la Section 114A.",
    btnMapOpen: "Ouvrir la Carte",
    cardTransitTitle: "Transport Éco-Responsable",
    cardTransitDesc: "Planifiez un trajet bas carbone, enregistrez-le et gagnez des jetons officiels Coupe du Monde.",
    btnTransitPlan: "Planifier l'Itinéraire",
    suggestedQuestionsTitle: "Questions Suggérées",
    prompt1: "Venir ici en train",
    prompt2: "Repas vegan près de la Sec 114",
    prompt3: "Attente aux toilettes",
    prompt4: "Salles sensorielles",
    prompt5: "Objets interdits",
    aiDisclaimerText: "FIFA ArenaIQ utilise l'IA générative pour fournir un support multilingue en temps réel.",
    assistantName: "Assistant ArenaIQ",
    chatWelcomeMsg: "Bonjour! Je suis votre assistant IA pour la Coupe du Monde de la FIFA 2026 au Stade MetLife. Posez-moi vos questions sur les entrées, la nourriture, les transports, ou l'accessibilité dans votre langue. Comment puis-je vous aider?",
    chatInputFieldPlaceholder: "Tapez votre question ici...",
    btnChatSendText: "Envoyer",
    mapMainTitle: "Carte Interactive du Stade",
    legendLow: "Attente Faible (<5 min)",
    legendMod: "Modérée (5-15 min)",
    legendHigh: "Élevée (>15 min)",
    mapTargetTitle: "Sélectionner une Zone",
    mapLandingDesc: "Cliquez sur une porte, zone, toilettes ou buvette pour voir les temps d'attente, l'accessibilité et l'itinéraire.",
    suggestedDestTitle: "Destinations Suggérées:",
    navSuggest1: "Aller à la Section 114A via la Porte C",
    navSuggest2: "Trouver les toilettes les plus proches (Zone A)",
    transitPlannerTitle: "Calculateur de Trajet Vert",
    transitPlannerDesc: "Sélectionnez votre départ pour calculer votre réduction d'empreinte carbone.",
    labelOrigin: "Départ De:",
    optNyc: "New York Penn Station (Manhattan)",
    optSec: "Secaucus Junction (NJ Transit)",
    optNwk: "Aéroport International Newark Liberty",
    optPrk: "Parking Relais Stade (Lot E)",
    modeTrainTitle: "Train Express NJ Transit",
    pointsTrain: "+40 Points Éco",
    lblDuration1: "Durée:",
    valDuration1: "22 mins",
    lblImpact1: "Impact CO₂:",
    valImpact1: "1.2 kg",
    lblSave1: "85% d'économie",
    modeShuttleTitle: "Navette MetLife Park-and-Ride",
    pointsShuttle: "+20 Points Éco",
    lblDuration2: "Durée:",
    valDuration2: "35 mins",
    lblImpact2: "Impact CO₂:",
    valImpact2: "2.8 kg",
    lblSave2: "65% d'économie",
    modeCarTitle: "Covoiturage / Voiture personnelle",
    pointsCar: "0 Points Éco",
    lblDuration3: "Durée:",
    valDuration3: "48 mins",
    lblImpact3: "Impact CO₂:",
    valImpact3: "8.4 kg",
    lblSave3: "Référence",
    btnLogRideText: "Enregistrer trajet vert et cumuler des points",
    sustainDashboardTitle: "Tableau de Bord Éco",
    lblCo2Saved: "Total CO₂ Économisé Aujourd'hui",
    lblUserLevel: "Votre Niveau de Réussite",
    ecoRewardsTitle: "Récompenses Éco Verrouillées:",
    reward1Title: "Soda Gratuit (Gobelet Souvenir)",
    lblRewardReq1: "Nécessite 50 Points (Il vous manque",
    lblRewardReq1Diff: "points)",
    reward2Title: "10% de Réduction en Boutique",
    lblRewardReq2: "Nécessite 100 Points (Il vous manque",
    lblRewardReq2Diff: "points)",
    ecoTipTitle: "AI Éco-Conseil du Jour:",
    ecoTipDesc: "Apporter une bouteille réutilisable (transparente, max 500ml) évite les déchets. Fontaines dispo aux Halls A, B et D.",
    accessibilityTitle: "Assistance Accessibilité",
    accessibilityDesc: "La FIFA 2026 s'engage à rendre le tournoi accessible à tous. Configurez votre profil pour afficher des itinéraires adaptés.",
    accOpt1Title: "Fauteuil Roulant",
    accOpt1Desc: "Affiche les rampes, ascenseurs et allées larges.",
    accOpt2Title: "Description Audio",
    accOpt2Desc: "Demandez un récepteur pour commentaires descriptifs.",
    accOpt3Title: "Sensibilité Sensorielle",
    accOpt3Desc: "Demandez un kit calme (casque antibruit).",
    accOpt4Title: "Famille / Poussette",
    accOpt4Desc: "Indique les espaces d'allaitement et de consigne poussette.",
    sensoryBookingTitle: "Réservation Espace Sensoriel (Salle MetLife 210)",
    lblSensoryTime: "Horaire:",
    optS1: "19:00 - 19:30 (Avant-match)",
    optS2: "20:15 - 20:45 (Mi-temps)",
    optS3: "21:00 - 21:30 (Deuxième mi-temps)",
    lblSensoryGuests: "Invités:",
    btnSensoryBook: "Réserver l'Espace Sensoriel",
    urgentSupportTitle: "Demander de l'Aide sur Place",
    urgentSupportDesc: "Besoin d'aide ? Décrivez votre situation. Un volontaire d'accessibilité sera envoyé vers votre siège.",
    lblHelpSeat: "Emplacement (Siège/Porte):",
    lblHelpDesc: "Décrivez l'aide requise:",
    btnSubmitHelpText: "Envoyer la Demande d'Assistance"
  },
  pt: {
    pageTitle: "Acompanhante do Torcedor",
    liveIndicator: "DIA DE JOGO AO VIVO",
    heroMatchStatus: "FINAL DA COPA DO MUNDO • JOGO DO CAMPEONATO",
    heroStadiumDesc: "Estádio MetLife • East Rutherford, Nova Jersey",
    ticketHeaderTitle: "Seu Ingresso Digital",
    labelSection: "SETOR",
    labelRow: "FILA",
    labelSeat: "ASSENTO",
    ticketRecGate: "Entrada Recomendada: Portão C",
    ticketRecReason: "Filas atuais mais rápidas (menos de 5 min)",
    ticketScanLabel: "Escaneie para entrada rápida",
    cardAiTitle: "Assistente de IA Multilíngue",
    cardAiDesc: "Pergunte ao nosso chatbot de IA sobre alimentação, regras, transporte ou segurança. Fala mais de 5 idiomas.",
    btnAiChat: "Conversar Agora",
    cardMapTitle: "Mapa Interativo do Estádio",
    cardMapDesc: "Veja tempos de fila em tempo real para banheiros e comida. Navegue para o Setor 114A.",
    btnMapOpen: "Abrir Mapa",
    cardTransitTitle: "Transporte Ecológico",
    cardTransitDesc: "Planeje rotas sustentáveis, registre sua viagem e ganhe pontos digitais da Copa do Mundo.",
    btnTransitPlan: "Planejar Rota",
    suggestedQuestionsTitle: "Perguntas Sugeridas",
    prompt1: "Como chegar aqui de trem",
    prompt2: "Comida vegana perto do Setor 114",
    prompt3: "Fila dos banheiros",
    prompt4: "Salas sensoriais",
    prompt5: "Itens proibidos",
    aiDisclaimerText: "O FIFA ArenaIQ usa inteligência artificial para oferecer suporte multilíngue em tempo real.",
    assistantName: "Assistente ArenaIQ",
    chatWelcomeMsg: "Olá! Sou seu assistente de IA para a Copa do Mundo da FIFA 2026 no MetLife Stadium. Pergunte-me qualquer coisa sobre acessos, alimentação, transporte ou acessibilidade em seu idioma. Como posso ajudar?",
    chatInputFieldPlaceholder: "Digite sua pergunta aqui...",
    btnChatSendText: "Enviar",
    mapMainTitle: "Mapa Interativo do Estádio",
    legendLow: "Fila Baixa (<5 min)",
    legendMod: "Moderada (5-15 min)",
    legendHigh: "Alta (>15 min)",
    mapTargetTitle: "Selecione uma Área no Mapa",
    mapLandingDesc: "Clique em portões, setores, banheiros ou lanchonetes para visualizar tempos de fila, acessibilidade e caminhos.",
    suggestedDestTitle: "Destinos Sugeridos:",
    navSuggest1: "Navegar para o Setor 114A pelo Portão C",
    navSuggest2: "Buscar banheiros próximos (Zona A)",
    transitPlannerTitle: "Planejador de Viagem Ecológica",
    transitPlannerDesc: "Selecione o ponto de partida para calcular redução de emissões e pontos.",
    labelOrigin: "Partindo De:",
    optNyc: "Estação Penn de Nova York (Manhattan)",
    optSec: "Secaucus Junction (NJ Transit)",
    optNwk: "Aeroporto Internacional de Newark Liberty",
    optPrk: "Estacionamento Park & Ride Lote E",
    modeTrainTitle: "Trem Expresso NJ Transit",
    pointsTrain: "+40 Pontos Eco",
    lblDuration1: "Duração:",
    valDuration1: "22 mins",
    lblImpact1: "CO₂ Emitido:",
    valImpact1: "1.2 kg",
    lblSave1: "85% de economia",
    modeShuttleTitle: "Shuttle Park-and-Ride MetLife",
    pointsShuttle: "+20 Pontos Eco",
    lblDuration2: "Duração:",
    valDuration2: "35 mins",
    lblImpact2: "CO₂ Emitido:",
    valImpact2: "2.8 kg",
    lblSave2: "65% de economia",
    modeCarTitle: "Carona / Carro Particular",
    pointsCar: "0 Pontos Eco",
    lblDuration3: "Duração:",
    valDuration3: "48 mins",
    lblImpact3: "CO₂ Emitido:",
    valImpact3: "8.4 kg",
    lblSave3: "Linha de base",
    btnLogRideText: "Registrar Viagem Ecológica e Ganhar Pontos",
    sustainDashboardTitle: "Painel de Sustentabilidade",
    lblCo2Saved: "Total CO₂ Economizado Hoje",
    lblUserLevel: "Seu Nível de Conquista",
    ecoRewardsTitle: "Prêmios Eco Bloqueados:",
    reward1Title: "Refrigerante Grátis (Copo de Lembrança)",
    lblRewardReq1: "Requer 50 Pontos Eco (Faltam",
    lblRewardReq1Diff: "mais)",
    reward2Title: "10% Desconto em Roupas Oficiais",
    lblRewardReq2: "Requer 100 Pontos Eco (Faltam",
    lblRewardReq2Diff: "mais)",
    ecoTipTitle: "AI Eco-Dica do Dia:",
    ecoTipDesc: "Trazer uma garrafa de plástico transparente (máx 500ml) reduz resíduos. Estações de recarga localizadas nas Zonas A, B e D.",
    accessibilityTitle: "Assistência de Acessibilidade",
    accessibilityDesc: "A FIFA 2026 está empenhada em tornar o torneio acessível para todos. Configure seu perfil para rotas adaptadas.",
    accOpt1Title: "Cadeirantes / Acessibilidade Física",
    accOpt1Desc: "Destaca rampas, elevadores e corredores amplos.",
    accOpt2Title: "Descrição de Áudio",
    accOpt2Desc: "Solicite um receptor para narração descritiva.",
    accOpt3Title: "Sensibilidade Sensorial",
    accOpt3Desc: "Solicite kit de abafadores de ruídos.",
    accOpt4Title: "Apoio Familiar / Carrinho",
    accOpt4Desc: "Mostra fraldários e local de guarda de carrinhos.",
    sensoryBookingTitle: "Reserva de Sala Sensorial (Sala MetLife 210)",
    lblSensoryTime: "Horário:",
    optS1: "19:00 - 19:30 (Pré-jogo)",
    optS2: "20:15 - 20:45 (Intervalo)",
    optS3: "21:00 - 21:30 (Segundo tempo)",
    lblSensoryGuests: "Acompanhantes:",
    btnSensoryBook: "Reservar Sala Sensorial",
    urgentSupportTitle: "Solicitar Apoio de Voluntário no Setor",
    urgentSupportDesc: "Precisa de ajuda imediata? Explique seu caso. Enviaremos um voluntário treinado até sua cadeira.",
    lblHelpSeat: "Setor / Fila / Assento:",
    lblHelpDesc: "Descreva a ajuda necessária:",
    btnSubmitHelpText: "Enviar Solicitação de Ajuda"
  },
  ar: {
    pageTitle: "مساعد المشجعين",
    liveIndicator: "يوم المباراة المباشر",
    heroMatchStatus: "نهائي كأس العالم • مباراة البطولة",
    heroStadiumDesc: "ملعب ميتلايف • إيست راذرفورد، نيوجيرسي",
    ticketHeaderTitle: "تذكرتك الرقمية",
    labelSection: "القسم",
    labelRow: "الصف",
    labelSeat: "المقعد",
    ticketRecGate: "البوابة المفضلة: بوابة C",
    ticketRecReason: "أقصر صفوف انتظار حالياً (أقل من 5 دقائق)",
    ticketScanLabel: "امسح الرمز للدخول السريع من البوابة",
    cardAiTitle: "مساعد الذكاء الاصطناعي الذكي",
    cardAiDesc: "اسأل مساعدنا الآلي عن الطعام، وسائل النقل، القوانين أو الأمن بـ 5 لغات مختلفة.",
    btnAiChat: "تحدث الآن",
    cardMapTitle: "خريطة الملعب التفاعلية",
    cardMapDesc: "تعرف على أوقات الانتظار في دورات المياه ومنافذ الطعام. توجه مباشرة إلى القسم 114A.",
    btnMapOpen: "افتح الخريطة",
    cardTransitTitle: "نقل صديق للبيئة",
    cardTransitDesc: "خطط لرحلة خالية من الانبعاثات، وسجل وصولك لربح رموز كأس العالم الرقمية.",
    btnTransitPlan: "تخطيط المسار",
    suggestedQuestionsTitle: "الأسئلة المقترحة",
    prompt1: "الوصول إلى هنا بالقطار",
    prompt2: "طعام نباتي قرب القسم 114",
    prompt3: "أوقات انتظار دورات المياه",
    prompt4: "الغرف الحسية للمشجعين",
    prompt5: "المواد المحظور دخولها",
    aiDisclaimerText: "FIFA ArenaIQ يستخدم الذكاء الاصطناعي التوليدي لتقديم الدعم والترجمة التشغيلية الفورية.",
    assistantName: "مساعد ArenaIQ",
    chatWelcomeMsg: "مرحباً بك! أنا مساعد الذكاء الاصطناعي لكأس العالم 2026 في ملعب ميتلايف. يمكنك سؤالي عن البوابات، الأطعمة، النقل، الاستدامة، وتسهيلات الوصول بلغتك المفضلة. كيف يمكنني مساعدتك؟",
    chatInputFieldPlaceholder: "اكتب سؤالك هنا...",
    btnChatSendText: "إرسال",
    mapMainTitle: "خريطة الملعب التفاعلية",
    legendLow: "انتظار قصير (<5 د)",
    legendMod: "انتظار متوسط (5-15 د)",
    legendHigh: "انتظار طويل (>15 د)",
    mapTargetTitle: "اختر منطقة من الخريطة",
    mapLandingDesc: "انقر على أي بوابة، منطقة، دورة مياه، أو منفذ طعام لمعاينة السعة، والانتظار، وتسهيلات الحركة، ومسار الملاحة المباشر.",
    suggestedDestTitle: "الوجهات المقترحة:",
    navSuggest1: "التوجه للقسم 114A عبر البوابة C",
    navSuggest2: "العثور على أقرب دورة مياه (منطقة A)",
    transitPlannerTitle: "مخطط النقل الصديق للبيئة",
    transitPlannerDesc: "اختر نقطة انطلاقك لحساب خيارات المسار وتقليل البصمة الكربونية.",
    labelOrigin: "الانطلاق من:",
    optNyc: "محطة نيويورك بن (مانهاتن)",
    optSec: "تقاطع سيكوكس (NJ Transit)",
    optNwk: "مطار نيوارك ليبرتي الدولي",
    optPrk: "موقف السيارات Lot E للملعب",
    modeTrainTitle: "قطار NJ Transit السريع",
    pointsTrain: "+40 نقطة بيئية",
    lblDuration1: "المدة:",
    valDuration1: "22 دقيقة",
    lblImpact1: "انبعاث CO₂:",
    valImpact1: "1.2 كجم",
    lblSave1: "توفير بنسبة 85%",
    modeShuttleTitle: "حافلة الملعب لنقل المشجعين",
    pointsShuttle: "+20 نقطة بيئية",
    lblDuration2: "المدة:",
    valDuration2: "35 دقيقة",
    lblImpact2: "انبعاث CO₂:",
    valImpact2: "2.8 كجم",
    lblSave2: "توفير بنسبة 65%",
    modeCarTitle: "تطبيق النقل / سيارة خاصة",
    pointsCar: "0 نقطة بيئية",
    lblDuration3: "المدة:",
    valDuration3: "48 دقيقة",
    lblImpact3: "انبعاث CO₂:",
    valImpact3: "8.4 كجم",
    lblSave3: "الوضع الافتراضي",
    btnLogRideText: "تسجيل الرحلة الخضراء والحصول على النقاط البيئية",
    sustainDashboardTitle: "لوحة تحكم الاستدامة",
    lblCo2Saved: "إجمالي الكربون الموفر اليوم",
    lblUserLevel: "مستوى إنجازك البيئي",
    ecoRewardsTitle: "الجوائز البيئية المقفلة:",
    reward1Title: "مشروب غازي مجاني (كوب تذكاري)",
    lblRewardReq1: "تتطلب 50 نقطة (أنت بحاجة إلى",
    lblRewardReq1Diff: "نقاط إضافية)",
    reward2Title: "خصم 10% على الهدايا التذكارية",
    lblRewardReq2: "تتطلب 100 نقطة (أنت بحاجة إلى",
    lblRewardReq2Diff: "نقاط إضافية)",
    ecoTipTitle: "نصيحة اليوم من الذكاء الاصطناعي:",
    ecoTipDesc: "إحضار زجاجة مياه بلاستيكية شفافة وقابلة لإعادة الاستخدام (أقصى 500 مل) يوفر النفايات. تتوفر محطات المياه في الأروقة A و B و D.",
    accessibilityTitle: "تسهيلات الوصول والمساعدة",
    accessibilityDesc: "كأس العالم 2026 ملتزم بجعل البطولة متاحة للجميع. يرجى تهيئة ملفك لتفعيل مسارات الكراسي المتحركة وتنسيق الدعم الميداني.",
    accOpt1Title: "ملاحة الكراسي المتحركة",
    accOpt1Desc: "تحديد المنحدرات والمصاعد والممرات الواسعة.",
    accOpt2Title: "الوصف الصوتي للمباراة",
    accOpt2Desc: "طلب جهاز بث للتعليق الوصفي الصوتي.",
    accOpt3Title: "حساسية المثيرات الحسية",
    accOpt3Desc: "طلب طرد الأدوات الحسية (سماعات حجب الضوضاء).",
    accOpt4Title: "مساعدة العائلات وعربات الأطفال",
    accOpt4Desc: "تحديد غرف الرعاية ومكان فحص عربات الأطفال.",
    sensoryBookingTitle: "حجز الغرفة الحسية (ملعب ميتلايف غرفة 210)",
    lblSensoryTime: "فترة الحجز:",
    optS1: "19:00 - 19:30 (قبل المباراة)",
    optS2: "20:15 - 20:45 (بين الشوطين)",
    optS3: "21:00 - 21:30 (الشوط الثاني)",
    lblSensoryGuests: "المرافقين:",
    btnSensoryBook: "احجز الغرفة الحسية الآن",
    urgentSupportTitle: "طلب متطوع مساعدة عاجل",
    urgentSupportDesc: "هل تحتاج مساعدة ميدانية عاجلة؟ صف المشكلة وسنقوم بإرسال أقرب متطوع لموقع مقعدك فوراً.",
    lblHelpSeat: "موقع مقعدك / البوابة:",
    lblHelpDesc: "صف المساعدة المطلوبة:",
    btnSubmitHelpText: "إرسال طلب المساعدة الميدانية"
  }
};

// Chatbot Mock Responses in different languages
const chatMockResponses = {
  en: {
    train: "Express trains run directly from Secaucus Junction to MetLife Stadium station every 10-15 minutes. Travel time is approximately 15-20 minutes. Keep your train ticket QR code handy!",
    vegan: "Yes! Concessions in Section 117 (Zone B) and Section 142 (Zone D) offer Plant-Based World Cup Burgers, Vegan Hot Dogs, and fresh wraps. All vegan locations are flagged on your interactive map.",
    restroom: "Restrooms in Zone A currently have a moderate wait (about 6 minutes). The restrooms in Zone C and D have the shortest wait times (under 3 minutes). Tap 'Stadium Map' to view real-time queues.",
    sensory: "MetLife Stadium features specialized sensory rooms for neurodivergent fans. The closest is Room 210 on the Plaza Level (Zone A). You can book a time slot under the 'Accessibility' tab.",
    prohibited: "Prohibited items include bags larger than 4.5x6.5 inches, recording devices (excluding smartphones), selfie sticks, glass bottles, and cans. Lockers are available at Gates B and D for $10.",
    eco: "Traveling by train or park-and-ride shuttle earns you Eco Points! Log your transit under the 'Green Transit' tab to unlock free refreshments and merchandise discounts.",
    default: "I'm ArenaIQ AI. I can assist with stadium gates, transit, food, accessibility, and sustainability. Could you specify your question or click one of our suggested questions?"
  },
  es: {
    train: "Los trenes expresos salen directamente desde Secaucus Junction hacia el Estadio MetLife cada 10-15 minutos. El trayecto dura unos 15-20 minutos. ¡Ten a mano el código QR de tu boleto!",
    vegan: "¡Sí! Los puestos en la Sección 117 (Zona B) y Sección 142 (Zona D) ofrecen hamburguesas veganas, hot dogs veganos y wraps. Todos están marcados en el mapa interactivo del estadio.",
    restroom: "Los baños de la Zona A tienen espera moderada (6 minutos). Los de la Zona C y D tienen esperas mínimas (menos de 3 minutos). Toca 'Abrir Mapa' para ver las filas en vivo.",
    sensory: "El Estadio MetLife tiene salas sensoriales para aficionados neurodivergentes. La más cercana es la Sala 210 en el nivel Plaza (Zona A). Puedes reservar en la pestaña 'Asistencia'.",
    prohibited: "Los objetos prohibidos incluyen bolsas de más de 4.5x6.5 pulgadas, cámaras profesionales, palos de selfie, botellas de vidrio y latas. Hay casilleros en Puertas B y D por $10.",
    eco: "¡Viajar en tren o autobús te da Puntos Eco! Registra tu viaje en la pestaña 'Transporte Ecológico' para desbloquear bebidas gratis y descuentos en la tienda oficial.",
    default: "Soy el asistente de IA ArenaIQ. Puedo ayudarte con accesos, comida, transporte y sustentabilidad. ¿Puedes detallar tu pregunta o hacer clic en una sugerencia?"
  },
  fr: {
    train: "Des navettes ferroviaires relient Secaucus Junction à la gare du Stade MetLife toutes les 10-15 min. Trajet d'environ 15-20 min. Gardez le QR code de votre billet de train sous la main!",
    vegan: "Oui! Les buvettes de la Section 117 (Zone B) et de la Section 142 (Zone D) proposent des burgers végétariens, hot-dogs vegan et wraps. Les emplacements sont indiqués sur votre carte interactive.",
    restroom: "Les toilettes de la Zone A ont une attente modérée (env. 6 min). Celles des Zones C et D ont l'attente la plus courte (moins de 3 min). Cliquez sur 'Stadium Map' pour voir le direct.",
    sensory: "Le Stade dispose d'espaces sensoriels calmes. Le plus proche est la Salle 210 (Niveau Plaza, Zone A). Vous pouvez réserver un créneau via l'onglet 'Accessibilité'.",
    prohibited: "Les sacs de plus de 4.5x6.5 pouces, caméras, perches à selfie, bouteilles en verre et canettes sont interdits. Consignes disponibles aux Portes B et D pour 10$.",
    eco: "Voyager en train ou navette vous rapporte des points éco! Enregistrez votre trajet dans l'onglet 'Green Transit' pour débloquer des boissons gratuites et des remises.",
    default: "Je suis l'assistant IA ArenaIQ. Je peux vous renseigner sur les portes, transports, buvettes et accessibilité. Veuillez préciser ou cliquer sur une question suggérée."
  },
  pt: {
    train: "Trens expressos saem de Secaucus Junction direto para o estádio MetLife a cada 10-15 minutos. Tempo de viagem de 15-20 minutos. Deixe o código QR do seu bilhete de trem à mão!",
    vegan: "Sim! Lanchonetes no Setor 117 (Zona B) e Setor 142 (Zona D) servem Hambúrgueres Veganos, Cachorro-Quente Vegano e wraps. Todos os pontos estão destacados no mapa interativo.",
    restroom: "Banheiros na Zona A têm espera moderada (6 minutos). Os da Zona C e D têm menor tempo de espera (menos de 3 min). Toque em 'Abrir Mapa' para ver os tempos de fila ao vivo.",
    sensory: "O MetLife Stadium possui salas sensoriais para torcedores neurodivergentes. A mais próxima é a Sala 210 (Zona A). Você pode agendar um horário na aba de 'Acessibilidade'.",
    prohibited: "Itens proibidos incluem bolsas maiores que 4.5x6.5 polegadas, filmadoras profissionais, bastão de selfie, garrafas de vidro e latas. Guarda-volumes disponíveis nos Portões B e D por $10.",
    eco: "Viajar de trem ou shuttle oficial gera Pontos Eco! Registre seu percurso na aba de 'Transporte Ecológico' para liberar brindes de bebidas e descontos na loja oficial.",
    default: "Sou o assistente de IA ArenaIQ. Posso ajudar com portões, alimentação, rotas ecológicas e acessibilidade. Escreva sua pergunta ou selecione um dos temas sugeridos."
  },
  ar: {
    train: "تنطلق القطارات السريعة مباشرة من محطة Secaucus Junction إلى ملعب ميتلايف كل 10-15 دقيقة. تستغرق الرحلة حوالي 15-20 دقيقة. يرجى الاحتفاظ بالرمز QR للتذكرة جاهزاً!",
    vegan: "نعم! تقدم منافذ الأطعمة في القسم 117 (منطقة B) والقسم 142 (منطقة D) وجبات برغر نباتية، وهوت دوغ نباتي، وسندويشات طازجة. تتوفر المواقع بالكامل على الخريطة التفاعلية.",
    restroom: "دورات المياه في المنطقة A تشهد انتظاراً متوسطاً (نحو 6 دقائق). بينما تسجل المنطقة C و D أقصر انتظار (أقل من 3 دقائق). انقر على خريطة الملعب لمشاهدة التفاصيل الفورية.",
    sensory: "يحتوي ملعب ميتلايف على غرف حسية مخصصة لذوي الاحتياجات الحسية. الأقرب هي الغرفة رقم 210 في مستوى البلازا (المنطقة A). يمكنك حجز موعد زيارة عبر قسم 'المساعدة'.",
    prohibited: "المواد المحظورة تشمل الحقائب التي تتجاوز أبعادها 4.5x6.5 بوصة، أجهزة التصوير الاحترافية، عصي السيلفي، الزجاجات المعدنية والزجاجية. تتوفر خزائن أمان عند البوابات B و D مقابل 10 دولارات.",
    eco: "الوصول بالقطار أو الحافلات المخصصة يمنحك نقاطاً بيئية! سجل وصولك في قسم 'نقل صديق للبيئة' لفتح جوائز المشروبات المجانية وخصومات المتجر الرسمي.",
    default: "أنا مساعد الذكاء الاصطناعي ArenaIQ. يمكنني مساعدتك في البوابات، التنقل، الطعام، وتسهيلات الوصول. يرجى كتابة سؤالك أو تحديد أحد الأسئلة المقترحة."
  }
};

// Initial Setup
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  lucide.createIcons();
  
  // Set real date/time string
  updateLiveClock();
  setInterval(updateLiveClock, 30000);
  
  // Setup countdown
  setupCountdown();

  // Initialize Operations Charts
  initOperationsCharts();
  
  // Initialize Lamine Yamal Radar Chart
  initYamalRadarChart();
});

// Update Live Clock in top bar
function updateLiveClock() {
  const timeLabel = document.getElementById("live-time-label");
  if (timeLabel) {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    timeLabel.innerText = `LIVE MATCHDAY • ${now.toLocaleTimeString('en-US', options)}`;
  }
}

// Kickoff Countdown timer
function setupCountdown() {
  const countdown = document.getElementById("countdown-timer");
  if (!countdown) return;
  
  let hours = 1;
  let minutes = 42;
  let seconds = 13;
  
  const timer = setInterval(() => {
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      minutes--;
      if (minutes < 0) {
        minutes = 59;
        hours--;
        if (hours < 0) {
          clearInterval(timer);
          countdown.innerText = "MATCH IN PROGRESS";
          return;
        }
      }
    }
    const hStr = hours.toString().padStart(2, '0');
    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');
    countdown.innerText = `KICKOFF ${hStr}:${mStr}:${sStr}`;
  }, 1000);
}

// Role Toggle (Fan vs Operations HQ)
function switchRole(role) {
  appState.role = role;
  
  // Toggles active state on role buttons
  document.getElementById("btn-role-fan").classList.toggle("active", role === 'fan');
  document.getElementById("btn-role-ops").classList.toggle("active", role === 'ops');
  
  // Show / Hide Nav menus
  document.getElementById("nav-fan").classList.toggle("hidden", role !== 'fan');
  document.getElementById("nav-ops").classList.toggle("hidden", role === 'fan');
  
  // Update header text based on role
  const pageTitle = document.getElementById("page-title");
  if (role === 'fan') {
    pageTitle.innerText = translations[appState.language].pageTitle;
    switchTab('fan-dashboard');
  } else {
    pageTitle.innerText = "Operations Command HQ";
    switchTab('ops-dashboard');
  }
}

// Tab Panels Toggling
function switchTab(tabId) {
  appState.currentTab = tabId;
  
  // Hide all panels
  const panels = document.querySelectorAll(".tab-panel");
  panels.forEach(panel => panel.classList.remove("active"));
  
  // Show target panel
  const targetPanel = document.getElementById(tabId);
  if (targetPanel) {
    targetPanel.classList.add("active");
  }
  
  // Mark navigation items active
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => item.classList.remove("active"));
  
  const activeNavItem = document.getElementById(`tab-${tabId}`);
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }
  
  // Custom checks when tabs loaded
  if (tabId === 'ops-analytics' || tabId === 'ops-dashboard') {
    // Redraw/Resize Chart.js containers
    setTimeout(() => {
      if (appState.charts.occupancy) appState.charts.occupancy.resize();
      if (appState.charts.queue) appState.charts.queue.resize();
    }, 50);
  } else if (tabId === 'fan-dashboard') {
    // Redraw/Resize Lamine Yamal radar chart
    setTimeout(() => {
      if (appState.charts.yamalRadar) appState.charts.yamalRadar.resize();
    }, 50);
  }
}

// Language Switching
function changeLanguage(lang) {
  appState.language = lang;
  
  // Toggle layout direction for RTL/Arabic support
  if (lang === 'ar') {
    document.documentElement.dir = 'rtl';
    document.body.style.textAlign = 'right';
  } else {
    document.documentElement.dir = 'ltr';
    document.body.style.textAlign = 'left';
  }
  
  // Update static text strings in HTML DOM matching translations object
  const transKeys = Object.keys(translations[lang]);
  transKeys.forEach(key => {
    const el = document.getElementById(key);
    if (el) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.innerText = translations[lang][key];
      }
    }
  });

  // Specifically check placeholder for input field
  const chatInput = document.getElementById("chat-input-field");
  if (chatInput) chatInput.placeholder = translations[lang].chatInputFieldPlaceholder;

  // Switch Welcome message in chat dynamically
  const welcomeMsg = document.getElementById("chat-welcome-msg");
  if (welcomeMsg) welcomeMsg.innerText = translations[lang].chatWelcomeMsg;
  
  // Update Header Title based on role
  const pageTitle = document.getElementById("page-title");
  if (appState.role === 'fan') {
    pageTitle.innerText = translations[lang].pageTitle;
  }
}

/* AI MULTILINGUAL ASSISTANT MOCK CHAT ENGINE */

// Handles suggested chips clicks
function sendSuggestedPrompt(text) {
  const chatField = document.getElementById("chat-input-field");
  if (chatField) {
    chatField.value = text;
    sendChatMessage();
  }
}

// Handles user message input and triggers simulated GenAI reply
function sendChatMessage() {
  const chatField = document.getElementById("chat-input-field");
  if (!chatField || chatField.value.trim() === "") return;
  
  const userText = chatField.value.trim();
  chatField.value = ""; // Clear input
  
  // Append User message card (safely escaped)
  appendChatBubble(escapeHTML(userText), 'user-message');
  
  // Trigger AI typing simulator
  const chatBox = document.getElementById("chat-messages-box");
  const loader = document.createElement("div");
  loader.className = "message bot-message typing-indicator-container";
  loader.id = "chat-typing-loader";
  loader.innerHTML = `
    <div class="message-bubble">
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  chatBox.appendChild(loader);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Generate reply depending on input content & active language
  let responseText = getMockAIResponse(userText);
  
  // Simulated streaming delay (1200ms)
  setTimeout(() => {
    const typingLoader = document.getElementById("chat-typing-loader");
    if (typingLoader) typingLoader.remove();
    
    appendChatBubble(responseText, 'bot-message');
  }, 1200);
}

// Append message bubbles to chat pane
function appendChatBubble(text, className) {
  const chatBox = document.getElementById("chat-messages-box");
  if (!chatBox) return;
  
  const messageCard = document.createElement("div");
  messageCard.className = `message ${className}`;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  messageCard.innerHTML = `
    <div class="message-bubble">
      <p>${text}</p>
    </div>
    <span class="message-time">${timeStr}</span>
  `;
  
  chatBox.appendChild(messageCard);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Matching keywords to supply realistic answers in chosen language
function getMockAIResponse(query) {
  const lang = appState.language;
  const qLower = query.toLowerCase();
  
  if (qLower.includes("train") || qLower.includes("قطار") || qLower.includes("tren") || qLower.includes("transit")) {
    return chatMockResponses[lang].train;
  } else if (qLower.includes("vegan") || qLower.includes("plant-based") || qLower.includes("نباتي") || qLower.includes("vegano") || qLower.includes("vegetar")) {
    return chatMockResponses[lang].vegan;
  } else if (qLower.includes("restroom") || qLower.includes("toilet") || qLower.includes("bathroom") || qLower.includes("حمام") || qLower.includes("baño") || qLower.includes("toilette")) {
    return chatMockResponses[lang].restroom;
  } else if (qLower.includes("sensory") || qLower.includes("حسية") || qLower.includes("sensorial") || qLower.includes("overload")) {
    return chatMockResponses[lang].sensory;
  } else if (qLower.includes("prohibited") || qLower.includes("ban") || qLower.includes("bags") || qLower.includes("محظور") || qLower.includes("prohibido") || qLower.includes("interdit")) {
    return chatMockResponses[lang].prohibited;
  } else if (qLower.includes("eco") || qLower.includes("green") || qLower.includes("carbon") || qLower.includes("كربون") || qLower.includes("puntos") || qLower.includes("points")) {
    return chatMockResponses[lang].eco;
  } else {
    return chatMockResponses[lang].default;
  }
}

// Enter key submit in chat text box
function handleChatKeyPress(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

// Speech-to-text simulator
function simulateVoiceInput() {
  const mic = document.getElementById("mic-icon");
  const micButton = document.querySelector(".btn-chat-mic");
  if (!mic || !micButton) return;
  
  micButton.classList.add("active");
  
  const chatField = document.getElementById("chat-input-field");
  if (chatField) {
    chatField.value = "... Listening ...";
  }
  
  setTimeout(() => {
    micButton.classList.remove("active");
    if (chatField) {
      chatField.value = "What is the fastest way to get to MetLife Stadium by train?";
    }
  }, 1500);
}

/* INTERACTIVE SVG MAP INTERACTIONS */

// Click handler for stadium zones
function selectMapZone(zoneName) {
  // Clear previous selected paths
  const zones = document.querySelectorAll(".map-zone");
  zones.forEach(z => z.classList.remove("selected-active"));
  
  // Highlight clicked zone (this handles SVG path styling via active state)
  const clickedId = event.target.id;
  const targetElement = document.getElementById(clickedId);
  if (targetElement) {
    targetElement.classList.add("selected-active");
  }
  
  const title = document.getElementById("map-target-title");
  const desc = document.getElementById("map-target-details");
  
  // Dynamic metrics depending on zone selection
  let waitTime = "Low Wait (<3 mins)";
  let occupancy = "68%";
  let concessions = "Concessions A (Food, Beverage, Coffee)";
  let colorClass = "val-green";
  
  if (clickedId === 'zone-B') {
    waitTime = "High Wait (18 mins)";
    occupancy = "92%";
    concessions = "Concessions East (Hot Dogs, Burgers, Drinks)";
    colorClass = "val-red";
  } else if (clickedId === 'zone-A') {
    waitTime = "Moderate Wait (6 mins)";
    occupancy = "76%";
    concessions = "Buvette North (Pizza, Snacks, Beer)";
    colorClass = "val-yellow";
  }
  
  title.innerText = zoneName;
  desc.innerHTML = `
    <div class="metric-row"><span>Status:</span><strong class="${colorClass}">${waitTime}</strong></div>
    <div class="metric-row"><span>Zone Occupancy:</span><strong>${occupancy}</strong></div>
    <div class="metric-row"><span>Featured Dining:</span><strong>${concessions}</strong></div>
    <div class="metric-row"><span>Accessibility Features:</span><strong class="val-green">Ramp Access, Elevator Gate 2</strong></div>
    <div class="nav-steps-box">
      <h4>Direct Nav Route:</h4>
      <ol>
        <li>Proceed through gate checkpoints</li>
        <li>Take Escalator East to level 2</li>
        <li>Follow signboards to Section 114A entry</li>
      </ol>
    </div>
  `;
}

// Click handler for gate circles
function selectMapGate(gateName) {
  const gates = document.querySelectorAll(".map-gate");
  gates.forEach(g => g.classList.remove("selected"));
  
  const gateEl = document.getElementById(`gate-${gateName.split(' ')[1].toLowerCase()}`);
  if (gateEl) {
    gateEl.classList.add("selected");
  }
  
  const title = document.getElementById("map-target-title");
  const desc = document.getElementById("map-target-details");
  
  let queueVal = "2 mins wait";
  let capVal = "Low queue depth. Recommend entry.";
  let color = "val-green";
  
  if (gateName === 'Gate B') {
    queueVal = "18 mins wait";
    capVal = "Heavy congestion. AI recommends rerouting to Gate A.";
    color = "val-red";
  }
  
  title.innerText = `${gateName} Access Point`;
  desc.innerHTML = `
    <div class="metric-row"><span>Average Queue Time:</span><strong class="${color}">${queueVal}</strong></div>
    <div class="metric-row"><span>Status:</span><strong>${capVal}</strong></div>
    <div class="metric-row"><span>Fast-track Lanes:</span><strong>Active (Mobile ticket scan)</strong></div>
    <div class="metric-row"><span>Assistance Booths:</span><strong>Staff Helpdesk 3</strong></div>
    <div class="nav-suggestions-box">
      <button class="btn btn-primary btn-sm" onclick="switchTab('fan-transit')">View shuttle directions</button>
    </div>
  `;
}

// Click handler for small icons (restrooms, food) on map
function selectMapItem(itemName, zone, status) {
  const title = document.getElementById("map-target-title");
  const desc = document.getElementById("map-target-details");
  
  let wait = "Under 3 mins wait";
  let color = "val-green";
  
  if (status === 'moderate') {
    wait = "Approx. 6 mins wait";
    color = "val-yellow";
  } else if (status === 'high') {
    wait = "Over 15 mins wait. Seek alternative.";
    color = "val-red";
  }
  
  title.innerText = `${itemName} (${zone})`;
  desc.innerHTML = `
    <div class="metric-row"><span>Wait Estimate:</span><strong class="${color}">${wait}</strong></div>
    <div class="metric-row"><span>Type:</span><strong>${itemName.includes('Concessions') ? 'Food & Drink Stall' : 'Public Amenity'}</strong></div>
    <div class="metric-row"><span>Wheelchair Friendly:</span><strong class="val-green">Yes</strong></div>
    <div class="metric-row"><span>Sensory Kit Station:</span><strong>No (Go to Room 210)</strong></div>
    <div class="nav-steps-box">
      <h4>Direct Nav Route:</h4>
      <p class="neutral-text" style="font-size:0.8rem">Direct routes mapped to your mobile ticket seat (Sec 114A). Follow concourse hallway indicators.</p>
    </div>
  `;
}

/* ECO TRANSIT PLANNER & CARBON METRICS */

// Switch transit planner card selection
function selectTransitMode(mode) {
  appState.selectedTransit = mode;
  
  // Highlight selection
  document.getElementById("mode-train").classList.toggle("active", mode === 'train');
  document.getElementById("mode-shuttle").classList.toggle("active", mode === 'shuttle');
  document.getElementById("mode-car").classList.toggle("active", mode === 'car');
  
  const btn = document.getElementById("btn-log-ride-text");
  if (mode === 'car') {
    btn.innerText = "Log Ride (No Eco Points Eligible)";
  } else {
    btn.innerText = "Log Sustainable Ride & Claim Eco-Points";
  }
}

// Claim sustainable points action
function logSustainableChoice() {
  const mode = appState.selectedTransit;
  
  if (mode === 'car') {
    alert("Personal rideshare/car options do not earn eco points. Please consider transit links or parking shuttles next time!");
    return;
  }
  
  let pointsGained = mode === 'train' ? 40 : 20;
  appState.ecoPoints += pointsGained;
  
  // Update badge UI top right
  document.getElementById("eco-points-label").innerText = `${appState.ecoPoints} Eco Points`;
  
  // Gamified achievements
  if (appState.ecoPoints >= 50) {
    const reward1 = document.getElementById("reward-1");
    if (reward1) {
      reward1.classList.remove("locked");
      reward1.classList.add("unlocked");
      document.getElementById("reward-1-diff").innerText = "0";
      document.getElementById("lbl-reward-req-1").innerText = "REWARD UNLOCKED!";
      document.getElementById("lbl-reward-req-1-diff").innerText = "";
    }
  } else {
    document.getElementById("reward-1-diff").innerText = (50 - appState.ecoPoints).toString();
  }
  
  if (appState.ecoPoints >= 100) {
    const reward2 = document.getElementById("reward-2");
    if (reward2) {
      reward2.classList.remove("locked");
      reward2.classList.add("unlocked");
      document.getElementById("reward-2-diff").innerText = "0";
      document.getElementById("lbl-reward-req-2").innerText = "REWARD UNLOCKED!";
      document.getElementById("lbl-reward-req-2-diff").innerText = "";
    }
    document.getElementById("user-eco-level").innerText = "Eco Champion (Level 3)";
  } else {
    document.getElementById("reward-2-diff").innerText = (100 - appState.ecoPoints).toString();
  }
  
  // Visual Feedback
  alert(`Eco-friendly transit logged! You earned +${pointsGained} points. Thank you for contributing to a green World Cup!`);
}

/* ACCESSIBILITY PANELS & URGENT SUPPORT DISPATCHER */

// Toggles helper options
function toggleAssistFeature(cardElement, type) {
  cardElement.classList.toggle("active");
  
  // Simulate SVG map adaptation when feature is toggled (e.g. wheelchair route highlighting)
  if (type === 'wheelchair') {
    const pathB = document.getElementById("zone-B");
    if (pathB) {
      pathB.classList.toggle("congested-red", cardElement.classList.contains("active"));
    }
  }
}

// Sensory Room Booking Confirmation
function bookSensoryRoom() {
  const timeSelect = document.getElementById("sensory-time");
  const timeText = timeSelect.options[timeSelect.selectedIndex].text;
  const guests = document.getElementById("sensory-guests").value;
  
  const conf = document.getElementById("booking-confirmation");
  conf.classList.remove("hidden");
  
  const code = appState.bookingCounter++;
  conf.innerHTML = `
    <strong>Booking Confirmed!</strong><br>
    Reservation Code: <strong>#SR-${code}</strong><br>
    Time Slot: ${timeText}<br>
    Guests: ${guests} fan(s)<br>
    <em>Location: MetLife Plaza Level Room 210. Present this screen at door entry.</em>
  `;
}

// Request emergency assistance
function requestVolunteerAssistance() {
  const seat = document.getElementById("help-seat").value.trim();
  const desc = document.getElementById("help-description").value.trim();
  
  if (seat === "" || desc === "") {
    alert("Please enter your seat position and outline assistance requirements.");
    return;
  }
  
  const statusBox = document.getElementById("volunteer-request-status");
  statusBox.classList.remove("hidden");
  
  // Set dispatch message
  document.getElementById("vol-status-text").innerText = "AI Dispatching Volunteer...";
  
  // Simulate Volunteer response
  setTimeout(() => {
    document.getElementById("vol-status-text").innerText = "Volunteer Assigned";
    document.getElementById("vol-status-text").style.color = "var(--green-color)";
    
    // Add incident dynamically to operations HQ log!
    addIncidentToOpsHQ(seat, desc);
  }, 2000);
}

// Inserts fan support request into Operations Command log
function addIncidentToOpsHQ(seat, description) {
  const opsLog = document.getElementById("ops-incident-feed");
  if (!opsLog) return;
  
  const newIncId = `inc-${Date.now().toString().slice(-4)}`;
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  const cleanSeat = escapeHTML(seat);
  const cleanDesc = escapeHTML(description);
  
  const incidentCard = document.createElement("div");
  incidentCard.className = "incident-card moderate";
  incidentCard.id = newIncId;
  incidentCard.innerHTML = `
    <div class="inc-header">
      <span class="inc-severity" style="color:var(--gold-color)">MODERATE</span>
      <span class="inc-time">${time}</span>
    </div>
    <h4>Accessibility Request - Seat ${cleanSeat}</h4>
    <p>${cleanDesc}</p>
    <div class="inc-actions">
      <button class="btn btn-sm btn-primary" onclick="resolveIncident('${newIncId}')">Mark Resolved</button>
      <button class="btn btn-sm btn-outline" onclick="dispatchDirect('Accessibility need Seat ${cleanSeat}: ${cleanDesc}')">Generate AI Dispatch</button>
    </div>
  `;
  
  opsLog.insertBefore(incidentCard, opsLog.firstChild);
  
  // Update badge count
  appState.incidentCount++;
  document.getElementById("incident-count-badge").innerText = `${appState.incidentCount} Active`;
  document.getElementById("ops-incidents-val").innerText = appState.incidentCount.toString();
}

/* OPERATIONS HQ - METRICS, DISPATCHER, CHARTS & SIMULATION SCENARIOS */

// Resolve Incident
function resolveIncident(incId) {
  const incCard = document.getElementById(incId);
  if (incCard) {
    incCard.remove();
    appState.incidentCount--;
    if (appState.incidentCount < 0) appState.incidentCount = 0;
    
    document.getElementById("incident-count-badge").innerText = `${appState.incidentCount} Active`;
    document.getElementById("ops-incidents-val").innerText = appState.incidentCount.toString();
  }
}

// Trigger simulation scenario
function triggerSimScenario(scenario) {
  appState.activeSimScenario = scenario;
  
  const banner = document.getElementById("ai-alert-banner");
  const bannerTitle = document.getElementById("alert-title");
  const bannerDesc = document.getElementById("alert-desc");
  const simScenarioLabel = document.getElementById("current-sim-scenario");
  const simDesc = document.getElementById("current-sim-desc");
  
  if (scenario === 'reset') {
    // Restore normal settings
    banner.classList.add("hidden");
    simScenarioLabel.innerText = "Normal Stadium Operations";
    simScenarioLabel.className = "text-green";
    simDesc.innerText = "The simulation is running on nominal settings. Click any scenario button above to trigger anomalies.";
    
    // Restore standard metrics
    document.getElementById("ops-attendance-val").innerText = "68,245";
    document.getElementById("ops-avg-queue-val").innerText = "8.5 min";
    document.getElementById("ops-avg-queue-val").style.color = "white";
    
    // Restore chart points
    updateChartsData([50, 60, 68, 72, 78, 82], [4, 18, 3, 6]);
    
    // Clear custom simulated incidents
    resolveIncident("sim-inc-01");
    resolveIncident("sim-inc-02");
    
    // Update map zones color
    const gateB = document.getElementById("gate-b");
    if (gateB) gateB.classList.remove("congested");
    const zoneB = document.getElementById("zone-B");
    if (zoneB) zoneB.classList.remove("congested-red");
    
  } else if (scenario === 'surge') {
    // Trigger crowd surge simulation
    banner.classList.remove("hidden");
    bannerTitle.innerText = "AI Crowdflow Alert:";
    bannerDesc.innerText = "Gate B queue bottleneck detected. Wait times exceeded 20 minutes. Diverting fans to Gate A.";
    
    simScenarioLabel.innerText = "Gate B Crowd Surge Active";
    simScenarioLabel.className = "text-red";
    simDesc.innerText = "Gate B flow rate is simulated at 180 entries/min. Alternate external signage has been activated to balance loading.";
    
    // Spikes values
    document.getElementById("ops-avg-queue-val").innerText = "14.2 min";
    document.getElementById("ops-avg-queue-val").style.color = "var(--red-color)";
    
    // SVG color changes
    const gateB = document.getElementById("gate-b");
    if (gateB) gateB.classList.add("congested");
    const zoneB = document.getElementById("zone-B");
    if (zoneB) zoneB.classList.add("congested-red");

    // Add Incident
    addSimulatedIncident("sim-inc-01", "HIGH", "Crowd bottleneck at East Plaza Gate B. Queue length is 450 meters. Redirect signage requested.");
    
    // Update charts
    updateChartsData([50, 60, 68, 76, 80, 84], [5, 34, 4, 7]);
    
  } else if (scenario === 'transit') {
    // Train delays
    banner.classList.remove("hidden");
    bannerTitle.innerText = "Transit Advisory Alert:";
    bannerDesc.innerText = "Severe delays on NJ Transit Line to Secaucus. Attendance rate slowed. Alternate shuttles dispatched.";
    
    simScenarioLabel.innerText = "Transit Link Outage";
    simScenarioLabel.className = "text-yellow";
    simDesc.innerText = "Rail link is running at 30% capacity. Auxiliary park-and-ride shuttles have been activated from Manhattan and Newark.";
    
    document.getElementById("ops-attendance-val").innerText = "59,480";
    
    addSimulatedIncident("sim-inc-02", "MODERATE", "Train track switch failure at Secaucus Junction. Approx 8,000 fans delayed. Directing to shuttle loops.");
    
    updateChartsData([50, 55, 57, 58, 59, 59], [2, 10, 3, 4]);
    
  } else if (scenario === 'weather') {
    // Severe Weather
    banner.classList.remove("hidden");
    bannerTitle.innerText = "Severe Weather Alert:";
    bannerDesc.innerText = "Lightning warning within 5 miles. Closing all open plazas. Directing fans to covered concourse shells.";
    
    simScenarioLabel.innerText = "Severe Weather Emergency";
    simScenarioLabel.className = "text-red";
    simDesc.innerText = "Pre-match outdoor activities cancelled. Automated evacuation routes triggered on all fan client maps.";
    
    updateChartsData([50, 60, 68, 69, 70, 70], [1, 2, 1, 2]);
  }
}

// Clear banner
function closeAlertBanner() {
  document.getElementById("ai-alert-banner").classList.add("hidden");
}

// Add incident from simulation scripts
function addSimulatedIncident(id, severity, text) {
  resolveIncident(id); // Avoid duplicates
  const opsLog = document.getElementById("ops-incident-feed");
  if (!opsLog) return;
  
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const cleanText = escapeHTML(text);
  const card = document.createElement("div");
  card.className = `incident-card ${severity.toLowerCase()}`;
  card.id = id;
  card.innerHTML = `
    <div class="inc-header">
      <span class="inc-severity">${severity}</span>
      <span class="inc-time">${time}</span>
    </div>
    <h4>Simulated Event Incident</h4>
    <p>${cleanText}</p>
    <div class="inc-actions">
      <button class="btn btn-sm btn-primary" onclick="resolveIncident('${id}')">Mark Resolved</button>
      <button class="btn btn-sm btn-outline" onclick="dispatchDirect('${cleanText}')">Generate AI Dispatch</button>
    </div>
  `;
  opsLog.insertBefore(card, opsLog.firstChild);
  appState.incidentCount++;
  document.getElementById("incident-count-badge").innerText = `${appState.incidentCount} Active`;
  document.getElementById("ops-incidents-val").innerText = appState.incidentCount.toString();
}

// Approve Signage reroute
function simulateGateReroute() {
  document.getElementById("reroute-success-label").classList.remove("hidden");
  
  // Decrease wait times as dynamic signs balance queues
  setTimeout(() => {
    document.getElementById("table-gate-b-time").innerText = "12 mins";
    document.getElementById("table-gate-b-status").innerText = "Moderate";
    document.getElementById("table-gate-b-status").className = "status-badge yellow";
    
    document.getElementById("table-gate-a-time").innerText = "8 mins";
  }, 2000);
}

/* GENAI DISPATCH CARD GENERATOR */

// Insert templates
function applyDispatchTemplate(type) {
  const notesField = document.getElementById("dispatcher-raw-text");
  if (!notesField) return;
  
  if (type === 'sensory') {
    notesField.value = "A parent reports their 7-year-old child is having a sensory fit in Section 112, Row 4. Sensory kit requested. Accessibility crew needed.";
  } else if (type === 'spill') {
    notesField.value = "Minor hazard: Soda spill near East Plaza entrance Gate B. Liquid on tiles, slippage risk. Trash crew dispatch requested.";
  } else if (type === 'lost-kid') {
    notesField.value = "Organizers: A lost kid wearing a green jersey was found near Concourse B information booth. Child name Leo. Need security response.";
  }
}

// Deep direct dispatch bypass
function dispatchDirect(text) {
  switchTab('ops-dispatcher');
  const field = document.getElementById("dispatcher-raw-text");
  if (field) {
    field.value = text;
    generateAIDispatch();
  }
}

// Mock parser for GenAI Action Dispatch
function generateAIDispatch() {
  const rawText = document.getElementById("dispatcher-raw-text").value.trim();
  if (rawText === "") {
    alert("Please enter incident notes to process.");
    return;
  }
  
  // Show Result panel, hide empty state
  document.getElementById("dispatch-card-empty").classList.add("hidden");
  const cardResult = document.getElementById("dispatch-card-result");
  cardResult.classList.remove("hidden");
  
  // Reset success banner
  document.getElementById("dispatcher-sent-banner").classList.add("hidden");
  
  // Mock AI categorization parsing logic
  let title = "General Incident Response";
  let severity = "MODERATE";
  let group = "Operations Staff";
  let location = "Concourse Main";
  let summary = "Standard request processed.";
  let checklist = [];
  
  const textLower = rawText.toLowerCase();
  
  if (textLower.includes("sensory") || textLower.includes("fit") || textLower.includes("accessibility")) {
    title = "Sensory Overload Assist";
    severity = "HIGH";
    group = "Accessibility Volunteer";
    location = textLower.includes("112") ? "Section 112, Row 4" : "Concourse Plaza";
    summary = "A child fan is experiencing sensory discomfort. Immediate delivery of specialized sensory kits is recommended.";
    checklist = [
      "Retrieve sensory noise-cancelling headphones and sensory kit.",
      "Dispatch nearest accessibility crew to Section 112.",
      "If necessary, escort fan to Sensory Room 210."
    ];
  } else if (textLower.includes("spill") || textLower.includes("hazard") || textLower.includes("slip")) {
    title = "Slippage Hazard Clearance";
    severity = "MODERATE";
    group = "Sanitation & Safety Patrol";
    location = textLower.includes("gate b") ? "East Entrance Gate B" : "Concourse A Section 104";
    summary = "Spilled beverage reported on tiles. Sanitation dispatch requested to prevent slip-and-fall incident.";
    checklist = [
      "Dispatch sanitation patrol with warning cones and cleanup kit.",
      "Secure and dry the zone around Gate B.",
      "Verify surface traction before releasing area."
    ];
  } else if (textLower.includes("child") || textLower.includes("lost") || textLower.includes("leo")) {
    title = "Lost Child Reconciliation Protocol";
    severity = "CRITICAL";
    group = "Security & Child Safety Taskforce";
    location = "Concourse B Info Booth";
    summary = "A lost minor (named Leo, green jersey) is located at Info Desk. Security protocols triggered to re-unite child with guardians.";
    checklist = [
      "Verify child comfort and assign supervisor care.",
      "Trigger AI digital bulletin match query matching tickets registered to guardians.",
      "Broadcast child security code alert to exit gates."
    ];
  } else {
    // Fallback standard parse
    title = "Custom Incident Dispatch";
    severity = "MODERATE";
    group = "General Arena Volunteer";
    location = "Field Level Plaza";
    summary = "Raw transcription processed. General task card created for nearby volunteers.";
    checklist = [
      "Review raw dispatch ticket details.",
      "Coordinate with supervisor on dispatch frequency.",
      "Confirm task completion in live terminal."
    ];
  }
  
  // Set values in DOM
  document.getElementById("disp-title").innerText = title;
  
  const sevEl = document.getElementById("disp-severity");
  sevEl.innerText = severity;
  sevEl.className = `severity-badge ${severity.toLowerCase()}`;
  
  document.getElementById("disp-location").innerText = location;
  document.getElementById("disp-group").innerText = group;
  document.getElementById("disp-summary").innerText = summary;
  
  const listEl = document.getElementById("disp-checklist");
  listEl.innerHTML = "";
  checklist.forEach(step => {
    listEl.innerHTML += `<li><input type="checkbox"> <span>${step}</span></li>`;
  });
  
  // Scroll to results
  cardResult.scrollIntoView({ behavior: 'smooth' });
}

// Action button dispatch
function dispatchVolunteerAction() {
  document.getElementById("dispatcher-sent-banner").classList.remove("hidden");
  
  // Clear notes input after a short delay
  setTimeout(() => {
    document.getElementById("dispatcher-raw-text").value = "";
  }, 2000);
}

/* CHART.JS OPERATIONS ANALYTICS CONFIG */

function initOperationsCharts() {
  const ctxOccupancy = document.getElementById('occupancyChart');
  const ctxQueue = document.getElementById('queueTimesChart');
  
  // Destroy old instances to prevent memory leaks and overlay bugs
  if (appState.charts.occupancy) {
    appState.charts.occupancy.destroy();
  }
  if (appState.charts.queue) {
    appState.charts.queue.destroy();
  }
  
  // 1. Capacity Line/Area Chart
  appState.charts.occupancy = new Chart(ctxOccupancy, {
    type: 'line',
    data: {
      labels: ['16:30', '17:00', '17:30', '18:00', '18:30', '19:00'],
      datasets: [{
        label: 'Occupancy Rate (%)',
        data: [12, 34, 52, 68, 78, 82],
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // 2. Queue Wait Times Bar Chart
  appState.charts.queue = new Chart(ctxQueue, {
    type: 'bar',
    data: {
      labels: ['Gate A', 'Gate B', 'Gate C', 'Gate D'],
      datasets: [{
        label: 'Wait Time (Minutes)',
        data: [4, 18, 3, 6],
        backgroundColor: ['#10b981', '#ef4444', '#10b981', '#fcd34d'],
        borderWidth: 0,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
  
  appState.chartsInitialized = true;
}

// Dynamically refresh data points on charts when simulator triggers scenarios
function updateChartsData(occupancyData, queueData) {
  if (!appState.chartsInitialized) return;
  
  // Update Occupancy Chart dataset
  appState.charts.occupancy.data.datasets[0].data = occupancyData;
  appState.charts.occupancy.update();
  
  // Update Queue Chart dataset
  appState.charts.queue.data.datasets[0].data = queueData;
  // Recolor bars depending on new wait times
  const bgColors = queueData.map(val => {
    if (val >= 15) return '#ef4444'; // Red
    if (val >= 8) return '#fcd34d';  // Yellow
    return '#10b981';                // Green
  });
  appState.charts.queue.data.datasets[0].backgroundColor = bgColors;
  appState.charts.queue.update();
  
  // Update the tabular values in Analytics pane as well
  document.getElementById("table-gate-a-time").innerText = `${queueData[0]} mins`;
  
  const tableB = document.getElementById("table-gate-b-time");
  const tableBStatus = document.getElementById("table-gate-b-status");
  tableB.innerText = `${queueData[1]} mins`;
  if (queueData[1] >= 15) {
    tableBStatus.innerText = "High Wait";
    tableBStatus.className = "status-badge red";
  } else if (queueData[1] >= 8) {
    tableBStatus.innerText = "Moderate";
    tableBStatus.className = "status-badge yellow";
  } else {
    tableBStatus.innerText = "Low Wait";
    tableBStatus.className = "status-badge green";
  }
  
  document.getElementById("table-gate-c-time").innerText = `${queueData[2]} mins`;
  
  const tableD = document.getElementById("table-gate-d-time");
  const tableDStatus = document.getElementById("table-gate-d-status");
  tableD.innerText = `${queueData[3]} mins`;
  if (queueData[3] >= 15) {
    tableDStatus.innerText = "High Wait";
    tableDStatus.className = "status-badge red";
  } else if (queueData[3] >= 8) {
    tableDStatus.innerText = "Moderate";
    tableDStatus.className = "status-badge yellow";
  } else {
    tableDStatus.innerText = "Low Wait";
    tableDStatus.className = "status-badge green";
  }
  
  // Redraw instructions routing in AI insights text boxes
  const routingEl = document.getElementById("ai-routing-rec");
  if (queueData[1] >= 15) {
    routingEl.innerText = `Due to the bottleneck at Gate B (${queueData[1]} min wait), the AI recommends adjusting the external digital signage at the train exit to reroute 40% of incoming fans to Gate A. Notifications have been dispatched to parking monitors.`;
    document.getElementById("reroute-success-label").classList.add("hidden");
  } else {
    routingEl.innerText = "All gates are balanced and within nominal throughput limits. Continuously monitoring flow rates.";
    document.getElementById("reroute-success-label").classList.add("hidden");
  }
}

// Initialize the Lamine Yamal radar stats chart
function initYamalRadarChart() {
  const ctx = document.getElementById('yamalRadarChart');
  if (!ctx) return;

  if (appState.charts.yamalRadar) {
    appState.charts.yamalRadar.destroy();
  }

  appState.charts.yamalRadar = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['PAC', 'SHO', 'PAS', 'DRI', 'DEF', 'PHY'],
      datasets: [{
        label: 'Lamine Yamal Stats',
        data: [95, 87, 91, 92, 54, 72],
        backgroundColor: 'rgba(236, 72, 153, 0.22)',
        borderColor: '#ec4899',
        borderWidth: 2,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#ec4899'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
          grid: { color: 'rgba(255, 255, 255, 0.08)' },
          pointLabels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
          ticks: { display: false },
          min: 0,
          max: 100
        }
      }
    }
  });
}

