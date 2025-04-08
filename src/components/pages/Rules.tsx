import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Rules() {
  // Estilos CSS para los contenedores y enlaces
  const styles = {
    contentContainer: "bg-white rounded-lg shadow-md p-6 mb-6",
    tocLink:
      "text-blue-600 hover:text-red-500 hover:underline transition-colors duration-200",
  };

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-500">
            Guía Completa y Detallada del JCC Pokémon
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Esta guía proporciona una explicación exhaustiva de las reglas del
            Juego de Cartas Coleccionables Pokémon, diseñada para ser una
            referencia completa y fácil de entender para jugadores de todos los
            niveles.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className={`${styles.contentContainer} mb-8`}>
            <h2 className="text-2xl font-bold mb-4">Tabla de Contenidos</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="#introduccion"
                  className={styles.tocLink}
                >
                  1. Introducción al JCC Pokémon
                </a>
              </li>
              <li>
                <a
                  href="#tipos-cartas"
                  className={styles.tocLink}
                >
                  2. Tipos de Cartas y sus Funciones
                </a>
              </li>
              <li>
                <a
                  href="#preparacion"
                  className={styles.tocLink}
                >
                  3. Preparación de la Partida
                </a>
              </li>
              <li>
                <a
                  href="#turno"
                  className={styles.tocLink}
                >
                  4. El Turno de un Jugador
                </a>
              </li>
              <li>
                <a
                  href="#atacar"
                  className={styles.tocLink}
                >
                  5. Atacar (Detalles)
                </a>
              </li>
              <li>
                <a
                  href="#condiciones"
                  className={styles.tocLink}
                >
                  6. Condiciones Especiales{" "}
                </a>
              </li>
              <li>
                <a
                  href="#ganar"
                  className={styles.tocLink}
                >
                  7. Cómo Ganar la Partida
                </a>
              </li>
              <li>
                <a
                  href="#mazos"
                  className={styles.tocLink}
                >
                  8. Construcción de Mazos
                </a>
              </li>
              <li>
                <a
                  href="#reglas-adicionales"
                  className={styles.tocLink}
                >
                  9. Reglas Adicionales y Casos Especiales
                </a>
              </li>
            </ul>
          </div>

          <div className={`${styles.contentContainer} mb-8`}>
            <h2 className="text-2xl font-bold mb-4">Preguntas Frecuentes</h2>
            <Accordion
              type="single"
              collapsible
              className="w-full"
            >
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  ¿Cuál es el objetivo principal del JCC Pokémon?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    El objetivo principal del juego es ser el primero en
                    alcanzar una de las siguientes condiciones de victoria:
                    tomar las 6 cartas de Premio dejando Fuera de Combate a los
                    Pokémon del rival, dejar al oponente sin Pokémon en juego, o
                    que el oponente no tenga cartas en su mazo al inicio de su
                    turno.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  ¿Qué necesito para jugar al JCC Pokémon?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Para jugar necesitas un mazo de exactamente 60 cartas,
                    contadores de daño, una moneda o dado para lanzamientos,
                    seis cartas de Premio, y opcionalmente marcadores de
                    Condiciones Especiales y un tapete de juego.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  ¿Cuántas cartas puedo tener en mi mazo?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Tu mazo debe contener exactamente 60 cartas, ni más ni
                    menos. Además, exceptuando las cartas de Energía Básica,
                    solo puedes incluir un máximo de 4 copias de cualquier carta
                    con el mismo nombre.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>
                  ¿Qué son las Condiciones Especiales?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Las Condiciones Especiales son estados que afectan a los
                    Pokémon: Dormido, Paralizado, Envenenado, Quemado y Confuso.
                    Cada una tiene efectos diferentes y formas específicas de
                    curarse.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>
                  ¿Cómo funciona la Debilidad y Resistencia?
                </AccordionTrigger>
                <AccordionContent>
                  <p>
                    Si un Pokémon es débil al tipo del ataque, el daño se
                    duplica. Si es resistente, el daño se reduce (generalmente
                    en 30 puntos). Estas características están indicadas en la
                    parte inferior de cada carta de Pokémon.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div id="contenido-principal">
            <section
              id="introduccion"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                1. Introducción al Juego de Cartas Coleccionables Pokémon
              </h2>

              <p className="mb-4">
                En el JCC Pokémon, cada jugador asume el rol de un Entrenador
                Pokémon que utiliza un mazo de 60 cartas compuesto por Pokémon,
                Energía y Entrenadores para enfrentarse a otro jugador. El juego
                se desarrolla en batallas estratégicas donde los jugadores
                buscan dejar Fuera de Combate a los Pokémon de su oponente.
              </p>

              <h3 className="text-xl font-semibold mb-2 text-red-500">
                Objetivo del Juego
              </h3>
              <p className="mb-2">
                El objetivo principal del juego es ser el primero en alcanzar
                una de las siguientes condiciones de victoria:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  Dejar Fuera de Combate a 6 Pokémon del rival y tomar las 6
                  cartas de Premio correspondientes. Algunos Pokémon especiales
                  (como los Pokémon-ex, Pokémon-GX, Pokémon V, Pokémon VSTAR,
                  Pokémon VMAX, Pokémon TAG TEAM) pueden otorgar 2 o incluso 3
                  cartas de Premio al ser derrotados.
                </li>
                <li>
                  Dejar al oponente sin Pokémon en juego (ni en el Puesto Activo
                  ni en la Banca).
                </li>
                <li>
                  Que el oponente no tenga cartas en su mazo al inicio de su
                  turno.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 text-red-500">
                ¿Qué Necesitas Para Jugar?
              </h3>
              <p className="mb-2">
                Para disfrutar de una partida de JCC Pokémon, cada jugador
                necesitará:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  Un mazo de exactamente 60 cartas. Este mazo debe cumplir con
                  las reglas de construcción, como un máximo de 4 copias de la
                  misma carta (excepto Energía Básica) y al menos 1 Pokémon
                  Básico.
                </li>
                <li>
                  Contadores de daño para indicar el daño recibido por los
                  Pokémon en juego. Pueden ser dados o marcadores especiales.
                  Cada contador de daño representa 10 puntos de daño.
                </li>
                <li>
                  Una moneda o un dado para realizar lanzamientos de cara o cruz
                  ("flip a coin"). Los dados con números pares pueden usarse
                  como "cara" y los impares como "cruz".
                </li>
                <li>
                  Cartas de Premio: Seis cartas que cada jugador coloca boca
                  abajo al inicio de la partida. Se toman una por cada Pokémon
                  del oponente que se deja Fuera de Combate.
                </li>
                <li>
                  Marcadores de Condiciones Especiales (opcional pero
                  recomendado) para indicar si un Pokémon está Dormido,
                  Paralizado, Envenenado, Quemado o Confuso.
                </li>
                <li>
                  Un marcador VSTAR (si se juega con Pokémon VSTAR) para indicar
                  cuándo se ha utilizado el Poder VSTAR.
                </li>
                <li>
                  Un tapete de juego (playmat) (opcional) para organizar las
                  cartas durante la partida y protegerlas.
                </li>
              </ul>
            </section>

            <section
              id="tipos-cartas"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                2. Tipos de Cartas y sus Funciones Detalladas
              </h2>

              <p className="mb-4">
                En el JCC Pokémon existen principalmente tres tipos de cartas:
                Pokémon, Energía y Entrenadores.
              </p>

              <h3 className="text-xl font-semibold mb-2 text-red-500">
                Cartas Pokémon
              </h3>
              <p className="mb-2">
                Las Cartas Pokémon representan las criaturas que combaten. Cada
                carta de Pokémon tiene:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Nombre del Pokémon.</li>
                <li>
                  Puntos de Salud (PS): La cantidad de daño que un Pokémon puede
                  recibir antes de ser Dejado Fuera de Combate.
                </li>
                <li>
                  Tipo de Pokémon: Indica la afinidad elemental del Pokémon (por
                  ejemplo, Planta, Fuego, Agua, etc.). Los tipos influyen en la
                  Debilidad y Resistencia contra otros Pokémon.
                </li>
                <li>
                  Fase: Indica si es un Pokémon Básico o una Evolución (Etapa 1
                  o Etapa 2). Los Pokémon de Evolución también muestran de qué
                  Pokémon evolucionan.
                </li>
                <li>
                  Habilidad (opcional): Un efecto especial que el Pokémon puede
                  tener en juego.
                </li>
                <li>
                  Ataques: Acciones que el Pokémon puede realizar para dañar o
                  afectar al Pokémon oponente.
                </li>
                <li>
                  Debilidad: Indica qué tipo de Pokémon inflige el doble de daño
                  a este Pokémon.
                </li>
                <li>
                  Resistencia: Indica qué tipo de Pokémon inflige menos daño a
                  este Pokémon.
                </li>
                <li>
                  Coste de Retirada: La cantidad de Energía que debe descartarse
                  para retirar este Pokémon Activo a la Banca.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 text-red-500">
                Tipos de Pokémon
              </h3>
              <p className="mb-2">Existen varios tipos de Pokémon en el JCC:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  Pokémon Básicos: Se pueden colocar directamente en el juego.
                </li>
                <li>
                  Pokémon de Evolución: Requieren un Pokémon previo en juego
                  para poder ser jugados.
                  <ul className="list-circle pl-6 mt-1">
                    <li>Etapa 1: Evoluciona de un Pokémon Básico.</li>
                    <li>Etapa 2: Evoluciona de un Pokémon de Etapa 1.</li>
                  </ul>
                </li>
                <li>
                  Pokémon con reglas especiales: Incluyen Pokémon-GX,
                  Pokémon-EX, Pokémon V, Pokémon VSTAR, Pokémon VMAX, Pokémon
                  Radiantes, entre otros.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 text-red-500">
                Tipos de Energía
              </h3>
              <p className="mb-2">
                Las Cartas de Energía proporcionan el combustible para los
                ataques de los Pokémon.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  Energía Básica: Representa los tipos de energía elementales
                  (Planta, Fuego, Agua, etc.).
                </li>
                <li>
                  Energía Especial: Cartas de energía con efectos adicionales
                  que se describen en la carta.
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-2 text-red-500">
                Tipos de Entrenadores
              </h3>
              <p className="mb-2">
                Las Cartas de Entrenador ayudan a los jugadores con diversas
                acciones estratégicas.
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>
                  Objetos (Items): Cartas con efectos variados que se juegan y
                  se descartan inmediatamente.
                </li>
                <li>
                  Partidarios (Supporters): Cartas con efectos a menudo
                  poderosos, pero solo se puede jugar una carta de Partidario
                  por turno.
                </li>
                <li>
                  Estadios (Stadiums): Cartas que, una vez jugadas, permanecen
                  en el campo y afectan a ambos jugadores.
                </li>
                <li>
                  Herramientas Pokémon (Pokémon Tools): Cartas de Objeto que se
                  unen a un Pokémon para proporcionarle un efecto beneficioso.
                </li>
              </ul>
            </section>

            <section
              id="preparacion"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                3. Preparación de la Partida (Paso a Paso)
              </h2>

              <p className="mb-4">
                Antes de comenzar la partida, los jugadores deben seguir estos
                pasos:
              </p>

              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>
                  <span className="font-semibold">Estrechar las manos:</span>{" "}
                  Como muestra de deportividad, los jugadores deben saludarse.
                </li>
                <li>
                  <span className="font-semibold">Lanzar una moneda:</span> Los
                  jugadores lanzan una moneda, y el ganador elige si quiere
                  comenzar primero o ceder el primer turno a su oponente.
                </li>
                <li>
                  <span className="font-semibold">Barajar los mazos:</span> Cada
                  jugador baraja completamente su mazo de 60 cartas para que el
                  orden sea aleatorio.
                </li>
                <li>
                  <span className="font-semibold">Robar la mano inicial:</span>{" "}
                  Cada jugador roba las siete primeras cartas de su mazo.
                </li>
                <li>
                  <span className="font-semibold">
                    Comprobar si hay un Pokémon Básico:
                  </span>
                  Cada jugador revisa su mano inicial. Si un jugador no tiene
                  ningún Pokémon Básico, debe mostrar su mano al oponente,
                  volver a barajar su mazo y robar otras siete cartas. Por cada
                  vez que un jugador realiza este proceso (llamado "mulligan"),
                  su oponente puede elegir robar una carta adicional de su mazo.
                </li>
                <li>
                  <span className="font-semibold">
                    Colocar el Pokémon Activo:
                  </span>
                  Cada jugador elige un Pokémon Básico de su mano y lo coloca
                  boca abajo en la posición del Pokémon Activo.
                </li>
                <li>
                  <span className="font-semibold">
                    Colocar Pokémon en la Banca (opcional):
                  </span>
                  Cada jugador puede colocar hasta cinco Pokémon Básicos
                  adicionales de su mano boca abajo en la Banca.
                </li>
                <li>
                  <span className="font-semibold">
                    Colocar las cartas de Premio:
                  </span>
                  Cada jugador toma las seis cartas superiores de su mazo y las
                  coloca boca abajo a un lado de su área de juego como sus
                  cartas de Premio.
                </li>
                <li>
                  <span className="font-semibold">
                    Determinar quién comienza:
                  </span>{" "}
                  El jugador que ganó el lanzamiento de la moneda decide quién
                  comienza la partida.
                </li>
                <li>
                  <span className="font-semibold">Voltear los Pokémon:</span>{" "}
                  Ambos jugadores voltean todos sus Pokémon en juego para que
                  queden boca arriba.
                </li>
              </ol>

              <p className="text-center font-semibold text-red-500 mt-4">
                ¡La partida está lista para comenzar!
              </p>
            </section>

            <section
              id="turno"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                4. El Turno de un Jugador (Acciones Detalladas)
              </h2>

              <p className="mb-4">
                En cada turno, un jugador puede realizar las siguientes acciones
                en el orden que prefiera (a menos que se indique lo contrario),
                una vez por turno a menos que se especifique otra cosa:
              </p>

              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>
                  <span className="font-semibold">Robar una carta:</span> Al
                  comienzo de su turno (antes de realizar cualquier otra
                  acción), el jugador activo roba la carta superior de su mazo.
                  El jugador que comienza el primer turno de la partida no roba
                  una carta en ese primer turno.
                </li>
                <li>
                  <span className="font-semibold">
                    Colocar un Pokémon Básico en la Banca:
                  </span>
                  El jugador puede colocar tantos Pokémon Básicos como desee de
                  su mano en su Banca, hasta tener un máximo de cinco Pokémon en
                  la Banca.
                </li>
                <li>
                  <span className="font-semibold">Evolucionar un Pokémon:</span>{" "}
                  Si el jugador tiene una carta de Evolución en su mano que
                  coincida con un Pokémon que ha tenido en juego durante al
                  menos un turno, puede evolucionarlo colocando la carta de
                  Evolución encima.
                </li>
                <li>
                  <span className="font-semibold">
                    Unir una carta de Energía:
                  </span>{" "}
                  El jugador puede unir una sola carta de Energía de su mano a
                  uno de sus Pokémon en juego (Activo o en Banca).
                </li>
                <li>
                  <span className="font-semibold">
                    Jugar cartas de Entrenador:
                  </span>
                  <ul className="list-disc pl-6 mt-1">
                    <li>
                      Objetos: Se pueden jugar tantas cartas de Objeto como se
                      desee por turno.
                    </li>
                    <li>
                      Partidarios: Solo se puede jugar una carta de Partidario
                      por turno, y no en el primer turno del jugador que
                      comienza.
                    </li>
                    <li>
                      Estadios: Solo se puede jugar una carta de Estadio por
                      turno.
                    </li>
                    <li>
                      Herramientas Pokémon: Se puede unir una carta de
                      Herramienta Pokémon a uno de los Pokémon del jugador por
                      turno.
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">
                    Retirar el Pokémon Activo:
                  </span>{" "}
                  El jugador puede retirar su Pokémon Activo a la Banca pagando
                  su Coste de Retirada descartando la Energía unida indicada.
                </li>
                <li>
                  <span className="font-semibold">Usar habilidades:</span> El
                  jugador puede usar todas las habilidades de sus Pokémon
                  Activos y en Banca que pueda activar durante su turno.
                </li>
                <li>
                  <span className="font-semibold">Atacar:</span> Después de
                  realizar las acciones deseadas, el jugador puede optar por
                  atacar al Pokémon Activo de su oponente. Para atacar, el
                  Pokémon Activo del jugador debe tener unida la Energía
                  requerida para el ataque. Solo se puede atacar una vez por
                  turno, y al declarar un ataque, el turno del jugador termina
                  inmediatamente. El jugador que comienza el primer turno de la
                  partida no puede atacar en ese turno.
                </li>
              </ol>

              <p className="mb-4">
                Después de que el jugador ha terminado su turno (ya sea atacando
                o decidiendo no hacerlo), el turno pasa al oponente.
              </p>
            </section>

            <section
              id="atacar"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                5. Atacar (Detalles)
              </h2>

              <p className="mb-4">
                Cuando un jugador decide atacar, se siguen estos pasos:
              </p>

              <ol className="list-decimal pl-6 mb-4 space-y-2">
                <li>
                  <span className="font-semibold">Comprobar la Energía:</span>{" "}
                  El jugador verifica que su Pokémon Activo tenga unida la
                  cantidad y tipo de Energía requerida para el ataque que desea
                  usar.
                </li>
                <li>
                  <span className="font-semibold">Anunciar el ataque:</span> El
                  jugador anuncia qué ataque de su Pokémon Activo va a usar.
                </li>
                <li>
                  <span className="font-semibold">
                    Aplicar efectos previos al daño:
                  </span>
                  Se aplican cualquier efecto que ocurra antes de infligir daño
                  (por ejemplo, lanzar una moneda para ver si el ataque tiene
                  éxito si el Pokémon Atacante está Confuso).
                </li>
                <li>
                  <span className="font-semibold">Calcular el daño:</span> Se
                  toma el daño base del ataque y se aplica la Debilidad y la
                  Resistencia del Pokémon Defensor.
                  <ul className="list-disc pl-6 mt-1">
                    <li>
                      Debilidad: Si el Pokémon Defensor es débil al tipo del
                      ataque, el daño se duplica (a menos que se especifique lo
                      contrario).
                    </li>
                    <li>
                      Resistencia: Si el Pokémon Defensor es resistente al tipo
                      del ataque, el daño se reduce (generalmente en 30 puntos).
                    </li>
                  </ul>
                </li>
                <li>
                  <span className="font-semibold">
                    Colocar contadores de daño:
                  </span>
                  Se coloca en el Pokémon Defensor el número de contadores de
                  daño igual al daño infligido (cada contador representa 10
                  puntos de daño).
                </li>
                <li>
                  <span className="font-semibold">
                    Comprobar si el Pokémon Defensor es Dejado Fuera de Combate:
                  </span>
                  Si el daño total recibido por el Pokémon Defensor es igual o
                  mayor que sus Puntos de Salud (PS), queda Fuera de Combate.
                </li>
                <li>
                  <span className="font-semibold">
                    Tomar una carta de Premio:
                  </span>{" "}
                  Si el jugador atacante ha Dejado Fuera de Combate al Pokémon
                  Defensor, toma una de sus cartas de Premio y la coloca boca
                  arriba en su área de juego. Si el Pokémon Derrotado era un
                  Pokémon-GX, Pokémon-EX, Pokémon V, Pokémon VSTAR, Pokémon VMAX
                  o Pokémon TAG TEAM, el jugador atacante toma el número de
                  cartas de Premio indicado en su regla.
                </li>
                <li>
                  <span className="font-semibold">
                    Descartar el Pokémon Derrotado:
                  </span>
                  El Pokémon Dejado Fuera de Combate y todas las cartas unidas a
                  él se colocan en la pila de descarte de su dueño.
                </li>
                <li>
                  <span className="font-semibold">
                    El oponente elige un nuevo Pokémon Activo:
                  </span>
                  Si el Pokémon Activo del oponente fue Dejado Fuera de Combate
                  y tiene Pokémon en su Banca, debe elegir uno de ellos para que
                  se convierta en su nuevo Pokémon Activo.
                </li>
              </ol>

              <p className="mb-4">
                Una vez completados estos pasos, el turno del jugador atacante
                termina.
              </p>
            </section>

            <section
              id="condiciones"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                6. Condiciones Especiales
              </h2>

              <p className="mb-4">
                Algunos ataques y habilidades pueden infligir Condiciones
                Especiales al Pokémon Activo del oponente. Un Pokémon solo puede
                tener un máximo de una condición de cada tipo a la vez. Si un
                Pokémon Activo se mueve a la Banca o evoluciona, pierde todas
                las Condiciones Especiales.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-red-500">
                    Dormido (Asleep)
                  </h3>
                  <p>
                    El Pokémon se gira boca abajo. Un Pokémon Dormido no puede
                    atacar ni retirarse. Al principio de cada turno del jugador
                    cuyo Pokémon está Dormido, debe lanzar una moneda. Si sale
                    cara, el Pokémon despierta; si sale cruz, permanece Dormido.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-600">
                    Paralizado (Paralyzed)
                  </h3>
                  <p>
                    El Pokémon se gira 90 grados en el sentido de las agujas del
                    reloj. Un Pokémon Paralizado no puede atacar ni retirarse.
                    La condición de Paralizado desaparece al final del próximo
                    turno del jugador cuyo Pokémon está Paralizado.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-purple-500">
                    Envenenado (Poisoned)
                  </h3>
                  <p>
                    Se coloca un marcador de Envenenado en el Pokémon. Entre
                    turnos, se coloca un contador de daño en el Pokémon
                    Envenenado. Esta condición permanece hasta que el Pokémon es
                    retirado a la Banca, evoluciona o es Dejado Fuera de
                    Combate.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-2 text-orange-500">
                    Quemado (Burned)
                  </h3>
                  <p>
                    Se coloca un marcador de Quemado en el Pokémon. Entre
                    turnos, se colocan dos contadores de daño en el Pokémon
                    Quemado, y luego el jugador cuyo Pokémon está Quemado lanza
                    una moneda. Si sale cara, la condición de Quemado se
                    elimina; si sale cruz, permanece Quemado.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg shadow-sm md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2 text-blue-500">
                    Confuso (Confused)
                  </h3>
                  <p>
                    El Pokémon se gira boca abajo y boca arriba alternativamente
                    (o se usa un marcador especial). Siempre que el jugador cuyo
                    Pokémon está Confuso intenta atacar con ese Pokémon, primero
                    debe lanzar una moneda. Si sale cara, el ataque se realiza
                    normalmente. Si sale cruz, el ataque no hace nada y el
                    Pokémon Confuso recibe tres contadores de daño. Esta
                    condición permanece hasta que el Pokémon es retirado a la
                    Banca, evoluciona o es Dejado Fuera de Combate.
                  </p>
                </div>
              </div>

              <p className="mt-4">
                Un Pokémon con una Condición Especial aún puede tener un ataque
                con un coste de Energía de cero.
              </p>
            </section>

            <section
              id="ganar"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                7. Cómo Ganar la Partida
              </h2>

              <p className="mb-4">
                Como se mencionó anteriormente, existen tres formas de ganar una
                partida de JCC Pokémon:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 p-4 rounded-lg shadow-sm hover-bounce pokemon-shadow">
                  <div className="text-center mb-2">
                    <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      1
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-green-600 text-center">
                    Tomar todas las cartas de Premio
                  </h3>
                  <p className="text-center">
                    Dejar Fuera de Combate a suficientes Pokémon del oponente
                    para tomar tus 6 cartas de Premio.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg shadow-sm hover-bounce pokemon-shadow">
                  <div className="text-center mb-2">
                    <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      2
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-600 text-center">
                    Dejar sin Pokémon al oponente
                  </h3>
                  <p className="text-center">
                    Dejar al oponente sin ningún Pokémon en juego (ni en el
                    Puesto Activo ni en la Banca).
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg shadow-sm hover-bounce pokemon-shadow">
                  <div className="text-center mb-2">
                    <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      3
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-purple-600 text-center">
                    Agotar el mazo del oponente
                  </h3>
                  <p className="text-center">
                    Que el oponente no pueda robar una carta al comienzo de su
                    turno porque su mazo está vacío.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="font-semibold text-yellow-700">Nota:</p>
                <p>
                  En el caso raro de que ambos jugadores alcancen una condición
                  de victoria al mismo tiempo, se pueden aplicar reglas de
                  Muerte Súbita (una partida rápida con una sola carta de Premio
                  por jugador).
                </p>
              </div>
            </section>

            <section
              id="mazos"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                8. Construcción de Mazos
              </h2>

              <p className="mb-4">
                Al construir un mazo de 60 cartas, se deben seguir las
                siguientes reglas:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>
                  El mazo debe contener
                  <span className="font-semibold">exactamente 60 cartas</span>.
                </li>
                <li>
                  Exceptuando las cartas de Energía Básica, solo se pueden
                  incluir un{" "}
                  <span className="font-semibold">máximo de cuatro copias</span>{" "}
                  de cualquier carta con el mismo nombre.
                </li>
                <li>
                  El mazo debe contener
                  <span className="font-semibold">
                    al menos un Pokémon Básico
                  </span>
                  .
                </li>
              </ul>

              <div className="bg-gray-50 p-5 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-3 text-red-500">
                  Recomendaciones para la Construcción de Mazos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-center mb-2">Energía</h4>
                    <div className="text-center text-4xl font-bold text-yellow-500 mb-2">
                      15-19
                    </div>
                    <p className="text-center text-sm">
                      Cartas de Energía para asegurar la disponibilidad durante
                      la partida.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-center mb-2">
                      Entrenadores
                    </h4>
                    <div className="text-center text-4xl font-bold text-blue-500 mb-2">
                      13-20
                    </div>
                    <p className="text-center text-sm">
                      Cartas de Entrenador para apoyar la estrategia del mazo.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-center mb-2">Pokémon</h4>
                    <div className="text-center text-4xl font-bold text-green-500 mb-2">
                      21-32
                    </div>
                    <p className="text-center text-sm">
                      Pokémon y sus evoluciones para formar tu línea de ataque.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <p className="font-semibold">Consejo:</p>
                <p>
                  Probar el mazo jugando contra otros jugadores es fundamental
                  para evaluar su rendimiento y realizar los ajustes necesarios.
                  Un buen mazo debe ser consistente y tener una estrategia
                  clara.
                </p>
              </div>
            </section>
            <section
              id="reglas-adicionales"
              className={`${styles.contentContainer} mb-8`}
            >
              <h2 className="text-3xl font-bold mb-4 text-red-600">
                9. Reglas Adicionales y Casos Especiales
              </h2>

              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold mb-1">
                    Paso entre turnos
                  </h3>
                  <p>
                    Entre el final de un turno y el comienzo del siguiente, se
                    resuelven los efectos que ocurren entre turnos, como aplicar
                    daño por Envenenado o Quemado, intentar despertar a un
                    Pokémon Dormido o recuperarse de la Parálisis.
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold mb-1">
                    ¿Qué se considera un ataque?
                  </h3>
                  <p>
                    Un ataque es una acción realizada por el Pokémon Activo que
                    inflige daño o aplica un efecto al Pokémon Defensor, y que
                    termina el turno del jugador atacante. Las habilidades no
                    son ataques.
                  </p>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="text-lg font-semibold mb-1">
                    ¿Qué hacer si debes robar más cartas de las que tienes?
                  </h3>
                  <p>
                    Si un efecto obliga a un jugador a robar más cartas de las
                    que quedan en su mazo, roba todas las que pueda y la partida
                    termina inmediatamente, ganando el jugador cuyo mazo no se
                    quedó sin cartas primero.
                  </p>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-lg font-semibold mb-1">
                    ¿Qué forma parte del nombre de un Pokémon y qué no?
                  </h3>
                  <p>
                    Los sufijos como "GX", "EX", "V", "VSTAR", "VMAX", "TURBO",
                    "M" (Mega), y los prefijos como "Alola", "Radiante", así
                    como los nombres de Entrenadores (en el caso de Pokémon de
                    Entrenadores), forman parte del nombre del Pokémon. Esto
                    afecta a las reglas de evolución y al límite de cuatro
                    copias por nombre en el mazo.
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-700">Nota Final:</p>
                <p>
                  Esta guía proporciona una base sólida para comprender las
                  reglas del Juego de Cartas Coleccionables Pokémon. Para
                  obtener información más detallada y ejemplos específicos, se
                  recomienda consultar los manuales de reglas oficiales de
                  Pokémon y explorar recursos en línea.
                </p>
              </div>
            </section>
          </div>

          <footer className="mt-16 pt-8 border-t text-center">
            <p className="text-sm text-gray-600 mb-4">
              Esta guía proporciona una base sólida para comprender las reglas
              del Juego de Cartas Coleccionables Pokémon. Para obtener
              información más detallada y ejemplos específicos, se recomienda
              consultar los manuales de reglas oficiales de Pokémon y explorar
              recursos en línea.
            </p>
            <p className="text-sm font-semibold text-red-600">
              ¡Disfruta de tus duelos Pokémon!
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
