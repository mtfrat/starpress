import Link from "next/link";

const features = [
  {
    badge: "01",
    title: "Widgets Web Nativos",
    subtitle: "Embeds impecables",
    description:
      "Copia el link de tu ficha en Google Maps y obtén un widget dinámico y responsivo para tu web. Carrusel, listado o insignia flotante.",
  },
  {
    badge: "02",
    title: "Análisis con IA Pro",
    subtitle: "Sentimiento y patrones",
    description:
      "Descubre exactamente qué admiran y qué reclaman tus clientes. Matriz de sentimiento, recomendaciones accionables y oportunidades ocultas.",
  },
  {
    badge: "03",
    title: "Publicaciones para Redes",
    subtitle: "Contenido editorial listo",
    description:
      "Transforma tus mejores testimonios en tarjetas visuales de alta resolución y copies elegantes listos para publicar en Instagram, LinkedIn y X.",
  },
  {
    badge: "04",
    title: "Alertas Tempranas",
    subtitle: "Notificaciones instantáneas",
    description:
      "Recibe avisos inmediatos en tu correo ante cualquier reseña insatisfecha para actuar y reparar la relación antes de que impacte tu reputación.",
  },
  {
    badge: "05",
    title: "Informes Semanales",
    subtitle: "Resumen ejecutivo en tu bandeja",
    description:
      "Un análisis periódico estructurado con la evolución de tus métricas, reseñas clave de la semana y plan de acción recomendado por la IA.",
  },
  {
    badge: "06",
    title: "Detección de Reseñas Falsas",
    subtitle: "Defensa jurídica y comercial",
    description:
      "Identifica patrones sospechosos que violan las políticas de Google y redacta solicitudes de disputa formales en un solo clic.",
  },
];

const steps = [
  {
    number: "1",
    title: "Conecta tu ficha de Google",
    description:
      "Pega la URL de tu negocio o conecta directamente con Google Business Profile para sincronizar cada reseña histórica y reciente.",
  },
  {
    number: "2",
    title: "Personaliza tu voz y widgets",
    description:
      "Elige el estilo visual que respeta la identidad de tu marca, activa la respuesta automática con IA y genera tus tarjetas sociales.",
  },
  {
    number: "3",
    title: "Convierte reputación en facturación",
    description:
      "Muestra prueba social auténtica en tu web, amplifica tus recomendaciones en redes y atrae nuevos clientes de alto valor.",
  },
];

const testimonials = [
  {
    name: "Dra. Sofía Albarracín",
    role: "Directora Médica · Clínica Albarracín",
    text: "Nuestra calificación subió de 4.1 a 4.8. Las respuestas generadas por IA son increíblemente humanas y nos ahorran horas de gestión cada semana.",
    rating: 5,
    highlight: "increíblemente humanas",
  },
  {
    name: "Marcos De la Vega",
    role: "Fundador · Grupo Gastronómico Volga",
    text: "Poder exportar las reseñas destacadas en tarjetas visuales elegantes para Instagram cambió radicalmente nuestra presencia en redes.",
    rating: 5,
    highlight: "tarjetas visuales elegantes",
  },
  {
    name: "Valentina Rossi",
    role: "Gerente de Operaciones · Hotel Boutique Mirador",
    text: "El informe semanal nos da claridad total sobre la experiencia de los huéspedes. Y detectamos 2 reseñas maliciosas con la herramienta de disputa.",
    rating: 5,
    highlight: "claridad total",
  },
];

const faqs = [
  {
    question: "¿Cómo funciona la conexión con Google Maps?",
    answer:
      "Simplemente pegas el enlace público de tu negocio en Google Maps o inicias sesión con tu cuenta de Google Business Profile. StarPress extrae y organiza tus reseñas de manera automática y segura mediante sincronización oficial.",
  },
  {
    question: "¿Los widgets de reseñas afectan la velocidad de mi sitio web?",
    answer:
      "No. Nuestros scripts están optimizados para cargar de forma asíncrona y pesan menos de 15KB, garantizando 100% de rendimiento en Google Core Web Vitals y sin bloquear el renderizado.",
  },
  {
    question: "¿Puedo exportar imágenes para publicar en Instagram y LinkedIn?",
    answer:
      "Sí. Con un solo clic puedes convertir cualquier reseña de 5 estrellas en una pieza gráfica con diseño editorial de revista en resolución 3x Retina (PNG de alta definición), lista para feed o stories.",
  },
  {
    question: "¿Qué es el sistema de Review Gating y cómo funciona el código QR?",
    answer:
      "El Review Gating es un embudo inteligente: al escanear tu código QR en el local, los clientes que califican con 4 o 5 estrellas son redirigidos directamente a Google Maps, mientras que los clientes con quejas de 1 a 3 estrellas son derivados a un formulario privado interno para que puedas solucionar el problema sin perjudicar tu puntaje público.",
  },
  {
    question: "¿Qué incluye el plan gratuito de StarPress?",
    answer:
      "El plan gratuito te permite gestionar una ubicación completa de negocio, insertar widgets web ilimitados y generar tu código QR de captura para siempre, sin necesidad de ingresar tarjeta de crédito.",
  },
];

const jsonLdFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#171417] antialiased selection:bg-[#eaebf8] selection:text-[#0c1754]">
      {/* Schema.org FAQPage for Google Rich Snippets & AI Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
      />
      {/* Top Navigation Bar — Officevibe Style */}
      <header className="sticky top-0 z-40 bg-[#f9f8f6]/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c1754] text-white font-bold text-sm shadow-sm transition group-hover:bg-[#2545ff]">
              ★
            </span>
            <span className="text-xl font-bold tracking-tight text-[#0c1754]">
              Star<span className="text-[#2545ff]">Press</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#caracteristicas"
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#2545ff]"
            >
              Soluciones
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#2545ff]"
            >
              Cómo funciona
            </Link>
            <Link
              href="#testimonios"
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#2545ff]"
            >
              Casos de éxito
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#2545ff]"
            >
              Precios
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-[#222222] transition-colors hover:text-[#0c1754]"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-[#2545ff] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1a38e8] active:scale-[0.98]"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section — 2 Columns Editorial Layout */}
      <section className="relative px-6 pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-7">
              {/* Eyebrow Label */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f0e9e1] bg-white px-4 py-1.5 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#2545ff]" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0c1754]">
                  Gestión Inteligente de Reputación
                </span>
              </div>

              {/* Display Headline with Signature Italic Cut */}
              <h1 className="font-editorial text-4xl font-normal leading-[1.08] tracking-tight text-[#0c1754] sm:text-5xl md:text-6xl">
                Tus mejores reseñas, convertidas en la{" "}
                <em className="font-editorial italic font-normal text-[#2545ff]">
                  mayor autoridad
                </em>{" "}
                para tu negocio.
              </h1>

              {/* Editorial Body Subtitle */}
              <p className="mt-7 max-w-xl text-lg leading-[1.65] text-[#222222]/85">
                Embebe testimonios en tu web con estilo impecable, responde con inteligencia
                artificial respetando la voz de tu marca y genera piezas gráficas editoriales para tus redes sociales en segundos.
              </p>

              {/* CTAs */}
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-full bg-[#2545ff] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#1a38e8] active:scale-[0.98]"
                >
                  Probar StarPress Gratis
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-full border border-[#f0e9e1] bg-white px-7 py-4 text-base font-medium text-[#222222] transition-colors hover:border-[#cccccc] hover:bg-[#f9f8f6]"
                >
                  Ver planes y precios
                </Link>
              </div>

              {/* Helper Notes */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#969696]">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#2545ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Configuración en 2 minutos
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#2545ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Sin tarjeta de crédito requerida
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-[#2545ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Plan gratuito disponible
                </span>
              </div>
            </div>

            {/* Right Column: In-Context Product Dashboard Card with Layered Tilt */}
            <div className="relative lg:col-span-5">
              {/* Layered Decorative Dark Card peeking from behind */}
              <div className="absolute -right-4 -top-4 -bottom-4 left-6 rounded-[20px] bg-[#0c1754] -rotate-2 transform opacity-95 shadow-xl hidden sm:block" />

              {/* Main Product Card */}
              <div className="relative rounded-[16px] border border-[#f0e9e1] bg-white p-7 shadow-[0_16px_40px_rgba(12,23,84,0.08)]">
                {/* Metric Header */}
                <div className="flex items-center justify-between border-b border-[#f0e9e1] pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#969696]">
                      Índice de Satisfacción
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold tracking-tight text-[#0c1754]">4.9</span>
                      <div className="flex text-[#2545ff] text-sm">★★★★★</div>
                      <span className="text-xs text-[#969696]">(248 reseñas)</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#eaebf8] px-3 py-1 text-xs font-semibold text-[#0c1754]">
                    +18% este mes
                  </div>
                </div>

                {/* Highlighted Review Quote */}
                <div className="my-6 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-[#0c1754] text-white flex items-center justify-center text-xs font-bold">
                        V
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#171417]">Victoria Gómez</p>
                        <p className="text-[10px] text-[#969696]">Cliente verificada · Hace 2 días</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#2545ff] border border-[#f0e9e1]">
                      5.0 ★
                    </span>
                  </div>
                  <p className="font-editorial italic text-base leading-snug text-[#0c1754]">
                    &ldquo;La atención personalizada superó todas mis expectativas. Sin duda el mejor servicio de la ciudad.&rdquo;
                  </p>
                </div>

                {/* AI Assistant Pill & Quick Actions */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between rounded-lg bg-[#eaebf8]/60 p-3 text-xs">
                    <span className="font-medium text-[#0c1754] flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-[#2545ff] animate-ping" />
                      Respuesta sugerida por IA lista
                    </span>
                    <span className="font-bold text-[#2545ff] cursor-pointer hover:underline">
                      Revisar
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-[#f0e9e1] p-3 text-xs text-[#222222]">
                    <span>Publicación para Instagram lista</span>
                    <span className="rounded-full bg-[#f9f8f6] px-2 py-0.5 font-semibold text-[#0c1754] border border-[#f0e9e1]">
                      Exportar HD
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-y border-[#f0e9e1] bg-white py-12">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
            Elegido por negocios físicos y profesionales de referencia
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-14 text-sm font-semibold tracking-wide text-[#222222]/70">
            <span className="flex items-center gap-2">
              <span className="text-[#2545ff]">✦</span> Gastronomía & Cafés de Autor
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#2545ff]">✦</span> Clínicas y Consultorios Médicos
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#2545ff]">✦</span> Hoteles Boutique & Hospitalidad
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#2545ff]">✦</span> Estudios de Arquitectura & Diseño
            </span>
          </div>
        </div>
      </section>

      {/* Feature Steps Triad (3-Card Feature Row: Dark / Light / Bordered Accent) */}
      <section id="como-funciona" className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Flujo de Trabajo
            </span>
            <h2 className="font-editorial mt-3 text-3xl font-normal tracking-tight text-[#0c1754] md:text-5xl">
              De la reseña pasiva a un{" "}
              <em className="font-editorial italic font-normal text-[#2545ff]">motor de confianza</em>
            </h2>
            <p className="mt-4 text-base text-[#222222]/80">
              Un proceso simple de tres etapas diseñado para darte control absoluto sobre la reputación de tu negocio.
            </p>
          </div>

          {/* 3-Card Row — Exactly as specified in Style Reference */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1: Dark Feature Card (Ink Navy) */}
            <div className="relative flex flex-col justify-between rounded-[16px] bg-[#0c1754] p-8 text-white shadow-lg">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#2545ff] text-sm font-bold text-white">
                  1
                </div>
                <h3 className="font-editorial text-2xl font-normal leading-snug text-white">
                  Conexión directa con Google
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-[#eaebf8]/85">
                  Conecta tu ubicación en un instante. StarPress sincroniza el historial completo de valoraciones y actualiza las nuevas entradas en tiempo real.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-xs font-semibold uppercase tracking-wider text-[#eaebf8]/70">
                Sincronización instantánea
              </div>
            </div>

            {/* Step 2: Light Feature Card (Paper White + Cream Border) */}
            <div className="relative flex flex-col justify-between rounded-[16px] border border-[#f0e9e1] bg-white p-8 shadow-sm">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#f0e9e1] bg-[#f9f8f6] text-sm font-bold text-[#0c1754]">
                  2
                </div>
                <h3 className="font-editorial text-2xl font-normal leading-snug text-[#0c1754]">
                  Embeds y difusión en web
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-[#222222]/80">
                  Inserta carruseles y badges en tu sitio web con tipografía nítida y diseño responsive que refuerza la tasa de conversión de tus visitantes.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#f0e9e1] text-xs font-semibold uppercase tracking-wider text-[#969696]">
                Sin frenar la carga de tu web
              </div>
            </div>

            {/* Step 3: Bordered Accent Card (Cobalt Accent for AI Coach / Redes) */}
            <div className="relative flex flex-col justify-between rounded-[16px] border-[1.5px] border-[#2545ff] bg-white p-8 shadow-md">
              <div>
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-[#2545ff] text-sm font-bold text-white">
                  3
                </div>
                <div className="inline-block rounded-full bg-[#eaebf8] px-2.5 py-0.5 text-[10px] font-bold text-[#0c1754] uppercase tracking-wider mb-2">
                  Destacado
                </div>
                <h3 className="font-editorial text-2xl font-normal leading-snug text-[#0c1754]">
                  IA y Tarjetas para Redes
                </h3>
                <p className="mt-3 text-sm leading-[1.6] text-[#222222]/80">
                  Convierte testimonios destacados en piezas de diseño listas para exportar (PNG HD) y genera textos profesionales de Instagram y X sin esfuerzo.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#f0e9e1] text-xs font-semibold uppercase tracking-wider text-[#2545ff]">
                Generador visual incluido
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid of All Features */}
      <section id="caracteristicas" className="border-t border-[#f0e9e1] bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Capacidades
            </span>
            <h2 className="font-editorial mt-3 text-3xl font-normal tracking-tight text-[#0c1754] md:text-5xl">
              Todo lo que necesitas para que tu reputación{" "}
              <em className="font-editorial italic font-normal text-[#2545ff]">trabaje por ti</em>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-[16px] border border-[#f0e9e1] bg-[#f9f8f6] p-7 transition-all duration-200 hover:border-[#cccccc] hover:bg-white hover:shadow-md"
              >
                <span className="text-xs font-bold tracking-widest text-[#2545ff]">
                  {f.badge}
                </span>
                <h3 className="font-editorial mt-3 text-xl font-normal text-[#0c1754]">
                  {f.title}
                </h3>
                <p className="text-xs font-medium text-[#969696] mt-0.5">
                  {f.subtitle}
                </p>
                <p className="mt-3 text-sm leading-[1.6] text-[#222222]/80">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Generator Showcase Section (Interactive Visuals) */}
      <section className="border-t border-[#f0e9e1] bg-[#f9f8f6] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Estudio Creativo para Redes
            </span>
            <h2 className="font-editorial mt-3 text-3xl font-normal tracking-tight text-[#0c1754] md:text-5xl">
              Tus reseñas 5★ convertidas en piezas de{" "}
              <em className="font-editorial italic font-normal text-[#2545ff]">diseño editorial</em>
            </h2>
            <p className="mt-4 text-base text-[#222222]/80 leading-relaxed">
              Exporta con 1 solo clic en resolución Retina 3x para Instagram, LinkedIn y X. Elige entre la calidez del papel crema o el lujo de nuestro azul noche con copies redactados por IA.
            </p>
          </div>

          {/* Side-by-side Visual Showcase */}
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Template 1: Editorial Cream */}
            <div className="flex flex-col justify-between rounded-[20px] border border-[#f0e9e1] bg-white p-6 sm:p-8 shadow-[0_16px_40px_rgba(12,23,84,0.06)]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaebf8] px-3 py-1 text-xs font-bold text-[#0c1754]">
                    <span className="h-2 w-2 rounded-full bg-[#2545ff]" />
                    Opción 1: Editorial Cream
                  </span>
                  <span className="text-xs text-[#969696] font-medium">Feed Diurno / LinkedIn</span>
                </div>

                {/* Card Preview Mockup */}
                <div className="rounded-[16px] border border-[#f0e9e1] bg-[#f9f8f6] p-6 text-center">
                  <div className="text-[#2545ff] text-base mb-3">★★★★★</div>
                  <p className="font-editorial italic text-base sm:text-lg text-[#0c1754] leading-relaxed mb-4">
                    &ldquo;El servicio superó todas las expectativas. La atención a los detalles y la calidez del equipo hicieron que la experiencia fuera inolvidable.&rdquo;
                  </p>
                  <div className="inline-flex items-center gap-2 pt-3 border-t border-[#f0e9e1]">
                    <span className="text-xs font-bold text-[#0c1754]">Valentina Rossi</span>
                    <span className="text-[11px] text-[#969696]">· Google Maps</span>
                    <span className="text-xs text-[#2545ff]">✓</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-white border border-[#f0e9e1] p-4 text-xs text-[#222222]/80">
                  <span className="font-bold text-[#0c1754] block mb-1">Copy de IA listo para publicar:</span>
                  <p className="italic text-[#969696]">
                    &ldquo;Cuando nuestros clientes se toman el tiempo de describir su experiencia con tanta precisión, sabemos que el esfuerzo vale la pena...&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f0e9e1] flex items-center justify-between text-xs text-[#969696]">
                <span>Resolución 1080x1080 (3x Retina)</span>
                <span className="font-semibold text-[#2545ff]">Exportación PNG</span>
              </div>
            </div>

            {/* Template 2: Ink Navy Luxury */}
            <div className="flex flex-col justify-between rounded-[20px] bg-[#0c1754] p-6 sm:p-8 text-white shadow-[0_20px_50px_rgba(12,23,84,0.25)]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                    <span className="h-2 w-2 rounded-full bg-[#2545ff]" />
                    Opción 2: Ink Navy Luxury
                  </span>
                  <span className="text-xs text-[#eaebf8]/70 font-medium">Alto Contraste / Stories</span>
                </div>

                {/* Card Preview Mockup */}
                <div className="rounded-[16px] border border-white/10 bg-[#09113d] p-6 text-center">
                  <div className="text-[#fbbf24] text-base mb-3">★★★★★</div>
                  <p className="font-editorial italic text-base sm:text-lg text-white leading-relaxed mb-4">
                    &ldquo;El estándar de profesionalismo y dedicación es incomparable. Sin duda se han convertido en nuestra primera opción.&rdquo;
                  </p>
                  <div className="inline-flex items-center gap-2 pt-3 border-t border-white/10">
                    <span className="text-xs font-bold text-white">Dr. Martín Silva</span>
                    <span className="text-[11px] text-[#eaebf8]/60">· Google Review</span>
                    <span className="text-xs text-[#2545ff]">✓</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-white/5 border border-white/10 p-4 text-xs text-[#eaebf8]/80">
                  <span className="font-bold text-white block mb-1">Copy de IA de alto impacto:</span>
                  <p className="italic text-[#eaebf8]/60">
                    &ldquo;&lsquo;El estándar de profesionalismo es incomparable&rsquo;. Orgullosos de mantener nuestro estándar 5★ en Google Maps gracias a ustedes...&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#eaebf8]/60">
                <span>Formato cuadrado y vertical</span>
                <span className="font-semibold text-white">Exportación PNG</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Gating & QR Funnel Section */}
      <section className="border-t border-[#f0e9e1] bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f0e9e1] bg-[#f9f8f6] px-4 py-1.5 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0c1754]">
                  Filtro Inteligente de Mostrador
                </span>
              </div>
              <h2 className="font-editorial text-3xl font-normal tracking-tight text-[#0c1754] sm:text-4xl md:text-5xl">
                Protege tu promedio de Google con nuestro{" "}
                <em className="font-editorial italic font-normal text-[#2545ff]">Kit QR Inteligente</em>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-[#222222]/85">
                Imprime tu código QR en mesas, recepciones, cartas o tickets. El sistema detecta automáticamente la satisfacción del cliente antes de enviarlo a internet:
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xs">
                    5★
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                      Clientes Felices (4 y 5 Estrellas)
                    </h4>
                    <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
                      Redirigidos automáticamente a Google Maps para dejar su reseña pública y potenciar tu SEO local.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs">
                    1-3★
                  </div>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                      Clientes Insatisfechos (1 a 3 Estrellas)
                    </h4>
                    <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                      Enviados a un buzón privado interno para que puedas solucionar su queja y contactarlos sin que dañen tu calificación en Google.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-sm rounded-[24px] border border-[#f0e9e1] bg-[#f9f8f6] p-8 text-center shadow-lg">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaebf8] text-2xl text-[#2545ff]">
                  📱
                </div>
                <h3 className="font-editorial text-2xl font-normal text-[#0c1754]">
                  Kit QR Imprimible
                </h3>
                <p className="mt-1 text-xs text-[#969696] mb-6">
                  Generado automáticamente con el nombre de tu negocio.
                </p>

                <div className="mx-auto w-48 h-48 rounded-2xl bg-white p-4 border border-[#f0e9e1] shadow-xs flex items-center justify-center">
                  <div className="space-y-2 text-center">
                    <span className="text-4xl block">🏁</span>
                    <span className="text-[11px] font-bold text-[#0c1754] block">ESCANEAR PARA OPINAR</span>
                    <span className="text-[10px] text-[#2545ff] block">Google Reviews</span>
                  </div>
                </div>

                <p className="mt-6 text-xs text-[#0c1754] font-medium">
                  ✓ Incluido en todos los planes · Listo para imprimir
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Editorial Quotes */}
      <section id="testimonios" className="px-6 py-24 md:py-32 bg-[#f9f8f6]">
        <div className="mx-auto max-w-[1200px]">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Testimonios Reales
            </span>
            <h2 className="font-editorial mt-3 text-3xl font-normal tracking-tight text-[#0c1754] md:text-5xl">
              Historias de marcas que cuidan su{" "}
              <em className="font-editorial italic font-normal text-[#2545ff]">prestigio</em>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between rounded-[16px] border border-[#f0e9e1] bg-white p-8 shadow-sm"
              >
                <div>
                  <div className="flex gap-1 text-[#2545ff] text-sm mb-4">
                    {"★".repeat(t.rating)}
                  </div>
                  <p className="font-editorial italic text-lg leading-[1.6] text-[#0c1754]">
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-[#f0e9e1]">
                  <p className="font-bold text-sm text-[#171417]">{t.name}</p>
                  <p className="text-xs text-[#969696] mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial FAQ Accordion Layout */}
      <section className="border-t border-[#f0e9e1] bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Sticky Left Column */}
            <div className="lg:col-span-5">
              <div className="sticky top-28">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
                  Preguntas Frecuentes
                </span>
                <h2 className="font-editorial mt-3 text-3xl font-normal leading-tight text-[#0c1754] md:text-4xl">
                  Respuestas claras sobre la plataforma y el servicio.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#222222]/80">
                  ¿Tenés una duda específica sobre la implementación técnica o los modelos de IA? Estamos para ayudarte.
                </p>
                <div className="mt-6">
                  <a
                    href="mailto:soporte@starpress.app"
                    className="inline-flex items-center text-sm font-medium text-[#2545ff] hover:underline"
                  >
                    Contactar al equipo de soporte →
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Accordion Rows */}
            <div className="lg:col-span-7 space-y-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-[16px] border border-[#f0e9e1] bg-[#f9f8f6] p-6 transition-all"
                >
                  <h3 className="text-base font-semibold text-[#0c1754]">
                    {faq.question}
                  </h3>
                  <p className="mt-3 text-sm leading-[1.65] text-[#222222]/85">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final Editorial Banner CTA */}
      <section className="bg-[#0c1754] px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-[#2545ff]/30 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#eaebf8] mb-6">
            Comienza Hoy Mismo
          </span>
          <h2 className="font-editorial text-3xl font-normal leading-tight md:text-5xl">
            Haz que las opiniones de tus clientes construyan el{" "}
            <em className="font-editorial italic font-normal text-white">próximo capítulo</em> de tu empresa.
          </h2>
          <p className="mt-6 text-base text-[#eaebf8]/80 max-w-xl mx-auto">
            Configura tus widgets, conecta tu ficha de Google Maps y descarga tus primeras tarjetas de redes sociales en menos de 2 minutos.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/signup"
              className="rounded-full bg-[#2545ff] px-8 py-4 text-base font-medium text-white transition hover:bg-[#1a38e8] active:scale-[0.98]"
            >
              Comenzar Gratis — Sin Tarjeta
            </Link>
          </div>
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="border-t border-[#f0e9e1] bg-[#f9f8f6] py-14">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0c1754] text-white text-xs font-bold">
                  ★
                </span>
                <span className="text-lg font-bold text-[#0c1754]">
                  Star<span className="text-[#2545ff]">Press</span>
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#969696]">
                Plataforma de reputación y marketing visual basada en Google Reviews para marcas que valoran la excelencia.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0c1754]">
                Plataforma
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-[#222222]/80">
                <li><Link href="/pricing" className="hover:text-[#2545ff]">Planes y Precios</Link></li>
                <li><Link href="#como-funciona" className="hover:text-[#2545ff]">Widgets Web</Link></li>
                <li><Link href="#caracteristicas" className="hover:text-[#2545ff]">Tarjetas para Redes</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0c1754]">
                Acceso
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-[#222222]/80">
                <li><Link href="/auth/login" className="hover:text-[#2545ff]">Iniciar Sesión</Link></li>
                <li><Link href="/auth/signup" className="hover:text-[#2545ff]">Crear Cuenta Gratis</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#2545ff]">Panel de Control</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0c1754]">
                Legal & Soporte
              </h4>
              <ul className="mt-4 space-y-2.5 text-xs text-[#222222]/80">
                <li><Link href="/legal/terms" className="hover:text-[#2545ff]">Términos de Servicio</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-[#2545ff]">Política de Privacidad</Link></li>
                <li><a href="mailto:soporte@starpress.app" className="hover:text-[#2545ff]">soporte@starpress.app</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#f0e9e1] pt-8 text-xs text-[#969696]">
            <p>© {new Date().getFullYear()} StarPress. Todos los derechos reservados.</p>
            <p className="mt-2 sm:mt-0 font-editorial italic text-sm text-[#0c1754]">
              Diseñado con estilo editorial cálido y tipografía curada.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

