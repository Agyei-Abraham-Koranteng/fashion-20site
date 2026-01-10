
import base64
import requests
import re
import sys
import os

def main():
    try:
        input_file = r'C:\Users\Abraham A Koranteng\.gemini\antigravity\brain\6f4f0b6b-8f73-42eb-aa07-2fbba14ed376\design_diagrams.md'
        output_dir = r'C:\Users\Abraham A Koranteng\OneDrive\Desktop\fashion-20site-repo'
        
        with open(input_file, 'r') as f:
            content = f.read()
        
        # Regex to find all mermaid blocks
        pattern = r'```mermaid\n(.*?)```'
        matches = list(re.finditer(pattern, content, re.DOTALL))
        
        if len(matches) < 2:
            print("Error: Could not find use case diagram (index 1)")
            return

        # Use Case is the 2nd one (index 1)
        match = matches[1]
        mermaid_code = match.group(1).strip()
        
        # Encode for mermaid.ink
        graph_bytes = mermaid_code.encode("utf8")
        base64_bytes = base64.urlsafe_b64encode(graph_bytes)
        base64_string = base64_bytes.decode("ascii")
        
        url = f"https://mermaid.ink/img/{base64_string}"
        output_path = os.path.join(output_dir, "use_case.png")
        
        print(f"Downloading use_case from: {url}")
        
        response = requests.get(url)
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            print(f"Success: {output_path} created")
        else:
            print(f"Error {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    main()
