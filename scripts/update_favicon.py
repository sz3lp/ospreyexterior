import os
import re

# --- Configuration ---
# The script will start searching from the directory where it is executed (your repo root).
ROOT_DIR = "." 
FAVICON_BASE_PATH = "/assets/images"

# HTML content to insert for dynamic favicons
# The browser will pick the first link that matches the media query.
# The final link acts as a non-media-query-specific fallback.
NEW_FAVICON_LINKS_TEMPLATE = """
    <link rel="icon" href="{}/Osprey-Exterior-Icon-03-white.png media="(prefers-color-scheme: dark)">
    <link rel="icon" href="{}/favicon.png" media="(prefers-color-scheme: light)">
    <link rel="icon" href="{}/favicon.png">"""

NEW_FAVICON_LINKS = NEW_FAVICON_LINKS_TEMPLATE.format(FAVICON_BASE_PATH, FAVICON_BASE_PATH, FAVICON_BASE_PATH)

# --- Regex Patterns ---
# 1. Pattern to find and remove *existing* favicon links (e.g., <link rel="icon" ...>)
EXISTING_FAVICON_PATTERN = re.compile(
    r'<link\s+[^>]*?rel=["\'](?:shortcut\s+)?icon["\'][^>]*?>', 
    re.IGNORECASE | re.DOTALL
)

# 2. Pattern to find the closing </head> tag, capturing potential leading whitespace
HEAD_CLOSING_TAG_PATTERN = re.compile(r'(\s*)</head>', re.IGNORECASE)

# --- Script Logic ---

def update_html_file(filepath):
    """Reads, cleans, updates, and writes the HTML file."""
    try:
        # Read the file content
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if the dynamic favicon links are already present to prevent re-running
        if 'media="(prefers-color-scheme: dark)"' in content and 'media="(prefers-color-scheme: light)"' in content:
            return False

        # 1. Find and remove any existing favicon links
        content_after_cleanup = EXISTING_FAVICON_PATTERN.sub('', content)
        
        # 2. Find the closing </head> tag in the cleaned content
        match = HEAD_CLOSING_TAG_PATTERN.search(content_after_cleanup)

        if match:
            # Preserve the original indentation of </head> for consistency
            indentation = match.group(1)
            
            # Format the new links to respect the file's indentation
            new_favicon_content = NEW_FAVICON_LINKS.replace('\n', '\n' + indentation)
            
            # The full replacement string: [new links] + [preserved indentation] + </head>
            new_content = HEAD_CLOSING_TAG_PATTERN.sub(
                new_favicon_content + '\n' + indentation + '</head>', 
                content_after_cleanup, 
                1
            )
            
            # Write the updated content back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filepath}")
            return True
        else:
            return False

    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False


def run_update_script():
    """Traverses the directory and updates all HTML files."""
    updated_count = 0
    skipped_count = 0
    
    print("Starting favicon update script...")
    
    for dirpath, dirnames, filenames in os.walk(ROOT_DIR):
        # Skip hidden directories and GitHub workflow directory
        dirnames[:] = [d for d in dirnames if not d.startswith('.') and d != '.github']
        
        for filename in filenames:
            if filename.endswith(('.html', '.htm')):
                full_path = os.path.join(dirpath, filename)

                # Skip files containing unusual characters that are likely temporary backups
                if '：' in full_path:
                    continue

                if update_html_file(full_path):
                    updated_count += 1
                else:
                    skipped_count += 1
                    
    print("\n--- Summary ---")
    print(f"Files updated: {updated_count}")
    print(f"Files skipped (already done or no </head>): {skipped_count}")


if __name__ == "__main__":
    run_update_script()
