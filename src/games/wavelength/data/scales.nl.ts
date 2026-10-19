/**
 * Scales for Op dezelfde golflengte: "left|right", one per line.
 * A good scale has two clear opposite ends and lots of things that sit somewhere in between.
 */
const RAW = `
koud|heet
saai|spannend
goedkoop|duur
slecht|goed
zacht|hard
klein|groot
ongezond|gezond
nutteloos|nuttig
lelijk|mooi
ouderwets|modern
rustig|druk
makkelijk|moeilijk
nep|echt
schattig|eng
licht|zwaar
langzaam|snel
onderschat|overschat
normaal|raar
zoet|hartig
droog|nat
stil|luid
kort|lang
vies|lekker
simpel|ingewikkeld
alledaags|zeldzaam
slechte film|goede film
slecht idee|goed idee
nerdy|cool
binnenactiviteit|buitenactiviteit
kinderachtig|volwassen
onbekend|beroemd
zwak|sterk
veilig|gevaarlijk
rommelig|netjes
goedkoop|luxe
zomers|winters
meer hond|meer kat
held|schurk
dom|slim
saaie baan|droombaan
slecht cadeau|goed cadeau
slechte vakantie|droomvakantie
slechte superkracht|goede superkracht
slechte snack|beste snack
jongensnaam|meisjesnaam
typisch Nederlands|totaal niet Nederlands
stad|platteland
ontspannend|stressvol
rond|hoekig
glad|ruw
vrolijk|verdrietig
onromantisch|romantisch
smaakloos|pittig
snackbar|sterrenrestaurant
nutteloze uitvinding|geniale uitvinding
tam|wild
uit de mode|hip
onschuldig|crimineel
onbelangrijk|belangrijk
makkelijk te spellen|moeilijk te spellen
slechte bijnaam|goede bijnaam
lekker ruikend|stinkend
serieus|grappig
slechte leraar|goede leraar
onhandig|handig
iets voor oma|iets voor tieners
onbetrouwbaar|betrouwbaar
natuur|technologie
onmogelijk|mogelijk
verleden|toekomst
slaapverwekkend|verslavend
ongezellig|gezellig
introvert|extravert
slecht huisdier|goed huisdier
slechte date|perfecte date
smerig|brandschoon
lui|sportief
zuinig|verkwistend
oneerlijk|eerlijk
jong|oud
koude kleur|warme kleur
kinderfilm|horrorfilm
vies ijsje|lekker ijsje
saai vak|leuk vak
waardeloos|waardevol
een beetje raar|heel raar
kleine leugen|grote leugen
slechte gewoonte|goede gewoonte
moet je delen|hou je voor jezelf
ontbijt|avondeten
geurloos|sterke geur
klein probleem|groot probleem
vergeetbaar|onvergetelijk
past in je broekzak|past niet in een huis
`;

export interface Scale {
  left: string;
  right: string;
}

export const SCALES_NL: Scale[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [left, right] = line.split('|').map((s) => s.trim());
    return { left, right };
  });
