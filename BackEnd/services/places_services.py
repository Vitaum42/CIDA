import logging

import httpx

from core.config import GOOGLE_PLACES_API_KEY

logger = logging.getLogger("cida.places")

PLACES_NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_TEXT_URL = "https://places.googleapis.com/v1/places:searchText"

# Só os campos que usamos: o FieldMask define o que é cobrado.
FIELD_MASK = ",".join(
    [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.googleMapsUri",
    ]
)

# Whitelist de tipos aceitos (evita o cliente mandar qualquer coisa ao Google)
TIPOS_PERMITIDOS = {"pharmacy", "hospital", "drugstore", "doctor"}


class PlacesError(Exception):
    pass


async def buscar_locais_proximos(
    lat: float, lng: float, tipo: str, raio: int, limite: int, q: str | None = None
) -> list[dict]:
    """Sem `q`: Nearby Search (mais próximos). Com `q`: Text Search restrito ao tipo e
    enviesado para a região (ex.: "farmacia", "drogasil", "farmácia 24 horas")."""
    if not GOOGLE_PLACES_API_KEY:
        raise PlacesError("GOOGLE_PLACES_API_KEY não configurada no servidor.")

    circulo = {"center": {"latitude": lat, "longitude": lng}, "radius": float(raio)}

    if q:
        url = PLACES_TEXT_URL
        corpo = {
            "textQuery": q,
            "includedType": tipo,
            "strictTypeFiltering": True,
            "pageSize": limite,
            "languageCode": "pt-BR",
            "locationBias": {"circle": circulo},
        }
    else:
        url = PLACES_NEARBY_URL
        corpo = {
            "includedTypes": [tipo],
            "maxResultCount": limite,
            "rankPreference": "DISTANCE",
            "languageCode": "pt-BR",
            "locationRestriction": {"circle": circulo},
        }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resposta = await client.post(url, json=corpo, headers=headers)
    except httpx.HTTPError as exc:
        logger.error("Falha de rede ao chamar o Google Places: %s", exc)
        raise PlacesError("Falha ao contatar o Google Places.") from exc

    if resposta.status_code != 200:
        # O motivo real (API não habilitada, chave restrita, cobrança...) vai só para o
        # log do servidor: o cliente recebe uma mensagem genérica.
        logger.error("Google Places respondeu %s: %s", resposta.status_code, resposta.text[:500])
        raise PlacesError(f"Google Places retornou status {resposta.status_code}.")

    return [
        {
            "id": p.get("id"),
            "nome": (p.get("displayName") or {}).get("text"),
            "endereco": p.get("formattedAddress"),
            "latitude": (p.get("location") or {}).get("latitude"),
            "longitude": (p.get("location") or {}).get("longitude"),
            "mapa_url": p.get("googleMapsUri"),
        }
        for p in resposta.json().get("places", [])
    ]
