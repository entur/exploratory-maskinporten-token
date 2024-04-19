# exploratory-maskinporten-token

Dette repoet kan lage gyldige jwt-tokens gitt en maskinporten-klient. Repoet har er primært
rettet for å lage one-off tokens for manuell testing av Maskinporten-apier og ikke for bruk i produksjon.

Digdir har sin egen java-klient: https://github.com/felleslosninger/jwt-grant-generator

## Uthenting av access_token
Etter førstegangsoppsett for integrasjon i Maskinporten er gjennomført, 
opprett en ny config under `/configs` til å inneholde minimum rett scope, klientid og referanse til nøkkel. 

```
{
  "scope": "prefix:name",
  "client_id": "uuid",
  "keyname": "my-key-id"
}
```
Defaults her er ingen audience satt i token, Maskinporten-issuer på `https://test.maskinporten.no/` og privatnøkkel i fila `certs/maskinporten.pem`.

Mulige utvidelser i objektet er `url`,`x5c`, `audience` og `certname`,  tilsvarende `full-example.json`. 
Dersom virksomhetssertifikat legges i `x5c`, trenger man ikke en keyname.  

```
{
  "scope": "prefix:name",
  "client_id": "fcae871b-4597-492e-ab9f-762ff2443fb1",
  "keyname": "my-key-id",
  "x5c": "cert.crt"                        // legg sertifikatchain i header (brukes ved signering med virksomhetssertifikat)
  "url": "https://sky.maskinporten.dev",   // overrider miljø/issuer fra https://test.maskinporten.no/
  "certname": "mycert.pem",                // overrider filnavn fra maskinporten.pem 
  "audience": "<verdi-fra-tilbyder-dokumentasjon>"
}
```

 kjør `node index configname` fra `src` hvor `configname`er filnavnet (uten.json) på configen under mappen `/configs`. 
 Om du dropper dette parametret, vil den bruke innholdet i `grantdetails.json`

Eksempel: 
`node index minimal` vil kjøre scriptet med configen fra `configs/minimal.json`
 

## Videre bruk 

Sjekk ut at innholdet i det mottatte tokenet er som forventet i https://jwt.io. Se mer info under *Innholdet i JWT-grant*

Siden det vanligste bruksområdet handler om uthenting av 
access_token, kan man kombinere med `jq` for å hente ut kun dette. 

```
node index.js | jq -r ".access_token"
```

# Førstegangsoppsett i Maskinporten via forenklet onboarding

| Link                                            | Miljøer                               | Påloggingskrav                               |
|-------------------------------------------------|---------------------------------------|----------------------------------------------|
| [TEST](http://onboarding.test.maskinporten.no/) | Testmiljø med syntetiske bedrifter    | Syntetisk personpålogging fra Tenor          |
| [PROD](http://onboarding.maskinporten.no/)      | Prod- og testmiljø for ekte orgnummer | Personlig pålogging med rettigheter i Altinn |


## Ved bruk av nøkler

Følg guiden i forenklet onboarding for opprettelse av ny integrasjon med nøkkel. 
Ta vare på key id og klientId som må plugges inn her for å få generert token.

Dersom du i klientopprettelsen ønsker å opprette nytt sertifikat selv kan du bruke følgende kommando `openssl genrsa -out maskinporten.pem 2048` og hent ut public key `openssl rsa -in maskinporten.pem -pubout -out maskinporten.pem.pub`, 
men forenklet onboarding kan også generere nytt nøkkelpar for deg som kan lastes ned og brukes videre her. 

## Ved bruk av virksomhetssertifikat

Virksomhetssertifikat for ekte virksomheter kan bestilles av bemyndidigede personer for test og prod, 
mens syntetiske bedrifter kan bestille test-virksomhetssertifikater, feks som her fra [Buypass](https://www.buypass.no/produkter/virksomhetssertifikat-esegl/bestill-testsertifikat-vid-europa).

Her mottar du en en .p12-bundle og for å kunne bruke disse inn i koden her, 
må du hente ut sertifikat (til `x5c`) og privatekey (til `certname`) separat.

Uthenting av cert-fil til `x5c`-feltet:
```openssl pkcs12 -in INFILE.p12 -out OUTFILE.pem -nodes -nocerts```

Uthenting av pem-fil for å signere (`certname`-feltet):
```openssl pkcs12 -in INFILE.p12 -out OUTFILE.crt -nokeys```

I denne crt-fila må du (dessverre) også gå inn og manuelt slette alt utenfor `-----BEGIN/END CERTIFICATE-----`
(TODO: fjerne dette manuelle steget)

# Innholdet i JWT-grant

Beskrivelse av [JWT-grant](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_jwtgrant) inspirert av 
tilsvarende stil på [https://jwt.io].

HEADER:ALGORITHM & TOKEN TYPE

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "keyname"
}
```

PAYLOAD:DATA

```json
{
  "aud": "https://ver2.maskinporten.no/",
  "scope": "prefix:postfix",
  "iss": "client_id",
  "exp": 1584693183,
  "iat": 1584693063,
  "jti": "b1197d5a-0c68-4c4a-a95c-dc07c1194600"
}
```

hvor `exp` og `iat` er timestamps og  `jti` er jwt-token-identifier som genereres unikt pr token

VERIFY SIGNATURE

```
Private og public keys fra nøkkelparet
```

### Verifisering av et accesstoken 

Verifisering av et Maskinportentoken er beskrevet i deres [dokumentasjon](https://docs.digdir.no/docs/Maskinporten/maskinporten_guide_apitilbyder#4-validere-token).

En testimplementasjon finnes også under `src/` og kan kjøres med følgende kommando `node verify.js <acces_token>`.

## Headerstørrelser

Hvor store headerne og tokenet kan bli er regnet på i [headerstørrelse.md]

## Bruk andre steder

Nav og NAIS sin runtime-generering og oppdatering av nøkler er beskrevet her: [https://github.com/nais/digdirator]
