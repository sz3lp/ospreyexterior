import json
import re
from pathlib import Path
from typing import List

ROOT_URL = "https://ospreyexterior.com"
PAGES_DIR = Path(__file__).resolve().parents[1] / "pages"


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


def build_schema_block(city_slug: str, service_slug: str) -> str:
    city_name = slug_to_title(city_slug) or city_slug
    canonical_url = build_canonical(city_slug, service_slug)
    service_slug_for_display = service_slug or "services"
    service_name = slug_to_title(service_slug_for_display) or service_slug_for_display

    local_business = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Osprey Exterior",
        "areaServed": city_name,
        "telephone": "(425) 550-1727",
        "url": canonical_url,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": city_name,
            "addressRegion": "WA",
            "addressCountry": "US",
        },
        "hasMap": False,
        "geo": None,
    }

    service_schema = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": f"{service_name} in {city_name}",
        "provider": {"@id": f"{ROOT_URL}/#organization"},
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


def ensure_schema(content: str, city_slug: str, service_slug: str) -> tuple[str, int, bool]:
    schema_block = build_schema_block(city_slug, service_slug)
    if schema_block.strip() in content:
        return content, 0, False
    if '"hasMap": false' in content and '"@type": "FAQPage"' in content:
        return content, 0, False
    new_content = insert_before_tag(content, "head", schema_block)
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


def ensure_nearby_links(content: str, city_slug: str, neighbors: List[str]) -> tuple[str, bool]:
    if not neighbors:
        return content, False
    lines = ["  <section id=\"nearby-links\">", "    <h2>Nearby Service Areas</h2>", "    <ul>"]
    for neighbor_slug in neighbors:
        neighbor_name = slug_to_title(neighbor_slug) or neighbor_slug
        href = f"{ROOT_URL}/pages/{neighbor_slug}/"
        lines.append(f"      <li><a href=\"{href}\">{neighbor_name}</a></li>")
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
        processed_cities.add(city_slug)
        service_slug = determine_service_slug(list(relative_parts))

        original = html_file.read_text(encoding="utf-8")
        updated = original
        file_changed = False

        updated, changed = update_canonical(updated, build_canonical(city_slug, service_slug))
        if changed:
            file_changed = True

        updated, inserted, schema_changed = ensure_schema(updated, city_slug, service_slug)
        if schema_changed:
            schema_blocks += inserted
            file_changed = True

        neighbors = get_adjacent_cities(city_slug, city_slugs)
        updated, nearby_changed = ensure_nearby_links(updated, city_slug, neighbors)
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
