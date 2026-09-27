// Official Cyprus road sign catalog. Pure data + lookup helpers.

export const CATEGORIES = [
  { id: 'warning', label: 'Warning Signs', color: '#e8a33d' },
  { id: 'prohibitory', label: 'Prohibitory Signs', color: '#d64545' },
  { id: 'mandatory', label: 'Mandatory Signs', color: '#2f6fd0' },
  { id: 'info', label: 'Information & Special Regulation Signs', color: '#2f9e6b' },
];

const img = (id) => `assets/signs/${id}.svg`;

export const SIGNS = [
  // ---- Warning ----
  { id: 'warning-bend-right', name: 'Bend to the Right', nameEl: 'Στροφή προς τα δεξιά', category: 'warning', meaning: 'A bend to the right is ahead. Slow down and keep to your lane.', aliases: ['right bend', 'curve right'], image: img('warning-bend-right') },
  { id: 'warning-bend-left', name: 'Bend to the Left', nameEl: 'Στροφή προς τα αριστερά', category: 'warning', meaning: 'A bend to the left is ahead. Slow down and keep to your lane.', aliases: ['left bend', 'curve left'], image: img('warning-bend-left') },
  { id: 'warning-double-bend', name: 'Double Bend', nameEl: 'Διπλή στροφή', category: 'warning', meaning: 'A series of bends, first to the right, is ahead.', aliases: ['winding road', 'series of bends'], image: img('warning-double-bend') },
  { id: 'warning-crossroads', name: 'Crossroads Ahead', nameEl: 'Διασταύρωση', category: 'warning', meaning: 'A crossroads junction is ahead. Watch for crossing traffic.', aliases: ['junction', 'intersection'], image: img('warning-crossroads') },
  { id: 'warning-roundabout', name: 'Roundabout Ahead', nameEl: 'Κυκλική διασταύρωση', category: 'warning', meaning: 'A roundabout is ahead. Give way to traffic from the right.', aliases: ['circle', 'rotary'], image: img('warning-roundabout') },
  { id: 'warning-pedestrian-crossing', name: 'Pedestrian Crossing Ahead', nameEl: 'Διάβαση πεζών', category: 'warning', meaning: 'A pedestrian crossing is ahead. Be ready to stop for pedestrians.', aliases: ['zebra crossing', 'crosswalk'], image: img('warning-pedestrian-crossing') },
  { id: 'warning-children', name: 'Children Crossing', nameEl: 'Παιδιά', category: 'warning', meaning: 'Children may be crossing. Drive slowly and be prepared to stop.', aliases: ['school', 'school zone'], image: img('warning-children') },
  { id: 'warning-animals', name: 'Animals Crossing', nameEl: 'Ζώα', category: 'warning', meaning: 'Wild or farm animals may cross the road ahead.', aliases: ['cattle', 'wild animals'], image: img('warning-animals') },
  { id: 'warning-road-narrows', name: 'Road Narrows', nameEl: 'Στένωση οδοστρώματος', category: 'warning', meaning: 'The road narrows ahead. Adjust your position and speed.', aliases: ['narrow road', 'road narrows both sides'], image: img('warning-road-narrows') },
  { id: 'warning-slippery', name: 'Slippery Road', nameEl: 'Ολισθηρό οδόστρωμα', category: 'warning', meaning: 'The road surface may be slippery. Reduce speed and avoid sudden braking.', aliases: ['slippery', 'skid risk'], image: img('warning-slippery') },
  { id: 'warning-steep-descent', name: 'Steep Descent', nameEl: 'Απότομη κατωφέρεια', category: 'warning', meaning: 'A steep downhill gradient is ahead. Use a low gear.', aliases: ['steep hill down', 'downhill'], image: img('warning-steep-descent') },
  { id: 'warning-steep-ascent', name: 'Steep Ascent', nameEl: 'Απότομη ανωφέρεια', category: 'warning', meaning: 'A steep uphill gradient is ahead.', aliases: ['steep hill up', 'uphill'], image: img('warning-steep-ascent') },
  { id: 'warning-traffic-signals', name: 'Traffic Signals Ahead', nameEl: 'Φωτεινοί σηματοδότες', category: 'warning', meaning: 'Traffic lights are ahead. Be ready to stop.', aliases: ['traffic lights', 'signals'], image: img('warning-traffic-signals') },
  { id: 'warning-two-way-traffic', name: 'Two-Way Traffic Ahead', nameEl: 'Διπλής κατεύθυνσης κυκλοφορία', category: 'warning', meaning: 'Two-way traffic resumes ahead. Keep to the left.', aliases: ['two way', 'oncoming traffic'], image: img('warning-two-way-traffic') },
  { id: 'warning-roadworks', name: 'Roadworks', nameEl: 'Έργα στον δρόμο', category: 'warning', meaning: 'Roadworks are ahead. Slow down and follow temporary signs.', aliases: ['road works', 'construction'], image: img('warning-roadworks') },
  { id: 'warning-falling-rocks', name: 'Falling Rocks', nameEl: 'Κατολισθήσεις', category: 'warning', meaning: 'Rocks may fall onto the road. Do not stop unnecessarily.', aliases: ['rockfall', 'landslide'], image: img('warning-falling-rocks') },
  { id: 'warning-t-junction', name: 'T-Junction Ahead', nameEl: 'Διακλάδωση σχήματος Τ', category: 'warning', meaning: 'A T-junction is ahead. Give way as directed.', aliases: ['t junction', 'side road'], image: img('warning-t-junction') },
  { id: 'warning-uneven-road', name: 'Uneven Road', nameEl: 'Ανώμαλο οδόστρωμα', category: 'warning', meaning: 'The road surface is uneven ahead. Reduce speed.', aliases: ['bumps', 'rough road'], image: img('warning-uneven-road') },

  // ---- Prohibitory ----
  { id: 'prohibitory-no-entry', name: 'No Entry', nameEl: 'Απαγορεύεται η είσοδος', category: 'prohibitory', meaning: 'No entry for all vehicles. Do not proceed past this sign.', aliases: ['do not enter', 'no entry for vehicles'], image: img('prohibitory-no-entry') },
  { id: 'prohibitory-no-parking', name: 'No Parking', nameEl: 'Απαγορεύεται η στάθμευση', category: 'prohibitory', meaning: 'Parking is prohibited. You may stop briefly to set down passengers.', aliases: ['no parking', 'parking prohibited'], image: img('prohibitory-no-parking') },
  { id: 'prohibitory-no-stopping', name: 'No Stopping', nameEl: 'Απαγορεύεται η στάση', category: 'prohibitory', meaning: 'Stopping and parking are prohibited at all times.', aliases: ['no stopping', 'clearway'], image: img('prohibitory-no-stopping') },
  { id: 'prohibitory-speed-50', name: 'Maximum Speed 50 km/h', nameEl: 'Ανώτατο όριο ταχύτητας 50', category: 'prohibitory', meaning: 'The maximum permitted speed is 50 km/h.', aliases: ['speed limit 50', '50 kmh'], image: img('prohibitory-speed-50') },
  { id: 'prohibitory-speed-30', name: 'Maximum Speed 30 km/h', nameEl: 'Ανώτατο όριο ταχύτητας 30', category: 'prohibitory', meaning: 'The maximum permitted speed is 30 km/h.', aliases: ['speed limit 30', '30 kmh'], image: img('prohibitory-speed-30') },
  { id: 'prohibitory-no-overtaking', name: 'No Overtaking', nameEl: 'Απαγορεύεται η προσπέραση', category: 'prohibitory', meaning: 'Overtaking motor vehicles is prohibited.', aliases: ['no passing', 'no overtaking'], image: img('prohibitory-no-overtaking') },
  { id: 'prohibitory-no-left-turn', name: 'No Left Turn', nameEl: 'Απαγορεύεται η αριστερή στροφή', category: 'prohibitory', meaning: 'Turning left is prohibited.', aliases: ['no left', 'left turn prohibited'], image: img('prohibitory-no-left-turn') },
  { id: 'prohibitory-no-right-turn', name: 'No Right Turn', nameEl: 'Απαγορεύεται η δεξιά στροφή', category: 'prohibitory', meaning: 'Turning right is prohibited.', aliases: ['no right', 'right turn prohibited'], image: img('prohibitory-no-right-turn') },
  { id: 'prohibitory-no-u-turn', name: 'No U-Turn', nameEl: 'Απαγορεύεται η αναστροφή', category: 'prohibitory', meaning: 'Making a U-turn is prohibited.', aliases: ['no u turn', 'u turn prohibited'], image: img('prohibitory-no-u-turn') },
  { id: 'prohibitory-no-horn', name: 'No Sounding of Horn', nameEl: 'Απαγορεύεται η χρήση κόρνας', category: 'prohibitory', meaning: 'The use of the horn is prohibited.', aliases: ['no horn', 'no honking'], image: img('prohibitory-no-horn') },
  { id: 'prohibitory-no-motor-vehicles', name: 'No Motor Vehicles', nameEl: 'Απαγορεύεται η κυκλοφορία μηχανοκίνητων', category: 'prohibitory', meaning: 'All motor vehicles are prohibited.', aliases: ['no vehicles', 'motor vehicles prohibited'], image: img('prohibitory-no-motor-vehicles') },
  { id: 'prohibitory-no-cycles', name: 'No Cycling', nameEl: 'Απαγορεύεται η κυκλοφορία ποδηλάτων', category: 'prohibitory', meaning: 'Cycles are prohibited.', aliases: ['no bicycles', 'no bikes'], image: img('prohibitory-no-cycles') },
  { id: 'prohibitory-no-pedestrians', name: 'No Pedestrians', nameEl: 'Απαγορεύεται η κυκλοφορία πεζών', category: 'prohibitory', meaning: 'Pedestrians are prohibited.', aliases: ['no walking', 'pedestrians prohibited'], image: img('prohibitory-no-pedestrians') },
  { id: 'prohibitory-weight-limit', name: 'Weight Limit', nameEl: 'Όριο βάρους', category: 'prohibitory', meaning: 'Vehicles exceeding the indicated weight are prohibited.', aliases: ['no heavy vehicles', 'weight restriction'], image: img('prohibitory-weight-limit') },
  { id: 'prohibitory-height-limit', name: 'Height Limit', nameEl: 'Όριο ύψους', category: 'prohibitory', meaning: 'Vehicles exceeding the indicated height are prohibited.', aliases: ['low bridge', 'height restriction'], image: img('prohibitory-height-limit') },

  // ---- Mandatory ----
  { id: 'mandatory-turn-right', name: 'Turn Right Ahead', nameEl: 'Υποχρεωτική στροφή δεξιά', category: 'mandatory', meaning: 'You must turn right ahead.', aliases: ['keep right', 'turn right'], image: img('mandatory-turn-right') },
  { id: 'mandatory-turn-left', name: 'Turn Left Ahead', nameEl: 'Υποχρεωτική στροφή αριστερά', category: 'mandatory', meaning: 'You must turn left ahead.', aliases: ['keep left', 'turn left'], image: img('mandatory-turn-left') },
  { id: 'mandatory-ahead-only', name: 'Ahead Only', nameEl: 'Υποχρεωτική πορεία ευθεία', category: 'mandatory', meaning: 'You must proceed straight ahead only.', aliases: ['go straight', 'straight only'], image: img('mandatory-ahead-only') },
  { id: 'mandatory-roundabout', name: 'Roundabout', nameEl: 'Υποχρεωτική κυκλική πορεία', category: 'mandatory', meaning: 'You must follow the roundabout in the direction shown.', aliases: ['mini roundabout', 'keep right roundabout'], image: img('mandatory-roundabout') },
  { id: 'mandatory-keep-right', name: 'Keep Right', nameEl: 'Υποχρεωτική διέλευση δεξιά', category: 'mandatory', meaning: 'You must pass to the right of the obstacle or island.', aliases: ['pass right', 'keep right'], image: img('mandatory-keep-right') },
  { id: 'mandatory-keep-left', name: 'Keep Left', nameEl: 'Υποχρεωτική διέλευση αριστερά', category: 'mandatory', meaning: 'You must pass to the left of the obstacle or island.', aliases: ['pass left', 'keep left'], image: img('mandatory-keep-left') },
  { id: 'mandatory-cycle-path', name: 'Cycle Path', nameEl: 'Ποδηλατόδρομος', category: 'mandatory', meaning: 'A route reserved for cyclists.', aliases: ['bicycle lane', 'cycle lane'], image: img('mandatory-cycle-path') },
  { id: 'mandatory-footpath', name: 'Footpath', nameEl: 'Πεζόδρομος', category: 'mandatory', meaning: 'A route reserved for pedestrians.', aliases: ['pedestrian path', 'walkway'], image: img('mandatory-footpath') },
  { id: 'mandatory-min-speed', name: 'Minimum Speed', nameEl: 'Ελάχιστη ταχύτητα', category: 'mandatory', meaning: 'You must drive at least at the indicated speed.', aliases: ['minimum speed limit', 'min speed'], image: img('mandatory-min-speed') },

  // ---- Information & Special Regulation ----
  { id: 'info-parking', name: 'Parking', nameEl: 'Στάθμευση', category: 'info', meaning: 'Parking is permitted in this area.', aliases: ['car park', 'parking allowed'], image: img('info-parking') },
  { id: 'info-hospital', name: 'Hospital', nameEl: 'Νοσοκομείο', category: 'info', meaning: 'A hospital is nearby. Avoid unnecessary noise.', aliases: ['clinic', 'medical'], image: img('info-hospital') },
  { id: 'info-one-way', name: 'One-Way Street', nameEl: 'Μονόδρομος', category: 'info', meaning: 'Traffic flows in one direction only.', aliases: ['one way', 'single direction'], image: img('info-one-way') },
  { id: 'info-pedestrian-crossing', name: 'Pedestrian Crossing', nameEl: 'Διάβαση πεζών', category: 'info', meaning: 'A pedestrian crossing is located here.', aliases: ['zebra crossing', 'crosswalk'], image: img('info-pedestrian-crossing') },
  { id: 'info-bus-stop', name: 'Bus Stop', nameEl: 'Στάση λεωφορείου', category: 'info', meaning: 'A bus stop is located here.', aliases: ['bus station', 'bus halt'], image: img('info-bus-stop') },
  { id: 'info-motorway', name: 'Motorway', nameEl: 'Αυτοκινητόδρομος', category: 'info', meaning: 'The start of a motorway. Motorway rules apply.', aliases: ['highway', 'expressway'], image: img('info-motorway') },
  { id: 'info-dead-end', name: 'Dead End', nameEl: 'Αδιέξοδο', category: 'info', meaning: 'The road has no through route.', aliases: ['no through road', 'cul de sac'], image: img('info-dead-end') },
  { id: 'info-priority-road', name: 'Priority Road', nameEl: 'Οδός προτεραιότητας', category: 'info', meaning: 'You are on a priority road and have right of way.', aliases: ['main road', 'right of way'], image: img('info-priority-road') },
  { id: 'info-give-way', name: 'Give Way', nameEl: 'Παραχώρηση προτεραιότητας', category: 'info', meaning: 'Give way to traffic on the road you are joining.', aliases: ['yield', 'give priority'], image: img('info-give-way') },
  { id: 'info-stop', name: 'Stop', nameEl: 'Στοπ', category: 'info', meaning: 'Come to a complete stop and give way before proceeding.', aliases: ['stop sign', 'halt'], image: img('info-stop') },
];

const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

export function getSignById(id) {
  return SIGNS.find((s) => s.id === id) || null;
}

export function getSignsByCategory(id) {
  return SIGNS.filter((s) => s.category === id);
}

export function searchSigns(query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return SIGNS.slice();
  return SIGNS.filter((s) => {
    const haystack = [
      s.name,
      s.nameEl,
      s.meaning,
      CATEGORY_LABELS[s.category] || '',
      ...(s.aliases || []),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
