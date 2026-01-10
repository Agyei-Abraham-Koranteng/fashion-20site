
import base64
import requests
import os

def main():
    # Simulated Use Case Diagram using Graph syntax for compatibility
    mermaid_code = """
    graph LR
        subgraph System [Fashion Store System]
            ip1(Browse Products)
            ip2(Add to Cart)
            ip3(Checkout)
            ip4(View Order History)
            ip5(Manage Products)
            ip6(Manage Orders)
            ip7(View Dashboard)
        end

        c((Customer)) --> ip1
        c --> ip2
        c --> ip3
        c --> ip4

        a((Admin)) --> ip5
        a --> ip6
        a --> ip7
    """
    
    try:
        graph_bytes = mermaid_code.encode("utf8")
        base64_bytes = base64.urlsafe_b64encode(graph_bytes)
        base64_string = base64_bytes.decode("ascii")
        url = f"https://mermaid.ink/img/{base64_string}"
        
        print(f"Downloading fallback use_case from: {url}")
        response = requests.get(url)
        if response.status_code == 200:
            with open('use_case.png', 'wb') as f:
                f.write(response.content)
            print("Success: use_case.png created")
        else:
            print(f"Error {response.status_code}")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    main()
