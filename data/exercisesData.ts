import { ExerciseGuide, WorkoutRoutine } from '../types';

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  // --- PETTO (CHEST) ---
  {
    id: 'bench-press',
    name: 'Panca Piana con Bilanciere',
    nameEn: 'Barbell Bench Press',
    muscleGroup: 'chest',
    primaryMuscles: ['Pettorali (Grande Pettorale)'],
    secondaryMuscles: ['Tricipiti', 'Deltoidi Anteriori'],
    equipment: 'barbell',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Sdraiati sulla panca con gli occhi sotto il bilanciere. Piedi piantati a terra, scapole retratte (avvicinate tra loro) e petto in fuori con un leggero arco naturale nella zona lombare.',
    setupEn: 'Lie flat on the bench with eyes aligned under the bar. Feet flat on the floor, shoulder blades pinched together, chest proud.',
    execution: 'Impugna il bilanciere poco più largo delle spalle. Staccalo con cura, abbassalo in modo controllato verso la parte inferiore dello sterno mantenendo i gomiti a circa 45-60° dal busto. Sfiora il petto e spingi verso l\'alto tornando alla posizione di partenza.',
    executionEn: 'Grip slightly wider than shoulder width. Lower bar with control to lower sternum keeping elbows at 45-60 degrees. Touch chest softly and press up to lockout.',
    commonMistakes: [
      'Gomiti troppo aperti a 90° (aumenta il rischio di infortunio alle spalle)',
      'Alzare i glutei dalla panca durante la spinta',
      'Far rimbalzare il bilanciere sul petto anziché controllare la discesa'
    ],
    commonMistakesEn: [
      'Flaring elbows out to 90 degrees (strains shoulders)',
      'Lifting glutes off the bench while pushing',
      'Bouncing the barbell off the ribcage'
    ],
    tip: 'Immagina di piegare il bilanciere con le mani verso l\'esterno per attivare al massimo i pettorali e stabilizzare le spalle.'
  },
  {
    id: 'incline-db-press',
    name: 'Spinte con Manubri su Panca Inclinata',
    nameEn: 'Incline Dumbbell Press',
    muscleGroup: 'chest',
    primaryMuscles: ['Pettorali Alti (Fascio Clavicolare)'],
    secondaryMuscles: ['Deltoidi Anteriori', 'Tricipiti'],
    equipment: 'dumbbell',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Regola la panca a un\'inclinazione di 30° o 45°. Siediti con un manubrio su ogni ginocchio, poi portali al petto aiutandoti con le gambe.',
    setupEn: 'Set bench to 30° or 45° incline. Sit with dumbbells on knees and kick them up to shoulder level as you lie back.',
    execution: 'Spingi i manubri verso l\'alto facendo convergere leggermente i pesi senza farli sbattere. Scendi lentamente sentendo allungare la parte alta del petto.',
    executionEn: 'Press dumbbells up and slightly inward without clanging them. Lower slowly feeling the stretch in upper pecs.',
    commonMistakes: [
      'Inclinazione panca oltre 45° (il lavoro si sposta troppo sulle spalle anteriori)',
      'Perdere la contrazione delle scapole sul fondo'
    ],
    commonMistakesEn: [
      'Incline too steep over 45° (turns into a shoulder press)',
      'Losing shoulder blade tightness at bottom'
    ],
    tip: 'Mantieni i polsi dritti sopra i gomiti per non sovraccaricare l\'articolazione.'
  },
  {
    id: 'chest-press-machine',
    name: 'Chest Press Machine',
    nameEn: 'Chest Press Machine',
    muscleGroup: 'chest',
    primaryMuscles: ['Pettorali'],
    secondaryMuscles: ['Tricipiti', 'Spalle Anteriori'],
    equipment: 'machine',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Regola l\'altezza del sellino in modo che le maniglie siano all\'altezza del centro del petto. Piedi saldi a terra e schiena aderente.',
    setupEn: 'Adjust seat height so handles are at mid-chest level. Feet flat, back firmly against the pad.',
    execution: 'Impugna saldamente, unisci le scapole e spingi in avanti espirando senza bloccare violentemente i gomiti alla fine. Ritorna lentamente.',
    executionEn: 'Grip handles, pin shoulder blades back, push forward smoothly without slamming elbow joints. Return with controlled speed.',
    commonMistakes: [
      'Spalle che scivolano in avanti a fine spinta',
      'Sellino regolato troppo in alto o troppo in basso'
    ],
    commonMistakesEn: [
      'Shoulders rolling forward at top of push',
      'Seat height incorrect causing shoulder strain'
    ],
    tip: 'Perfetta per i principianti per imparare a spingere con il petto in totale sicurezza senza rischiare di far cadere i pesi.'
  },

  // --- DORSO (BACK) ---
  {
    id: 'lat-pulldown',
    name: 'Lat Machine (Trazioni alla Lat Machine)',
    nameEn: 'Lat Pulldown',
    muscleGroup: 'back',
    primaryMuscles: ['Gran Dorsale', 'Teres Major'],
    secondaryMuscles: ['Bicipiti', 'Trapezio', 'Romboidi'],
    equipment: 'cables',
    difficulty: 'beginner',
    viewType: 'back',
    setup: 'Blocca le cosce sotto i cuscinetti imbottiti. Afferra la sbarra con presa prona poco più larga delle spalle. Busto eretto o leggermente inclinato indietro (10-15°).',
    setupEn: 'Lock thighs firmly under pads. Grip bar with overhand grip wider than shoulders. Torso upright or tilted back 10-15°.',
    execution: 'Tira la sbarra verso la parte alta del petto guidando il movimento con i gomiti, immaginando di volerli infilare nelle tasche posteriori. Contrai i dorsali per un secondo e risali controllando il peso.',
    executionEn: 'Pull bar down towards upper chest leading with your elbows. Squeeze lats hard at bottom, then return with control.',
    commonMistakes: [
      'Dondolarsi all\'indietro con il busto usando lo slancio lombare',
      'Tirare la sbarra dietro la nuca (sconsigliato per la cervicale e le spalle)',
      'Tirare solo con le braccia senza muovere le scapole'
    ],
    commonMistakesEn: [
      'Swinging back using momentum instead of lats',
      'Pulling behind the neck (strains cervical spine and rotators)',
      'Pulling only with arms without depressing scapulae'
    ],
    tip: 'Pensa ai polsi come a dei ganci: tira verso il basso guidando dai gomiti per isolare al meglio la schiena.'
  },
  {
    id: 'seated-cable-row',
    name: 'Pulley Basso (Seated Cable Row)',
    nameEn: 'Seated Cable Row',
    muscleGroup: 'back',
    primaryMuscles: ['Centro Schiena (Romboidi, Trapezio Medio)', 'Gran Dorsale'],
    secondaryMuscles: ['Bicipiti', 'Deltoidi Posteriori'],
    equipment: 'cables',
    difficulty: 'beginner',
    viewType: 'back',
    setup: 'Siediti con i piedi saldi sulle pedane e ginocchia leggermente flesse. Afferra la maniglia a V a braccia tese con schiena dritta e petto fiero.',
    setupEn: 'Sit with feet braced, knees slightly bent. Grasp V-bar handle with arms extended, neutral spine and proud chest.',
    execution: 'Tira la maniglia verso l\'ombelico portando i gomiti indietro vicini ai fianchi e strizzando le scapole. Ritorna allungando la schiena senza incurvarla.',
    executionEn: 'Pull handle toward belly button, driving elbows back and squeezing shoulder blades. Return smoothly without hunching.',
    commonMistakes: [
      'Incurvare la schiena (effetto gobba) durante l\'allungamento',
      'Tirare verso il petto invece che verso la parte bassa dell\'addome'
    ],
    commonMistakesEn: [
      'Rounding the lower back during stretch phase',
      'Pulling to high chest instead of belly button'
    ],
    tip: 'Tieni le spalle basse e lontane dalle orecchie durante tutta la tirata.'
  },
  {
    id: 'dumbbell-row',
    name: 'Rematore Singolo con Manubrio su Panca',
    nameEn: 'Single-Arm Dumbbell Row',
    muscleGroup: 'back',
    primaryMuscles: ['Gran Dorsale'],
    secondaryMuscles: ['Romboidi', 'Bicipiti'],
    equipment: 'dumbbell',
    difficulty: 'beginner',
    viewType: 'back',
    setup: 'Appoggia ginocchio e mano sinistra sulla panca. Piede destro a terra, schiena parallela al suolo. Prendi il manubrio con la mano destra.',
    setupEn: 'Place left knee and left hand on bench. Right foot braced on floor, spine flat. Hold dumbbell in right hand.',
    execution: 'Tira il manubrio verso l\'anca disegnando una traiettoria ad arco con il gomito. Sentire il dorso contrarsi al culmine e scendi controllando.',
    executionEn: 'Pull dumbbell toward hip in a smooth arc. Feel the lat squeeze at the top, then lower with control.',
    commonMistakes: [
      'Ruotare il busto per aiutarsi con lo slancio',
      'Tirare il manubrio dritto verso la spalla invece che verso il bacino'
    ],
    commonMistakesEn: [
      'Twisting torso to yank weight up',
      'Pulling straight up to shoulder instead of back toward hip'
    ],
    tip: 'Mantieni il collo allineato alla colonna guardando il pavimento.'
  },

  // --- GAMBE & GLUTEI (LEGS) ---
  {
    id: 'leg-press',
    name: 'Leg Press a 45°',
    nameEn: '45° Leg Press',
    muscleGroup: 'legs',
    primaryMuscles: ['Quadricipiti', 'Glutei'],
    secondaryMuscles: ['Femorali (Ischiocrurali)'],
    equipment: 'machine',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Siediti comodamente con schiena e bacino ben incollati allo schienale. Piedi posizionati al centro della pedana a larghezza spalle.',
    setupEn: 'Sit with back and glutes glued to the backrest. Place feet shoulder-width apart in middle of platform.',
    execution: 'Sblocca le maniglie di sicurezza. Piega le ginocchia scendendo finché non formano un angolo di circa 90° senza staccare il bacino. Spingi con tutto il piede tornando su, senza bloccare (iperestendere) le ginocchia a fine corsa.',
    executionEn: 'Release safeties. Bend knees lowering to 90 degrees keeping glutes anchored. Press back up without hyperextending knees.',
    commonMistakes: [
      'Iperestendere le ginocchia a gambe tese (pericoloso per l\'articolazione)',
      'Far staccare i glutei dal sedile scendendo troppo in profondità',
      'Far cadere le ginocchia verso l\'interno (valgismo)'
    ],
    commonMistakesEn: [
      'Locking out knees aggressively at top (joint hazard)',
      'Butt lifting off seat due to excessive depth',
      'Knees caving inward (valgus collapse)'
    ],
    tip: 'Ottima alternativa allo squat con bilanciere per costruire forza sulle gambe in sicurezza mentre impari lo schema motorio.'
  },
  {
    id: 'goblet-squat',
    name: 'Goblet Squat con Manubrio',
    nameEn: 'Dumbbell Goblet Squat',
    muscleGroup: 'legs',
    primaryMuscles: ['Quadricipiti', 'Glutei'],
    secondaryMuscles: ['Core / Addome', 'Femorali'],
    equipment: 'dumbbell',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'In piedi con piedi poco più larghi delle spalle e punte leggermente aperte verso l\'esterno (15-20°). Tieni un manubrio in verticale contro il petto con entrambe le mani.',
    setupEn: 'Stand feet slightly wider than shoulders, toes angled out 15-20°. Hold dumbbell vertically cupped against upper chest.',
    execution: 'Inspira, spingi i fianchi indietro e piega le ginocchia come per sederti su una sedia. Scendi finché le cosce sono parallele al suolo mantenendo il busto eretto. Spingi sui talloni per risalire espirando.',
    executionEn: 'Inhale, push hips back and bend knees like sitting into a low chair. Descend until thighs parallel floor with chest tall. Drive through heels to stand.',
    commonMistakes: [
      'Alzare i talloni da terra durante la discesa',
      'Incurvare la schiena in avanti allontanando il manubrio dal petto'
    ],
    commonMistakesEn: [
      'Heels lifting off ground',
      'Chest collapsing forward and rounding upper spine'
    ],
    tip: 'I gomiti devono scendere all\'interno delle ginocchia sul punto più basso dello squat.'
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension (Isolamento Quadricipiti)',
    nameEn: 'Leg Extension Machine',
    muscleGroup: 'legs',
    primaryMuscles: ['Quadricipiti'],
    secondaryMuscles: [],
    equipment: 'machine',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Regola lo schienale in modo che il retro del ginocchio aderisca al bordo del sellino. Il cuscinetto imbottito deve poggiare sulla parte inferiore delle tibie (sopra i piedi).',
    setupEn: 'Adjust back pad so back of knees sit flush against seat edge. Shin pad sits comfortably above ankles.',
    execution: 'Afferra le maniglie laterali per ancorare il bacino. Estendi le gambe sollevando il peso fino a distendere le ginocchia, contrai i quadricipiti per un secondo e scendi lentamente.',
    executionEn: 'Grip side handles to keep hips down. Extend legs up until knees are straight, squeeze quads for 1 second, lower slowly.',
    commonMistakes: [
      'Usare lo slancio alzando il sedere dal sedile',
      'Far cadere i pesi troppo velocemente senza controllare la fase eccentrica'
    ],
    commonMistakesEn: [
      'Swinging body and lifting hips off seat',
      'Dropping weight stack rapidly without resisting'
    ],
    tip: 'Un secondo di contrazione isometrica in alto farà bruciare i quadricipiti senza bisogno di caricare pesi spropositati.'
  },
  {
    id: 'leg-curl',
    name: 'Leg Curl (Femorali da Seduto o Sdraiato)',
    nameEn: 'Seated / Prone Leg Curl',
    muscleGroup: 'legs',
    primaryMuscles: ['Ischiocrurali (Femorali)'],
    secondaryMuscles: ['Polpacci'],
    equipment: 'machine',
    difficulty: 'beginner',
    viewType: 'back',
    setup: 'Posiziona il cuscinetto dietro le caviglie/tendine d\'achille. Blocca le cosce con l\'apposito cuscino se esegui la variante da seduto.',
    setupEn: 'Position pad behind ankles/Achilles. Secure thigh pad if using seated machine.',
    execution: 'Fletti le ginocchia spingendo il cuscinetto verso i glutei. Senti la contrazione sul retro coscia e rilascia lentamente resistendo al ritorno.',
    executionEn: 'Curl heels down towards glutes contracting hamstrings. Pause briefly at peak flexion, then slowly extend.',
    commonMistakes: [
      'Staccare le cosce o inarcare bruscamente la zona lombare',
      'Movimento a scatti'
    ],
    commonMistakesEn: [
      'Lifting thighs or excessively arching lower back',
      'Jerky rapid reps without tension control'
    ],
    tip: 'Tieni i piedi a martello (dita puntate verso le tibie) per massimizzare il reclutamento del bicipite femorale.'
  },

  // --- SPALLE (SHOULDERS) ---
  {
    id: 'shoulder-press-db',
    name: 'Lento Avanti con Manubri da Seduto',
    nameEn: 'Seated Dumbbell Shoulder Press',
    muscleGroup: 'shoulders',
    primaryMuscles: ['Deltoidi Anteriori & Laterali'],
    secondaryMuscles: ['Tricipiti', 'Trapezio Superiore'],
    equipment: 'dumbbell',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Panca quasi a 90° (circa 75-80° per non forzare la cuffia dei rotatori). Siediti con i manubri all\'altezza delle orecchie, gomiti a circa 60°.',
    setupEn: 'Set bench to high incline (75-80°). Sit upright with dumbbells at ear level, elbows angled slightly forward.',
    execution: 'Spingi i manubri verso l\'alto sopra la testa fin quasi a distendere le braccia senza farli toccare. Riscendi controllando fino all\'altezza del mento o delle orecchie.',
    executionEn: 'Press weights overhead until arms extended without clashing. Lower under control back to ear level.',
    commonMistakes: [
      'Inarcare eccessivamente la schiena staccando i lombari dallo schienale',
      'Gomiti aperti a 180° sul piano frontale (porta i gomiti leggermente in avanti)'
    ],
    commonMistakesEn: [
      'Excessively arching lower back away from pad',
      'Elbows pointing straight out to sides (keep slightly forward in scapular plane)'
    ],
    tip: 'Espira durante la spinta ed inspira mentre scendi controllando il carico.'
  },
  {
    id: 'lateral-raises',
    name: 'Alzate Laterali con Manubri',
    nameEn: 'Dumbbell Lateral Raises',
    muscleGroup: 'shoulders',
    primaryMuscles: ['Deltoide Laterale (Larghezza Spalle)'],
    secondaryMuscles: ['Trapezio'],
    equipment: 'dumbbell',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'In piedi con manubri leggeri lungo i fianchi, ginocchia morbide, busto appena inclinato in avanti (5°).',
    setupEn: 'Stand with light dumbbells at sides, slight knee bend, torso angled forward 5°.',
    execution: 'Solleva le braccia verso l\'esterno fino all\'altezza delle spalle guidando con i gomiti, mantenendo una leggera piega all\'articolazione del gomito. Scendi lentamente.',
    executionEn: 'Raise arms out to sides up to shoulder height leading with elbows, maintaining slight elbow bend. Lower slowly.',
    commonMistakes: [
      'Usare manubri troppo pesanti e dondolare con la schiena',
      'Alzare i pesi più in alto delle spalle (attiva solo il trapezio)'
    ],
    commonMistakesEn: [
      'Using overly heavy weights and swinging hips/torso',
      'Shrugging shoulders into ears or lifting way above parallel'
    ],
    tip: 'Pensa di versare dell\'acqua da due brocche in cima al movimento: gomiti sempre leggermente più alti dei polsi.'
  },

  // --- BRACCIA (ARMS - BICIPITI & TRICIPITI) ---
  {
    id: 'dumbbell-curl',
    name: 'Curl con Manubri Alternato',
    nameEn: 'Alternating Dumbbell Bicep Curl',
    muscleGroup: 'arms',
    primaryMuscles: ['Bicipite Brachiale'],
    secondaryMuscles: ['Brachiale', 'Avambracci'],
    equipment: 'dumbbell',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'In piedi con busto fermo e scapole retratte, un manubrio in ciascuna mano con palmi rivolti verso le cosce.',
    setupEn: 'Stand upright with core tight, holding dumbbells at sides with palms facing inwards.',
    execution: 'Solleva un manubrio flettendo il gomito e ruotando il palmo verso l\'alto (supinazione). Contrai il bicipite in cima e scendi lentamente prima di ripetere con l\'altro braccio.',
    executionEn: 'Curl one dumbbell up while rotating palm upward (supination). Squeeze bicep at peak, lower with control, alternate arms.',
    commonMistakes: [
      'Portare i gomiti in avanti per aiutarsi con la spalla anteriore',
      'Dondolare con la schiena per dare slancio al peso'
    ],
    commonMistakesEn: [
      'Swinging elbows forward to engage front delts',
      'Leaning back to swing weights up'
    ],
    tip: 'Tieni i gomiti "incollati" ai fianchi come se fossero un perno fisso.'
  },
  {
    id: 'tricep-pushdown',
    name: 'Pushdown ai Cavi con Corda',
    nameEn: 'Cable Rope Tricep Pushdown',
    muscleGroup: 'arms',
    primaryMuscles: ['Tricipite (Capo Laterale & Lungo)'],
    secondaryMuscles: ['Avambracci'],
    equipment: 'cables',
    difficulty: 'beginner',
    viewType: 'back',
    setup: 'Fissa la corda al cavo alto. Afferra le estremità, arretra di un passo, piega leggermente le ginocchia e inclina il busto avanti di 10°.',
    setupEn: 'Attach rope to high cable. Hold ends, step back slightly, hinge torso forward 10° with knees soft.',
    execution: 'Mantenendo i gomiti fermi lungo i fianchi, spingi la corda verso il basso distendendo le braccia e allarga le estremità della corda verso l\'esterno in fondo per massima contrazione. Ritorna a 90° controllando.',
    executionEn: 'Keeping elbows locked at sides, push rope down until arms lock out, flaring rope ends outward at bottom. Return to 90° with control.',
    commonMistakes: [
      'Gomiti che oscillano avanti e indietro',
      'Incurvare le spalle verso l\'interno'
    ],
    commonMistakesEn: [
      'Elbows flaring or moving back and forth like pistons',
      'Hunching forward over the cable'
    ],
    tip: 'Allarga la corda verso l\'esterno a fine spinta: sentirai i tricipiti bruciare come mai prima.'
  },

  // --- CORE & ADDOME ---
  {
    id: 'plank',
    name: 'Plank Isometrico',
    nameEn: 'Forearm Plank',
    muscleGroup: 'core',
    primaryMuscles: ['Trasverso dell\'Addome', 'Retto Addominale'],
    secondaryMuscles: ['Spalle', 'Glutei', 'Zona Lombare'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Posizionati a terra sui gomiti e sulle punte dei piedi. Gomiti allineati sotto le spalle, corpo dritto come una tavola.',
    setupEn: 'Position yourself face down resting on forearms and toes. Elbows directly beneath shoulders, body aligned in a straight board.',
    execution: 'Contrai fortissimo addome e glutei spingendo l\'ombelico verso la colonna vertebrale. Respira regolarmente senza trattenere il fiato.',
    executionEn: 'Brace core and glutes tightly pulling navel to spine. Breathe steadily without holding breath.',
    commonMistakes: [
      'Bacino che sprofonda verso il basso (inarcando la schiena dolorosamente)',
      'Tenere il sedere troppo alto in aria'
    ],
    commonMistakesEn: [
      'Hips sagging downward causing lower back compression',
      'Piking hips high in the air'
    ],
    tip: 'Non serve fare 3 minuti fatti male: 40-45 secondi di massima tensione granitica sono molto più efficaci.'
  },
  {
    id: 'cable-crunch',
    name: 'Crunch al Tappetino con Gambe a 90°',
    nameEn: 'Floor Crunch with Elevated Knees',
    muscleGroup: 'core',
    primaryMuscles: ['Retto dell\'Addome'],
    secondaryMuscles: [],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    viewType: 'front',
    setup: 'Sdraiati supino con la schiena ben aderente a terra. Solleva le ginocchia a formare un angolo di 90°. Mani dietro le tempie (senza tirare il collo).',
    setupEn: 'Lie flat on back with spine flush to floor. Raise knees to 90° angle. Fingers touching temples lightly.',
    execution: 'Espira e arriccia la gabbia toracica verso il bacino sollevando solo le scapole da terra. Contrai l\'addome per un istante e riscendi controllando.',
    executionEn: 'Exhale and curl ribcage toward pelvis, peeling shoulder blades off floor. Squeeze abs, then lower slowly.',
    commonMistakes: [
      'Tirare la testa con le mani sforzando la cervicale',
      'Alzare tutta la schiena da terra (non è un sit-up, basta sollevare le scapole)'
    ],
    commonMistakesEn: [
      'Pulling head forward with hands straining neck',
      'Lifting lower back off ground (it is a crunch, not a full sit-up)'
    ],
    tip: 'Focalizzati sull\'avvicinare le costole al bacino, espirando tutta l\'aria nei polmoni in salita.'
  }
];

// Pre-configured Starter Routines tailored for beginners
export const STARTER_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'starter-fullbody-a',
    title: 'Full Body 3x - Scheda A (Fondamentali)',
    description: 'La scheda perfetta per chi ha iniziato da poco: stimola tutti i gruppi muscolari con esercizi guidati e sicuri.',
    dayTag: 'Giorno A',
    estimatedDurationMin: 45,
    exercises: [
      {
        id: 'we-1',
        exerciseId: 'leg-press',
        name: 'Leg Press a 45°',
        muscleGroup: 'legs',
        targetRestSeconds: 90,
        notes: '3 serie da 10-12 ripetizioni. Concentrati sul controllo del movimento.',
        sets: [
          { id: 's1', setNumber: 1, reps: 12, weightKg: 40, completed: false },
          { id: 's2', setNumber: 2, reps: 10, weightKg: 50, completed: false },
          { id: 's3', setNumber: 3, reps: 10, weightKg: 50, completed: false },
        ]
      },
      {
        id: 'we-2',
        exerciseId: 'lat-pulldown',
        name: 'Lat Machine',
        muscleGroup: 'back',
        targetRestSeconds: 90,
        notes: 'Tira la sbarra al petto guidando dai gomiti.',
        sets: [
          { id: 's4', setNumber: 1, reps: 10, weightKg: 30, completed: false },
          { id: 's5', setNumber: 2, reps: 10, weightKg: 35, completed: false },
          { id: 's6', setNumber: 3, reps: 10, weightKg: 35, completed: false },
        ]
      },
      {
        id: 'we-3',
        exerciseId: 'chest-press-machine',
        name: 'Chest Press Machine',
        muscleGroup: 'chest',
        targetRestSeconds: 90,
        notes: 'Piedi saldi a terra e scapole chiuse.',
        sets: [
          { id: 's7', setNumber: 1, reps: 10, weightKg: 25, completed: false },
          { id: 's8', setNumber: 2, reps: 10, weightKg: 25, completed: false },
          { id: 's9', setNumber: 3, reps: 8, weightKg: 30, completed: false },
        ]
      },
      {
        id: 'we-4',
        exerciseId: 'shoulder-press-db',
        name: 'Lento Avanti con Manubri',
        muscleGroup: 'shoulders',
        targetRestSeconds: 60,
        notes: 'Panca a 75°, spingi in alto senza inarcare la schiena.',
        sets: [
          { id: 's10', setNumber: 1, reps: 10, weightKg: 8, completed: false },
          { id: 's11', setNumber: 2, reps: 10, weightKg: 8, completed: false },
          { id: 's12', setNumber: 3, reps: 10, weightKg: 8, completed: false },
        ]
      },
      {
        id: 'we-5',
        exerciseId: 'plank',
        name: 'Plank Isometrico',
        muscleGroup: 'core',
        targetRestSeconds: 60,
        notes: '3 serie da 30-45 secondi di massima tenuta addominale.',
        sets: [
          { id: 's13', setNumber: 1, reps: 30, weightKg: 0, completed: false },
          { id: 's14', setNumber: 2, reps: 30, weightKg: 0, completed: false },
          { id: 's15', setNumber: 3, reps: 30, weightKg: 0, completed: false },
        ]
      }
    ]
  },
  {
    id: 'starter-fullbody-b',
    title: 'Full Body 3x - Scheda B (Variante)',
    description: 'Alterna questa scheda al Giorno A per lavorare sui muscoli complementari con manubri e cavi.',
    dayTag: 'Giorno B',
    estimatedDurationMin: 45,
    exercises: [
      {
        id: 'we-b1',
        exerciseId: 'goblet-squat',
        name: 'Goblet Squat con Manubrio',
        muscleGroup: 'legs',
        targetRestSeconds: 90,
        notes: 'Manubrio stretto al petto, gomiti all\'interno delle ginocchia.',
        sets: [
          { id: 'sb1', setNumber: 1, reps: 12, weightKg: 10, completed: false },
          { id: 'sb2', setNumber: 2, reps: 10, weightKg: 12, completed: false },
          { id: 'sb3', setNumber: 3, reps: 10, weightKg: 12, completed: false },
        ]
      },
      {
        id: 'we-b2',
        exerciseId: 'seated-cable-row',
        name: 'Pulley Basso',
        muscleGroup: 'back',
        targetRestSeconds: 90,
        notes: 'Tira verso l\'ombelico strizzando le scapole.',
        sets: [
          { id: 'sb4', setNumber: 1, reps: 10, weightKg: 25, completed: false },
          { id: 'sb5', setNumber: 2, reps: 10, weightKg: 30, completed: false },
          { id: 'sb6', setNumber: 3, reps: 10, weightKg: 30, completed: false },
        ]
      },
      {
        id: 'we-b3',
        exerciseId: 'incline-db-press',
        name: 'Spinte Manubri su Panca Inclinata',
        muscleGroup: 'chest',
        targetRestSeconds: 90,
        notes: 'Panca a 30°, enfasi sulla parte alta del petto.',
        sets: [
          { id: 'sb7', setNumber: 1, reps: 10, weightKg: 10, completed: false },
          { id: 'sb8', setNumber: 2, reps: 10, weightKg: 12, completed: false },
          { id: 'sb9', setNumber: 3, reps: 8, weightKg: 12, completed: false },
        ]
      },
      {
        id: 'we-b4',
        exerciseId: 'lateral-raises',
        name: 'Alzate Laterali Manubri',
        muscleGroup: 'shoulders',
        targetRestSeconds: 60,
        notes: 'Peso leggero e controllo, niente slanci con la schiena.',
        sets: [
          { id: 'sb10', setNumber: 1, reps: 12, weightKg: 5, completed: false },
          { id: 'sb11', setNumber: 2, reps: 12, weightKg: 5, completed: false },
          { id: 'sb12', setNumber: 3, reps: 10, weightKg: 6, completed: false },
        ]
      },
      {
        id: 'we-b5',
        exerciseId: 'dumbbell-curl',
        name: 'Curl Bicipiti con Manubri',
        muscleGroup: 'arms',
        targetRestSeconds: 60,
        notes: 'Gomiti fermi ai fianchi, rotazione del polso in cima.',
        sets: [
          { id: 'sb13', setNumber: 1, reps: 10, weightKg: 8, completed: false },
          { id: 'sb14', setNumber: 2, reps: 10, weightKg: 8, completed: false },
          { id: 'sb15', setNumber: 3, reps: 10, weightKg: 8, completed: false },
        ]
      },
      {
        id: 'we-b6',
        exerciseId: 'tricep-pushdown',
        name: 'Pushdown Corda ai Cavi',
        muscleGroup: 'arms',
        targetRestSeconds: 60,
        notes: 'Allarga la corda all\'esterno a fine spinta.',
        sets: [
          { id: 'sb16', setNumber: 1, reps: 12, weightKg: 12, completed: false },
          { id: 'sb17', setNumber: 2, reps: 10, weightKg: 15, completed: false },
          { id: 'sb18', setNumber: 3, reps: 10, weightKg: 15, completed: false },
        ]
      }
    ]
  }
];
