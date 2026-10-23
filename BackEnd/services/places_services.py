import httpx

from core.config import GOOGLE_PLACES_API_KEY

PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby"

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
    lat: float, lng: float, tipo: str, raio: int, limite: int
) -> list[dict]:
    if not GOOGLE_PLACES_API_KEY:
        raise PlacesError("GOOGLE_PLACES_API_KEY não configurada no servidor.")

    corpo = {
        "includedTypes": [tipo],
        "maxResultCount": limite,
        "rankPreference": "DISTANCE",
        "languageCode": "pt-BR",
        "locationRestriction": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": float(raio),
            }
        },
    }
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resposta = await client.post(PLACES_URL, json=corpo, headers=headers)
    except httpx.HTTPError as exc:
        raise PlacesError("Falha ao contatar o Google Places.") from exc

    if resposta.status_code != 200:
        # Não repassa o corpo do erro (pode conter detalhes da conta/chave)
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
