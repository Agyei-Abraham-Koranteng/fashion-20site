
from PIL import Image, ImageDraw, ImageFont
import os

def main():
    try:
        # Define files
        files = {
            'tl': 'conceptual_erd.png',
            'tr': 'use_case.png',
            'bl': 'sequence_diagram.png',
            'br': 'customer_journey.png'
        }
        
        titles = {
            'tl': '1. Entity Relationship Diagram',
            'tr': '2. Use Case Diagram',
            'bl': '3. Sequence Diagram (Checkout)',
            'br': '4. Customer Journey Flow'
        }

        images = {}
        for key, filename in files.items():
            if os.path.exists(filename):
                images[key] = Image.open(filename)
            else:
                print(f"Warning: {filename} not found.")
                return

        # Calculate dimensions
        padding = 40
        title_height = 60
        
        # Determine max widths/heights for rows/cols to align grid
        # Top row height
        h_top = max(images['tl'].height, images['tr'].height) + title_height
        # Bottom row height
        h_bot = max(images['bl'].height, images['br'].height) + title_height
        
        # Left col width
        w_left = max(images['tl'].width, images['bl'].width)
        # Right col width
        w_right = max(images['tr'].width, images['br'].width)

        total_width = w_left + w_right + (padding * 3)
        total_height = h_top + h_bot + (padding * 3)

        # Create canvas (White background)
        new_im = Image.new('RGB', (total_width, total_height), 'white')
        draw = ImageDraw.Draw(new_im)
        
        # Helper to paste
        def paste_with_title(img, x, y, title):
            # Draw title
            # Try to load a font, fallback to default
            try:
                font = ImageFont.truetype("arial.ttf", 30)
            except:
                font = ImageFont.load_default()
            
            draw.text((x, y), title, fill="black", font=font)
            
            # Paste image
            new_im.paste(img, (x, y + title_height))
            
            # Draw border around image
            draw.rectangle([x, y + title_height, x + img.width, y + title_height + img.height], outline="black", width=2)

        # Top Left
        paste_with_title(images['tl'], padding, padding, titles['tl'])
        
        # Top Right
        paste_with_title(images['tr'], padding + w_left + padding, padding, titles['tr'])
        
        # Bottom Left
        paste_with_title(images['bl'], padding, padding + h_top + padding, titles['bl'])
        
        # Bottom Right
        paste_with_title(images['br'], padding + w_left + padding, padding + h_top + padding, titles['br'])

        output_file = 'system_design_poster.png'
        new_im.save(output_file)
        print(f"Success: Created {output_file}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
