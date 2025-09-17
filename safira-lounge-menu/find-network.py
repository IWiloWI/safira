#!/usr/bin/env python3
import socket
import subprocess
import sys

def get_local_ips():
    """Get all local IP addresses"""
    ips = []
    
    # Method 1: Using socket
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        primary_ip = s.getsockname()[0]
        ips.append(primary_ip)
        s.close()
    except:
        pass
    
    # Method 2: Using hostname
    try:
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        if local_ip not in ips:
            ips.append(local_ip)
    except:
        pass
    
    # Method 3: Parse ifconfig
    try:
        result = subprocess.run(['ifconfig'], capture_output=True, text=True)
        lines = result.stdout.split('\n')
        for line in lines:
            if 'inet ' in line and '127.0.0.1' not in line:
                ip = line.split('inet ')[1].split(' ')[0]
                if ip not in ips and ip.count('.') == 3:
                    ips.append(ip)
    except:
        pass
    
    return list(set(ips))

def test_port(ip, port):
    """Test if a port is open"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((ip, port))
        sock.close()
        return result == 0
    except:
        return False

def main():
    print("🌐 SAFIRA LOUNGE - NETZWERK FINDER")
    print("=" * 50)
    
    # Find all IPs
    ips = get_local_ips()
    ports = [8000, 8001, 5001, 3001]
    
    print(f"📍 Gefundene IP-Adressen: {len(ips)}")
    for ip in ips:
        print(f"   • {ip}")
    print()
    
    print("🔍 TESTE VERFÜGBARE DIENSTE:")
    print("-" * 30)
    
    working_urls = []
    
    for ip in ips:
        for port in ports:
            if test_port(ip, port):
                url = f"http://{ip}:{port}"
                service = {
                    8000: "Frontend (Hauptseite)",
                    8001: "Network Setup",
                    5001: "API Server",
                    3001: "Dev Server"
                }.get(port, "Unbekannt")
                
                print(f"✅ {url} - {service}")
                working_urls.append((url, service))
            else:
                print(f"❌ http://{ip}:{port}")
    
    print()
    print("📱 TABLET URLS:")
    print("=" * 30)
    
    if working_urls:
        print("Verwende eine dieser URLs auf deinem Tablet:")
        for url, service in working_urls:
            if "Frontend" in service:
                print(f"🎯 HAUPTSEITE: {url}")
            elif "Network" in service:
                print(f"🔧 SETUP: {url}/network-setup.html")
    else:
        print("❌ Keine Server gefunden!")
        print("Starte die Server mit: npm run server && python3 -m http.server 8000")
    
    print()
    print("🆘 PROBLEMLÖSUNG:")
    print("-" * 20)
    print("1. Mac und Tablet im gleichen WLAN?")
    print("2. Handy-Hotspot verwenden und beide verbinden")
    print("3. Mac Hotspot: Systemeinstellungen > Sharing > Internet Sharing")
    print("4. Router Gast-Netzwerk deaktivieren")

if __name__ == "__main__":
    main()