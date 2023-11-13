import requests
import uuid
import os
from jwcrypto import jwk, jwt
from datetime import datetime, timezone

# Variables from integration
kid = os.environ.get('SKYPORTEN_KID') # export SKYPORTEN_KID=OAXSxbkVoe
integration_id = os.environ.get('SKYPORTEN_CLIENT_ID') # export SKYPORTEN_CLIENT_ID=78a8d8dd-bb88-4c9e-8a52-bec28ce8901e
scope = "entur:skyporten.demo"


# Environment specific variables
maskinporten_audience = "https://test.sky.maskinporten.no"
maskinporten_token = "https://test.sky.maskinporten.no/token"

timestamp = int(datetime.now(timezone.utc).timestamp())

secret = os.environ.get('SKYPORTEN_PEM') # export SKYPORTEN_PEM=`cat ./skyporten-public.pem`
key = jwk.JWK.from_pem(
  data=bytes(secret, 'ascii'),
  #password=str('PASSWORD').encode() <-- if password needed
)


jwt_header = {
  'alg': 'RS256',
  'kid': kid
}

jwt_claims = {
  'aud': maskinporten_audience,
  'iss': integration_id,
  'scope': scope,
  'resource': 'https://skyporten.entur.org', 
  'iat': timestamp,
  'exp': timestamp+100,
  'jti': str(uuid.uuid4())
}

jwt_token = jwt.JWT(
  header = jwt_header,
  claims = jwt_claims,
)
jwt_token.make_signed_token(key)
signed_jwt = jwt_token.serialize()

body = {
  'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  'assertion': signed_jwt
}

res = requests.post(maskinporten_token, data=body)
print(res.text)
