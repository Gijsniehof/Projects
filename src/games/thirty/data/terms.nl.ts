import type { TermPool } from '../types';

/**
 * Curated Dutch term lists for 30 Seconds.
 * One term per line. To add terms, just add lines to a list.
 * Duplicates across lists are removed at load time (see logic test).
 */
const list = (s: string) =>
  s
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean);

const GENERAL = list(`
paraplu
olifant
verjaardag
tandarts
regenboog
vulkaan
piramide
kangoeroe
magnetron
ijsbeer
vuurtoren
sneeuwpop
trampoline
rugzak
piano
gitaar
drumstel
microfoon
kerstboom
bruiloft
zwembad
achtbaan
bibliotheek
ziekenhuis
vliegveld
onderzeeër
helikopter
raket
astronaut
dinosaurus
haai
pinguïn
giraffe
krokodil
vlinder
spin
slak
uil
papegaai
flamingo
zebra
kameel
octopus
kwal
dolfijn
egel
eekhoorn
vos
wolf
gorilla
panda
koala
hamster
goudvis
varken
ezel
pizza
spaghetti
sushi
hamburger
popcorn
chocolade
aardbei
banaan
ananas
watermeloen
citroen
knoflook
broccoli
champignon
croissant
taart
ijsje
limonade
honing
ketchup
wekker
stofzuiger
wasmachine
koelkast
afstandsbediening
laptop
oplader
koptelefoon
batterij
gloeilamp
kaars
lucifer
schaar
hamer
schroevendraaier
ladder
emmer
bezem
tandenborstel
föhn
handdoek
shampoo
kussen
matras
pyjama
badpak
zonnebril
horloge
ketting
sjaal
handschoen
portemonnee
sleutel
fiets
trein
tram
kano
vliegtuig
motor
skateboard
tractor
vrachtwagen
ambulance
verkeerslicht
rotonde
tankstation
snelweg
tunnel
berg
woestijn
oerwoud
eiland
grot
waterval
bliksem
onweer
hagel
mist
tornado
aardbeving
zonsondergang
maan
planeet
komeet
zwart gat
tennis
hockey
basketbal
golf
judo
yoga
breien
vissen
kamperen
hardlopen
fotograferen
tuinieren
schaken
sudoku
legpuzzel
verstoppertje
tikkertje
piraat
ridder
prinses
tovenaar
heks
spook
zombie
vampier
robot
alien
superheld
clown
goochelaar
kapper
bakker
slager
piloot
kok
verpleegkundige
politieagent
postbode
loodgieter
timmerman
boer
advocaat
rechter
journalist
ober
brandweerman
tatoeage
selfie
wifi
wachtwoord
emoji
podcast
vakantie
huiswerk
examen
diploma
rijbewijs
paspoort
koffer
tent
slaapzak
kampvuur
barbecue
picknick
schommel
glijbaan
zandbak
speeltuin
dierentuin
circus
kermis
bioscoop
museum
kasteel
gevangenis
kerkhof
sauna
sportschool
supermarkt
markt
stoplicht
zebrapad
brievenbus
`);

const PEOPLE = list(`
Willem-Alexander
Máxima
Amalia
Beatrix
Willem van Oranje
Rembrandt
Vincent van Gogh
Johannes Vermeer
Anne Frank
Johan Cruijff
Max Verstappen
Virgil van Dijk
Frenkie de Jong
Memphis Depay
Arjen Robben
Ruud Gullit
Marco van Basten
Louis van Gaal
Sven Kramer
Ireen Wüst
Femke Bol
Sifan Hassan
Epke Zonderland
Martin Garrix
Tiësto
Armin van Buuren
André Hazes
Marco Borsato
Guus Meeuwis
Duncan Laurence
Joost Klein
Frans Bauer
Linda de Mol
Chantal Janzen
Najib Amhali
Enzo Knol
Freek Vonk
Doutzen Kroes
Carice van Houten
Dick Bruna
Annie M.G. Schmidt
Erasmus
Michiel de Ruyter
Antoni van Leeuwenhoek
Nijntje
Kabouter Plop
Bassie en Adriaan
Pluk van de Petteflet
Jip en Janneke
Dikkie Dik
Alfred J. Kwak
Samson en Gert
K3
Dolfje Weerwolfje
Bumba
Albert Einstein
Napoleon
Cleopatra
Julius Caesar
Leonardo da Vinci
Mozart
Beethoven
Shakespeare
Isaac Newton
Charles Darwin
Marie Curie
Nelson Mandela
Martin Luther King
Gandhi
Christoffel Columbus
Neil Armstrong
Winston Churchill
Abraham Lincoln
koningin Elizabeth
prinses Diana
Pablo Picasso
Frida Kahlo
Charlie Chaplin
Marilyn Monroe
Walt Disney
Steve Jobs
Bill Gates
Elvis Presley
Michael Jackson
Madonna
Beyoncé
Taylor Swift
Ed Sheeran
Adele
Rihanna
Lady Gaga
Billie Eilish
Harry Styles
Dua Lipa
Bruno Mars
Freddie Mercury
John Lennon
Bob Marley
Lionel Messi
Cristiano Ronaldo
Kylian Mbappé
Erling Haaland
Serena Williams
Roger Federer
Usain Bolt
Michael Jordan
LeBron James
Lewis Hamilton
Muhammad Ali
Leonardo DiCaprio
Brad Pitt
Tom Cruise
Dwayne Johnson
Zendaya
Emma Watson
Mr. Bean
Harry Potter
Hermelien Griffel
Voldemort
Sherlock Holmes
James Bond
Spider-Man
Batman
Superman
Wonder Woman
Mickey Mouse
Donald Duck
SpongeBob
Mario
Pikachu
Shrek
Elsa
Simba
Darth Vader
Yoda
Gandalf
Pippi Langkous
Peter Pan
Sneeuwwitje
Assepoester
Roodkapje
Pinokkio
Tarzan
Robin Hood
Dracula
Frankenstein
Kuifje
Asterix
Garfield
Homer Simpson
de Grinch
Willy Wonka
Barbie
de Kerstman
de Paashaas
Sinterklaas
`);

const NETHERLANDS = list(`
Amsterdam
Rotterdam
Den Haag
Utrecht
Eindhoven
Groningen
Maastricht
Nijmegen
Leiden
Haarlem
Delft
Zwolle
Arnhem
Amersfoort
Tilburg
Breda
Volendam
Giethoorn
Zandvoort
Scheveningen
Texel
Ameland
Terschelling
Schiermonnikoog
Friesland
Limburg
Zeeland
Drenthe
Brabant
Rijksmuseum
Anne Frank Huis
Efteling
Madurodam
Keukenhof
Kinderdijk
Afsluitdijk
Deltawerken
Erasmusbrug
Domtoren
Euromast
Paleis op de Dam
Binnenhof
Schiphol
Walibi
Duinrell
Artis
Blijdorp
Hoge Veluwe
Waddenzee
Markthal
Kubuswoningen
Ajax
Feyenoord
PSV
Oranje
Koningsdag
pakjesavond
Elfstedentocht
carnaval
Bevrijdingsdag
oudjaarsavond
vuurwerk
Prinsjesdag
Vierdaagse
Pinkpop
Lowlands
Gouden Koets
Songfestival
stroopwafel
bitterbal
kroket
frikandel
hagelslag
drop
haring
stamppot
erwtensoep
poffertjes
ontbijtkoek
vla
kibbeling
patatje oorlog
tompouce
speculaas
pepernoten
oliebol
boterkoek
beschuit met muisjes
hutspot
pindakaas
Albert Heijn
HEMA
Jumbo
Bol.com
Action
Kruidvat
Philips
Heineken
KLM
NS
ANWB
Tony's Chocolonely
Coolblue
Zeeman
Boer zoekt Vrouw
Wie is de Mol?
Goede Tijden Slechte Tijden
Het Klokhuis
Sesamstraat
Jeugdjournaal
Heel Holland Bakt
Expeditie Robinson
De Slimste Mens
Lingo
Sinterklaasjournaal
klompen
tulp
windmolen
grachtenpand
bakfiets
fietspad
OV-chipkaart
dijk
polder
gezelligheid
borrel
verjaardagskring
Delfts blauw
De Nachtwacht
Meisje met de parel
Het melkmeisje
De zonnebloemen
Wilhelmus
wadlopen
Hollandse Nieuwe
koopavond
kringloopwinkel
Sinterklaasintocht
Noordzee
IJsselmeer
Veluwe
Randstad
Zuidas
De Wallen
Vondelpark
Dam tot Damloop
Zaanse Schans
`);

export const TERM_POOLS: TermPool[] = [
  { id: 'algemeen', name: 'Algemeen', terms: GENERAL },
  { id: 'personen', name: 'Personen', terms: PEOPLE },
  { id: 'nederland', name: 'Nederland', terms: NETHERLANDS },
];
