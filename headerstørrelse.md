# Headerstørrelse og problemstillinger?

Kan noen begrensninger i http eller oauth2 skape problemer for oss når vi får mange scopes?

## Konklusjon:

Å holde antallet scopes under 8Kb for å støtte mange implementasjoner av webservere der ute, gir over komfortabelt over
100 scopes, mer sannsylig opp mot 200 eller strukket mot 300 avhengig av navnelengde på scope og finregning.
Med den skisserte dataflyten fra konsument til tilbyder, bør ikke em slik headerbegresning være et problem i praktisk
bruk.
Konsumenten har mulighet til å omgå eventuelle begrensninger ved å dele opp i flere kall til maskinporten og i så måte
få færre scopes pr token. Det man likevel må være oppmerksom på er eventuelle andre headere som legges til - automatisk
eller ikke - da disse vil gjøre mindre plass til scopes. Begrensninger man kan møte på kommer ikke fra standarder, men
fra implementasjoner av webservere, lastbalanserere og reverseproxies

## Bakgrunn

Jeg har sjekket opp følgende:

- Http headeres i spec har ingen offisielle begrensninger,

> HTTP does not place a predefined limit on the length of each header
> field or on the length of the header section as a whole, as described
> in Section 2.5. Various ad hoc limitations on individual header
> field length are found in practice, often depending on the specific
> field semantics.
https://www.rfc-editor.org/rfc/rfc7230

- oauth2 har ingen spesielle begrensninger som treffer oss her
- implementasjon av webservere, Kjente begrensninger avhengig av webserver, anbefalinger om å holde seg under 8Kb unngår
  de fleste: https://stackoverflow.com/questions/686217/maximum-on-http-header-values

### Generering av et token

Videre i denne teksten er det forutsatt at du har generert et maskinporten-token med ett scope på 14 tegn.

### Headerstørrelser med ett scope

```
curl --location --request GET 'url' \
--header 'Authorization: Bearer <maskinportentoken>'
```

Headersize er 1061 bytes, som fordeles på følgende

1. "Authorization: Bearer " 22 bytes
2. JWT-token
   2a. Header 90 bytes
   `eyJraWQiOiItcURrYkNkWDdWWXRFZEhpczFCRlJ6bnZ6VE00Nm1PcUstclAxWmhtNFAwIiwiYWxnIjoiUlMyNTYifQ.`
   2b. Payload, varierende men i mitt testtilfelle 435 bytes
   `<basert på ditt token>`
   2c. Signaturverifikasjon 512 bytes
   `<basert på ditt token>`
   2d. Punktum for å skille 2bytes
   `header.payload.verifikasjon`

Innholdet i 1 og 2d er statisk. Innholdet i 2c er basert på antallet bytes i public modulus (n)på maskinporten public
key som er 512 bytes fast i ver2 og prodmiljø. Se https://ver2.maskinporten.no/jwk og https://maskinporten.no/jwk

Innholdet i 2a er ikke helt statisk, men ikke en funksjon av antallet scopes. Innholdet i 2b er har faste claims,
deretter øker lineært med antallet scopes.

### Headerstørrelser med flere scopes

*Så hvor mange scopes kan man requeste og fortsatt holde seg under 8Kb?*

Dersom man også legger til andre headere i requesten kan dette også påvirke, men dette bør ikke være en funksjon av
antallet scopes.

Gjenstående bytes er 8000 - 1061 = 6939 bytes. De er base64-encodet, så vi kan anta en økning i bytes
på [33%](https://developer.mozilla.org/en-US/docs/Glossary/Base64#encoded_size_increase).

Gjenstående bytes til klartekstscopes: 6936/133*100 = 5215 bytes.

Dersom man har scope på 26 tegn pluss whitespace-skilletegn, vil det være plass til 5215/(26+1)= 193 scopes

Dersom man har scope på 16 tegn pluss whitespace-skilletegn, vil det være plass til 5215/(16+1)= 306 scopes

### Tileggsinfo

For å unngå DDOS angrep som holder serveren opptatt med å prosessere kjempelange tokens, er det uansett lurt å sette en
max størrelse på http-headeren. I Spring Boot /Tomcat er denne default 8Kb .

# Kjente webserverbegrensninger

* nginx deafult header buffer size
  8kB https://nginx.org/en/docs/http/ngx_http_core_module.html#large_client_header_buffers
* GCP lastbalanserer har en hard limit på 64 KB.
  Ref. https://cloud.google.com/load-balancing/docs/quotas#https-lb-header-limits
* Apigee har en grense på 25 KB. Ref. https://docs.apigee.com/api-platform/reference/limits#system
* Træfik har en maks på 1MB