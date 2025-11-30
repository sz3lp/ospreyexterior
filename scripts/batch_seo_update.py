import json
import re
from pathlib import Path
from typing import Dict, List

ROOT_URL = "https://ospreyexterior.com"
PAGES_DIR = Path(__file__).resolve().parents[1] / "pages"
LOCATIONS_PATH = PAGES_DIR / "locations.json"


def load_locations() -> Dict[str, dict]:
    if not LOCATIONS_PATH.exists():
        raise SystemExit("locations.json not found in pages directory")
    data = json.loads(LOCATIONS_PATH.read_text(encoding="utf-8"))
    return {entry["slug"]: entry for entry in data}


LOCATIONS = load_locations()


def slug_to_title(slug: str) -> str:
    words = slug.replace("-", " ").replace("_", " ")
    return " ".join(word.capitalize() for word in words.split()) if words else ""


def build_canonical(city_slug: str, service_slug: str) -> str:
    if service_slug:
        return f"{ROOT_URL}/pages/{city_slug}/{service_slug}/"
    return f"{ROOT_URL}/pages/{city_slug}/"


def determine_service_slug(parts: List[str]) -> str:
    if parts[-1] != "index.html":
        return Path(parts[-1]).stem
    if len(parts) >= 2:
        candidate = parts[-2]
        return "" if candidate == parts[0] else candidate
    return ""


def insert_before_tag(content: str, tag: str, insertion: str) -> str:
    pattern = re.compile(rf"</{tag}>", re.IGNORECASE)
    match = pattern.search(content)
    if not match:
        return content + insertion
    idx = match.start()
    return content[:idx] + insertion + content[idx:]


def build_geo_tags(location: dict) -> str:
    city = location.get("city", "")
    state = location.get("state", "")
    latitude = location.get("latitude")
    longitude = location.get("longitude")
    parts = [
        f'  <meta name="geo.region" content="US-{state}">',
        f'  <meta name="geo.placename" content="{city}">',
        f'  <meta name="geo.position" content="{latitude};{longitude}">',
        f'  <meta name="ICBM" content="{latitude}, {longitude}">',
    ]
    return "\n".join(parts) + "\n"


def ensure_geo_tags(content: str, location: dict) -> tuple[str, bool]:
    block = build_geo_tags(location)
    if block.strip() in content:
        return content, False
    cleaned = re.sub(
        r"\s*<meta name=\"(?:geo\.region|geo\.placename|geo\.position|ICBM)\"[^>]*>\s*",
        "",
        content,
        flags=re.IGNORECASE,
    )
    new_content = insert_before_tag(cleaned, "head", block)
    return new_content, True


def update_canonical(content: str, canonical_url: str) -> tuple[str, bool]:
    canonical_tag = f'<link rel="canonical" href="{canonical_url}">'  # exact format we will enforce
    if canonical_tag in content:
        return content, False
    pattern = re.compile(r"<link\s+rel=['\"]canonical['\"][^>]*>", re.IGNORECASE)
    if pattern.search(content):
        new_content, count = pattern.subn(canonical_tag, content, count=1)
        return new_content, count > 0
    insertion = "  " + canonical_tag + "\n"
    new_content = insert_before_tag(content, "head", insertion)
    return new_content, True


def build_schema_block(city_slug: str, service_slug: str, location: dict) -> str:
    city_name = location.get("city") or slug_to_title(city_slug) or city_slug
    state = location.get("state", "WA")
    latitude = location.get("latitude")
    longitude = location.get("longitude")
    canonical_url = build_canonical(city_slug, service_slug)
    service_slug_for_display = service_slug or "services"
    service_name = slug_to_title(service_slug_for_display) or service_slug_for_display

    local_business = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Osprey Exterior",
        "areaServed": {"@type": "City", "name": city_name},
        "telephone": "(425) 550-1727",
        "url": canonical_url,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": city_name,
            "addressRegion": state,
            "addressCountry": "US",
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": latitude,
            "longitude": longitude,
        },
    }

    service_schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": f"{service_name} in {city_name}",
        "provider": {"@id": f"{ROOT_URL}/#organization"},
        "areaServed": {"@type": "City", "name": city_name},
        "serviceArea": {"@type": "AdministrativeArea", "name": f"{city_name}, {state}"},
        "url": canonical_url,
    }

    faq_schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [],
    }

    scripts = []
    for obj in (local_business, service_schema, faq_schema):
        scripts.append(
            "  <script type=\"application/ld+json\">\n"
            + json.dumps(obj, ensure_ascii=False, indent=2)
            + "\n  </script>\n"
        )
    return "".join(scripts)


def ensure_schema(content: str, city_slug: str, service_slug: str, location: dict) -> tuple[str, int, bool]:
    schema_block = build_schema_block(city_slug, service_slug, location)
    if schema_block.strip() in content:
        return content, 0, False
    cleaned = re.sub(
        r"\s*<script type=\"application/ld\+json\">.*?@type\":\s*\"(?:LocalBusiness|Service|FAQPage)\".*?</script>\s*",
        "",
        content,
        flags=re.IGNORECASE | re.DOTALL,
    )
    new_content = insert_before_tag(cleaned, "head", schema_block)
    return new_content, 3, True


def get_adjacent_cities(city_slug: str, city_slugs: List[str]) -> List[str]:
    if city_slug not in city_slugs:
        return []
    idx = city_slugs.index(city_slug)
    max_count = 5
    min_count = 3
    ordered_indices = [i for i in range(len(city_slugs)) if i != idx]
    ordered_indices.sort(key=lambda i: (abs(i - idx), i))
    selected_indices = ordered_indices[:max_count]
    if len(selected_indices) < min_count:
        selected_indices = ordered_indices
    selected_indices.sort()
    return [city_slugs[i] for i in selected_indices]


def ensure_nearby_links(
    content: str, city_slug: str, service_slug: str, neighbors: List[str]
) -> tuple[str, bool]:
    if not neighbors:
        return content, False
    lines = ["  <section id=\"nearby-links\">", "    <h2>Nearby Service Areas</h2>", "    <ul>"]
    service_title = slug_to_title(service_slug) or service_slug.replace("-", " ").title()

    for neighbor_slug in neighbors:
        neighbor_name = slug_to_title(neighbor_slug) or neighbor_slug
        # Use the service slug in the URL and the service title in the anchor text
        href = build_canonical(neighbor_slug, service_slug)
        lines.append(f"      <li><a href=\"{href}\">{service_title} in {neighbor_name}</a></li>")
    lines.extend(["    </ul>", "  </section>\n"])
    block = "\n" + "\n".join(lines)

    pattern = re.compile(r"\n?\s*<section id=\"nearby-links\">.*?</section>\s*", re.DOTALL)
    if pattern.search(content):
        new_content, count = pattern.subn(block, content, count=1)
        return new_content, count > 0

    new_content = insert_before_tag(content, "body", block)
    return new_content, True


def main() -> None:
    if not PAGES_DIR.exists():
        raise SystemExit("pages directory not found")

    city_slugs = sorted([p.name for p in PAGES_DIR.iterdir() if p.is_dir()])

    pages_modified = 0
    schema_blocks = 0
    processed_cities: set[str] = set()

    for html_file in PAGES_DIR.rglob("*.html"):
        relative_parts = html_file.relative_to(PAGES_DIR).parts
        if len(relative_parts) < 2:
            continue
        city_slug = relative_parts[0]
        if city_slug not in city_slugs:
            continue
        location = LOCATIONS.get(city_slug)
        if not location:
            continue
        processed_cities.add(city_slug)
        service_slug = determine_service_slug(list(relative_parts))

        original = html_file.read_text(encoding="utf-8")
        updated = original
        file_changed = False

        updated, geo_changed = ensure_geo_tags(updated, location)
        if geo_changed:
            file_changed = True

        updated, changed = update_canonical(updated, build_canonical(city_slug, service_slug))
        if changed:
            file_changed = True

        updated, inserted, schema_changed = ensure_schema(updated, city_slug, service_slug, location)
        if schema_changed:
            schema_blocks += inserted
            file_changed = True

        neighbors = get_adjacent_cities(city_slug, city_slugs)
        updated, nearby_changed = ensure_nearby_links(
            updated, city_slug, service_slug, neighbors
        )
        if nearby_changed:
            file_changed = True

        if file_changed:
            html_file.write_text(updated, encoding="utf-8")
            pages_modified += 1

    print(
        json.dumps(
            {
                "cities_processed": len(processed_cities),
                "pages_modified": pages_modified,
                "schema_blocks_injected": schema_blocks,
            }
        )
    )




if __name__ == "__main__":
    main()
