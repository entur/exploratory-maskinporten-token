# Førstegangsoppsett i Maskinporten via samarbeidsportalen

Før du begynner på denne må du ha en bruker i Samarbeidsportalen med tilgang til å
se [integrasjoner for din virksomhet](https://sjolvbetjening.test.samarbeid.digdir.no/integrations)

## Sette opp en ny klient

Før du kan sette opp din egen klient, må det aktuelle scopet være tildelt ditt orgnummer. Dette må gjøres i
Samarbeidsportalen av tilbyderorganisasjonen.

### Lag en klient i Maskinporten

* Logg inn i test-miljøet
  under [Integrasjoner i Samarbeidsportalen](https://sjolvbetjening.test.samarbeid.digdir.no/integrations)
* Velg ny integrasjon, velg `Difi-tjeneste: Maskinporten`, velg relevante scopes og oppgi levetid.
* Ta vare på `client_id` og `client_name` etter lagring

### Opprett et nøkkelpar

Du kan enten opprette et nøkkelpar på din lokale maskin eller bruke [https://mkjwk.org/](https://mkjwk.org/).
Husk å lagre privatnøkkelen som `makskinporten.pem`.


#### Bruk av mkjwk

Keysize: 2048
Key use: signature
Algorithm: RS256: RSASSA-PKCS1-v1_5 using SHA-256
KeyId: <dinselvvalgtekeyId>
Show X.509: yes

#### Opprett et nøkkelpar på din lokale maskin

Opprett et nøkkelpar under `certs`-mappen

```
openssl genrsa -out maskinporten.pem 2048
```

Output tekstrepresentasjonen av nøklen `openssl rsa -text -noout -in maskinporten.pem`. Resultatet vil ligne på følgende

```
Private-Key: (2048 bit)
modulus:
    00:b6:45:94:aa:15:c3:49:60:b7:51:01:21:c6:e0:
    85:c5:01:8a:23:33:e4:41:25:2f:4a:16:08:7e:39:
    ac:7a:a3:c9:eb:ae:cc:b8:61:f4:14:e0:a1:fd:45:
    4e:f7:0b:04:08:4f:72:b8:9c:c1:81:df:1e:49:cb:
    25:0f:f1:6c:66:5d:26:e4:51:3f:56:99:58:bc:6b:
    20:7a:5a:47:ab:ce:ff:d3:e6:de:3c:b0:46:57:82:
    dc:20:6c:54:4c:6c:bc:15:df:ca:6e:12:39:f4:e1:
    db:31:14:7d:4b:f5:40:ba:b2:16:42:f6:cd:c5:bf:
    44:64:af:f1:6b:4d:53:63:e7:1f:41:6f:6f:6d:0a:
    6a:e4:83:bb:5f:72:c2:1d:13:90:bc:bc:d3:98:5c:
    84:03:9b:d4:77:44:42:1a:14:37:87:fd:8c:49:c4:
    ee:db:2a:b1:26:bc:8a:f1:e4:18:10:68:0b:00:9e:
    bc:2e:8d:dc:42:77:d4:0f:01:d6:da:72:9e:cb:ad:
    e7:d5:b3:77:9f:94:dd:95:b5:ad:62:d0:f7:69:f0:
    20:12:d3:fb:87:93:81:1d:31:57:3f:44:d9:5c:98:
    57:0c:7b:23:7e:71:ff:79:db:39:f5:4a:1f:c3:11:
    44:fc:89:12:0f:d9:5b:de:77:ba:0c:d8:f0:eb:5d:
    c8:bd
publicExponent: 65537 (0x10001)
[...]
```

Innholdet i modulus (mellom 00 og bd) kan kopieres inn
i  [CyberChef](https://gchq.github.io/CyberChef/#recipe=From_Hex('Auto')To_Base64('A-Za-z0-9%2B/%3D'))
for å konvertere fra hex til base64

### Legg til nøkler i Maskinporten

Under den nyopprettede integrasjonen i Samarbeidsportalen, velg "Legg til egne nøkler" og paste inn på JWK-format som følger.
Dersom du har bruk mkjwks vil du automatisk får formatet rett, men du må legge innholdet til i en array

`<keyname>` er et valgfritt navn du gir denne nøkkelen og `<base64>` er modulus-komponenten i nøkkelen i base64-format.

```json
[
  {
    "kty": "RSA",
    "e": "AQAB",
    "use": "sig",
    "kid": "<keyname>",
    "alg": "RS256",
      "n": "<base64>"
  }
]


```
Det finnes også [automatiseringsmuligheter](https://docs.digdir.no/docs/Maskinporten/maskinporten_sjolvbetjening_api#registrere-klient-som-bruker-egen-nøkkel)
for å laste opp nøkler på denne måten, men for denne testingen har det ikke vært aktuelt å sjekke ut basert på følgende
informasjon fra [dokumentasjonen](https://docs.digdir.no/docs/Maskinporten/maskinporten_sjolvbetjening_api#selvbetjening-som-api-konsument)

> For å kunne bruke selvbetjening via API, så må virksomheten få utdelt en administrasjons-klient fra Digdir. API’et er sikret med oAuth2 med bruk av virksomhetssertifikat. Merk at i testmiljøene må det benyttes gyldig test-virksomhetssertifikat.


### Generering av et nytt accesstoken

Koden under `src` genererer og signerer en JWT-grant som sendes til Maskinporten. Deretter returnerer Maskinporten et
gyldig accesstoken som kan brukes videre og som kan valideres av andre API'er.

* Dokumentasjon om [token-endepunktet](https://docs.digdir.no/docs/Maskinporten/maskinporten_protocol_token)
* [Well-known endepunkter](https://docs.digdir.no/docs/Maskinporten/maskinporten_func_wellknown) i de forskjellige miljøene

Fra token-endepunktet vet vi at

* grant type er `urn:ietf:params:oauth:grant-type:jwt-bearer`
* assertion er signert JWT-grant

```
POST /token
Content-type: application/x-www-form-urlencoded

  grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&
  assertion=<jwt>
```
